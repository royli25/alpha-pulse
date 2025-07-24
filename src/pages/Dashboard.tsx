
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
import sampleData from "@/data/sampleData.json"

export default function Dashboard() {
  const { dashboardMetrics, signals, watchlist } = sampleData

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
              <div className="text-2xl font-bold">{dashboardMetrics.activeSignals.value}</div>
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{dashboardMetrics.activeSignals.change}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{dashboardMetrics.activeSignals.period}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">{dashboardMetrics.avgConfidence.value}{dashboardMetrics.avgConfidence.unit}</div>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                <BarChart3 className="w-3 h-3 mr-1" />
                {dashboardMetrics.avgConfidence.quality}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{dashboardMetrics.avgConfidence.description}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Market Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">{dashboardMetrics.marketSentiment.value}</div>
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                <Users className="w-3 h-3 mr-1" />
                +{dashboardMetrics.marketSentiment.change}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{dashboardMetrics.marketSentiment.source}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">+${(dashboardMetrics.portfolioImpact.value / 1000).toFixed(1)}K</div>
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{dashboardMetrics.portfolioImpact.change}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{dashboardMetrics.portfolioImpact.period}</p>
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
            {signals.slice(0, 4).map((signal) => (
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
              {watchlist.map((item) => (
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
