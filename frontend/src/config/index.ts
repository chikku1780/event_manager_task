export interface ApiConfig {
  graphqlUrl: string;
  wsUrl?: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface AuthConfig {
  tokenKey: string;
  userKey: string;
  refreshTokenKey: string;
  autoRefresh: boolean;
  refreshThreshold: number; // seconds before expiry to refresh
}

export interface AppConfig {
  environment: 'development' | 'production' | 'test';
  api: ApiConfig;
  auth: AuthConfig;
  features: {
    enableWebsockets: boolean;
    enableOfflineMode: boolean;
    enablePWA: boolean;
    enableAnalytics: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: string;
  };
  pagination: {
    defaultPageSize: number;
    maxPageSize: number;
    pageSizeOptions: number[];
  };
  upload: {
    maxFileSize: number; // in bytes
    allowedTypes: string[];
    imageCompression: boolean;
    compressionQuality: number;
  };
}

const getApiConfig = (): ApiConfig => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || `${baseUrl}/graphql`;
  
  return {
    graphqlUrl,
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || graphqlUrl.replace('http', 'ws'),
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
    retryAttempts: parseInt(process.env.NEXT_PUBLIC_API_RETRY_ATTEMPTS || '3'),
    retryDelay: parseInt(process.env.NEXT_PUBLIC_API_RETRY_DELAY || '1000'),
  };
};

const getAuthConfig = (): AuthConfig => {
  return {
    tokenKey: process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'authToken',
    userKey: process.env.NEXT_PUBLIC_AUTH_USER_KEY || 'authUser',
    refreshTokenKey: process.env.NEXT_PUBLIC_AUTH_REFRESH_TOKEN_KEY || 'refreshToken',
    autoRefresh: process.env.NEXT_PUBLIC_AUTH_AUTO_REFRESH !== 'false',
    refreshThreshold: parseInt(process.env.NEXT_PUBLIC_AUTH_REFRESH_THRESHOLD || '300'), // 5 minutes
  };
};

export const config: AppConfig = {
  environment: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  
  api: getApiConfig(),
  
  auth: getAuthConfig(),
  
  features: {
    enableWebsockets: process.env.NEXT_PUBLIC_ENABLE_WEBSOCKETS !== 'false',
    enableOfflineMode: process.env.NEXT_PUBLIC_ENABLE_OFFLINE_MODE === 'true',
    enablePWA: process.env.NEXT_PUBLIC_ENABLE_PWA === 'true',
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  },
  
  ui: {
    theme: (process.env.NEXT_PUBLIC_THEME as 'light' | 'dark' | 'auto') || 'auto',
    language: process.env.NEXT_PUBLIC_LANGUAGE || 'en',
    timezone: process.env.NEXT_PUBLIC_TIMEZONE || 'UTC',
    dateFormat: process.env.NEXT_PUBLIC_DATE_FORMAT || 'MM/DD/YYYY',
    timeFormat: process.env.NEXT_PUBLIC_TIME_FORMAT || 'HH:mm',
  },
  
  pagination: {
    defaultPageSize: parseInt(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE || '10'),
    maxPageSize: parseInt(process.env.NEXT_PUBLIC_MAX_PAGE_SIZE || '100'),
    pageSizeOptions: [5, 10, 20, 50, 100],
  },
  
  upload: {
    maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '5242880'), // 5MB
    allowedTypes: process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    imageCompression: process.env.NEXT_PUBLIC_IMAGE_COMPRESSION !== 'false',
    compressionQuality: parseFloat(process.env.NEXT_PUBLIC_COMPRESSION_QUALITY || '0.8'),
  },
};

// Validation function
export const validateConfig = (): void => {
  const errors: string[] = [];
  
  if (!config.api.graphqlUrl) {
    errors.push('NEXT_PUBLIC_GRAPHQL_URL is required');
  }
  
  if (config.api.timeout <= 0) {
    errors.push('API timeout must be greater than 0');
  }
  
  if (config.pagination.defaultPageSize <= 0) {
    errors.push('Default page size must be greater than 0');
  }
  
  if (config.pagination.defaultPageSize > config.pagination.maxPageSize) {
    errors.push('Default page size cannot be greater than max page size');
  }
  
  if (config.upload.maxFileSize <= 0) {
    errors.push('Max file size must be greater than 0');
  }
  
  if (config.upload.compressionQuality < 0 || config.upload.compressionQuality > 1) {
    errors.push('Compression quality must be between 0 and 1');
  }
  
  if (errors.length > 0) {
    throw new Error(`Frontend configuration validation failed:\n${errors.join('\n')}`);
  }
};

// Helper functions
export const isDevelopment = (): boolean => config.environment === 'development';
export const isProduction = (): boolean => config.environment === 'production';
export const isTest = (): boolean => config.environment === 'test';

export const getApiUrl = (endpoint: string = ''): string => {
  const baseUrl = config.api.graphqlUrl.replace('/graphql', '');
  return `${baseUrl}${endpoint}`;
};

export const getWebSocketUrl = (): string | undefined => {
  return config.features.enableWebsockets ? config.api.wsUrl : undefined;
};

// Export individual configs for convenience
export const { api, auth, features, ui, pagination, upload } = config; 