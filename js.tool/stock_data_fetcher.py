import os
import json
import time
from datetime import datetime
import logging
from llm_service import get_llm_response_with_template

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 30个股票符号列表
STOCK_SYMBOLS = [
    'AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NFLX', 'BABA', 'JPM',
    'V', 'MA', 'DIS', 'PYPL', 'ADBE', 'CRM', 'ORCL', 'INTC', 'AMD', 'CSCO',
    'UBER', 'LYFT', 'SQ', 'SHOP', 'ZM', 'TWTR', 'SNAP', 'PINS', 'ROKU', 'DOCU'
]

# 使用与模板匹配的提示词
STOCK_ANALYSIS_PROMPT = """# Stock Analysis Assistant - JSON Mode

You are a real-time stock analysis bot. Your ONLY task is to search for today's live stock data and return a valid JSON object.

## JSON OUTPUT REQUIREMENTS:
Return EXACTLY this JSON structure:
{
  "id": "<generate_unique_id>",
  "asset": "<STOCK_SYMBOL>",
  "type": "BUY|SELL|HOLD",
  "confidence": <0-100>,
  "signal": "neutral|bullish|bearish",
  "timestamp": "<current_time>",
  "description": "<brief analysis combining price action, news, and sentiment>",
  "sources": ["news", "technical", "social"],
  "price": "<current_price>",
  "change": <percentage_change>,
  "newsArticles": <number>,
  "socialSentiment": "very_positive|positive|neutral|negative|very_negative",
  "redditMentions": <number>,
  "marketCap": "<market_cap>",
  "volume": "<trading_volume>"
}

## INSTRUCTIONS:
- Use $web_search to get current stock data
- Search for: "STOCK_SYMBOL stock price news sentiment today 2024"
- Return ONLY the JSON object, no additional text
- Ensure all fields are populated with real data
- Include recent news, price movement, and social sentiment"""

class StockDataFetcher:
    def __init__(self):
        self.symbols = STOCK_SYMBOLS
        self.results = {}
        self.failed_symbols = []
    
    def fetch_single_stock_data(self, symbol):
        """获取单个股票的完整数据"""
        try:
            logger.info(f"正在获取 {symbol} 的实时数据...")
            
            prompt = f"请搜索{symbol}股票的完整实时数据，包括当前价格、涨跌幅、今日新闻、社交媒体情绪、交易量等所有相关信息"
            
            # 使用llm_service中的模板化调用
            stock_data = get_llm_response_with_template(
                prompt, 
                "stock_analyzer", 
                use_json_mode=True
            )
            
            if isinstance(stock_data, dict) and "error" not in stock_data:
                # 添加元数据
                stock_data["fetch_timestamp"] = datetime.now().isoformat()
                stock_data["source"] = "llm_with_web_search"
                return stock_data
            else:
                logger.error(f"获取 {symbol} 数据失败: {stock_data.get('error', 'Unknown error')}")
                return None
                
        except Exception as e:
            logger.error(f"处理 {symbol} 时发生错误: {str(e)}")
            return None
    
    def fetch_batch_stocks(self, symbols=None, delay=3):
        """批量获取股票数据"""
        if symbols is None:
            symbols = self.symbols
        
        logger.info(f"开始批量获取 {len(symbols)} 只股票的数据...")
        
        self.results = {}
        self.failed_symbols = []
        
        for i, symbol in enumerate(symbols):
            data = self.fetch_single_stock_data(symbol)
            
            if data:
                self.results[symbol] = data
                logger.info(f"✓ {symbol} 数据获取成功")
            else:
                self.failed_symbols.append(symbol)
                logger.warning(f"✗ {symbol} 数据获取失败")
            
            # 添加延迟避免API限制
            if i < len(symbols) - 1:
                time.sleep(delay)
        
        return self.generate_report()
    
    def generate_report(self):
        """生成数据报告"""
        report = {
            "fetch_timestamp": datetime.now().isoformat(),
            "total_symbols": len(self.symbols),
            "successful_count": len(self.results),
            "failed_count": len(self.failed_symbols),
            "failed_symbols": self.failed_symbols,
            "success_rate": round(len(self.results) / len(self.symbols) * 100, 2),
            "data": self.results
        }
        
        # 保存到文件
        self.save_to_file(report)
        
        return report
    
    def save_to_file(self, data, filename="real_stock_data.json"):
        """保存数据到JSON文件"""
        try:
            file_path = os.path.join(os.path.dirname(__file__), filename)
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            logger.info(f"数据已保存到: {file_path}")
            return file_path
        except Exception as e:
            logger.error(f"保存文件失败: {str(e)}")
            return None
    
    def get_top_movers(self, limit=5):
        """获取涨跌幅度最大的股票"""
        if not self.results:
            return {"gainers": [], "losers": []}
        
        try:
            sorted_stocks = sorted(
                self.results.items(), 
                key=lambda x: float(x[1].get('change', 0)), 
                reverse=True
            )
            
            gainers = [(symbol, data) for symbol, data in sorted_stocks[:limit]]
            losers = [(symbol, data) for symbol, data in sorted_stocks[-limit:][::-1]]
            
            return {"gainers": gainers, "losers": losers}
        except Exception as e:
            logger.error(f"获取涨跌股票失败: {str(e)}")
            return {"gainers": [], "losers": []}

# 使用示例和快捷函数
def quick_fetch_all():
    """快速获取所有股票数据"""
    fetcher = StockDataFetcher()
    return fetcher.fetch_batch_stocks()

def fetch_specific_stocks(symbols):
    """获取指定股票数据"""
    fetcher = StockDataFetcher()
    return fetcher.fetch_batch_stocks(symbols)

def demo_fetch():
    """演示获取前5只股票"""
    fetcher = StockDataFetcher()
    demo_symbols = STOCK_SYMBOLS[:5]
    return fetcher.fetch_batch_stocks(demo_symbols, delay=2)

# 命令行运行
if __name__ == "__main__":
    print("🚀 股票数据获取器启动...")
    
    # 获取所有30只股票数据
    result = quick_fetch_all()
    
    print(f"\n📊 数据获取完成!")
    print(f"成功: {result['successful_count']}/{result['total_symbols']} 只股票")
    print(f"成功率: {result['success_rate']}%")
    print(f"失败股票: {result['failed_symbols']}")
    
    # 显示涨跌榜
    fetcher = StockDataFetcher()
    fetcher.results = result['data']
    movers = fetcher.get_top_movers(3)
    
    print(f"\n📈 涨幅前三: {[s[0] for s in movers['gainers']]}")
    print(f"📉 跌幅前三: {[s[0] for s in movers['losers']]}")