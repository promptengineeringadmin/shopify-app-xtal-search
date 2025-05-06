import { json, LoaderFunction } from "@remix-run/node";

import {
  DataTable,
  BlockStack,
  Card,
  Text,
  Page,
} from "@shopify/polaris";
import {
  SearchIcon,
  IncentiveIcon,
  ClockIcon,
  PersonIcon,
} from "@shopify/polaris-icons";
import { TitleBar } from "@shopify/app-bridge-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from "recharts";


// Dummy data for demonstration
const trendData = [
  { name: "Week 1", searches: 1200 },
  { name: "Week 2", searches: 1500 },
  { name: "Week 3", searches: 1100 },
  { name: "Week 4", searches: 1700 },
];

const tableRows = [
  ["summer dress", "1,234", "Floral Maxi Dress", "456"],
  ["running shoes", "987", "Nike Air Zoom", "321"],
  ["laptop", "876", "MacBook Pro", "234"],
];

export const loader: LoaderFunction = async () => {
  // Dummy static data. Replace with real data fetching.
  return json({
    metrics: [
      {
        title: "Total Searches",
        value: "87,456",
        icon: SearchIcon,
        timeframe: "Last 30d",
      },
      {
        title: "Conversion Rate (Search Sessions)",
        value: "15.0%",
        icon: IncentiveIcon,
        delta: "5.2%",
        deltaPositive: true,
      },
      {
        title: "Time to Product",
        value: "3.2s",
        icon: ClockIcon,
        delta: "0.8%",
        deltaPositive: false,
        tooltip: "Average time from search to product click",
      },
      {
        title: "Engaged Users",
        value: "45.0%",
        icon: PersonIcon,
        delta: "2.1%",
        deltaPositive: true,
        subtext: "6.8% conversion",
        tooltip: "Sessions with more than 1 search",
      },
      {
        title: "Super Engaged Users",
        value: "12.0%",
        icon: PersonIcon,
        delta: "2.1%",
        deltaPositive: true,
        subtext: "1.8% conversion",
        tooltip: "Sessions with 5+ searches",
      },
    ],
  });
};

export default function SearchPerformance() {
  return (
    <Page fullWidth>
      <TitleBar title="Search Performance" />
      <BlockStack gap="300">
        <Card>
          <Text as="h3" variant="bodyMd" tone="subdued">
            Search Volume Trends
          </Text>
          <div style={{ height: 320, marginTop: "1rem" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Line
                  type="monotone"
                  dataKey="searches"
                  stroke="#5c6ac4"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card >
          <Text as="h3" variant="bodyMd" tone="subdued">
            Top Search Terms
          </Text>
          <DataTable
            columnContentTypes={["text", "numeric", "text", "numeric"]}
            headings={["Search Term", "Search Count", "Top Product", "Clicks"]}
            rows={tableRows}
          />
        </Card>
      </BlockStack>
    </Page>
  );
}
