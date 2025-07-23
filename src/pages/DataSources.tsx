
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  Settings, 
  Check, 
  AlertCircle, 
  Twitter, 
  Newspaper, 
  BarChart3,
  Globe,
  Zap,
  RefreshCw
} from "lucide-react"

const dataSources = [
  {
    id: 'twitter',
    name: 'Twitter/X API',
    description: 'Real-time social sentiment and trending discussions',
    icon: Twitter,
    status: 'connected',
    lastUpdate: '2 minutes ago',
    signalsGenerated: 156,
    category: 'Social Media'
  },
  {
    id: 'news',
    name: 'Financial News APIs',
    description: 'Reuters, Bloomberg, Yahoo Finance news aggregation',
    icon: Newspaper,
    status: 'connected',
    lastUpdate: '5 minutes ago',
    signalsGenerated: 89,
    category: 'News & Media'
  },
  {
    id: 'technical',
    name: 'Technical Analysis',
    description: 'Price action, volume, and technical indicators',
    icon: BarChart3,
    status: 'connected',
    lastUpdate: '1 minute ago',
    signalsGenerated: 234,
    category: 'Technical Data'
  },
  {
    id: 'alpha',
    name: 'Alpha Vantage',
    description: 'Real-time and historical market data',
    icon: Globe,
    status: 'connected',
    lastUpdate: '3 minutes ago',
    signalsGenerated: 67,
    category: 'Market Data'
  },
  {
    id: 'reddit',
    name: 'Reddit API',
    description: 'Community sentiment from investing subreddits',
    icon: Globe,
    status: 'error',
    lastUpdate: '2 hours ago',
    signalsGenerated: 12,
    category: 'Social Media'
  },
  {
    id: 'insider',
    name: 'Insider Trading Data',
    description: 'SEC filings and insider transaction tracking',
    icon: Zap,
    status: 'disconnected',
    lastUpdate: 'Never',
    signalsGenerated: 0,
    category: 'Regulatory'
  }
]

export default function DataSources() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'disconnected': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return Check
      case 'error': return AlertCircle
      default: return RefreshCw
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter">Data Sources</h1>
          <p className="text-muted-foreground mt-1">
            Manage your connected data providers and signal generation sources.
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6">
          <Settings className="w-4 h-4 mr-2" />
          Add Source
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-2xl border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Connected Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground mt-1">of 6 available</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Data Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground mt-1">Uptime this month</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Signals Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">558</div>
            <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">API Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.4K</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {dataSources.map((source) => {
          const IconComponent = source.icon
          const StatusIcon = getStatusIcon(source.status)
          
          return (
            <Card key={source.id} className="rounded-2xl border-border bg-card hover-lift">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold">{source.name}</h3>
                      <p className="text-xs text-muted-foreground">{source.category}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(source.status)}
                    >
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {source.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {source.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Last Update</div>
                    <div className="font-medium">{source.lastUpdate}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Signals Today</div>
                    <div className="font-medium">{source.signalsGenerated}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={source.status === 'connected'}
                      disabled={source.status === 'error'}
                    />
                    <span className="text-sm">
                      {source.status === 'connected' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Connection Issues */}
      <Card className="rounded-2xl border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <span>Connection Issues</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div>
                <div className="font-medium">Reddit API</div>
                <div className="text-sm text-muted-foreground">
                  Rate limit exceeded. Consider upgrading your plan.
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-red-400 border-red-500/30">
                Resolve
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <div>
                <div className="font-medium">Insider Trading Data</div>
                <div className="text-sm text-muted-foreground">
                  Source not configured. Click to set up connection.
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-yellow-400 border-yellow-500/30">
                Configure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
