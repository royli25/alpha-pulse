// src/config/environment.ts

interface EnvironmentConfig {
    newsApiKey: string;
    isDevelopment: boolean;
    apiEndpoints: {
      newsApi: string;
      alphaVantage?: string;
      reddit?: string;
    };
    rateLimits: {
      newsApi: {
        requestsPerHour: number;
        requestsPerDay: number;
      };
    };
  }
  
  // For development, we'll use the provided key directly
  // In production, you should use environment variables
  const config: EnvironmentConfig = {
    newsApiKey: 'a7d827dd61f04722a1286264d0354f55',
    isDevelopment: true,
    apiEndpoints: {
      newsApi: 'https://newsapi.org/v2',
      // Add other API endpoints here as you implement them
    },
    rateLimits: {
      newsApi: {
        requestsPerHour: 1000, // NewsAPI free tier limit
        requestsPerDay: 1000
      }
    }
  };
  
  export { config, type EnvironmentConfig };
  
  // Utility function to get configuration values
  export const getConfig = (): EnvironmentConfig => {
    return config;
  };
  
  // API key validation
  export const validateApiKeys = (): boolean => {
    if (!config.newsApiKey || config.newsApiKey.length < 10) {
      console.error('❌ Invalid NewsAPI key configuration');
      return false;
    }
    console.log('✅ API keys validated successfully');
    return true;
  };