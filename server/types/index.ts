import { Subscription, User } from "@prisma/client";

export type RequestUserType = User & { subscription: Subscription };
