
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

type Signal = {
  id: string
  asset: string
  type: 'BUY' | 'SELL' | 'HOLD'
  confidence: number
  timestamp: string
  description: string
  sources: Array<'news' | 'social' | 'technical'>
  price: string
  change: number
  redditMentions?: number
  newsArticles?: number
  socialSentiment?: string
}

export default function Dashboard() {
  const { dashboardMetrics, signals, marketNews } = sampleData
  const typedSignals = signals as Signal[]
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

      {/* Consolidated KPI Row - Moderately Compact */}
      <div className="flex flex-row justify-between w-full gap-4 py-3 px-2 bg-transparent" style={{ fontSize: '0.5em' }}>
        {/* Active Signals */}
        <div className="space-y-2 flex-1">
          <div className="text-base font-semibold text-muted-foreground">Active Signals</div>
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-extrabold">{dashboardMetrics.activeSignals.value}</div>
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 text-[1em] px-2 py-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{dashboardMetrics.activeSignals.change}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{dashboardMetrics.activeSignals.period}</p>
        </div>

        {/* Avg Confidence */}
        <div className="space-y-2 flex-1">
          <div className="text-base font-semibold text-muted-foreground">Avg Confidence</div>
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-extrabold">{dashboardMetrics.avgConfidence.value}{dashboardMetrics.avgConfidence.unit}</div>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[1em] px-2 py-1">
              <BarChart3 className="w-3 h-3 mr-1" />
              {dashboardMetrics.avgConfidence.quality}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{dashboardMetrics.avgConfidence.description}</p>
        </div>

        {/* Market Sentiment */}
        <div className="space-y-2 flex-1">
          <div className="text-base font-semibold text-muted-foreground">Market Sentiment</div>
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-extrabold">{dashboardMetrics.marketSentiment.value}</div>
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 text-[1em] px-2 py-1">
              <Users className="w-3 h-3 mr-1" />
              +{dashboardMetrics.marketSentiment.change}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{dashboardMetrics.marketSentiment.source}</p>
        </div>

        {/* Portfolio Impact */}
        <div className="space-y-2 flex-1">
          <div className="text-base font-semibold text-muted-foreground">Portfolio Impact</div>
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-extrabold">+${(dashboardMetrics.portfolioImpact.value / 1000).toFixed(1)}K</div>
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 text-[1em] px-2 py-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{dashboardMetrics.portfolioImpact.change}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{dashboardMetrics.portfolioImpact.period}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Signal Cards */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Latest Signals</h2>
            <Button variant="ghost" className="bg-[rgba(120,120,128,0.1)] text-primary hover:bg-[rgba(120,120,128,0.15)] border-none shadow-none">
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {typedSignals.slice(0, 4).map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </div>
        </div>

        {/* Recent News - No Card Wrapper */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent News</h2>
            <Button variant="ghost" size="sm" onClick={() => setNewsCollapsed(v => !v)}>
              {newsCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </Button>
          </div>
          {!newsCollapsed && (
            <div className="space-y-4">
              {marketNews.map((news) => (
                <div key={news.id} className="p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm leading-tight">{news.title}</h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{news.source}</span>
                      <span>{news.timestamp}</span>
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
                      {news.relevantSymbols.length > 0 && (
                        <div className="flex gap-1">
                          {news.relevantSymbols.slice(0, 2).map((symbol) => (
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
    </div>
  )
}
