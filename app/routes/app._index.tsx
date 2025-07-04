import React, { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Spinner, Thumbnail,
} from "@shopify/polaris";
import { TitleBar, useAppBridge, Modal } from "@shopify/app-bridge-react";
import { authenticate, db } from "../shopify.server";
import {fetchAndSendProducts} from "../utils/shopifyProducts";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  const syncLogs = await db.SyncLogs.findMany({
    orderBy: { date: "asc" },
    take: 3,
  });
  return { syncLogs };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const { admin } = await authenticate.admin(request);
    console.log(`admin`,admin);
    const fetchProductsResponse = await fetchAndSendProducts(request);
    console.log(`\n\n\nAll Products sent successfully!`);
    return { products: fetchProductsResponse };
  } catch (error) {
    console.error("Error in action:", error);
    return { error: "Failed to send products." };
  }
};


export default function Index() {
  const shopify = useAppBridge();
  const fetcher = useFetcher<typeof action>();
  const [isLoading, setLoaded] = useState(false)
  const { syncLogs } = useLoaderData<typeof loader>() || { syncLogs: [] };

  useEffect(() => {
    console.log(`fetcher.state`,fetcher.state);

    if( fetcher.state === 'submitting' ){
      shopify.loading(true);
      shopify.modal.show('my-modal')
      setLoaded(true);
    }
    if( fetcher.state === 'loading'){
      shopify.loading(false);
      setLoaded(false);
    }
  }, [fetcher]);

  const styles = {
    spinnerContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '150px',
    },
  };

  return (
    <Page>
      <TitleBar title="XTAL - AI Search">
      </TitleBar>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Thumbnail
                    source="/banner.avif"
                    size="large"
                    alt="Black choker necklace"
                  />
                  <Text as="h3" variant="headingMd">
                    Get started with products
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Start by syncing your Shopify store products with our platform. This allows the AI-powered search to detect, classify, and suggest your products automatically.
                    Whenever you add or update a product, make sure to run a new sync to keep everything up to date.
                    Ready to improve your customers’ search experience? Click the New Sync button begin.
                  </Text>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
              <Card>
                <BlockStack gap="500">
                  <Text as="h3" variant="headingMd">
                    Sync Logs
                  </Text>
                  <BlockStack gap="200">
                    {syncLogs.length > 0 ? (
                      syncLogs.map((log: any) => (
                        <Text key={log.id} as="p" variant="bodyMd">
                          <strong>Succeed Sync At: </strong> {new Date(log.date).toLocaleString()}
                        </Text>
                      ))
                    ) : (
                      <Text as="p">No sync logs available.</Text>
                    )}
                  </BlockStack>
                  <BlockStack gap="200">
                    <fetcher.Form method="post">
                      {isLoading ? (
                        <Spinner accessibilityLabel="Sending products" size="large" />
                      ) : (
                        <>
                          <input type="hidden" name="actionType" value="sendProducts" />
                          <Button submit>
                            {syncLogs.length > 0 ? (
                              'New Sync'
                            ) : (
                              'Send Products to External Provider'
                            )}
                          </Button>
                        </>
                      )}
                    </fetcher.Form>
                  </BlockStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
      <Modal id="my-modal" variant="large">
        <div style={styles.spinnerContainer}>
          {isLoading ? (
            <Spinner size="large" />
          ) : (
            <Text as="strong">Products Sent!</Text>
          )}
        </div>
        <TitleBar title="Sending Products">
        </TitleBar>
      </Modal>
    </Page>
  );
}
