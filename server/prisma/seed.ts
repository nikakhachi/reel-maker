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
})();
