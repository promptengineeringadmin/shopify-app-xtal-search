import {
  Box,
  Card,
  Page,
  Button,
  Text,
  ProgressBar,
  InlineStack,
  BlockStack,
} from "@shopify/polaris";
import {
  ChatIcon,
} from "@shopify/polaris-icons";
import { TitleBar } from "@shopify/app-bridge-react";

export default function BillingPage() {
  return (
    <Page fullWidth>
      <TitleBar title="Billing & Usage" />
        <BlockStack gap="500">
          <Card>
            <BlockStack gap="400">
              <InlineStack  align="space-between">
                <BlockStack gap="200">
                  <Text variant="headingMd" as="h2">This Month's Bill</Text>
                  <Text variant="bodyXs" as="span">87,456 searches @ $0.030 per search</Text>
                </BlockStack>
                <BlockStack gap="100" align="end" inlineAlign="end">
                  <Text numeric={true} variant="headingLg" as="p">$2 623.68</Text>
                  <Text as="span">Estimated Total</Text>
                </BlockStack>
              </InlineStack>

              <BlockStack gap="100">
                <InlineStack  align="space-between">
                  <Text variant="headingSm" as="h3">Monthly Usage</Text>
                  <Text variant="bodyXs" as="p">87,456 / 100,000 searches</Text>
                </InlineStack>
                <ProgressBar progress={87.45} />

              </BlockStack>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="500">
              <BlockStack gap="100">
                <Text variant="headingSm" as="h3">Billing History</Text>
                <Text variant="bodyXs" as="p">View and download past invoices</Text>
              </BlockStack>

            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="300">
              <InlineStack  align="space-between">
                <Text variant="headingSm" as="h3">Current Billing Rate</Text>
                <Button variant="primary" icon={ChatIcon}>Contact Support</Button>
              </InlineStack>
              <Text variant="bodyXs" as="p">Your current billing rate is $0.030 per search</Text>
            </BlockStack>
          </Card>

        </BlockStack>
    </Page>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <Box
      as="span"
      padding="025"
      paddingInlineStart="100"
      paddingInlineEnd="100"
      background="bg-surface-active"
      borderWidth="025"
      borderColor="border"
      borderRadius="100"
    >
      <code>{children}</code>
    </Box>
  );
}
