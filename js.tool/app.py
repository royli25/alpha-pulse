from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import logging
from datetime import datetime
from llm_service import get_llm_response, get_llm_response_with_template
from cache_service import CacheService

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

if __name__ == '__main__':
    logger.info("启动Flask服务...")
    app.run(host='0.0.0.0', port=5000, debug=True)