import json
import os
import glob

def convert_auto_data_to_signals():
    """将auto_data中的JSON文件转换为signals格式"""
    auto_data_dir = "auto_data"
    signals = []
    
    # 获取所有股票JSON文件（排除progress.json）
    json_files = glob.glob(os.path.join(auto_data_dir, "*_*.json"))
    
    for file_path in json_files:
        if "progress.json" in file_path:
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            # 提取data对象并转换格式
            stock_data = data.get('data', {})
            if stock_data:
                signal = {
                    "id": stock_data.get('id', f"{stock_data.get('asset', 'UNKNOWN')}_auto"),
                    "asset": stock_data.get('asset', ''),
                    "type": stock_data.get('type', 'HOLD').upper(),
                    "confidence": stock_data.get('confidence', 50),
                    "timestamp": stock_data.get('timestamp', 'now'),
                    "description": stock_data.get('description', ''),
                    "sources": stock_data.get('sources', ['news']),
                    "price": stock_data.get('price', '$0.00'),
                    "change": stock_data.get('change', 0.0),
                    "redditMentions": stock_data.get('redditMentions', 0),
                    "newsArticles": stock_data.get('newsArticles', 0),
                    "socialSentiment": stock_data.get('socialSentiment', 'neutral')
                }
                signals.append(signal)
                
        except Exception as e:
            print(f"处理文件 {file_path} 时出错: {e}")
    
    return signals

def update_sample_data():
    """更新sampleData.json文件"""
    # 读取当前的sampleData.json
    sample_data_path = "../src/data/sampleData.json"
    
    with open(sample_data_path, 'r', encoding='utf-8') as f:
        sample_data = json.load(f)
    
    # 获取新的signals
    new_signals = convert_auto_data_to_signals()
    
    # 更新signals数组
    sample_data['signals'] = new_signals
    
    # 更新dashboardMetrics
    sample_data['dashboardMetrics']['activeSignals']['value'] = len(new_signals)
    sample_data['dashboardMetrics']['avgConfidence']['value'] = round(
        sum(s['confidence'] for s in new_signals) / len(new_signals) if new_signals else 0, 1
    )
    
    # 保存更新后的文件
    with open(sample_data_path, 'w', encoding='utf-8') as f:
        json.dump(sample_data, f, indent=2, ensure_ascii=False)
    
    print(f"已更新sampleData.json，包含 {len(new_signals)} 个信号")

if __name__ == "__main__":
    update_sample_data()