import React, { createContext, useContext, useState, useEffect } from 'react';

interface Signal {
  id: string;
  asset: string;
  type: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  timestamp: string;
  description: string;
  sources: Array<'news' | 'social' | 'technical'>;
  price: string | number;
  change: number;
  redditMentions?: number;
  newsArticles?: number;
  socialSentiment?: string;
  indicator?: string;
  value?: number;
}

interface WatchlistContextType {
  bookmarkedSignals: Signal[];
  addToWatchlist: (signal: Signal) => void;
  removeFromWatchlist: (signalId: string) => void;
  isBookmarked: (signalId: string) => boolean;
  toggleBookmark: (signal: Signal) => void;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [bookmarkedSignals, setBookmarkedSignals] = useState<Signal[]>([]);

  // Load bookmarked signals from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('watchlist');
    if (saved) {
      try {
        setBookmarkedSignals(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading watchlist from localStorage:', error);
      }
    }
  }, []);

  // Save to localStorage whenever bookmarkedSignals changes
  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(bookmarkedSignals));
  }, [bookmarkedSignals]);

  const addToWatchlist = (signal: Signal) => {
    setBookmarkedSignals(prev => {
      if (!prev.find(s => s.id === signal.id)) {
        return [...prev, signal];
      }
      return prev;
    });
  };

  const removeFromWatchlist = (signalId: string) => {
    setBookmarkedSignals(prev => prev.filter(s => s.id !== signalId));
  };

  const isBookmarked = (signalId: string) => {
    return bookmarkedSignals.some(s => s.id === signalId);
  };

  const toggleBookmark = (signal: Signal) => {
    if (isBookmarked(signal.id)) {
      removeFromWatchlist(signal.id);
    } else {
      addToWatchlist(signal);
    }
  };

  return (
    <WatchlistContext.Provider value={{
      bookmarkedSignals,
      addToWatchlist,
      removeFromWatchlist,
      isBookmarked,
      toggleBookmark
    }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
} 