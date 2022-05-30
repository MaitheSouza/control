import { PrismaClient } from '@prisma/client';

export const prisma: PrismaClient =
	typeof window === 'undefined' ? new PrismaClient() : ({} as any);
