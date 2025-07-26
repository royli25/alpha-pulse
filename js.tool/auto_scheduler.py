import os
import json
import time
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Set
from stock_data_fetcher_improved import ImprovedStockDataFetcher, STOCK_SYMBOLS

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class AutoStockScheduler:
    def __init__(self, check_interval: int = 180):  # 3分钟 = 180秒
        self.check_interval = check_interval
        self.fetcher = ImprovedStockDataFetcher(api_delay=6.0, max_retries=2)
        self.data_dir = os.path.join(os.path.dirname(__file__), "auto_data")
        self.progress_file = os.path.join(self.data_dir, "progress.json")
        self._ensure_data_dir()
        self.progress = self._load_progress()
        
    def _ensure_data_dir(self):
        """确保数据目录存在"""
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
            logger.info(f"创建数据目录: {self.data_dir}")
    
    def _load_progress(self) -> Dict:
        """加载进度文件"""
        if os.path.exists(self.progress_file):
            try:
                with open(self.progress_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"加载进度失败: {e}")
        
        # 初始化进度
        return {
            "total_symbols": len(STOCK_SYMBOLS),
            "completed_symbols": [],
            "failed_symbols": [],
            "last_update": None,
            "start_time": datetime.now().isoformat(),
            "statistics": {
                "total_attempts": 0,
                "successful_fetches": 0,
                "failed_fetches": 0
            }
        }
    
    def _save_progress(self):
        """保存进度文件"""
        try:
            with open(self.progress_file, 'w', encoding='utf-8') as f:
                json.dump(self.progress, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"保存进度失败: {e}")
    
    def get_pending_symbols(self) -> List[str]:
        """获取待获取的股票列表"""
        completed = set(self.progress["completed_symbols"])
        failed = set(self.progress["failed_symbols"])
        pending = [s for s in STOCK_SYMBOLS if s not in completed and s not in failed]
        return pending
    
    def fetch_next_batch(self, batch_size: int = 2) -> Dict:
        """获取下一批股票数据"""
        pending = self.get_pending_symbols()
        
        if not pending:
            logger.info("所有股票数据已获取完成！")
            return {"status": "completed", "message": "所有股票数据已获取完成"}
        
        # 获取下一批
        next_batch = pending[:batch_size]
        logger.info(f"准备获取 {len(next_batch)} 只股票: {next_batch}")
        
        try:
            # 使用fetcher获取数据
            result = self.fetcher.fetch_batch_with_rate_limiting(
                symbols=next_batch,
                batch_size=batch_size,
                delay_between_batches=5.0  # 批次间延迟减少
            )
            
            # 更新进度
            successful = result.get("successful_symbols", [])
            failed = result.get("failed_symbols", [])
            
            self.progress["completed_symbols"].extend(successful)
            self.progress["failed_symbols"].extend(failed)
            self.progress["statistics"]["total_attempts"] += len(next_batch)
            self.progress["statistics"]["successful_fetches"] += len(successful)
            self.progress["statistics"]["failed_fetches"] += len(failed)
            self.progress["last_update"] = datetime.now().isoformat()
            
            # 保存单个股票数据
            for symbol, data in result.get("data", {}).items():
                if data.get("fetch_success", False):
                    self._save_single_stock(symbol, data)
            
            self._save_progress()
            
            logger.info(f"批次完成: 成功 {len(successful)}, 失败 {len(failed)}")
            
            return {
                "status": "success",
                "batch_size": len(next_batch),
                "successful": len(successful),
                "failed": len(failed),
                "remaining": len(pending) - len(next_batch)
            }
            
        except Exception as e:
            logger.error(f"批次获取失败: {e}")
            return {"status": "error", "message": str(e)}
    
    def _save_single_stock(self, symbol: str, data: Dict):
        """保存单个股票数据"""
        try:
            filename = f"{symbol}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            filepath = os.path.join(self.data_dir, filename)
            
            stock_data = {
                "symbol": symbol,
                "timestamp": datetime.now().isoformat(),
                "data": data,
                "metadata": {
                    "fetch_success": True,
                    "file_created": datetime.now().isoformat()
                }
            }
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(stock_data, f, ensure_ascii=False, indent=2)
                
            logger.info(f"✅ 已保存 {symbol} 数据到: {filename}")
            
        except Exception as e:
            logger.error(f"保存 {symbol} 数据失败: {e}")
    
    def get_status(self) -> Dict:
        """获取当前状态"""
        pending = self.get_pending_symbols()
        completed = len(self.progress["completed_symbols"])
        failed = len(self.progress["failed_symbols"])
        
        return {
            "total_stocks": len(STOCK_SYMBOLS),
            "completed": completed,
            "failed": failed,
            "pending": len(pending),
            "completion_rate": round((completed + failed) / len(STOCK_SYMBOLS) * 100, 2),
            "last_update": self.progress["last_update"],
            "statistics": self.progress["statistics"],
            "next_batch": pending[:2] if pending else []
        }
    
    def run_continuous(self):
        """持续运行模式"""
        logger.info("🚀 启动自动化股票数据获取系统")
        logger.info(f"总股票数: {len(STOCK_SYMBOLS)}")
        logger.info(f"检查间隔: {self.check_interval}秒")
        
        try:
            while True:
                status = self.get_status()
                
                if status["pending"] == 0:
                    logger.info("🎉 所有股票数据获取完成！")
                    break
                
                logger.info(f"当前状态: 完成 {status['completed']}, 失败 {status['failed']}, 待获取 {status['pending']}")
                
                # 执行下一批
                result = self.fetch_next_batch(batch_size=2)
                
                if result["status"] == "completed":
                    break
                
                # 等待下一轮
                logger.info(f"⏳ 等待 {self.check_interval} 秒后进行下一轮...")
                time.sleep(self.check_interval)
                
        except KeyboardInterrupt:
            logger.info("用户中断，正在停止...")
        except Exception as e:
            logger.error(f"运行错误: {e}")
    
    def run_once(self):
        """单次运行模式"""
        logger.info("执行单次数据获取...")
        return self.fetch_next_batch(batch_size=3)

