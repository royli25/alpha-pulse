import os
import json
import time
import random
from datetime import datetime
import logging
from typing import Dict, List, Optional
import requests
from llm_service import get_llm_response_with_template

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 30个股票符号列表
STOCK_SYMBOLS = [
    'AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NFLX', 'BABA', 'JPM',
    'V', 'MA', 'DIS', 'PYPL', 'ADBE', 'CRM', 'ORCL', 'INTC', 'AMD', 'CSCO',
    'UBER', 'LYFT', 'SQ', 'SHOP', 'ZM', 'TWTR', 'SNAP', 'PINS', 'ROKU', 'DOCU'
]

class ImprovedStockDataFetcher:
    def __init__(self, api_delay: float = 5.0, max_retries: int = 3):
        self.symbols = STOCK_SYMBOLS
        self.api_delay = api_delay  # API调用间隔（秒）
        self.max_retries = max_retries
        self.results = {}
        self.failed_symbols = []
        
    def fetch_single_stock_with_retry(self, symbol: str) -> Optional[Dict]:
        """带重试机制获取单个股票数据"""
        for attempt in range(self.max_retries):
            try:
                logger.info(f"获取 {symbol} 数据 (尝试 {attempt + 1}/{self.max_retries})...")
                
                # 使用更具体的提示词
                prompt = f"""
                请搜索{symbol}股票的最新实时数据，包括：
                1. 当前股价和涨跌幅
                2. 今日重要新闻（至少3条）
                3. 社交媒体情绪分析
                4. 交易量数据
                5. 市场分析师观点
                
                请返回标准JSON格式，包含：asset, price, change, signal, confidence, description, newsArticles, socialSentiment
                """
                
                stock_data = get_llm_response_with_template(
                    prompt, 
                    "stock_analyzer", 
                    use_json_mode=True
                )
                
                if isinstance(stock_data, dict) and "error" not in stock_data:
                    # 添加额外字段
                    stock_data["fetch_timestamp"] = datetime.now().isoformat()
                    stock_data["fetch_success"] = True
                    stock_data["symbol"] = symbol
                    
                    # 确保所有必需字段存在
                    stock_data.setdefault("price", "N/A")
                    stock_data.setdefault("change", 0.0)
                    stock_data.setdefault("signal", "neutral")
                    stock_data.setdefault("confidence", 50)
                    stock_data.setdefault("description", f"{symbol}股票分析")
                    stock_data.setdefault("newsArticles", 0)
                    stock_data.setdefault("socialSentiment", "neutral")
                    
                    logger.info(f"✅ {symbol} 数据获取成功")
                    return stock_data
                    
                else:
                    logger.warning(f"⚠️ {symbol} 数据格式无效: {stock_data}")
                    if attempt < self.max_retries - 1:
                        time.sleep(self.api_delay * (attempt + 1))  # 指数退避
                    continue
                        
            except Exception as e:
                logger.error(f"❌ {symbol} 获取失败: {str(e)}")
                if attempt < self.max_retries - 1:
                    time.sleep(self.api_delay * (attempt + 1))
                continue
        
        logger.error(f"❌ {symbol} 所有重试失败")
        return None
    
    def fetch_batch_with_rate_limiting(self, symbols: List[str] = None, 
                                     batch_size: int = 3, 
                                     delay_between_batches: float = 15.0) -> Dict:
        """分批获取股票数据，避免速率限制"""
        if symbols is None:
            symbols = self.symbols
        
        logger.info(f"开始分批获取 {len(symbols)} 只股票数据...")
        
        self.results = {}
        self.failed_symbols = []
        
        # 分批处理
        for i in range(0, len(symbols), batch_size):
            batch = symbols[i:i+batch_size]
            logger.info(f"处理批次 {i//batch_size + 1}/{(len(symbols)+batch_size-1)//batch_size}: {batch}")
            
            for symbol in batch:
                data = self.fetch_single_stock_with_retry(symbol)
                
                if data:
                    self.results[symbol] = data
                else:
                    # 创建失败记录
                    self.failed_symbols.append(symbol)
                    self.results[symbol] = {
                        "symbol": symbol,
                        "fetch_success": False,
                        "error": "数据获取失败",
                        "fetch_timestamp": datetime.now().isoformat()
                    }
            
            # 批次间延迟
            if i + batch_size < len(symbols):
                logger.info(f"⏳ 等待 {delay_between_batches} 秒后继续...")
                time.sleep(delay_between_batches)
        
        return self.generate_summary_report()
    
    def generate_summary_report(self) -> Dict:
        """生成详细的数据报告"""
        successful = [k for k, v in self.results.items() if v.get('fetch_success', False)]
        failed = [k for k, v in self.results.items() if not v.get('fetch_success', False)]
        
        report = {
            "fetch_timestamp": datetime.now().isoformat(),
            "total_symbols": len(self.symbols),
            "successful_count": len(successful),
            "failed_count": len(failed),
            "success_rate": round(len(successful) / len(self.symbols) * 100, 2),
            "successful_symbols": successful,
            "failed_symbols": failed,
            "data": self.results,
            "summary": {
                "total_stocks": len(self.symbols),
                "data_quality": "good" if len(successful) > len(failed) else "poor",
                "recommendations": [
                    "数据已成功获取" if len(successful) > 0 else "建议检查网络连接和API密钥",
                    f"成功率: {len(successful)}/{len(self.symbols)}"
                ]
            }
        }
        
        # 保存到文件
        self.save_report(report, "improved_stock_data.json")
        
        return report
    
    def save_report(self, report: Dict, filename: str):
        """保存报告到文件"""
        try:
            file_path = os.path.join(os.path.dirname(__file__), filename)
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(report, f, ensure_ascii=False, indent=2)
            
            logger.info(f"📁 报告已保存到: {file_path}")
            
            # 也保存简化版本
            simple_report = {
                "timestamp": report["fetch_timestamp"],
                "stocks": [
                    {
                        "symbol": data.get("symbol", symbol),
                        "price": data.get("price", "N/A"),
                        "change": data.get("change", 0),
                        "signal": data.get("signal", "neutral"),
                        "confidence": data.get("confidence", 50)
                    }
                    for symbol, data in report["data"].items()
                    if data.get("fetch_success", False)
                ]
            }
            
            simple_path = os.path.join(os.path.dirname(__file__), "simple_stock_data.json")
            with open(simple_path, 'w', encoding='utf-8') as f:
                json.dump(simple_report, f, ensure_ascii=False, indent=2)
            
            logger.info(f"📊 简化报告已保存到: {simple_path}")
            
        except Exception as e:
            logger.error(f"保存文件失败: {str(e)}")
    
    def get_market_summary(self) -> Dict:
        """获取市场概览"""
        successful_data = [v for v in self.results.values() if v.get('fetch_success', False)]
        
        if not successful_data:
            return {"error": "无成功数据"}
        
        try:
            # 计算统计信息
            prices = [float(str(v.get('price', '0')).replace('$', '').replace(',', '')) 
                     for v in successful_data if str(v.get('price', '')).replace('$', '').replace(',', '').strip()]
            changes = [float(v.get('change', 0)) for v in successful_data if isinstance(v.get('change'), (int, float))]
            
            gainers = [v for v in successful_data if float(v.get('change', 0)) > 0]
            losers = [v for v in successful_data if float(v.get('change', 0)) < 0]
            
            return {
                "total_stocks": len(successful_data),
                "average_change": sum(changes) / len(changes) if changes else 0,
                "gainers_count": len(gainers),
                "losers_count": len(losers),
                "top_gainers": sorted(gainers, key=lambda x: float(x.get('change', 0)), reverse=True)[:3],
                "top_losers": sorted(losers, key=lambda x: float(x.get('change', 0)))[:3]
            }
        except Exception as e:
            logger.error(f"生成市场概览失败: {str(e)}")
            return {"error": str(e)}

