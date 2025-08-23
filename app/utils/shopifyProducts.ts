import { authenticate, db } from "../shopify.server";
import { from, EMPTY } from 'rxjs';
import { expand, tap } from 'rxjs/operators';

// Define types for Shopify product and response
interface ShopifyProduct {
  id: string;
  title: string;
  description: string;
  handle: string;
  productType: string;
  vendor: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  featuredImage?: {
    url: string;
    altText: string;
  };
}

interface ExternalProduct {
  product_id: string;
  name: string;
  description: string;
  product_url: string;
  image_url: string | null;
  item_group_id: null;
  price: string | null;
  sale_price: null;
  category: string;
  brand: string;
  color: null;
  size: null;
  gender: null;
}

interface ProductEdge {
  node: ShopifyProduct;
  cursor: string;
}

interface PageInfo {
  hasNextPage: boolean;
}

interface GraphQLResponse {
  data: {
    products: {
      edges: ProductEdge[];
      pageInfo: PageInfo;
    };
  };
}

// Utility to split an array into chunks
export function splitIntoChunks<T>(array: T[], chunkSize: number): T[][] {
  const result: T[][] = [];
  const arrayLenght = array.length;
  for (let i = 0; i < arrayLenght; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

// Maps Shopify product to external provider format
export function mapShopifyProduct(shopifyProduct: ShopifyProduct): ExternalProduct {
  const itemPrice = Number(shopifyProduct.priceRange?.minVariantPrice?.amount).toFixed(2);
  return {
    product_id: shopifyProduct.id,
    name: shopifyProduct.title,
    description: shopifyProduct.description,
    product_url: shopifyProduct.handle,
    image_url: shopifyProduct.featuredImage?.url || null,
    item_group_id: null,
    price: itemPrice || null,
    sale_price: null,
    category: shopifyProduct.productType,
    brand: shopifyProduct.vendor,
    color: null,
    size: null,
    gender: null,
  };
}

// Maps Shopify response to external product format
export function mapShopifyProducts(shopifyResponse: ShopifyProduct[]): ExternalProduct[] {
  return shopifyResponse.map(mapShopifyProduct);
}

// Fetch products from Shopify and send them to an external provider
export async function fetchAndQueueProducts(request: Request) {
  const { admin } = await authenticate.admin(request);
  console.log(`\n\nFetching and sending products.`);
  try {
    // Fetch function
    async function fetchProducts(cursor: string | null) {
      const response: Response = await admin.graphql(
        `#graphql
        query getProducts($cursor: String) {
          products(first: 100, after: $cursor) {
            edges {
              node {
                id
                title
                handle
                description
                productType
                vendor
                priceRange {
                  minVariantPrice { amount currencyCode }
                }
                featuredImage {
                    url
                    altText
                }
              }
              cursor
            }
            pageInfo {
              hasNextPage
            }
          }
        }
        `,
        { variables: { cursor } }
      );

      const responseJson = await response.json();
      const products = responseJson?.data.products.edges.map(
        (edge: { node: any }) => edge.node
      );

      const nextCursor = responseJson.data.products.edges.length
        ? responseJson.data.products.edges.slice(-1)[0].cursor
        : null;

      const hasNextPage = responseJson.data.products.pageInfo.hasNextPage;

      return { products, nextCursor, hasNextPage };
    }

    // Observable process
    from(fetchProducts(null)).pipe(
      expand(({ nextCursor, hasNextPage }) => {
        if (!hasNextPage) return EMPTY; // No more pages -> complete Observable
        return from(fetchProducts(nextCursor));
      }),
      tap(async ({ products }) => {
        // Save sync log
        await db.SyncLogs.create({
          data: {
            shop: 'prisma',
            date: new Date(),
          },
        });

        console.log('Fetched batch of products:', products.length);

        // Here you can do more processing with "products" if needed
      })
    ).subscribe({
      next: () => {},
      error: (err) => console.error('Error fetching products:', err),
      complete: () => console.log('Finished fetching all products!')
    });

  } catch (error: any) {
    console.error("Error in fetchAndQueueProducts:", error);
    return { success: false, error: error?.message ?? '' };
  }
}

export async function fetchAndSendProducts(request: Request) {
  const { admin } = await authenticate.admin(request);
  let products: ShopifyProduct[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;

  console.log(`\n\nFetching and sending products.`);

  try {
    // Loop through paginated results
    while (hasNextPage) {
      const response: Response = await admin.graphql(
        `#graphql
        query getProducts($cursor: String) {
          products(first: 150, after: $cursor) {
            edges {
              node {
                id
                title
                handle
                description
                productType
                vendor
                priceRange {
                  minVariantPrice { amount currencyCode }
                }
                featuredImage {
                    url
                    altText
                }
              }
              cursor
            }
            pageInfo {
              hasNextPage
            }
          }
        }
        `,
        { variables: { cursor } }
      );

      const responseJson: GraphQLResponse = await response.json();
      const fetchedProducts: ShopifyProduct[] = responseJson?.data.products.edges.map(
        (edge: { node: ShopifyProduct }) => edge.node
      );

      products = [...products, ...fetchedProducts];

      // Update cursor & check if more pages exist
      cursor = responseJson.data.products.edges.length
        ? responseJson.data.products.edges.slice(-1)[0].cursor
        : null;
      hasNextPage = responseJson.data.products.pageInfo.hasNextPage;

      hasNextPage = false;
    }

    // Map Shopify products to external format
    const mappedProducts = mapShopifyProducts(products);
    console.log(`Fetched ${mappedProducts.length} products from Shopify.`);

    await db.SyncLogs.create({
      data: {
        shop: 'prisma',
        date: new Date(),
      },
    });

    console.log(`Products`);
    console.log(JSON.stringify(mappedProducts));
    console.log(`\n\n`);

    const authentication = await fetch(
      'https://us-east-21skawhkkr.auth.us-east-2.amazoncognito.com/oauth2/token',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
        body: `grant_type=client_credentials&client_id=4q786i1ngbjv7ogf1i5i6m2k20&client_secret=gqc44cg8ltcqtb85vmhj8kb8sruti4est3d80tg2qr9ponq6hck&scope=default-m2m-resource-server-pzhb8z/read`
      }
    )

    const authData = await authentication.json();

    const externalResponse = await fetch("https://d37ia7ubfgdimd.cloudfront.net/api/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authData.access_token}`
      },
      body: JSON.stringify(mappedProducts),
    });

    if (!externalResponse.ok) {
      throw new Error(`Failed to send products: ${externalResponse.statusText}`);
    } else {
      console.log(`Products group sent successfully!`);
    }

    return { success: true, message: `Sent ${mappedProducts.length} products successfully` };
  } catch (error: any) {
    console.error("Error in fetchAndSendProducts:", error);
    return { success: false, error: error?.message ?? '' };
  }
}
