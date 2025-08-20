import { z } from 'zod';

// Environment variable validation schema
const envSchema = z.object({
  // Database Configuration
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // Server Configuration
  PORT: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().min(1).max(65535)).default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // CORS Configuration
  CORS_ORIGIN: z.string().min(1, 'CORS_ORIGIN is required for production').refine((origin) => {
    if (process.env.NODE_ENV === 'production') {
      try {
        new URL(origin);
        return true;
      } catch {
        return false;
      }
    }
    return true;
  }, 'CORS_ORIGIN must be a valid URL in production'),
  
  // Security Configuration
  BCRYPT_ROUNDS: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().min(10).max(15)).default('12'),
  
  // Rate Limiting Configuration
  RATE_LIMIT_WINDOW_MS: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().min(1000)).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().min(1)).default('100'),
  RATE_LIMIT_AUTH_MAX_REQUESTS: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().min(1)).default('5'),
  
  // Optional Configuration
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  ENABLE_SWAGGER: z.string().transform((val) => val === 'true').default('true'),
});

export type Environment = z.infer<typeof envSchema>;

let validatedEnv: Environment;

/**
 * Validate environment variables and throw if any are missing or invalid
 */
export function validateEnvironment(): Environment {
  try {
    validatedEnv = envSchema.parse(process.env);
    console.log('✅ Environment variables validated successfully');
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment variable validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      console.error('\nPlease check your .env file and ensure all required variables are set.');
      console.error('Refer to .env.example for the complete list of required variables.');
    } else {
      console.error('❌ Unexpected error during environment validation:', error);
    }
    
    // Graceful shutdown
    process.exit(1);
  }
}

/**
 * Get validated environment variables
 * Must call validateEnvironment() first
 */
export function getEnv(): Environment {
  if (!validatedEnv) {
    throw new Error('Environment not validated. Call validateEnvironment() first.');
  }
  return validatedEnv;
}

/**
 * Check if we're in production environment
 */
export function isProduction(): boolean {
  return getEnv().NODE_ENV === 'production';
}

/**
 * Check if we're in development environment
 */
export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === 'development';
}

/**
 * Check if we're in test environment
 */
export function isTest(): boolean {
  return getEnv().NODE_ENV === 'test';
}