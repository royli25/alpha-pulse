import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

interface StockSearchProps {
    onStockFound: (stockCode: string, stockData?: any) => void;
    className?: string;
}

export const StockSearch: React.FC<StockSearchProps> = ({ onStockFound, className }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            const query = searchQuery.trim();

            // 判断输入类型：如果是纯字母且长度<=5，认为是股票代码；否则认为是股票名称
            const isStockCode = /^[A-Z]{1,5}$/i.test(query);

            let stockCode: string;
            let stockData: any = null;

            if (isStockCode) {
                // 直接按股票代码查询
                stockCode = query.toUpperCase();
                const response = await fetch(`http://localhost:5000/api/stock/${stockCode}`);

                if (response.ok) {
                    stockData = await response.json();
                } else {
                    toast.error('股票代码不存在或API错误');
                    return;
                }
            } else {
                // 通过LLM搜索股票名称
                const llmResponse = await fetch('http://localhost:5000/api/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        prompt: `搜索股票: ${query}，返回对应的股票代码和最新数据`,
                        template: "stock_analyzer"
                    })
                });

                if (llmResponse.ok) {
                    const llmData = await llmResponse.json();

                    if (llmData.asset) {
                        stockCode = llmData.asset.toUpperCase();
                        stockData = llmData;

                        // 验证股票代码是否有效
                        const verifyResponse = await fetch(`http://localhost:5000/api/stock/${stockCode}`);
                        if (!verifyResponse.ok) {
                            toast.error(`LLM返回的股票代码 ${stockCode} 无效`);
                            return;
                        }
                    } else {
                        toast.error('未找到匹配的股票');
                        return;
                    }
                } else {
                    toast.error('LLM搜索失败');
                    return;
                }
            }

            // 返回股票代码和数据
            onStockFound(stockCode, stockData);
            toast.success(`已找到股票: ${stockCode}`);
            setSearchQuery('');

        } catch (error) {
            console.error('搜索错误:', error);
            toast.error('搜索失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSearch} className={`relative ${className}`}>
            <div className="relative" style={{ marginLeft: '20px' }}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                    type="text"
                    placeholder="输入股票代码或名称..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-96 bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                    maxLength={50}
                />
            </div>
            {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
            )}
        </form>
    );
};