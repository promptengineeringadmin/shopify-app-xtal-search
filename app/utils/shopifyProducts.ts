import { authenticate, db } from "../shopify.server";
//import { productQueue } from "./queue";

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
  let cursor: string | null = null;
  let hasNextPage = true;

  console.log(`\n\nFetching and sending products.`);

  try {
    // Loop through paginated results
    while (hasNextPage) {
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

    await db.SyncLogs.create({
      data: {
        shop: 'prisma',
        date: new Date(),
      },
    });

    const responseJson = await response.json();
    const fetchedProducts = responseJson?.data.products.edges.map(
      (edge: { node: any }) => edge.node
    );

    // Add each batch to the queue
    await productQueue.add("sendProducts", { products: fetchedProducts });

    // Update cursor & check if more pages exist
    cursor = responseJson.data.products.edges.length
      ? responseJson.data.products.edges.slice(-1)[0].cursor
      : null;
    hasNextPage = responseJson.data.products.pageInfo.hasNextPage;
    }

    console.log("All products added to the queue.");
    return { success: true, message: "Products enqueued successfully" };
  } catch (error) {
    console.error("Error in fetchAndQueueProducts:", error);
    return { success: false, error: error.message };
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
    console.log(JSON.stringify(mappedProducts[2]));
    console.log(JSON.stringify(mappedProducts[3]));
    console.log(`\n\n`);

    const externalResponse = await fetch("https://84cf-187-161-119-1.ngrok-free.app/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mappedProducts),
    });

    if (!externalResponse.ok) {
      throw new Error(`Failed to send products: ${externalResponse.statusText}`);
    } else {
      console.log(`Products group sent successfully!`);
    }

    return { success: true, message: `Sent ${mappedProducts.length} products successfully` };
  } catch (error) {
    console.error("Error in fetchAndSendProducts:", error);
    return { success: false, error: error.message };
  }
}
