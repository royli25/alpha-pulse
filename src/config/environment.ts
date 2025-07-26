// src/config/environment.ts

interface EnvironmentConfig {
  newsApiKey: string;
  alphaVantageApiKey: string; // Add this
  isDevelopment: boolean;
  apiEndpoints: {
    newsApi: string;
    alphaVantage: string; // Add this
    reddit?: string;
  };
  rateLimits: {
    newsApi: {
      requestsPerHour: number;
      requestsPerDay: number;
    };
    alphaVantage: { // Add this - Free tier limits
      requestsPerMinute: number;
      requestsPerDay: number;
    };
  };
}

// For development, we'll use the provided key directly
// In production, you should use environment variables
const config: EnvironmentConfig = {
  newsApiKey: 'a7d827dd61f04722a1286264d0354f55',
  alphaVantageApiKey: '6MIZP8TY1U7NEYGM', // Your API key
  isDevelopment: true,
  apiEndpoints: {
    newsApi: 'https://newsapi.org/v2',
    alphaVantage: 'https://www.alphavantage.co/query', // Add this
  },
  rateLimits: {
    newsApi: {
      requestsPerHour: 1000,
      requestsPerDay: 1000
    },
    alphaVantage: { // Add this - Free tier limits
      requestsPerMinute: 5,
      requestsPerDay: 500
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
  
  if (!config.alphaVantageApiKey || config.alphaVantageApiKey.length < 10) {
    console.error('❌ Invalid Alpha Vantage API key configuration');
    return false;
  }
  
  console.log('✅ All API keys validated successfully');
  return true;
};