import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

let cachedPrisma: any = null

export const getPrisma = (database_url: string) => {
  if (!database_url) {
    throw new Error('DATABASE_URL is not defined')
  }
  
  if (cachedPrisma) {
    return cachedPrisma
  }
  
  const prisma = new PrismaClient({
    datasourceUrl: database_url,
  }).$extends(withAccelerate())
  
  cachedPrisma = prisma
  return prisma
}
