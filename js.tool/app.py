from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import logging
from datetime import datetime
from llm_service import get_llm_response, get_llm_response_with_template
from cache_service import CacheService
from stock_data_fetcher_improved import ImprovedStockDataFetcher, STOCK_SYMBOLS
import json

# 配置详细日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv()
app = Flask(__name__)
CORS(app)

cache = CacheService(cache_dir="cache", default_ttl=3600)

@app.route('/api/search', methods=['POST'])
def handle_search():
    try:
        data = request.json
        prompt = data.get('prompt')
        system_prompt = data.get('system_prompt')
        template_name = data.get('template')
        force_refresh = data.get('force_refresh', False)
        
        logger.info(f"收到请求: prompt={prompt}, template={template_name}, force_refresh={force_refresh}")
        
        if not prompt:
            logger.error("缺少prompt参数")
            return jsonify({'error': 'Missing prompt parameter'}), 400

        # 检查缓存（除非强制刷新）
        if not force_refresh:
            cached_response = cache.get(prompt, template_name)
            if cached_response is not None:
                logger.info("缓存命中，返回缓存数据")
                return jsonify({
                    **cached_response,
                    '_cached': True,
                    '_cached_at': datetime.now().isoformat()
                })
        
        logger.info("缓存未命中，调用LLM API")
        
        # 获取新数据
        if system_prompt:
            response = get_llm_response(prompt, system_prompt)
        elif template_name:
            response = get_llm_response_with_template(prompt, template_name)
        else:
            response = get_llm_response(prompt)
        
        logger.info(f"LLM响应: {response}")
        
        # 检查响应是否包含错误
        if isinstance(response, dict) and 'error' in response:
            logger.error(f"LLM错误: {response['error']}")
            return jsonify(response), 500
        
        # 保存到缓存
        if isinstance(response, dict) and 'error' not in response:
            cache.set(prompt, response, template=template_name)
            logger.info("数据已缓存")
        
        return jsonify({
            **response,
            '_cached': False,
            '_fresh': True
        })
        
    except Exception as e:
        logger.exception("处理请求时发生错误")
        return jsonify({'error': str(e)}), 500

# === 🎯 股票数据专用API路由 ===

@app.route('/api/stock/<symbol>', methods=['GET'])
def get_stock_data(symbol):
    """获取单个股票数据"""
    try:
        symbol = symbol.upper().strip()
        force_refresh = request.args.get('force_refresh', 'false').lower() == 'true'
        
        logger.info(f"获取股票数据: {symbol}, 强制刷新: {force_refresh}")
        
        if symbol not in STOCK_SYMBOLS:
            return jsonify({'error': f'不支持的股票代码: {symbol}'}), 400
        
        # 构建缓存键
        cache_key = f"stock_{symbol}"
        
        # 检查缓存
        if not force_refresh:
            cached_data = cache.get(cache_key)
            if cached_data:
                return jsonify({
                    **cached_data,
                    '_cached': True,
                    '_cached_at': datetime.now().isoformat()
                })
        
        # 获取新数据
        fetcher = ImprovedStockDataFetcher()
        result = fetcher.fetch_batch_with_rate_limiting([symbol], batch_size=1)
        
        if symbol in result.get('data', {}) and result['data'][symbol].get('fetch_success'):
            stock_data = result['data'][symbol]
            cache.set(cache_key, stock_data)
            
            return jsonify({
                **stock_data,
                '_cached': False,
                '_fresh': True
            })
        else:
            return jsonify({
                'error': '数据获取失败',
                'symbol': symbol,
                'details': result.get('data', {}).get(symbol, {})
            }), 500
            
    except Exception as e:
        logger.exception("获取股票数据时发生错误")
        return jsonify({'error': str(e)}), 500