# 快捷函数
def safe_fetch_all():
    """安全获取所有股票数据"""
    fetcher = ImprovedStockDataFetcher(api_delay=6.0, max_retries=2)
    return fetcher.fetch_batch_with_rate_limiting(batch_size=2, delay_between_batches=20.0)

def quick_test():
    """快速测试（获取3只股票）"""
    fetcher = ImprovedStockDataFetcher(api_delay=5.0)
    return fetcher.fetch_batch_with_rate_limiting(['AAPL', 'TSLA', 'NVDA'], batch_size=1, delay_between_batches=10.0)

def resume_failed(failed_symbols: List[str]):
    """重试失败的股票"""
    fetcher = ImprovedStockDataFetcher(api_delay=8.0)
    return fetcher.fetch_batch_with_rate_limiting(failed_symbols, batch_size=1, delay_between_batches=15.0)

# 命令行运行
if __name__ == "__main__":
    print("🚀 改进版股票数据获取器启动...")
    print("⚠️  注意：为避免速率限制，已调整API调用频率")
    
    # 提供选项
    print("\n选择操作:")
    print("1. 获取所有30只股票（分批，约需15-20分钟）")
    print("2. 快速测试（获取5只股票）")
    print("3. 获取特定股票")
    
    choice = input("\n请输入选择 (1/2/3) [默认2]: ").strip() or "2"
    
    if choice == "1":
        result = safe_fetch_all()
    elif choice == "2":
        fetcher = ImprovedStockDataFetcher()
        result = fetcher.fetch_batch_with_rate_limiting(STOCK_SYMBOLS[:5])
    elif choice == "3":
        symbols = input("请输入股票代码（逗号分隔，如AAPL,TSLA,NVDA）: ").strip().split(',')
        symbols = [s.strip().upper() for s in symbols]
        fetcher = ImprovedStockDataFetcher()
        result = fetcher.fetch_batch_with_rate_limiting(symbols, batch_size=1)
    else:
        result = quick_test()
    
    print(f"\n📊 数据获取完成!")
    print(f"成功: {result['successful_count']}/{result['total_symbols']} 只股票")
    print(f"成功率: {result['success_rate']}%")
    
    if result['failed_symbols']:
        print(f"失败股票: {result['failed_symbols']}")
        retry = input("是否重试失败的股票？(y/n) [默认n]: ").strip().lower()
        if retry == 'y':
            failed_result = resume_failed(result['failed_symbols'])
            print(f"重试结果: 成功 {failed_result['successful_count']} 个")
    
    # 显示市场概览
    fetcher = ImprovedStockDataFetcher()
    fetcher.results = result['data']
    market_summary = fetcher.get_market_summary()
    
    if 'error' not in market_summary:
        print(f"\n📈 市场概览:")
        print(f"上涨股票: {market_summary['gainers_count']}")
        print(f"下跌股票: {market_summary['losers_count']}")
        print(f"平均涨跌幅: {market_summary['average_change']:.2f}%")