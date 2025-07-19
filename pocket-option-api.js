/**
 * محاكاة API لـ Pocket Option
 * 
 * هذا الملف يحاكي اتصالاً بواجهة برمجة تطبيقات Pocket Option
 * ملاحظة: هذه محاكاة فقط وليست اتصالاً حقيقياً بـ API
 * 
 * مفتاح API المطلوب للاتصال: 5c69b5827bb172a741bc236aad283efa
 * 
 * @version 1.1.0
 */

class PocketOptionAPI {
    constructor() {
        this.connected = false;
        this.connectionAttempts = 0;
        this.maxConnectionAttempts = 3;
        this.assets = [
            // أصول الفوركس العادية
            { symbol: 'EURUSD', name: 'EUR/USD', type: 'forex', profitPercent: 85 },
            { symbol: 'GBPUSD', name: 'GBP/USD', type: 'forex', profitPercent: 83 },
            { symbol: 'USDJPY', name: 'USD/JPY', type: 'forex', profitPercent: 82 },
            { symbol: 'USDCAD', name: 'USD/CAD', type: 'forex', profitPercent: 81 },
            { symbol: 'AUDUSD', name: 'AUD/USD', type: 'forex', profitPercent: 84 },
            { symbol: 'EURGBP', name: 'EUR/GBP', type: 'forex', profitPercent: 82 },
            { symbol: 'USDCHF', name: 'USD/CHF', type: 'forex', profitPercent: 81 },
            
            // أصول OTC (Over The Counter)
            { symbol: 'EURUSD-OTC', name: 'EUR/USD OTC', type: 'otc', profitPercent: 87 },
            { symbol: 'GBPUSD-OTC', name: 'GBP/USD OTC', type: 'otc', profitPercent: 86 },
            { symbol: 'USDJPY-OTC', name: 'USD/JPY OTC', type: 'otc', profitPercent: 85 },
            { symbol: 'EURGBP-OTC', name: 'EUR/GBP OTC', type: 'otc', profitPercent: 84 },
            { symbol: 'USDCHF-OTC', name: 'USD/CHF OTC', type: 'otc', profitPercent: 83 },
            { symbol: 'AUDUSD-OTC', name: 'AUD/USD OTC', type: 'otc', profitPercent: 85 },
            { symbol: 'USDCAD-OTC', name: 'USD/CAD OTC', type: 'otc', profitPercent: 84 },
            { symbol: 'EURJPY-OTC', name: 'EUR/JPY OTC', type: 'otc', profitPercent: 86 },
            { symbol: 'GBPJPY-OTC', name: 'GBP/JPY OTC', type: 'otc', profitPercent: 85 },
            
            // العملات الرقمية
            { symbol: 'BTCUSD', name: 'BTC/USD', type: 'crypto', profitPercent: 90 },
            { symbol: 'ETHUSD', name: 'ETH/USD', type: 'crypto', profitPercent: 88 },
            { symbol: 'XRPUSD', name: 'XRP/USD', type: 'crypto', profitPercent: 86 },
            
            // السلع
            { symbol: 'XAUUSD', name: 'XAU/USD (Gold)', type: 'commodity', profitPercent: 87 },
            { symbol: 'XAGUSD', name: 'XAG/USD (Silver)', type: 'commodity', profitPercent: 86 }
        ];
        this.lastPrices = {};
        this.callbacks = {
            onConnect: null,
            onDisconnect: null,
            onPrice: null,
            onError: null
        };
        
        // تهيئة أسعار افتراضية
        this.assets.forEach(asset => {
            let basePrice;
            switch(asset.symbol) {
                // أسعار الفوركس العادية
                case 'EURUSD': basePrice = 1.1; break;
                case 'GBPUSD': basePrice = 1.3; break;
                case 'USDJPY': basePrice = 150; break;
                case 'USDCAD': basePrice = 1.35; break;
                case 'AUDUSD': basePrice = 0.67; break;
                case 'EURGBP': basePrice = 0.85; break;
                case 'USDCHF': basePrice = 0.91; break;
                
                // أسعار OTC (مشابهة للأسعار العادية مع اختلافات طفيفة)
                case 'EURUSD-OTC': basePrice = 1.102; break;
                case 'GBPUSD-OTC': basePrice = 1.298; break;
                case 'USDJPY-OTC': basePrice = 149.8; break;
                case 'EURGBP-OTC': basePrice = 0.845; break;
                case 'USDCHF-OTC': basePrice = 0.905; break;
                case 'AUDUSD-OTC': basePrice = 0.668; break;
                case 'USDCAD-OTC': basePrice = 1.348; break;
                case 'EURJPY-OTC': basePrice = 164.5; break;
                case 'GBPJPY-OTC': basePrice = 194.2; break;
                
                // أسعار العملات الرقمية
                case 'BTCUSD': basePrice = 60000; break;
                case 'ETHUSD': basePrice = 3000; break;
                case 'XRPUSD': basePrice = 0.5; break;
                
                // أسعار السلع
                case 'XAUUSD': basePrice = 2000; break;
                case 'XAGUSD': basePrice = 25; break;
                
                default: basePrice = 1.0;
            }
            this.lastPrices[asset.symbol] = basePrice;
        });
        
        // حالة الاتصال
        this.connectionStatus = {
            lastConnected: null,
            lastDisconnected: null,
            connectionQuality: 'excellent' // excellent, good, poor
        };
    }
    