@app.route('/api/stock/search', methods=['POST'])
def search_stock_data():
    """搜索股票数据（前端搜索组件专用）"""
    try:
        data = request.json
        symbols = data.get('symbols', [])
        force_refresh = data.get('force_refresh', False)
        
        if not symbols:
            return jsonify({'error': '请提供股票代码'}), 400
        
        # 验证股票代码
        valid_symbols = [s.upper().strip() for s in symbols if s.upper().strip() in STOCK_SYMBOLS]
        invalid_symbols = [s.upper().strip() for s in symbols if s.upper().strip() not in STOCK_SYMBOLS]
        
        if not valid_symbols:
            return jsonify({
                'error': '所有股票代码都不支持',
                'supported_symbols': STOCK_SYMBOLS,
                'invalid_symbols': invalid_symbols
            }), 400
        
        logger.info(f"批量搜索股票: {valid_symbols}")
        
        results = {}
        need_fetch = []
        
        # 检查缓存
        for symbol in valid_symbols:
            cache_key = f"stock_{symbol}"
            if not force_refresh:
                cached_data = cache.get(cache_key)
                if cached_data:
                    results[symbol] = {
                        **cached_data,
                        '_cached': True,
                        '_cached_at': datetime.now().isoformat()
                    }
                else:
                    need_fetch.append(symbol)
            else:
                need_fetch.append(symbol)
        
        # 获取未缓存的数据
        if need_fetch:
            fetcher = ImprovedStockDataFetcher()
            fetch_result = fetcher.fetch_batch_with_rate_limiting(
                need_fetch, 
                batch_size=len(need_fetch),
                delay_between_batches=2.0
            )
            
            for symbol in need_fetch:
                if symbol in fetch_result.get('data', {}) and fetch_result['data'][symbol].get('fetch_success'):
                    stock_data = fetch_result['data'][symbol]
                    cache.set(f"stock_{symbol}", stock_data)
                    results[symbol] = {
                        **stock_data,
                        '_cached': False,
                        '_fresh': True
                    }
                else:
                    results[symbol] = {
                        'error': '数据获取失败',
                        'symbol': symbol,
                        'details': fetch_result.get('data', {}).get(symbol, {})
                    }
        
        return jsonify({
            'results': results,
            'total': len(valid_symbols),
            'from_cache': len([r for r in results.values() if r.get('_cached')]),
            'fresh': len([r for r in results.values() if r.get('_fresh')]),
            'invalid_symbols': invalid_symbols
        })
        
    except Exception as e:
        logger.exception("搜索股票数据时发生错误")
        return jsonify({'error': str(e)}), 500

@app.route('/api/stock/symbols', methods=['GET'])
def get_supported_symbols():
    """获取支持的股票代码列表"""
    return jsonify({
        'symbols': STOCK_SYMBOLS,
        'count': len(STOCK_SYMBOLS),
        'last_updated': datetime.now().isoformat()
    })

@app.route('/api/stock/batch', methods=['POST'])
def batch_stock_data():
    """批量获取股票数据"""
    try:
        data = request.json
        symbols = data.get('symbols', [])
        max_symbols = 10  # 限制批量查询数量
        
        if len(symbols) > max_symbols:
            return jsonify({'error': f'单次查询最多支持 {max_symbols} 只股票'}), 400
        
        # 使用搜索端点逻辑
        return search_stock_data()
        
    except Exception as e:
        logger.exception("批量获取股票数据时发生错误")
        return jsonify({'error': str(e)}), 500

# === 缓存管理路由 ===

@app.route('/api/cache/stats', methods=['GET'])
def cache_stats():
    """获取缓存统计"""
    return jsonify(cache.get_stats())

@app.route('/api/cache/clear', methods=['POST'])
def clear_cache():
    """清空缓存"""
    success = cache.clear_all()
    return jsonify({'success': success})

@app.route('/api/cache/clear_expired', methods=['POST'])
def clear_expired():
    """清理过期缓存"""
    cleared = cache.clear_expired()
    return jsonify({'cleared': cleared})

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'supported_symbols_count': len(STOCK_SYMBOLS)
    })

if __name__ == '__main__':
    logger.info("启动Flask股票数据服务...")
    logger.info(f"支持的股票代码: {len(STOCK_SYMBOLS)} 个")
    app.run(host='0.0.0.0', port=5000, debug=True)