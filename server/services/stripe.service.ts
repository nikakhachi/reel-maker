import { Stripe } from "stripe";

export type UserSubscriptionType = {
  subscriptionId: string;
  productId: string;
  priceId: any;
  priceInCents: any;
  transcriptionSeconds: number;
  activatedAt: Date;
  endsAt: Date;
};

export const stripe = new Stripe(process.env.STRIPE_KEY || "", { apiVersion: "2020-08-27" });

export const getUserSubscriptionPlan = async (userStripeId: string) => {
  const data = (await stripe.customers.retrieve(userStripeId, { expand: ["subscriptions"] })) as Stripe.Customer;
  const subscription = data.subscriptions?.data[0];
  if (!subscription) return null;
  // @ts-ignore
  const subscriptionPlan = subscription.plan;
  if (!subscription) throw new Error("Internal Server Error");
  const subscriptionData: UserSubscriptionType = {
    subscriptionId: subscription?.id,
    productId: subscriptionPlan.product,
    priceId: subscriptionPlan.id,
    priceInCents: subscriptionPlan.amount,
    transcriptionSeconds: Number(subscriptionPlan.metadata.transcriptionSeconds),
    activatedAt: new Date(subscription.current_period_start * 1000),
    endsAt: new Date(subscription.current_period_end * 1000),
  };
  return subscriptionData;
};

export const getAllSubscriptionPlans = async () => {
  const [productsData, plansData] = await Promise.all([stripe.products.list({}), stripe.plans.list({})]);
  const product = productsData.data.find((item) => item.active === true);
  const plans = plansData.data.filter((item) => item.product === product?.id);
  return plans.map((item) => ({
    priceInCents: item.amount,
    transcriptionSeconds: Number(item.metadata?.transcriptionSeconds),
    name: item.metadata?.name,
    durationInDays: item.interval_count,
    priceId: item.id,
    productId: product?.id,
  }));
};
