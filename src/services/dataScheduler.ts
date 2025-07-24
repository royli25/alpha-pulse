// src/services/dataScheduler.ts

import { NewsService, type ProcessedNewsData } from './newsService';
import { getConfig, validateApiKeys } from '../config/environment';

interface SchedulerStatus {
  isRunning: boolean;
  lastRun: Date | null;
  nextRun: Date | null;
  totalRuns: number;
  errors: number;
}

interface CollectedData {
  timestamp: Date;
  articles: ProcessedNewsData[];
  signals: any[];
  source: string;
}

class DataCollectionScheduler {
  private newsService: NewsService;
  private intervalId: number | null = null;
  private status: SchedulerStatus;
  private subscribers: ((data: CollectedData) => void)[] = [];
  private readonly COLLECTION_INTERVAL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Validate API keys before initializing services
    if (!validateApiKeys()) {
      throw new Error('Invalid API configuration');
    }

    const config = getConfig();
    this.newsService = new NewsService(config.newsApiKey);
    
    this.status = {
      isRunning: false,
      lastRun: null,
      nextRun: null,
      totalRuns: 0,
      errors: 0
    };
  }

  /**
   * Start the data collection scheduler
   */
  start(): void {
    if (this.status.isRunning) {
      console.log('⚠️ Scheduler is already running');
      return;
    }

    console.log('🚀 Starting data collection scheduler...');
    this.status.isRunning = true;
    this.status.nextRun = new Date(Date.now() + this.COLLECTION_INTERVAL);

    // Run immediately on start
    this.collectData();

    // Schedule regular data collection
    this.intervalId = window.setInterval(() => {
      this.collectData();
    }, this.COLLECTION_INTERVAL);

    console.log(`✅ Scheduler started - collecting data every ${this.COLLECTION_INTERVAL / 60000} minutes`);
  }

  /**
   * Stop the data collection scheduler
   */
  stop(): void {
    if (!this.status.isRunning) {
      console.log('⚠️ Scheduler is not running');
      return;
    }

    console.log('🛑 Stopping data collection scheduler...');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.status.isRunning = false;
    this.status.nextRun = null;

    console.log('✅ Scheduler stopped');
  }

  /**
   * Manually trigger data collection
   */
  async triggerCollection(): Promise<CollectedData | null> {
    console.log('🔄 Manually triggering data collection...');
    return await this.collectData();
  }

  /**
   * Subscribe to data collection events
   */
  subscribe(callback: (data: CollectedData) => void): () => void {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Get current scheduler status
   */
  getStatus(): SchedulerStatus {
    return { ...this.status };
  }

  /**
   * Private method to collect data from all sources
   */
  private async collectData(): Promise<CollectedData | null> {
    try {
      console.log('📊 Starting data collection cycle...');
      this.status.lastRun = new Date();
      this.status.totalRuns++;

      // Collect news data
      const newsData = await this.newsService.collectNewsData();

      const collectedData: CollectedData = {
        timestamp: new Date(),
        articles: newsData.articles,
        signals: newsData.signals,
        source: 'news'
      };

      // Update next run time
      if (this.status.isRunning) {
        this.status.nextRun = new Date(Date.now() + this.COLLECTION_INTERVAL);
      }

      // Notify subscribers
      this.notifySubscribers(collectedData);

      console.log(`✅ Data collection completed - ${newsData.articles.length} articles, ${newsData.signals.length} signals`);
      return collectedData;

    } catch (error) {
      console.error('❌ Data collection failed:', error);
      this.status.errors++;
      return null;
    }
  }

  /**
   * Notify all subscribers of new data
   */
  private notifySubscribers(data: CollectedData): void {
    for (const callback of this.subscribers) {
      try {
        callback(data);
      } catch (error) {
        console.error('❌ Error notifying subscriber:', error);
      }
    }
  }
}

// Export singleton instance
let schedulerInstance: DataCollectionScheduler | null = null;

export const getDataScheduler = (): DataCollectionScheduler => {
  if (!schedulerInstance) {
    schedulerInstance = new DataCollectionScheduler();
  }
  return schedulerInstance;
};

export { DataCollectionScheduler, type SchedulerStatus, type CollectedData };