// src/hooks/useNewsData.ts

import { useState, useEffect, useCallback } from 'react';
import { getDataScheduler, type CollectedData, type SchedulerStatus } from '../services/dataScheduler';
import { type ProcessedNewsData } from '../services/newsService';
import { type ProcessedMarketData } from '../services/alphaVantageService';

interface NewsDataState {
  articles: ProcessedNewsData[];
  signals: any[];
  marketData: ProcessedMarketData[]; // Add this
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  schedulerStatus: SchedulerStatus;
}

interface UseNewsDataReturn extends NewsDataState {
  refreshData: () => Promise<void>;
  startScheduler: () => void;
  stopScheduler: () => void;
  clearError: () => void;
}

export const useNewsData = (): UseNewsDataReturn => {
  const [state, setState] = useState<NewsDataState>({
    articles: [],
    signals: [],
    marketData: [], // Add this
    isLoading: false,
    error: null,
    lastUpdated: null,
    schedulerStatus: {
      isRunning: false,
      lastRun: null,
      nextRun: null,
      totalRuns: 0,
      errors: 0
    }
  });

  const scheduler = getDataScheduler();

  // Update scheduler status
  const updateSchedulerStatus = useCallback(() => {
    setState(prev => ({
      ...prev,
      schedulerStatus: scheduler.getStatus()
    }));
  }, [scheduler]);

  // Handle new data from scheduler
  const handleDataUpdate = useCallback((data: CollectedData) => {
    console.log('📊 Received new data update:', data);
    
    setState(prev => ({
      ...prev,
      articles: data.articles,
      signals: data.signals,
      marketData: data.marketData || [], // Add this
      lastUpdated: data.timestamp,
      isLoading: false,
      error: null
    }));
  }, []);

  // Manual refresh function
  const refreshData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const data = await scheduler.triggerCollection();
      if (data) {
        setState(prev => ({
          ...prev,
          articles: data.articles,
          signals: data.signals,
          marketData: data.marketData || [], // Add this
          lastUpdated: data.timestamp,
          isLoading: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh data',
        isLoading: false
      }));
    }
    
    updateSchedulerStatus();
  }, [scheduler, updateSchedulerStatus]);

  // Start scheduler
  const startScheduler = useCallback(() => {
    try {
      scheduler.start();
      updateSchedulerStatus();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start scheduler'
      }));
    }
  }, [scheduler, updateSchedulerStatus]);

  // Stop scheduler
  const stopScheduler = useCallback(() => {
    scheduler.stop();
    updateSchedulerStatus();
  }, [scheduler, updateSchedulerStatus]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Set up data subscription and initial load
  useEffect(() => {
    console.log('🔌 Setting up news data subscription...');
    
    // Subscribe to scheduler updates
    const unsubscribe = scheduler.subscribe(handleDataUpdate);
    
    // Update initial scheduler status
    updateSchedulerStatus();
    
    // Auto-start scheduler if not running
    const status = scheduler.getStatus();
    if (!status.isRunning) {
      console.log('🚀 Auto-starting news data scheduler...');
      startScheduler();
    }
    
    // Cleanup subscription on unmount
    return () => {
      console.log('🔌 Cleaning up news data subscription...');
      unsubscribe();
    };
  }, [scheduler, handleDataUpdate, updateSchedulerStatus, startScheduler]);

  // Periodic status updates
  useEffect(() => {
    const statusInterval = setInterval(updateSchedulerStatus, 10000); // Update every 10 seconds
    return () => clearInterval(statusInterval);
  }, [updateSchedulerStatus]);

  return {
    ...state,
    refreshData,
    startScheduler,
    stopScheduler,
    clearError
  };
};

// Export types for use in components
export type { NewsDataState, UseNewsDataReturn };