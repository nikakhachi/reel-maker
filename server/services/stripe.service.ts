import { Stripe } from "stripe";

export type UserSubscriptionType = {
  subscriptionId: string;
  productId: string;
  priceId: any;
  priceInCents: any;
  transcriptionSeconds: number;
  activatedAt: Date;
  endsAt: Date;
  name: string;
};

export const stripe = new Stripe(process.env.STRIPE_KEY || "", { apiVersion: "2020-08-27" });

export const subscribeToPlan = async (customerId: string, priceId: string) => {
  const response = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    customer: customerId,
    subscription_data: { items: [{ plan: priceId }] },
    success_url: `${process.env.CLIENT_URL}/dashboard/my-account`,
    cancel_url: `${process.env.CLIENT_URL}/dashboard/my-account`,
  });
  return response;
};

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
    name: subscriptionPlan.metadata.name,
  };
  return subscriptionData;
};

export const getAllSubscriptionPlans = async () => {
  const [productsData, plansData] = await Promise.all([stripe.products.list({}), stripe.plans.list({})]);
  const product = productsData.data.find((item) => item.active);
  const plans = plansData.data.filter((item) => item.product === product?.id && item.active);
  return plans.map((item) => ({
    priceInCents: item.amount,
    transcriptionSeconds: Number(item.metadata?.transcriptionSeconds),
    name: item.metadata?.name,
    durationInDays: item.interval_count,
    priceId: item.id,
    productId: product?.id,
  }));
};

export const cancelSubscription = async (subscriptionId: string) => {
  await stripe.subscriptions.del(subscriptionId);
};

export const changeSubscription = async (subscriptionId: string, priceId: string) => {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const response = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
    proration_behavior: "always_invoice",
    items: [
      {
        id: subscription.items.data[0].id,
        price: priceId,
      },
    ],
  });
  return response;
};
