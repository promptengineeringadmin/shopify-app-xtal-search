import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";

import { login } from "../../shopify.server";
import styles from "./styles.module.css";

const CONFIG_STEPS = [
  "Install the app",
  "Connect to your external provider",
  "Sync your Shopify products",
  "Set default preferences",
  "Enable live mode",
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  // Eventually load step states from DB or session
  return {
    showForm: Boolean(login),
    completedSteps: [] as string[], // default none done
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const step = formData.get("step");

  if (typeof step !== "string") {
    return json({ error: "Invalid step" }, { status: 400 });
  }

  // You can handle step saving in an external function here
  // e.g., await saveCompletedStep(shopDomain, step)

  return json({ success: true });
};

export default function App() {
  const { showForm, completedSteps } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const handleComplete = (step: string) => {
    fetcher.submit({ step }, { method: "post" });
  };

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>A short heading about [your app]</h1>
        <p className={styles.text}>
          A tagline about [your app] that describes your value proposition.
        </p>

        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Shop domain</span>
              <input className={styles.input} type="text" name="shop" />
              <span>e.g: my-shop-domain.myshopify.com</span>
            </label>
            <button className={styles.button} type="submit">
              Log in
            </button>
          </Form>
        )}

        <ul className={styles.list}>
          <li>
            <strong>Product feature</strong>. Some detail about your feature and
            its benefit to your customer.
          </li>
          <li>
            <strong>Product feature</strong>. Some detail about your feature and
            its benefit to your customer.
          </li>
          <li>
            <strong>Product feature</strong>. Some detail about your feature and
            its benefit to your customer.
          </li>
        </ul>

        <div className={styles.todoSection}>
          <h2>🛠 Setup To-Do List</h2>
          <ul className={styles.todoList}>
            {CONFIG_STEPS.map((step) => (
              <li key={step} className={styles.todoItem}>
                <label>
                  <input
                    type="checkbox"
                    checked={completedSteps.includes(step)}
                    onChange={() => handleComplete(step)}
                  />
                  {step}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
