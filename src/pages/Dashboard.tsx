import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  Star
} from "lucide-react"

const mockSignals = [
  {
    id: '1',
    asset: 'AAPL',
    type: 'BUY' as const,
    confidence: 92,
    timestamp: '2m ago',
    description: 'Strong momentum breakout above resistance level with increased institutional buying pressure.',
    sources: ['news', 'technical'] as ('news' | 'social' | 'technical')[],
    price: '$174.52',
    change: 2.3
  },
  {
    id: '2',
    asset: 'TSLA',
    type: 'SELL' as const,
    confidence: 78,
    timestamp: '5m ago',
    description: 'Overbought conditions detected with negative sentiment shift in social media discussions.',
    sources: ['social', 'technical'] as ('news' | 'social' | 'technical')[],
    price: '$248.91',
    change: -1.2
  },
  {
    id: '3',
    asset: 'NVDA',
    type: 'BUY' as const,
    confidence: 85,
    timestamp: '8m ago',
    description: 'AI sector optimism continues with strong earnings expectations and analyst upgrades.',
    sources: ['news', 'social', 'technical'] as ('news' | 'social' | 'technical')[],
    price: '$429.18',
    change: 3.7
  },
  {
    id: '4',
    asset: 'MSFT',
    type: 'HOLD' as const,
    confidence: 65,
    timestamp: '12m ago',
    description: 'Mixed signals from recent cloud earnings, awaiting clearer directional catalyst.',
    sources: ['news'] as ('news' | 'social' | 'technical')[],
    price: '$378.45',
    change: 0.8
  }
]

const watchlistItems = [
  { symbol: 'SPY', price: '$486.52', change: 1.2 },
  { symbol: 'QQQ', price: '$403.78', change: 2.1 },
  { symbol: 'BTC-USD', price: '$67,234', change: -0.8 },
  { symbol: 'GOOGL', price: '$168.91', change: 0.5 }
]

export default function Dashboard() {
  return (
    <div className="space-y-8 p-6">
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-2xl border-border bg-card hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Signals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">127</div>
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                <TrendingUp className="w-3 h-3 mr-1" />
                +23%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">From last week</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">84.5%</div>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                <BarChart3 className="w-3 h-3 mr-1" />
                High
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Quality score</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Market Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">Bullish</div>
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                <Users className="w-3 h-3 mr-1" />
                +8%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Social & news</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">+$12.4K</div>
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                <TrendingUp className="w-3 h-3 mr-1" />
                +5.2%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Signal Cards */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Latest Signals</h2>
            <Button variant="ghost" className="text-primary hover:text-primary/80">
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {mockSignals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </div>
        </div>

        {/* Watchlist */}
        <div className="lg:col-span-1">
          <Card className="rounded-2xl border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Watchlist</span>
                <Button variant="ghost" size="sm">
                  <Star className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {watchlistItems.map((item) => (
                <div key={item.symbol} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                  <div>
                    <div className="font-medium">{item.symbol}</div>
                    <div className="text-sm text-muted-foreground">{item.price}</div>
                  </div>
                  <div className={`text-sm font-medium ${
                    item.change > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {item.change > 0 ? '+' : ''}{item.change}%
                  </div>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full mt-4 rounded-xl border-dashed"
              >
                Add Symbol
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
