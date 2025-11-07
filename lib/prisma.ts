// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: ReturnType<typeof prismaClientSingleton> | undefined;
}

const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: ["query"],
  });

  // Extender el cliente para configurar timezone de Buenos Aires
  return client.$extends({
    query: {
      $allOperations: async ({ operation, model, args, query }) => {
        // Configurar timezone antes de cada operación
        await client.$executeRawUnsafe(
          `SET TIMEZONE = 'America/Argentina/Buenos_Aires'`
        );
        return query(args);
      },
    },
  });
};

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
