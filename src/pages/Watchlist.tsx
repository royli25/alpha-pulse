import React, { useState, useEffect } from 'react'
import { SignalCard } from '@/components/SignalCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter } from 'lucide-react'
import { useWatchlist } from '@/contexts/WatchlistContext'



export default function Watchlist() {
  const { bookmarkedSignals } = useWatchlist()
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')

  const filteredSignals = bookmarkedSignals.filter(signal => {
    const matchesSearch = signal.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         signal.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || signal.type.toLowerCase() === filter.toLowerCase()
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Watchlist</h1>
          <p className="text-muted-foreground">Your saved signals and tracked investments.</p>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredSignals.length} signals
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search your watchlist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by sentiment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sentiments</SelectItem>
            <SelectItem value="buy">Bullish</SelectItem>
            <SelectItem value="sell">Bearish</SelectItem>
            <SelectItem value="hold">Neutral</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Signals Grid */}
      {filteredSignals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {filteredSignals.map((signal) => (
            <div key={signal.id} className="w-full h-full min-h-[280px]">
              <SignalCard signal={signal} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            {searchTerm || filter !== 'all' ? 'No signals match your search criteria.' : 'No signals in your watchlist yet.'}
          </div>
          {!searchTerm && filter === 'all' && (
            <p className="text-sm text-muted-foreground">
              Click the bookmark icon on any signal card to add it to your watchlist.
            </p>
          )}
        </div>
      )}
    </div>
  )
} 