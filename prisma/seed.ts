import { PrismaClient } from "@prisma/client";

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
  await prisma.processedVideoType.createMany({
    data: [
      {
        name: "Clip",
        id: 1,
      },
      {
        name: "Short",
        id: 2,
      },
    ],
  });
})();
