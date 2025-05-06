import {
  Card,
  Text,
  TextField,
  Button,
  BlockStack,
  InlineStack,
  Icon,
  Page,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import {
  PlayIcon,
  ClockIcon,
} from "@shopify/polaris-icons";
import { useState } from "react";

export default function MerchandisingPrompt() {
  const [prompt, setPrompt] = useState(
    "Focus on summer collection and trending items. Prioritize new arrivals and items with high conversion rates."
  );
  const [testQuery, setTestQuery] = useState("");
  const testPrompt = false;

  const history = [
    {
      name: "John Smith",
      date: "15/3/2024",
      text: "Focus on summer collection and trending items",
    },
    {
      name: "Sarah Johnson",
      date: "14/3/2024",
      text: "Highlight new arrivals and seasonal promotions",
    },
  ];

  return (
    <Page fullWidth>
      <TitleBar title="Prompt Controls" />
      <BlockStack gap="500">
        <Card  >
          <BlockStack gap="300">
            <InlineStack  align="space-between">
              <Text variant="headingMd" as="h2">
                Merchandising Prompt
              </Text>
              <Button>
                Save Changes
              </Button>
            </InlineStack>

            <TextField
              label=""
              value={prompt}
              onChange={setPrompt}
              multiline={6}
              autoComplete="off"
              placeholder="Enter your merchandising prompt..."
            />
          </BlockStack>

        </Card>

        <Card>
          <TextField
            label="Test Prompt"
            value={testQuery}
            onChange={setTestQuery}
            autoComplete="off"
            placeholder="Enter a test search query..."
            connectedRight={
              <Button variant="primary" tone="success" loading={testPrompt} icon={PlayIcon}>
                Test
              </Button>
            }
          />
        </Card>

        <Card>
          <BlockStack gap="300">
            <Text variant="headingMd" as="h2">
              Version History
            </Text>
            <BlockStack gap="300">
              {history.map((entry, index) => (
                <Card key={index} background={"bg-surface-tertiary"}>
                  <InlineStack wrap={false} align="space-between" >
                    <InlineStack align="start" >                    
                      <div style={{display:'flex',marginRight:'0.5rem'}}>
                        <Icon source={ClockIcon} tone="subdued" />                  
                      </div>
                      <BlockStack>
                        <Text as="span" fontWeight="medium">
                          {entry.name}
                        </Text>
                        <Text as="span" tone="subdued">
                          {entry.text}
                        </Text>
                      </BlockStack>                    
                    </InlineStack>
                    <InlineStack>
                      <Text as="p" tone="subdued">
                        {entry.date}
                      </Text>
                    </InlineStack>
                  </InlineStack>
                </Card>
              ))}
            </BlockStack>
          </BlockStack>
        </Card>

      </BlockStack>
    </Page>
  );
}