    /**
     * الاتصال بـ API
     * @returns {Promise} وعد بنتيجة الاتصال
     */
    connect(apiKey = '5c69b5827bb172a741bc236aad283efa') {
        return new Promise((resolve, reject) => {
            if (this.connected) {
                console.log('Already connected to Pocket Option API');
                resolve(true);
                return;
            }
            
            // التحقق من مفتاح API
            if (apiKey !== '5c69b5827bb172a741bc236aad283efa') {
                console.error('Invalid API key');
                reject(new Error('Invalid API key'));
                
                if (this.callbacks.onError) {
                    this.callbacks.onError(new Error('Invalid API key'));
                }
                return;
            }
            
            this.connectionAttempts++;
            console.log(`Connection attempt ${this.connectionAttempts}/${this.maxConnectionAttempts}`);
            
            // محاكاة تأخير الاتصال وإمكانية الفشل
            setTimeout(() => {
                // محاكاة فشل الاتصال في بعض الأحيان
                if (this.connectionAttempts > 1 && Math.random() < 0.2) {
                    console.error('Connection failed (Simulated)');
                    
                    if (this.connectionAttempts >= this.maxConnectionAttempts) {
                        this.connectionAttempts = 0;
                        reject(new Error('Maximum connection attempts reached'));
                    } else {
                        reject(new Error('Connection failed, please try again'));
                    }
                    
                    if (this.callbacks.onError) {
                        this.callbacks.onError(new Error('Connection failed'));
                    }
                    return;
                }
                
                this.connected = true;
                this.connectionStatus.lastConnected = new Date();
                this.connectionStatus.connectionQuality = Math.random() < 0.7 ? 'excellent' : 'good';
                this.connectionAttempts = 0;
                
                console.log('Connected to Pocket Option API (Simulated)');
                
                if (this.callbacks.onConnect) {
                    this.callbacks.onConnect({
                        timestamp: this.connectionStatus.lastConnected,
                        quality: this.connectionStatus.connectionQuality
                    });
                }
                
                // بدء محاكاة تحديثات الأسعار
                this._startPriceUpdates();
                
                resolve(true);
            }, 1000 + Math.random() * 1000); // تأخير عشوائي بين 1-2 ثانية
        });
    }
    
    /**
     * قطع الاتصال بـ API
     */
    disconnect() {
        if (!this.connected) {
            console.log('Already disconnected from Pocket Option API');
            return;
        }
        
        this.connected = false;
        this.connectionStatus.lastDisconnected = new Date();
        console.log('Disconnected from Pocket Option API (Simulated)');
        
        if (this.callbacks.onDisconnect) {
            this.callbacks.onDisconnect({
                timestamp: this.connectionStatus.lastDisconnected,
                reason: 'user_request'
            });
        }
        
        // إيقاف محاكاة تحديثات الأسعار
        if (this.priceUpdateInterval) {
            clearInterval(this.priceUpdateInterval);
            this.priceUpdateInterval = null;
        }
    }
    
    /**
     * الحصول على قائمة الأصول المتاحة
     */
    getAssets() {
        return this.assets;
    }
    
    /**
     * الحصول على السعر الحالي لأصل معين
     */
    getCurrentPrice(symbol) {
        if (!this.connected) {
            throw new Error('Not connected to API');
        }
        
        return this.lastPrices[symbol] || null;
    }
    
    /**
     * الحصول على بيانات الشموع لأصل معين
     */
    getCandles(symbol, timeframe, count = 100) {
        if (!this.connected) {
            throw new Error('Not connected to API');
        }
        
        // محاكاة بيانات الشموع
        const candles = [];
        let time = new Date();
        time.setMinutes(Math.floor(time.getMinutes() / timeframe) * timeframe);
        time.setSeconds(0);
        time.setMilliseconds(0);
        
        const basePrice = this.lastPrices[symbol] || 1.0;
        const volatility = symbol.includes('BTC') || symbol.includes('ETH') ? 0.02 : 0.002;
        
        for (let i = count - 1; i >= 0; i--) {
            const open = basePrice * (1 + (Math.random() - 0.5) * volatility);
            const high = open * (1 + Math.random() * volatility);
            const low = open * (1 - Math.random() * volatility);
            const close = (open + high + low) / 3 + (Math.random() - 0.5) * volatility * basePrice;
            
            const timestamp = Math.floor(time.getTime() / 1000) - i * timeframe * 60;
            
            candles.push({
                time: timestamp,
                open: open,
                high: high,
                low: low,
                close: close,
                volume: Math.floor(Math.random() * 1000)
            });
        }
        
        return candles;
    }
    
