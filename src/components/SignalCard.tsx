import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TrendingUp, TrendingDown, Clock, Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWatchlist } from '@/contexts/WatchlistContext';

interface SignalCardProps {
  signal: {
    id: string
    asset: string
    type: 'BUY' | 'SELL' | 'HOLD'
    price: number | string
    confidence: number
    description: string
    timestamp: string
    sources: string[]
    redditMentions?: number
    newsArticles?: number
    socialSentiment?: string
    indicator?: string
    value?: number
  }
}

// 随机风向生成函数
const getRandomSentiment = () => {
  const sentiments = [
    { label: 'Bullish', icon: TrendingUp, color: '#105E48', bgColor: '#105E48', textColor: '#C0F8E2' },
    { label: 'Bearish', icon: TrendingDown, color: '#DC2626', bgColor: '#DC2626', textColor: '#FECACA' },
    { label: 'Neutral', icon: Clock, color: '#CA8A04', bgColor: '#CA8A04', textColor: '#FEF3C7' }
  ]
  return sentiments[Math.floor(Math.random() * sentiments.length)]
}

export function SignalCard({ signal }: SignalCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { isBookmarked, toggleBookmark } = useWatchlist()
  const [randomSentiment] = useState(getRandomSentiment())

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
  const SentimentIcon = randomSentiment.icon

  return (
    <>
      <Card
        className="cursor-pointer group bg-[#1E1E2F] border-none rounded-[12px] overflow-hidden transition-transform duration-150 hover:scale-[0.98] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.15)] w-full h-full"
        onClick={() => setIsModalOpen(true)}
        style={{ color: '#fff', fontFamily: 'Inter, sans-serif' }}
      >
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="font-bold text-[18px]">{signal.asset}</span>
            <span className="inline-flex items-center gap-1 px-2 py-1 text-[12px] font-medium rounded-[8px]"
              style={{ backgroundColor: randomSentiment.bgColor, color: randomSentiment.textColor }}>
              <SentimentIcon className="w-3 h-3 mr-1" /> {randomSentiment.label}
            </span>
          </div>
          <Bookmark
            className={cn(
              "w-5 h-5 cursor-pointer hover:scale-110 transition-transform",
              isBookmarked(signal.id) && "fill-current"
            )}
            style={{ color: isBookmarked(signal.id) ? '#FFD700' : '#FFD700' }}
            onClick={(e) => {
              e.stopPropagation()
              toggleBookmark(signal)
            }}
          />
        </div>

        {/* Price Section */}
        <div className="flex flex-col mt-3">
          <span className="text-[24px] font-semibold text-white">{typeof signal.price === 'number' ? `$${signal.price.toFixed(2)}` : signal.price}</span>
        </div>

        {/* Confidence Section */}
        <div className="flex flex-col mt-4">
          <span className="text-[14px] text-[#A1A1AA] mb-1">Confidence Score</span>
          <div className="w-full h-2 rounded-[4px] bg-[#374151] overflow-hidden">
            <div
              className="h-2 rounded-[4px]"
              style={{ width: `${signal.confidence}%`, backgroundColor: '#10B981' }}
            />
          </div>
          <span className="text-[12px] text-[#D4D4D8] mt-1">{signal.confidence}%</span>
        </div>

        {/* Tags Row */}
        <div className="flex flex-wrap gap-2 mt-3">
          {signal.sources.includes('news') && (
            <span className="px-2 py-1 text-[12px] rounded-[12px]" style={{ backgroundColor: '#60A5FA', color: '#fff' }}>News</span>
          )}
          {signal.sources.includes('technical') && (
            <span className="px-2 py-1 text-[12px] rounded-[12px]" style={{ backgroundColor: '#A78BFA', color: '#fff' }}>Technical</span>
          )}
          {signal.sources.includes('social') && (
            <span className="px-2 py-1 text-[12px] rounded-[12px]" style={{ backgroundColor: '#34D399', color: '#fff' }}>Social</span>
          )}
        </div>

        {/* Summary */}
        <div className="mt-4">
          <span className="text-[13px] text-[#E5E7EB]">{signal.description}</span>
        </div>

        {/* Footer Row */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-[12px] text-[#9CA3AF]">{signal.timestamp}</span>
          <span className="text-[12px] text-[#9CA3AF]">Vol: {signal.redditMentions || '--'}M   Cap: ${signal.newsArticles || '--'}T</span>
        </div>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-[#1E1E2F] border-none" style={{ color: '#fff', fontFamily: 'Inter, sans-serif' }}>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold">{signal.asset}</span>
                <span className="inline-flex items-center gap-1 px-2 py-1 text-[12px] font-medium rounded-[8px]" style={{ backgroundColor: randomSentiment.bgColor, color: randomSentiment.textColor }}>
                  <SentimentIcon className="w-3 h-3 mr-1" /> {randomSentiment.label}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Bookmark
                  className={cn(
                    "w-5 h-5 cursor-pointer hover:scale-110 transition-transform",
                    isBookmarked(signal.id) && "fill-current"
                  )}
                  style={{ color: isBookmarked(signal.id) ? '#FFD700' : '#FFD700' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleBookmark(signal)
                  }}
                />
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Price Section */}
            <div className="flex flex-col">
              <span className="text-[24px] font-semibold text-white">{typeof signal.price === 'number' ? `$${signal.price.toFixed(2)}` : signal.price}</span>
            </div>

            {/* Confidence Section */}
            <div className="flex flex-col">
              <span className="text-[14px] text-[#A1A1AA] mb-1">Confidence Score</span>
              <div className="w-full h-2 rounded-[4px] bg-[#374151] overflow-hidden">
                <div
                  className="h-2 rounded-[4px]"
                  style={{ width: `${signal.confidence}%`, backgroundColor: '#10B981' }}
                />
              </div>
              <span className="text-[12px] text-[#D4D4D8] mt-1">{signal.confidence}%</span>
            </div>

            {/* Tags Row */}
            <div className="flex flex-wrap gap-2">
              {signal.sources.includes('news') && (
                <span className="px-2 py-1 text-[12px] rounded-[12px]" style={{ backgroundColor: '#60A5FA', color: '#fff' }}>News</span>
              )}
              {signal.sources.includes('technical') && (
                <span className="px-2 py-1 text-[12px] rounded-[12px]" style={{ backgroundColor: '#A78BFA', color: '#fff' }}>Technical</span>
              )}
              {signal.sources.includes('social') && (
                <span className="px-2 py-1 text-[12px] rounded-[12px]" style={{ backgroundColor: '#34D399', color: '#fff' }}>Social</span>
              )}
            </div>

            {/* Summary */}
            <div>
              <span className="text-[13px] text-[#E5E7EB]">{signal.description}</span>
            </div>

            {/* Footer Row */}
            <div className="flex items-center justify-between pt-4 border-t border-[#374151]">
              <span className="text-[12px] text-[#9CA3AF]">{signal.timestamp}</span>
              <span className="text-[12px] text-[#9CA3AF]">Vol: {signal.redditMentions || '--'}M   Cap: ${signal.newsArticles || '--'}T</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}