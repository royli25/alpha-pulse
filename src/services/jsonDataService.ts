export interface JsonSignalData {
    symbol: string;
    timestamp: string;
    data: {
        id: string;
        asset: string;
        type: 'BUY' | 'SELL' | 'HOLD';
        confidence: number;
        signal: string;
        timestamp: string;
        description: string;
        sources: string[];
        price: string;
        change: number;
        newsArticles: number;
        socialSentiment: string;
        fetch_timestamp: string;
        fetch_success: boolean;
        symbol: string;
    };
    metadata: {
        fetch_success: boolean;
        file_created: string;
    };
}

class JsonDataService {
    private baseUrl = '/js.tool/auto_data';
    private loadedFiles = new Set<string>();
    private subscribers: Set<(data: JsonSignalData[]) => void> = new Set();

    /**
     * 加载所有JSON文件
     */
    // 修改loadAllJsonFiles方法，移除已加载文件的限制
    async loadAllJsonFiles(): Promise<JsonSignalData[]> {
        try {
            const response = await fetch(`${this.baseUrl}/progress.json`);
            const progress = await response.json();

            const allData: JsonSignalData[] = [];

            // 加载所有文件，包括已加载过的
            for (const fileName of progress.completed_files) {
                const fileData = await this.loadJsonFile(fileName);
                if (fileData) {
                    allData.push(fileData);
                }
            }

            return allData;
        } catch (error) {
            console.error('Failed to load JSON files:', error);
            return [];
        }
    }

    /**
     * 加载单个JSON文件
     */
    private async loadJsonFile(fileName: string): Promise<JsonSignalData | null> {
        try {
            const response = await fetch(`${this.baseUrl}/${fileName}`);
            if (response.ok) {
                const data = await response.json();
                return data;
            }
            return null;
        } catch (error) {
            console.error(`Failed to load file ${fileName}:`, error);
            return null;
        }
    }

    /**
     * 定期检查新文件
     */
    startPolling(intervalMs: number = 30000) {
        setInterval(async () => {
            const newData = await this.loadAllJsonFiles();
            if (newData.length > 0) {
                this.notifySubscribers(newData);
            }
        }, intervalMs);
    }

    /**
     * 订阅数据更新
     */
    subscribe(callback: (data: JsonSignalData[]) => void): () => void {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    private notifySubscribers(data: JsonSignalData[]) {
        this.subscribers.forEach(callback => callback(data));
    }

    /**
     * 将JSON数据转换为Signal格式
     */
    convertToSignalFormat(jsonData: JsonSignalData): any {
        return {
            id: jsonData.data.id,
            asset: jsonData.data.asset,
            type: jsonData.data.type,
            confidence: jsonData.data.confidence,
            timestamp: jsonData.data.timestamp,
            description: jsonData.data.description,
            sources: jsonData.data.sources,
            price: jsonData.data.price,
            change: jsonData.data.change,
            newsArticles: jsonData.data.newsArticles,
            socialSentiment: jsonData.data.socialSentiment,
            redditMentions: 0, // 默认值
            indicator: jsonData.data.signal,
            value: jsonData.data.confidence
        };
    }
}

export const jsonDataService = new JsonDataService();