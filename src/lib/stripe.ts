import Stripe from "stripe";
import config from "../config";

export const stripe = new Stripe(config.stripe_secret_key || "sk_test_placeholder", {
  apiVersion: "2024-12-18.acacia" as any,
});