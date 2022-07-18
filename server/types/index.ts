import { User } from "@prisma/client";
import { UserSubscriptionType } from "../services/stripe.service";

export type RequestUserType = User & UserSubscriptionType;
