import { PrismaClient } from "@prisma/client";
import logger from "../utils/logger";

const prisma = new PrismaClient();

(async () => {
  await prisma.status.createMany({
    data: [
      {
        name: "Success",
        id: 1,
      },
      {
        name: "Processing",
        id: 2,
      },
      {
        name: "Error",
        id: 3,
      },
    ],
  });
  logger.info(`Youtube Video Status seeded successfully.`);
  // await prisma.subscription.createMany({
  //   data: [
  //     {
  //       id: 1,
  //       title: "Free",
  //       durationInDays: 10,
  //       priceInDollars: 0,
  //       transcriptionSeconds: 60 * 10,
  //       isActive: true,
  //     },
  //     {
  //       id: 2,
  //       title: "Basic",
  //       durationInDays: 30,
  //       priceInDollars: 20,
  //       transcriptionSeconds: 60 * 30,
  //       isActive: true,
  //     },
  //     {
  //       id: 3,
  //       title: "Premium",
  //       durationInDays: 30,
  //       priceInDollars: 50,
  //       transcriptionSeconds: 60 * 60 * 2,
  //       isActive: true,
  //     },
  //     {
  //       id: 4,
  //       title: "Enterprise",
  //       durationInDays: 30,
  //       priceInDollars: 200,
  //       transcriptionSeconds: 60 * 60 * 10,
  //       isActive: true,
  //     },
  //   ],
  // });
  // logger.info(`Subscription seeded successfully.`);
})();
