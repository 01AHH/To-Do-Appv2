import { PrismaClient } from '@prisma/client';

// Global variable to store Prisma client instance
declare global {
  var __prisma: PrismaClient | undefined;
}

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Test database connectivity with retry logic
 */
export async function testDatabaseConnection(maxRetries: number = 5): Promise<void> {
  let lastError: Error = new Error('No connection attempts made');
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔍 Testing database connection (attempt ${attempt}/${maxRetries})...`);
      
      // Test the connection with a simple query
      await prisma.$queryRaw`SELECT 1`;
      
      console.log('✅ Database connection successful');
      return;
    } catch (error) {
      lastError = error as Error;
      console.warn(`❌ Database connection failed (attempt ${attempt}/${maxRetries}):`, error);
      
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s, 8s, 16s
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`⏳ Retrying in ${delay / 1000}s...`);
        await sleep(delay);
      }
    }
  }
  
  console.error('❌ Database connection failed after all retries');
  console.error('💡 Please check:');
  console.error('  - DATABASE_URL environment variable is correct');
  console.error('  - Database server is running and accessible');
  console.error('  - Network connectivity to database');
  console.error('  - Database credentials are valid');
  
  throw new Error(`Database connection failed after ${maxRetries} attempts: ${lastError.message}`);
}

// Create Prisma client instance
const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// In development, store the instance globally to prevent multiple instances
if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export { prisma };
export default prisma;