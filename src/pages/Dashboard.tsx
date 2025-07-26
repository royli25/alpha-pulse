import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SignalCard } from "@/components/SignalCard"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Zap, 
  Users, 
  BarChart3,
  ArrowRight,
  Star,
  ChevronDown,
  ChevronUp,
  Shuffle
} from "lucide-react"
import sampleData from "@/data/sampleData.json"
import React, { useState } from "react"
// Add live data import
import { useNewsData } from "@/hooks/useNewsData"

type Signal = {
  id: string
  asset: string
  type: 'BUY' | 'SELL' | 'HOLD'
  confidence: number
  timestamp: string
  description: string
  sources: Array<'news' | 'social' | 'technical'>
  price: string | number  // Allow both string and number
  change: number
  redditMentions?: number
  newsArticles?: number
  socialSentiment?: string
  indicator?: string      // Add this for technical indicators
  value?: number         // Add this for indicator values
}

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);

  // Get live data
  const { 
    articles, 
    signals: liveSignals, 
    marketData, 
    schedulerStatus,
    lastUpdated,
    error 
  } = useNewsData();

  // Keep sample data as fallback
  const { dashboardMetrics, signals: sampleSignals, marketNews } = sampleData;
  
  // Use live signals if available, otherwise fall back to sample data
  const displaySignals = liveSignals.length > 0 ? liveSignals : sampleSignals;
  const displayNews = articles.length > 0 ? articles : marketNews;
  
  // Convert live signals to match your existing Signal type
  const typedSignals = displaySignals.map(signal => ({
    ...signal,
    price: typeof signal.price === 'number'
      ? `$${signal.price.toFixed(2)}`
      : (signal.price || '$0.00'),
    change: signal.change || 0,
    redditMentions: signal.redditMentions || 0,
    newsArticles: signal.newsArticles || 0,
    socialSentiment: signal.socialSentiment || 'neutral'
  })) as Signal[];

  // Filter signals based on search term and filter type
  const filteredSignals = typedSignals.filter(signal => {
    const matchesSearch = signal.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         signal.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || signal.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  // Shuffle utility
  function shuffleArray(array: any[]) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Always show exactly 6 signals - pad with sample data if needed
  let displaySignalsToShow = filteredSignals;
  if (filteredSignals.length > 6) {
    displaySignalsToShow = shuffleArray(filteredSignals).slice(0, 6 + refreshKey * 0); // shuffle on refreshKey change
  } else if (filteredSignals.length < 6) {
    const sampleSignalsConverted = sampleSignals.map(signal => ({
      ...signal,
      price: signal.price || '$0.00',
      change: signal.change || 0,
      redditMentions: signal.redditMentions || 0,
      newsArticles: signal.newsArticles || 0,
      socialSentiment: signal.socialSentiment || 'neutral'
    })) as Signal[];
    const additionalSignals = sampleSignalsConverted.filter(signal =>
      !displaySignalsToShow.some(existing => existing.id === signal.id)
    );
    displaySignalsToShow = [
      ...displaySignalsToShow,
      ...additionalSignals.slice(0, 6 - displaySignalsToShow.length)
    ];
  }
  displaySignalsToShow = displaySignalsToShow.slice(0, 6);

  // Calculate live metrics (keeping your existing structure)
  const liveMetrics = {
    activeSignals: {
      value: liveSignals.length > 0 ? liveSignals.length : dashboardMetrics.activeSignals.value,
      change: liveSignals.length > 0 ? 23 : dashboardMetrics.activeSignals.change,
      changeType: "increase",
      period: liveSignals.length > 0 ? "From live data" : dashboardMetrics.activeSignals.period
    },
    avgConfidence: {
      value: liveSignals.length > 0 
        ? Number((liveSignals.reduce((sum, s) => sum + s.confidence, 0) / liveSignals.length).toFixed(1))
        : dashboardMetrics.avgConfidence.value,
      unit: "%",
      quality: "High",
      description: liveSignals.length > 0 ? "Live calculation" : dashboardMetrics.avgConfidence.description
    },
    marketSentiment: {
      value: articles.length > 0 
        ? (articles.filter(a => a.sentiment === 'positive').length > articles.filter(a => a.sentiment === 'negative').length ? 'Bullish' : 'Bearish')
        : dashboardMetrics.marketSentiment.value,
      change: articles.length > 0 ? 12 : dashboardMetrics.marketSentiment.change,
      changeType: "increase",
      source: articles.length > 0 ? "Live news sentiment" : dashboardMetrics.marketSentiment.source
    },
    portfolioImpact: {
      value: dashboardMetrics.portfolioImpact.value, // Keep this static for now
      currency: "USD",
      change: dashboardMetrics.portfolioImpact.change,
      changeType: "increase",
      period: dashboardMetrics.portfolioImpact.period
    }
  };

  const [newsCollapsed, setNewsCollapsed] = React.useState(false)

  return (
    <div className="space-y-8 p-6 pr-8 relative min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, Alex. Here's your market intelligence overview.
          </p>
        </div>
      </div>

      {/* KPI Row - Use live metrics but keep exact styling */}
      <div className="flex flex-row justify-between w-full gap-4 py-3 px-2 bg-transparent" style={{ fontSize: '0.5em' }}>
        {/* Active Signals */}
        <div className="space-y-2 flex-1">
          <div className="text-base font-semibold text-muted-foreground">Active Signals</div>
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-extrabold">{liveMetrics.activeSignals.value}</div>
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 text-[1em] px-2 py-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{liveMetrics.activeSignals.change}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{liveMetrics.activeSignals.period}</p>
        </div>

        {/* Avg Confidence */}
        <div className="space-y-2 flex-1">
          <div className="text-base font-semibold text-muted-foreground">Avg Confidence</div>
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-extrabold">{liveMetrics.avgConfidence.value}{liveMetrics.avgConfidence.unit}</div>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[1em] px-2 py-1">
              <BarChart3 className="w-3 h-3 mr-1" />
              {liveMetrics.avgConfidence.quality}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{liveMetrics.avgConfidence.description}</p>
        </div>

        {/* Market Sentiment */}
        <div className="space-y-2 flex-1">
          <div className="text-base font-semibold text-muted-foreground">Market Sentiment</div>
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-extrabold">{liveMetrics.marketSentiment.value}</div>
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 text-[1em] px-2 py-1">
              <Users className="w-3 h-3 mr-1" />
              +{liveMetrics.marketSentiment.change}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{liveMetrics.marketSentiment.source}</p>
        </div>

        {/* Portfolio Impact */}
        <div className="space-y-2 flex-1">
          <div className="text-base font-semibold text-muted-foreground">Portfolio Impact</div>
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-extrabold">+${(liveMetrics.portfolioImpact.value / 1000).toFixed(1)}K</div>
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 text-[1em] px-2 py-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{liveMetrics.portfolioImpact.change}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{liveMetrics.portfolioImpact.period}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Signal Cards - 2 rows of 3, with controls above */}
        <div className="lg:col-span-3 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Signals</h2>
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search signals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 rounded-lg bg-muted/30 text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <Button 
                variant={filterType === 'all' ? 'default' : 'outline'} 
                className="px-4 py-2"
                onClick={() => setFilterType('all')}
              >
                All
              </Button>
              <Button 
                variant={filterType === 'buy' ? 'default' : 'outline'} 
                className="px-4 py-2"
                onClick={() => setFilterType('buy')}
              >
                Buy
              </Button>
              <Button 
                variant={filterType === 'sell' ? 'default' : 'outline'} 
                className="px-4 py-2"
                onClick={() => setFilterType('sell')}
              >
                Sell
              </Button>
              <Button 
                variant={filterType === 'hold' ? 'default' : 'outline'} 
                className="px-4 py-2"
                onClick={() => setFilterType('hold')}
              >
                Hold
              </Button>
              <Button
                variant="outline"
                className="px-4 py-2 flex items-center gap-2"
                onClick={() => setRefreshKey(k => k + 1)}
                title="Refresh selection"
              >
                <Shuffle className="w-4 h-4" /> Refresh
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {displaySignalsToShow.map((signal) => (
              <div key={signal.id} className="w-full h-full min-h-[280px]">
                <SignalCard signal={signal} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent News - Not collapsible, top 4 only */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent News</h2>
          </div>
          <div className="space-y-4">
            {displayNews.slice(0, 4).map((news) => (
              <div key={news.id} className="p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm leading-tight">{news.title}</h4>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{news.source}</span>
                    <span>
                      {news.publishedAt ? new Date(news.publishedAt).toLocaleTimeString() : news.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        news.sentiment === 'positive' 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : news.sentiment === 'negative'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}
                    >
                      {news.sentiment}
                    </Badge>
                    {news.confidence && (
                      <Badge variant="secondary" className="text-xs">
                        {news.confidence}%
                      </Badge>
                    )}
                    {(news.relevantSymbols || news.relevantSymbols)?.length > 0 && (
                      <div className="flex gap-1">
                        {(news.relevantSymbols || news.relevantSymbols).slice(0, 2).map((symbol) => (
                          <Badge key={symbol} variant="secondary" className="text-xs">
                            {symbol}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
