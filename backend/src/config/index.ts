import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface DatabaseConfig {
  type: 'memory' | 'cache' | 'mongodb' | 'postgresql';
  url?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  options?: Record<string, any>;
}

export interface ServerConfig {
  port: number;
  host: string;
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  graphql: {
    path: string;
    introspection: boolean;
  };
}

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptRounds: number;
  refreshTokenExpiresIn: string;
}

export interface CacheConfig {
  type: 'memory' | 'redis';
  host?: string;
  port?: number;
  password?: string;
  ttl?: number;
}

export interface LoggingConfig {
  level: 'error' | 'warn' | 'info' | 'debug';
  format: 'json' | 'simple';
  enableConsole: boolean;
  enableFile: boolean;
  filePath?: string;
}

export interface AppConfig {
  environment: 'development' | 'production' | 'test';
  database: DatabaseConfig;
  server: ServerConfig;
  auth: AuthConfig;
  cache: CacheConfig;
  logging: LoggingConfig;
}

const getDatabaseConfig = (): DatabaseConfig => {
  const dbType = process.env.DB_TYPE || 'memory';
  
  switch (dbType) {
    case 'mongodb':
      return {
        type: 'mongodb',
        url: process.env.MONGODB_URL || 'mongodb://localhost:27017/event-manager',
        options: {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      };
    case 'postgresql':
      return {
        type: 'postgresql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'event_manager',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        options: {
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        }
      };
    case 'cache':
      return {
        type: 'cache',
        host: process.env.CACHE_HOST || 'localhost',
        port: parseInt(process.env.CACHE_PORT || '6379'),
        password: process.env.CACHE_PASSWORD,
        options: {
          ttl: parseInt(process.env.CACHE_TTL || '3600'),
        }
      };
    case 'memory':
    default:
      return {
        type: 'memory',
        options: {
          maxSize: parseInt(process.env.MEMORY_CACHE_SIZE || '1000'),
        }
      };
  }
};

const getCacheConfig = (): CacheConfig => {
  const cacheType = process.env.CACHE_TYPE || 'memory';
  
  if (cacheType === 'redis') {
    return {
      type: 'redis',
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      ttl: parseInt(process.env.REDIS_TTL || '3600'),
    };
  }
  
  return {
    type: 'memory',
    ttl: parseInt(process.env.MEMORY_CACHE_TTL || '3600'),
  };
};

export const config: AppConfig = {
  environment: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  
  database: getDatabaseConfig(),
  
  server: {
    port: parseInt(process.env.PORT || '4000'),
    host: process.env.HOST || 'localhost',
    cors: {
      origin: process.env.FRONTEND_URL ? 
        process.env.FRONTEND_URL.split(',') : 
        ['http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
    },
    graphql: {
      path: process.env.GRAPHQL_PATH || '/graphql',
      introspection: process.env.NODE_ENV !== 'production',
    },
  },
  
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
  
  cache: getCacheConfig(),
  
  logging: {
    level: (process.env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug') || 'info',
    format: (process.env.LOG_FORMAT as 'json' | 'simple') || 'simple',
    enableConsole: process.env.LOG_CONSOLE !== 'false',
    enableFile: process.env.LOG_FILE === 'true',
    filePath: process.env.LOG_FILE_PATH || './logs/app.log',
  },
};

// Validation function
export const validateConfig = (): void => {
  const errors: string[] = [];
  
  if (config.environment === 'production') {
    if (config.auth.jwtSecret === 'your-super-secret-jwt-key-change-in-production') {
      errors.push('JWT_SECRET must be set in production');
    }
    
    if (config.database.type === 'memory') {
      errors.push('Memory database is not suitable for production');
    }
  }
  
  if (config.database.type === 'mongodb' && !config.database.url) {
    errors.push('MONGODB_URL is required when using MongoDB');
  }
  
  if (config.database.type === 'postgresql') {
    if (!config.database.host || !config.database.database) {
      errors.push('DB_HOST and DB_NAME are required when using PostgreSQL');
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
};

// Export individual configs for convenience
export const { database, server, auth, cache, logging } = config; 