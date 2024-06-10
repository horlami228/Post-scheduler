// global.d.ts

import { PrismaClient } from '@prisma/client';

declare global {
  namespace NodeJS {
    interface Global {
      prisma: PrismaClient | undefined;
    }
  }
}

// To ensure that the file is treated as a module and is included in the TypeScript compilation process
export {};