# 快捷函数
def start_auto_fetch():
    """启动自动获取"""
    scheduler = AutoStockScheduler(check_interval=180)  # 3分钟
    scheduler.run_continuous()

def quick_status():
    """查看当前状态"""
    scheduler = AutoStockScheduler()
    return scheduler.get_status()

def run_single_batch():
    """运行单批次"""
    scheduler = AutoStockScheduler()
    return scheduler.run_once()

if __name__ == "__main__":
    import sys
    
    print("🤖 自动化股票数据获取调度器")
    print("=" * 50)
    
    scheduler = AutoStockScheduler()
    status = scheduler.get_status()
    
    print(f"当前状态:")
    print(f"  总股票数: {status['total_stocks']}")
    print(f"  已完成: {status['completed']}")
    print(f"  失败: {status['failed']}")
    print(f"  待获取: {status['pending']}")
    print(f"  完成率: {status['completion_rate']}%")
    
    print("\n选择操作:")
    print("1. 启动持续获取 (每3分钟一轮)")
    print("2. 运行单批次")
    print("3. 查看状态")
    
    choice = input("\n请输入选择 (1/2/3) [默认1]: ").strip() or "1"
    
    if choice == "1":
        print("\n🚀 启动持续获取模式...")
        print("按 Ctrl+C 停止")
        start_auto_fetch()
    elif choice == "2":
        print("\n⚡ 运行单批次...")
        result = run_single_batch()
        print(f"结果: {result}")
    elif choice == "3":
        print(f"\n📊 状态详情:")
        print(json.dumps(status, ensure_ascii=False, indent=2))
    else:
        print("无效选择")