import { LoaderFunction } from "@remix-run/node";
//import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Card,
  Text,
  Grid,
  Select,
  InlineStack,
  BlockStack,
  Icon,
} from "@shopify/polaris";
import {
  SearchIcon,
  IncentiveIcon,
  ClockIcon,
  PersonIcon,
  ArrowDownIcon,
} from "@shopify/polaris-icons";
import { TitleBar } from "@shopify/app-bridge-react";

export const loader: LoaderFunction = async () => {
  // Dummy static data. Replace with real data fetching.
  return ({
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


export default function Dashboard() {
  //const { metrics } = useLoaderData<typeof loader>();
  const timeRanges = [
    { label: "Last 7 days", value: "7d" },
    { label: "Last 30 days", value: "30d" },
    { label: "Last 90 days", value: "90d" },
  ];

  const dataMetrics = [
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
  ];

  return (
    <Page fullWidth>
      <TitleBar title="Dashboard" />
      <BlockStack gap="300">
        <InlineStack align="end" blockAlign="stretch" >
          <Select labelHidden label="Time Range" options={timeRanges} />
        </InlineStack>
        <Grid columns={{ xs: 1, md: 2, lg: 3 }}>
          {dataMetrics.map((metric, idx) => (
            <Card key={idx}>
              <InlineStack align="space-between">
                <Text as="h3" variant="bodyMd" tone="subdued">
                  {metric.title}
                </Text>
                <div>
                  <Icon source={metric.icon} tone="base" />                  
                </div>
              </InlineStack>
              <InlineStack>
                <Text as="p" variant="heading2xl">
                  {metric.value}
                </Text>
                {metric.delta && (
                  <InlineStack gap="1">
                    <Icon
                      source={
                        metric.deltaPositive ? IncentiveIcon : ArrowDownIcon 
                      }
                      tone={metric.deltaPositive ? "success" : "critical"}
                    />
                    <Text
                      as="span"
                      variant="bodySm"
                      tone={metric.deltaPositive ? "success" : "critical"}
                    >
                      {metric.delta}
                    </Text>
                  </InlineStack>
                )}
              </InlineStack>
              {metric.subtext && (
                <Text variant="bodySm">
                  {metric.subtext}
                </Text>
              )}
            </Card>
          ))}
        </Grid>
      </BlockStack>
    </Page>
  );
}
