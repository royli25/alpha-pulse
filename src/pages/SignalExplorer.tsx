
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Search, 
  Filter, 
  Download, 
  Grid, 
  List, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Zap
} from "lucide-react"
import { SignalCard } from "@/components/SignalCard"

const allSignals = [
  {
    id: '1',
    asset: 'AAPL',
    type: 'BUY' as const,
    confidence: 92,
    timestamp: '2m ago',
    description: 'Strong momentum breakout above resistance level with increased institutional buying pressure.',
    sources: ['news', 'technical'] as const,
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
    sources: ['social', 'technical'] as const,
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
    sources: ['news', 'social', 'technical'] as const,
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
    sources: ['news'] as const,
    price: '$378.45',
    change: 0.8
  },
  {
    id: '5',
    asset: 'GOOGL',
    type: 'BUY' as const,
    confidence: 88,
    timestamp: '15m ago',
    description: 'Search ad revenue growth momentum with positive regulatory environment signals.',
    sources: ['news', 'technical'] as const,
    price: '$168.91',
    change: 1.9
  },
  {
    id: '6',
    asset: 'META',
    type: 'SELL' as const,
    confidence: 73,
    timestamp: '18m ago',
    description: 'Regulatory headwinds and user growth concerns impacting near-term outlook.',
    sources: ['news', 'social'] as const,
    price: '$512.78',
    change: -2.1
  }
]

export default function SignalExplorer() {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState({
    type: 'all',
    confidence: 'all',
    source: 'all'
  })

  const filteredSignals = allSignals.filter(signal => {
    const matchesSearch = signal.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         signal.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filters.type === 'all' || signal.type === filters.type
    const matchesConfidence = filters.confidence === 'all' || 
                             (filters.confidence === 'high' && signal.confidence >= 80) ||
                             (filters.confidence === 'medium' && signal.confidence >= 60 && signal.confidence < 80) ||
                             (filters.confidence === 'low' && signal.confidence < 60)
    
    return matchesSearch && matchesType && matchesConfidence
  })

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter">Signal Explorer</h1>
          <p className="text-muted-foreground mt-1">
            Discover and analyze trading signals with advanced filtering and search.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="rounded-xl">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <div className="flex items-center border border-border rounded-xl overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="rounded-2xl border-border bg-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search signals, assets, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            
            <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Signal Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="BUY">Buy Signals</SelectItem>
                <SelectItem value="SELL">Sell Signals</SelectItem>
                <SelectItem value="HOLD">Hold Signals</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.confidence} onValueChange={(value) => setFilters({...filters, confidence: value})}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Confidence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Confidence</SelectItem>
                <SelectItem value="high">High (80%+)</SelectItem>
                <SelectItem value="medium">Medium (60-79%)</SelectItem>
                <SelectItem value="low">Low (<60%)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.source} onValueChange={(value) => setFilters({...filters, source: value})}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Data Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="news">News</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="technical">Technical Analysis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                {filteredSignals.length} signals found
              </Badge>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Quick filters:</span>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                  High Confidence
                </Button>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                  Buy Signals
                </Button>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                  Recent
                </Button>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setSearchTerm("")
                setFilters({ type: 'all', confidence: 'all', source: 'all' })
              }}
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSignals.map((signal) => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </div>
      ) : (
        <Card className="rounded-2xl border-border bg-card">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filteredSignals.map((signal) => (
                <div key={signal.id} className="p-6 hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          signal.type === 'BUY' ? 'bg-green-500/20' :
                          signal.type === 'SELL' ? 'bg-red-500/20' :
                          'bg-yellow-500/20'
                        }`}>
                          {signal.type === 'BUY' ? (
                            <TrendingUp className="w-5 h-5 text-green-400" />
                          ) : signal.type === 'SELL' ? (
                            <TrendingDown className="w-5 h-5 text-red-400" />
                          ) : (
                            <Clock className="w-5 h-5 text-yellow-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{signal.asset}</h3>
                          <p className="text-sm text-muted-foreground">{signal.price}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={signal.type === 'BUY' ? 'default' : signal.type === 'SELL' ? 'destructive' : 'secondary'}
                        className="font-medium"
                      >
                        {signal.type}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Badge 
                        variant="outline" 
                        className={`font-semibold ${
                          signal.confidence >= 80 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          signal.confidence >= 60 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}
                      >
                        {signal.confidence}%
                      </Badge>
                      <div className="text-sm text-muted-foreground">{signal.timestamp}</div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                    {signal.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
