import json
import os
import time
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CacheService:
    def __init__(self, cache_dir="cache", default_ttl=3600):
        self.cache_dir = cache_dir
        self.default_ttl = default_ttl  # 默认1小时
        self._ensure_cache_dir()
        
    def _ensure_cache_dir(self):
        """确保缓存目录存在"""
        if not os.path.exists(self.cache_dir):
            os.makedirs(self.cache_dir)
            logger.info(f"创建缓存目录: {self.cache_dir}")
    
    def _generate_cache_key(self, prompt: str, template: str = None) -> str:
        """生成唯一的缓存键"""
        key_data = f"{prompt}:{template or 'default'}"
        return hashlib.md5(key_data.encode()).hexdigest()
    
    def _get_cache_path(self, cache_key: str) -> str:
        """获取缓存文件路径"""
        return os.path.join(self.cache_dir, f"{cache_key}.json")
    
    def get(self, prompt: str, template: str = None) -> Optional[Dict[str, Any]]:
        """
        获取缓存数据
        返回: 缓存数据或None（未命中或过期）
        """
        cache_key = self._generate_cache_key(prompt, template)
        cache_path = self._get_cache_path(cache_key)
        
        if not os.path.exists(cache_path):
            logger.debug(f"缓存未命中: {cache_key}")
            return None
        
        try:
            with open(cache_path, 'r', encoding='utf-8') as f:
                cache_data = json.load(f)
            
            # 检查过期时间
            expires = datetime.fromisoformat(cache_data['expires'])
            if datetime.now() > expires:
                logger.info(f"缓存过期: {cache_key}")
                self.delete(prompt, template)  # 清理过期缓存
                return None
            
            logger.info(f"缓存命中: {cache_key}")
            return cache_data['response']
            
        except (json.JSONDecodeError, KeyError, IOError) as e:
            logger.error(f"缓存读取错误: {e}")
            self.delete(prompt, template)  # 删除损坏的缓存
            return None
    
    def set(self, prompt: str, response: Dict[str, Any], template: str = None, ttl: int = None) -> bool:
        """
        设置缓存数据
        返回: 是否成功
        """
        cache_key = self._generate_cache_key(prompt, template)
        cache_path = self._get_cache_path(cache_key)
        
        # 确保ttl是整数
        ttl_value = ttl if ttl is not None else self.default_ttl
        if isinstance(ttl_value, str):
            ttl_value = int(ttl_value)
        elif not isinstance(ttl_value, int):
            ttl_value = self.default_ttl
            
        expires = datetime.now() + timedelta(seconds=ttl_value)
        
        cache_data = {
            'prompt': prompt,
            'template': template,
            'response': response,
            'created_at': datetime.now().isoformat(),
            'expires': expires.isoformat(),
            'ttl': ttl_value
        }
        
        try:
            with open(cache_path, 'w', encoding='utf-8') as f:
                json.dump(cache_data, f, ensure_ascii=False, indent=2)
            logger.info(f"缓存设置成功: {cache_key} (TTL: {ttl_value}s)")
            return True
            
        except IOError as e:
            logger.error(f"缓存写入错误: {e}")
            return False
    
    def delete(self, prompt: str, template: str = None) -> bool:
        """删除特定缓存"""
        cache_key = self._generate_cache_key(prompt, template)
        cache_path = self._get_cache_path(cache_key)
        
        try:
            if os.path.exists(cache_path):
                os.remove(cache_path)
                logger.info(f"缓存删除成功: {cache_key}")
                return True
            return False
        except IOError as e:
            logger.error(f"缓存删除错误: {e}")
            return False
    
    def clear_expired(self) -> int:
        """清理所有过期缓存，返回清理数量"""
        cleared = 0
        now = datetime.now()
        
        for filename in os.listdir(self.cache_dir):
            if not filename.endswith('.json'):
                continue
                
            cache_path = os.path.join(self.cache_dir, filename)
            try:
                with open(cache_path, 'r', encoding='utf-8') as f:
                    cache_data = json.load(f)
                
                expires = datetime.fromisoformat(cache_data['expires'])
                if now > expires:
                    os.remove(cache_path)
                    cleared += 1
                    
            except (json.JSONDecodeError, KeyError, IOError):
                # 删除损坏的文件
                os.remove(cache_path)
                cleared += 1
        
        logger.info(f"清理过期缓存: {cleared} 个")
        return cleared
    
    def get_stats(self) -> Dict[str, Any]:
        """获取缓存统计信息"""
        stats = {
            'total_files': 0,
            'total_size': 0,
            'expired_files': 0,
            'active_files': 0
        }
        
        now = datetime.now()
        
        for filename in os.listdir(self.cache_dir):
            if not filename.endswith('.json'):
                continue
                
            cache_path = os.path.join(self.cache_dir, filename)
            try:
                stats['total_files'] += 1
                stats['total_size'] += os.path.getsize(cache_path)
                
                with open(cache_path, 'r', encoding='utf-8') as f:
                    cache_data = json.load(f)
                
                expires = datetime.fromisoformat(cache_data['expires'])
                if now > expires:
                    stats['expired_files'] += 1
                else:
                    stats['active_files'] += 1
                    
            except (json.JSONDecodeError, KeyError, IOError):
                stats['expired_files'] += 1
        
        return stats
    
    def clear_all(self) -> bool:
        """清空所有缓存"""
        try:
            for filename in os.listdir(self.cache_dir):
                if filename.endswith('.json'):
                    os.remove(os.path.join(self.cache_dir, filename))
            logger.info("清空所有缓存")
            return True
        except IOError as e:
            logger.error(f"清空缓存错误: {e}")
            return False