    /**
     * تسجيل دالة استدعاء للأحداث
     */
    on(event, callback) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }
        
        switch(event) {
            case 'connect':
                this.callbacks.onConnect = callback;
                break;
            case 'disconnect':
                this.callbacks.onDisconnect = callback;
                break;
            case 'price':
                this.callbacks.onPrice = callback;
                break;
            case 'error':
                this.callbacks.onError = callback;
                break;
            default:
                throw new Error(`Unknown event: ${event}`);
        }
    }
    
    /**
     * بدء محاكاة تحديثات الأسعار
     * @private
     */
    _startPriceUpdates() {
        this.priceUpdateInterval = setInterval(() => {
            if (!this.connected) return;
            
            // تحديث الأسعار لجميع الأصول
            this.assets.forEach(asset => {
                const currentPrice = this.lastPrices[asset.symbol];
                const volatility = asset.symbol.includes('BTC') || asset.symbol.includes('ETH') ? 0.005 : 0.0005;
                const newPrice = currentPrice * (1 + (Math.random() - 0.5) * volatility);
                this.lastPrices[asset.symbol] = newPrice;
                
                // استدعاء دالة الاستدعاء لتحديث السعر
                if (this.callbacks.onPrice) {
                    this.callbacks.onPrice({
                        symbol: asset.symbol,
                        price: newPrice,
                        timestamp: Date.now()
                    });
                }
            });
        }, 1000); // تحديث كل ثانية
    }
    
    /**
     * الحصول على الأخبار الاقتصادية
     */
    getEconomicNews() {
        // محاكاة الأخبار الاقتصادية
        const now = new Date();
        const currentHour = now.getHours();
        
        const news = [
            {
                time: `${(currentHour + 1) % 24}:30`,
                title: 'معدل البطالة الأمريكي',
                impact: 'high',
                currency: 'USD'
            },
            {
                time: `${(currentHour + 2) % 24}:00`,
                title: 'مؤشر ISM للتصنيع',
                impact: 'medium',
                currency: 'USD'
            },
            {
                time: `${(currentHour + 3) % 24}:15`,
                title: 'تصريحات البنك المركزي الأوروبي',
                impact: 'low',
                currency: 'EUR'
            },
            {
                time: `${(currentHour + 4) % 24}:45`,
                title: 'مبيعات التجزئة البريطانية',
                impact: 'medium',
                currency: 'GBP'
            },
            {
                time: `${(currentHour + 5) % 24}:30`,
                title: 'قرار سعر الفائدة الياباني',
                impact: 'high',
                currency: 'JPY'
            }
        ];
        
        return news;
    }
    
    /**
     * الحصول على حالة الأسواق
     */
    getMarketStatus() {
        const now = new Date();
        const currentHour = now.getHours();
        const currentDay = now.getDay(); // 0 = الأحد، 6 = السبت
        
        // محاكاة حالة الأسواق بناءً على الوقت الحالي
        const markets = {
            forex: {
                name: 'فوركس',
                status: (currentDay >= 1 && currentDay <= 5) ? 'open' : 'closed'
            },
            otc: {
                name: 'سوق OTC',
                status: 'open', // سوق OTC متاح دائمًا حتى في عطلات نهاية الأسبوع
                description: 'متاح 24/7 حتى في عطلات نهاية الأسبوع'
            },
            us_stocks: {
                name: 'الأسهم الأمريكية',
                status: (currentDay >= 1 && currentDay <= 5 && currentHour >= 14 && currentHour < 21) ? 'open' : 'closed'
            },
            crypto: {
                name: 'العملات الرقمية',
                status: 'open', // العملات الرقمية متاحة على مدار الساعة
                description: 'متاح 24/7'
            },
            commodities: {
                name: 'المعادن',
                status: (currentDay >= 1 && currentDay <= 5) ? 'open' : 'closed'
            }
        };
        
        return markets;
    }
    
    /**
     * الحصول على جلسات التداول النشطة
     */
    getActiveSessions() {
        const now = new Date();
        const currentHour = now.getHours();
        
        // محاكاة جلسات التداول بناءً على الوقت الحالي
        const sessions = [
            {
                name: 'آسيا',
                timeRange: '00:00 - 09:00',
                active: (currentHour >= 0 && currentHour < 9)
            },
            {
                name: 'أوروبا',
                timeRange: '08:00 - 17:00',
                active: (currentHour >= 8 && currentHour < 17)
            },
            {
                name: 'أمريكا',
                timeRange: '13:00 - 22:00',
                active: (currentHour >= 13 && currentHour < 22)
            }
        ];
        
        return sessions;
    }
}

// تصدير الفئة للاستخدام في ملفات أخرى
window.PocketOptionAPI = PocketOptionAPI;