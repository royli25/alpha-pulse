// src/components/NewsAPITest.tsx

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNewsData } from "@/hooks/useNewsData";
import { 
  Newspaper, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ExternalLink,
  RefreshCw,
  Play,
  Pause,
  AlertCircle,
  CheckCircle
} from "lucide-react";

export const NewsAPITest = () => {
  const { 
    articles, 
    signals, 
    isLoading, 
    error, 
    lastUpdated, 
    schedulerStatus,
    refreshData,
    startScheduler,
    stopScheduler,
    clearError
  } = useNewsData();

  const [showDetails, setShowDetails] = useState(false);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return TrendingUp;
      case 'negative': return TrendingDown;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">NewsAPI Integration Test</h2>
          <p className="text-muted-foreground">
            Test your NewsAPI implementation and monitor real-time data collection
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            variant={schedulerStatus.isRunning ? "destructive" : "default"}
            size="sm"
            onClick={schedulerStatus.isRunning ? stopScheduler : startScheduler}
          >
            {schedulerStatus.isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-medium">Error: {error}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={clearError}>
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Scheduler Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              {schedulerStatus.isRunning ? (
                <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
              ) : (
                <AlertCircle className="w-4 h-4 mr-2 text-yellow-400" />
              )}
              Scheduler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schedulerStatus.isRunning ? 'Active' : 'Inactive'}
            </div>
            <p className="text-xs text-muted-foreground">
              {schedulerStatus.totalRuns} total runs
            </p>
          </CardContent>
        </Card>

        {/* Articles Collected */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Newspaper className="w-4 h-4 mr-2" />
              Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{articles.length}</div>
            <p className="text-xs text-muted-foreground">
              {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Not updated'}
            </p>
          </CardContent>
        </Card>

        {/* Signals Generated */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{signals.length}</div>
            <p className="text-xs text-muted-foreground">
              From news analysis
            </p>
          </CardContent>
        </Card>

        {/* Error Count */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedulerStatus.errors}</div>
            <p className="text-xs text-muted-foreground">
              Collection errors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Articles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Newspaper className="w-5 h-5 mr-2" />
              Recent Financial News
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {articles.length > 0 ? (
            <div className="space-y-4">
              {articles.slice(0, 5).map((article) => {
                const SentimentIcon = getSentimentIcon(article.sentiment);
                return (
                  <div key={article.id} className="border-l-2 border-border pl-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm leading-tight">
                          {article.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {article.source} • {new Date(article.publishedAt).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge variant="outline" className={getSentimentColor(article.sentiment)}>
                          <SentimentIcon className="w-3 h-3 mr-1" />
                          {article.sentiment}
                        </Badge>
                        <Badge variant="secondary">
                          {article.confidence}%
                        </Badge>
                      </div>
                    </div>
                    
                    {showDetails && (
                      <>
                        <p className="text-xs text-muted-foreground">
                          {article.description}
                        </p>
                        {article.relevantSymbols.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">Symbols:</span>
                            {article.relevantSymbols.map(symbol => (
                              <Badge key={symbol} variant="outline" className="text-xs">
                                {symbol}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <a 
                          href={article.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-blue-400 hover:text-blue-300"
                        >
                          Read full article <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No articles collected yet</p>
              <p className="text-sm">Start the scheduler to begin collecting news data</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Signals */}
      {signals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Generated Trading Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {signals.map((signal) => (
                <div key={signal.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant={signal.type === 'BUY' ? 'default' : 'destructive'}>
                      {signal.type}
                    </Badge>
                    <span className="font-medium">{signal.asset}</span>
                    <span className="text-sm text-muted-foreground">
                      {signal.description}
                    </span>
                  </div>
                  <Badge variant="outline">
                    {signal.confidence}% confidence
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};