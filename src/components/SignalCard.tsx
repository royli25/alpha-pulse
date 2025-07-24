import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TrendingUp, TrendingDown, Clock, Zap, Twitter, Newspaper } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface SignalCardProps {
  signal: {
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
}

export function SignalCard({ signal }: SignalCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const getSignalColor = (type: string) => {
    switch (type) {
      case 'BUY': return 'text-green-400'
      case 'SELL': return 'text-red-400'
      default: return 'text-yellow-400'
    }
  }

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'BUY': return TrendingUp
      case 'SELL': return TrendingDown
      default: return Clock
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-500/20 text-green-400 border-green-500/30'
    if (confidence >= 60) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    return 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  const SignalIcon = getSignalIcon(signal.type)

  return (
    <>
      <Card 
        className="cursor-pointer group bg-[#121828] border-none rounded-2xl overflow-hidden transition-transform duration-150 hover:scale-[0.98]"
        onClick={() => setIsModalOpen(true)}
      >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              signal.type === 'BUY' && "bg-green-500/20",
              signal.type === 'SELL' && "bg-red-500/20",
              signal.type === 'HOLD' && "bg-yellow-500/20"
            )}>
              <SignalIcon className={cn("w-5 h-5", getSignalColor(signal.type))} />
            </div>
            <div>
              <h3 className="font-bold text-lg">{signal.asset}</h3>
              <p className="text-sm text-muted-foreground">{signal.price}</p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={cn("font-semibold", getConfidenceColor(signal.confidence))}
          >
            {signal.confidence}%
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge 
              variant={signal.type === 'BUY' ? 'default' : signal.type === 'SELL' ? 'destructive' : 'secondary'}
              className="font-medium"
            >
              {signal.type}
            </Badge>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{signal.timestamp}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {signal.description}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center space-x-2">
              {signal.sources.includes('news') && (
                <div className="w-6 h-6 bg-blue-500/20 rounded-md flex items-center justify-center">
                  <Newspaper className="w-3 h-3 text-blue-400" />
                </div>
              )}
              {signal.sources.includes('social') && (
                <div className="w-6 h-6 bg-secondary/20 rounded-md flex items-center justify-center">
                  <Twitter className="w-3 h-3 text-secondary" />
                </div>
              )}
              {signal.sources.includes('technical') && (
                <div className="w-6 h-6 bg-accent/20 rounded-md flex items-center justify-center">
                  <Zap className="w-3 h-3 text-accent" />
                </div>
              )}
            </div>
            
            <div className={cn(
              "text-sm font-medium",
              signal.change > 0 ? "text-green-400" : "text-red-400"
            )}>
              {signal.change > 0 ? '+' : ''}{signal.change}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              signal.type === 'BUY' && "bg-green-500/20",
              signal.type === 'SELL' && "bg-red-500/20",
              signal.type === 'HOLD' && "bg-yellow-500/20"
            )}>
              <SignalIcon className={cn("w-5 h-5", getSignalColor(signal.type))} />
            </div>
            <span className="text-2xl font-bold">{signal.asset}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Badge 
              variant={signal.type === 'BUY' ? 'default' : signal.type === 'SELL' ? 'destructive' : 'secondary'}
              className="font-medium text-lg px-4 py-2"
            >
              {signal.type}
            </Badge>
            <Badge 
              variant="outline" 
              className={cn("font-semibold text-lg px-4 py-2", getConfidenceColor(signal.confidence))}
            >
              {signal.confidence}% Confidence
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Current Price</h4>
              <p className="text-xl font-bold">{signal.price}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Change</h4>
              <p className={cn(
                "text-xl font-bold",
                signal.change > 0 ? "text-green-400" : "text-red-400"
              )}>
                {signal.change > 0 ? '+' : ''}{signal.change}%
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Description</h4>
            <p className="text-sm leading-relaxed">{signal.description}</p>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Data Sources</h4>
            <div className="flex items-center space-x-3">
              {signal.sources.includes('news') && (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-md flex items-center justify-center">
                    <Newspaper className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-sm">News Analysis</span>
                </div>
              )}
              {signal.sources.includes('social') && (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-secondary/20 rounded-md flex items-center justify-center">
                    <Twitter className="w-4 h-4 text-secondary" />
                  </div>
                  <span className="text-sm">Social Media</span>
                </div>
              )}
              {signal.sources.includes('technical') && (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-accent/20 rounded-md flex items-center justify-center">
                    <Zap className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-sm">Technical Analysis</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1 text-xs text-muted-foreground pt-4 border-t border-border">
            <Clock className="w-3 h-3" />
            <span>Generated: {signal.timestamp}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
