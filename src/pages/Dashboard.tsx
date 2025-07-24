
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
  ChevronUp
} from "lucide-react"
import sampleData from "@/data/sampleData.json"
import React from "react"
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
    <div className="space-y-8 p-6 pr-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, Alex. Here's your market intelligence overview.
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6">
          <Zap className="w-4 h-4 mr-2" />
          Generate Signal
        </Button>
      </div>

      {/* Live Status Indicator - Add this NEW section */}
      {(liveSignals.length > 0 || articles.length > 0) && (
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border-dashed border-2 border-green-500/30">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                schedulerStatus.isRunning 
                  ? 'bg-green-400 animate-pulse' 
                  : 'bg-gray-400'
              }`} />
              <span className="font-medium text-green-400">
                Live Market Intelligence Active
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>{articles.length} articles</span>
              <span>{liveSignals.length} live signals</span>
              <span>{marketData.length} market quotes</span>
              {lastUpdated && <span>Updated: {lastUpdated.toLocaleTimeString()}</span>}
            </div>
          </div>
          {error && (
            <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
              {error.substring(0, 30)}...
            </Badge>
          )}
        </div>
      )}

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
        {/* Signal Cards - Keep exact styling, use live data */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Latest Signals</h2>
            <div className="flex items-center space-x-2">
              {liveSignals.length > 0 && (
                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                  LIVE
                </Badge>
              )}
              <Button variant="ghost" className="bg-[rgba(120,120,128,0.1)] text-primary hover:bg-[rgba(120,120,128,0.15)] border-none shadow-none">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {typedSignals.slice(0, 4).map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </div>
        </div>

        {/* Recent News - Enhanced with live data */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent News</h2>
            <div className="flex items-center space-x-2">
              {articles.length > 0 && (
                <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                  {articles.length} LIVE
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={() => setNewsCollapsed(v => !v)}>
                {newsCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          {!newsCollapsed && (
            <div className="space-y-4">
              {displayNews.map((news) => (
                <div key={news.id} className="p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm leading-tight">{news.title}</h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{news.source}</span>
                      <span>
                        {/* Handle both live and sample data timestamp formats */}
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
                      
                      {/* Live data confidence score */}
                      {news.confidence && (
                        <Badge variant="secondary" className="text-xs">
                          {news.confidence}%
                        </Badge>
                      )}
                      
                      {/* Show relevant symbols for live data or sample data */}
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
          )}
        </div>
      </div>

      {/* Live Market Data - NEW SECTION */}
      {marketData.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Live Market Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {marketData.slice(0, 3).map((data) => (
              <div key={data.quote.symbol} className="p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-lg">{data.quote.symbol}</span>
                  <Badge variant={data.quote.changePercent > 0 ? 'default' : 'destructive'}>
                    {data.quote.changePercent > 0 ? '+' : ''}{data.quote.changePercent.toFixed(1)}%
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-medium text-foreground">${data.quote.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Volume:</span>
                    <span>{(data.quote.volume / 1000000).toFixed(1)}M</span>
                  </div>
                  {data.technicals.length > 0 && (
                    <div className="flex justify-between">
                      <span>RSI:</span>
                      <span className={
                        data.technicals.find(t => t.indicator === 'RSI')?.value < 30 ? 'text-green-400' :
                        data.technicals.find(t => t.indicator === 'RSI')?.value > 70 ? 'text-red-400' : 'text-yellow-400'
                      }>
                        {data.technicals.find(t => t.indicator === 'RSI')?.value.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
