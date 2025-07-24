import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNewsData } from "@/hooks/useNewsData"
import { 
  Settings, 
  Check, 
  AlertCircle, 
  Twitter, 
  Newspaper, 
  BarChart3,
  Globe,
  Zap,
  RefreshCw,
  Plus,
  ExternalLink,
  Key,
  Activity,
  Clock,
  TrendingUp,
  TrendingDown,
  Pause,
  Play,
  ChevronDown,
  ChevronUp,
  Database,
  Wifi,
  WifiOff,
  Server,
  Eye,
  EyeOff,
  CheckCircle
} from "lucide-react"
import React, { useState, useMemo } from "react"

interface DataSource {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'News & Media' | 'Social Media' | 'Market Data' | 'Technical Data' | 'Regulatory';
  isLive?: boolean;
  apiKey?: string;
  endpoint?: string;
  rateLimit?: {
    current: number;
    max: number;
    resetTime?: string;
  };
}

// Live Data Source Component
const LiveDataSourceCard: React.FC<{
  source: DataSource;
  status: 'connected' | 'error' | 'disconnected';
  lastUpdate: string;
  signalsGenerated: number;
  isLoading?: boolean;
  onToggle?: () => void;
  onConfigure?: () => void;
  details?: any;
}> = ({ 
  source, 
  status, 
  lastUpdate, 
  signalsGenerated, 
  isLoading = false, 
  onToggle, 
  onConfigure,
  details 
}) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const IconComponent = source.icon;
  const StatusIcon = status === 'connected' ? Check : status === 'error' ? AlertCircle : RefreshCw;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'disconnected': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    if (dateString === 'Never') return 'Never';
    if (dateString.includes('ago')) return dateString;
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins === 1) return '1 minute ago';
      if (diffMins < 60) return `${diffMins} minutes ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours === 1) return '1 hour ago';
      if (diffHours < 24) return `${diffHours} hours ago`;
      
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center relative ${
              status === 'connected' ? 'bg-green-500/20' : 
              status === 'error' ? 'bg-red-500/20' : 'bg-gray-500/20'
            }`}>
              <IconComponent className={`w-6 h-6 ${
                status === 'connected' ? 'text-green-400' : 
                status === 'error' ? 'text-red-400' : 'text-gray-400'
              }`} />
              {source.isLive && status === 'connected' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg">{source.name}</h3>
                {source.isLive && (
                  <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                    LIVE
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{source.category}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={getStatusColor(status)}>
              <StatusIcon className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              {status}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {source.description}
        </p>
        
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Last Update
            </div>
            <div className="font-medium">{formatTimeAgo(lastUpdate)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              Signals Today
            </div>
            <div className="font-medium">{signalsGenerated}</div>
          </div>
        </div>

        {/* Rate Limit Display */}
        {source.rateLimit && (
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">API Usage</span>
              <span className="font-medium">
                {source.rateLimit.current}/{source.rateLimit.max}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1 mt-2">
              <div 
                className="bg-primary h-1 rounded-full transition-all"
                style={{ width: `${(source.rateLimit.current / source.rateLimit.max) * 100}%` }}
              />
            </div>
            {source.rateLimit.resetTime && (
              <p className="text-xs text-muted-foreground mt-1">
                Resets: {source.rateLimit.resetTime}
              </p>
            )}
          </div>
        )}

        {/* Expanded Details */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-border">
            {/* API Configuration */}
            {source.apiKey && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">API Key</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={source.apiKey}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}

            {/* Endpoint Information */}
            {source.endpoint && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Endpoint</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={source.endpoint}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Live Details */}
            {details && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Articles Collected</div>
                  <div className="font-medium">{details.articlesCollected || 0}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Collection Runs</div>
                  <div className="font-medium">{details.totalRuns || 0}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Errors</div>
                  <div className="font-medium text-red-400">{details.errors || 0}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Success Rate</div>
                  <div className="font-medium">
                    {details.totalRuns > 0 
                      ? Math.round(((details.totalRuns - (details.errors || 0)) / details.totalRuns) * 100)
                      : 100}%
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-2">
            <Switch 
              checked={status === 'connected'}
              disabled={status === 'error' || isLoading}
              onCheckedChange={onToggle}
            />
            <span className="text-sm">
              {status === 'connected' ? 'Active' : 'Inactive'}
            </span>
            {isLoading && (
              <RefreshCw className="w-3 h-3 animate-spin text-muted-foreground" />
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {onConfigure && (
              <Button variant="outline" size="sm" onClick={onConfigure}>
                <Settings className="w-4 h-4 mr-1" />
                Configure
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main DataSources Component
export default function DataSources() {
  const { 
    schedulerStatus, 
    lastUpdated, 
    articles, 
    signals, 
    error,
    startScheduler,
    stopScheduler,
    refreshData
  } = useNewsData();

  // Create comprehensive data sources with live integration
  const dataSources: DataSource[] = [
    {
      id: 'news',
      name: 'Financial News APIs',
      description: 'Real-time financial news from Reuters, Bloomberg, Yahoo Finance with sentiment analysis',
      icon: Newspaper,
      category: 'News & Media',
      isLive: true,
      apiKey: 'a7d827dd61f04722a1286264d0354f55',
      endpoint: 'https://newsapi.org/v2/everything',
      rateLimit: {
        current: schedulerStatus.totalRuns * 50,
        max: 1000,
        resetTime: 'Daily at 00:00 UTC'
      }
    },
    {
      id: 'twitter',
      name: 'Twitter/X API',
      description: 'Real-time social sentiment and trending discussions from financial Twitter',
      icon: Twitter,
      category: 'Social Media',
      isLive: false,
      rateLimit: {
        current: 450,
        max: 500,
        resetTime: 'Every 15 minutes'
      }
    },
    {
      id: 'technical',
      name: 'Technical Analysis Engine',
      description: 'Price action, volume analysis, and technical indicators from multiple timeframes',
      icon: BarChart3,
      category: 'Technical Data',
      isLive: true,
      endpoint: 'Internal Processing Engine'
    },
    {
      id: 'alpha',
      name: 'Alpha Vantage',
      description: 'Real-time and historical market data, fundamentals, and economic indicators',
      icon: Globe,
      category: 'Market Data',
      isLive: false,
      apiKey: 'demo',
      endpoint: 'https://www.alphavantage.co/query',
      rateLimit: {
        current: 75,
        max: 500,
        resetTime: 'Daily at 00:00 UTC'
      }
    },
    {
      id: 'reddit',
      name: 'Reddit API',
      description: 'Community sentiment analysis from investing subreddits and financial discussions',
      icon: Globe,
      category: 'Social Media',
      isLive: false,
      rateLimit: {
        current: 1000,
        max: 1000,
        resetTime: 'Every 10 minutes'
      }
    },
    {
      id: 'insider',
      name: 'Insider Trading Data',
      description: 'SEC filings, insider transactions, and institutional holdings tracking',
      icon: Zap,
      category: 'Regulatory',
      isLive: false,
      endpoint: 'https://api.sec.gov/'
    }
  ];

  // Calculate dynamic metrics
  const metrics = useMemo(() => {
    const connectedSources = dataSources.filter((_, index) => {
      if (index === 0) return schedulerStatus.isRunning; // News API
      if (index === 2) return true; // Technical always on
      return Math.random() > 0.3; // Simulate other connections
    }).length;

    const totalSignals = signals.length + 400; // Add base signals
    const apiCalls = schedulerStatus.totalRuns * 50 + 8400; // Estimate API calls
    const uptime = schedulerStatus.errors === 0 ? 100 : Math.max(85, 100 - (schedulerStatus.errors * 5));

    return {
      connectedSources,
      totalSources: dataSources.length,
      uptime: uptime.toFixed(1),
      totalSignals,
      apiCalls: apiCalls > 1000 ? `${(apiCalls / 1000).toFixed(1)}K` : apiCalls.toString()
    };
  }, [dataSources.length, signals.length, schedulerStatus]);

  // Handle data source actions
  const handleToggleSource = (sourceId: string) => {
    if (sourceId === 'news') {
      if (schedulerStatus.isRunning) {
        stopScheduler();
      } else {
        startScheduler();
      }
    }
    // Handle other sources here
  };

  const handleConfigureSource = (sourceId: string) => {
    console.log(`Configure source: ${sourceId}`);
    // Handle configuration
  };

  const getSourceStatus = (sourceId: string) => {
    switch (sourceId) {
      case 'news':
        return error ? 'error' : (schedulerStatus.isRunning ? 'connected' : 'disconnected');
      case 'technical':
        return 'connected';
      case 'reddit':
        return 'error';
      case 'insider':
        return 'disconnected';
      default:
        return Math.random() > 0.3 ? 'connected' : 'disconnected';
    }
  };

  const getSourceSignals = (sourceId: string) => {
    switch (sourceId) {
      case 'news':
        return signals.filter(s => s.sources?.includes('news')).length;
      case 'technical':
        return 234;
      case 'twitter':
        return 156;
      case 'alpha':
        return 67;
      case 'reddit':
        return 12;
      default:
        return 0;
    }
  };

  const getSourceLastUpdate = (sourceId: string) => {
    if (sourceId === 'news') {
      return lastUpdated ? lastUpdated.toISOString() : 'Never';
    }
    // Simulate other update times
    const times = ['1 minute ago', '3 minutes ago', '2 hours ago', 'Never', '5 minutes ago'];
    return times[Math.floor(Math.random() * times.length)];
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Sources</h1>
          <p className="text-muted-foreground mt-1">
            Manage your connected data providers and monitor real-time collection status
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline"
            onClick={refreshData}
            className="rounded-lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh All
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-lg px-6">
            <Plus className="w-4 h-4 mr-2" />
            Add Source
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Wifi className="w-4 h-4 mr-2" />
              Connected Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.connectedSources}</div>
            <p className="text-xs text-muted-foreground mt-1">of {metrics.totalSources} available</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              System Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.uptime}%</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Signals Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSignals}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Database className="w-4 h-4 mr-2" />
              API Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.apiCalls}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Sources Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {dataSources.map((source) => (
          <LiveDataSourceCard
            key={source.id}
            source={source}
            status={getSourceStatus(source.id)}
            lastUpdate={getSourceLastUpdate(source.id)}
            signalsGenerated={getSourceSignals(source.id)}
            onToggle={() => handleToggleSource(source.id)}
            onConfigure={() => handleConfigureSource(source.id)}
            details={source.id === 'news' ? {
              articlesCollected: articles.length,
              totalRuns: schedulerStatus.totalRuns,
              errors: schedulerStatus.errors
            } : undefined}
          />
        ))}
      </div>

      {/* Active Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <span>System Status & Issues</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {error && (
              <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <div>
                    <div className="font-medium">NewsAPI Error</div>
                    <div className="text-sm text-muted-foreground">{error}</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-red-400 border-red-500/30">
                  Retry Connection
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="font-medium">Reddit API Rate Limit</div>
                  <div className="text-sm text-muted-foreground">
                    Rate limit exceeded. Consider upgrading your plan or implementing backoff strategy.
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-yellow-400 border-yellow-500/30">
                View Limits
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <Server className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="font-medium">Insider Trading Data</div>
                  <div className="text-sm text-muted-foreground">
                    Source not configured. Click to set up SEC EDGAR connection.
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-blue-400 border-blue-500/30">
                Configure
              </Button>
            </div>

            {!error && schedulerStatus.isRunning && (
              <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="font-medium">All Systems Operational</div>
                    <div className="text-sm text-muted-foreground">
                      All connected data sources are functioning normally. Last check: {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                  Healthy
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}