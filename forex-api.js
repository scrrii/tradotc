/**
 * واجهة برمجة تطبيقات الفوركس (Forex API)
 * 
 * هذا الملف يوفر واجهة برمجة تطبيقات متكاملة للفوركس والأسواق المالية
 * يدعم العديد من أزواج العملات والمؤشرات والسلع
 * 
 * مفتاح API المطلوب للاتصال: 7d8f3e2a1c6b5940d2c7e8f9a3b1d5c0
 * 
 * @version 1.0.0
 */

class ForexAPI {
    constructor() {
        this.connected = false;
        this.connectionAttempts = 0;
        this.maxConnectionAttempts = 3;
        
        // قائمة الأصول المدعومة
        this.assets = [
            // أزواج العملات الرئيسية
            { symbol: 'EURUSD', name: 'EUR/USD', type: 'forex', profitPercent: 85, spread: 1.2 },
            { symbol: 'GBPUSD', name: 'GBP/USD', type: 'forex', profitPercent: 83, spread: 1.5 },
            { symbol: 'USDJPY', name: 'USD/JPY', type: 'forex', profitPercent: 82, spread: 1.3 },
            { symbol: 'USDCHF', name: 'USD/CHF', type: 'forex', profitPercent: 80, spread: 1.8 },
            { symbol: 'AUDUSD', name: 'AUD/USD', type: 'forex', profitPercent: 81, spread: 1.4 },
            { symbol: 'USDCAD', name: 'USD/CAD', type: 'forex', profitPercent: 81, spread: 1.6 },
            { symbol: 'NZDUSD', name: 'NZD/USD', type: 'forex', profitPercent: 79, spread: 1.9 },
            
            // أزواج العملات الثانوية
            { symbol: 'EURGBP', name: 'EUR/GBP', type: 'forex', profitPercent: 78, spread: 2.0 },
            { symbol: 'EURJPY', name: 'EUR/JPY', type: 'forex', profitPercent: 79, spread: 1.7 },
            { symbol: 'GBPJPY', name: 'GBP/JPY', type: 'forex', profitPercent: 80, spread: 1.8 },
            { symbol: 'AUDJPY', name: 'AUD/JPY', type: 'forex', profitPercent: 77, spread: 2.1 },
            { symbol: 'CADJPY', name: 'CAD/JPY', type: 'forex', profitPercent: 76, spread: 2.2 },
            
            // أزواج OTC (Over The Counter)
            { symbol: 'EURUSD-OTC', name: 'EUR/USD OTC', type: 'otc', profitPercent: 87, spread: 1.0 },
            { symbol: 'GBPUSD-OTC', name: 'GBP/USD OTC', type: 'otc', profitPercent: 86, spread: 1.2 },
            { symbol: 'USDJPY-OTC', name: 'USD/JPY OTC', type: 'otc', profitPercent: 85, spread: 1.1 },
            { symbol: 'EURGBP-OTC', name: 'EUR/GBP OTC', type: 'otc', profitPercent: 84, spread: 1.5 },
            { symbol: 'USDCHF-OTC', name: 'USD/CHF OTC', type: 'otc', profitPercent: 83, spread: 1.6 },
            { symbol: 'AUDUSD-OTC', name: 'AUD/USD OTC', type: 'otc', profitPercent: 85, spread: 1.3 },
            { symbol: 'EURJPY-OTC', name: 'EUR/JPY OTC', type: 'otc', profitPercent: 86, spread: 1.4 },
            
            // المؤشرات
            { symbol: 'US30', name: 'Dow Jones 30', type: 'index', profitPercent: 85, spread: 3.0 },
            { symbol: 'SPX500', name: 'S&P 500', type: 'index', profitPercent: 86, spread: 2.8 },
            { symbol: 'NASDAQ', name: 'NASDAQ', type: 'index', profitPercent: 87, spread: 2.5 },
            { symbol: 'GER30', name: 'DAX 30', type: 'index', profitPercent: 84, spread: 3.2 },
            { symbol: 'UK100', name: 'FTSE 100', type: 'index', profitPercent: 83, spread: 3.5 },
            { symbol: 'FRA40', name: 'CAC 40', type: 'index', profitPercent: 82, spread: 3.7 },
            { symbol: 'JPN225', name: 'Nikkei 225', type: 'index', profitPercent: 81, spread: 4.0 },
            
            // السلع
            { symbol: 'XAUUSD', name: 'Gold', type: 'commodity', profitPercent: 87, spread: 2.5 },
            { symbol: 'XAGUSD', name: 'Silver', type: 'commodity', profitPercent: 85, spread: 3.0 },
            { symbol: 'USOIL', name: 'US Oil', type: 'commodity', profitPercent: 84, spread: 3.2 },
            { symbol: 'UKOIL', name: 'UK Oil', type: 'commodity', profitPercent: 83, spread: 3.5 },
            
            // العملات الرقمية
            { symbol: 'BTCUSD', name: 'Bitcoin', type: 'crypto', profitPercent: 90, spread: 20 },
            { symbol: 'ETHUSD', name: 'Ethereum', type: 'crypto', profitPercent: 88, spread: 15 },
            { symbol: 'XRPUSD', name: 'Ripple', type: 'crypto', profitPercent: 86, spread: 10 },
            { symbol: 'LTCUSD', name: 'Litecoin', type: 'crypto', profitPercent: 85, spread: 12 },
            { symbol: 'BCHUSD', name: 'Bitcoin Cash', type: 'crypto', profitPercent: 84, spread: 18 },
            { symbol: 'ADAUSD', name: 'Cardano', type: 'crypto', profitPercent: 83, spread: 8 },
            { symbol: 'DOTUSD', name: 'Polkadot', type: 'crypto', profitPercent: 82, spread: 9 },
            { symbol: 'DOGEUD', name: 'Dogecoin', type: 'crypto', profitPercent: 80, spread: 7 }
        ];
        
        this.lastPrices = {};
        this.callbacks = {
            onConnect: null,
            onDisconnect: null,
            onPrice: null,
            onError: null,
            onMarketStatus: null,
            onEconomicCalendar: null
        };
        
        // تهيئة أسعار افتراضية
        this.assets.forEach(asset => {
            let basePrice;
            switch(asset.type) {
                case 'forex':
                    if (asset.symbol.includes('JPY')) {
                        basePrice = asset.symbol.startsWith('USD') ? 150 : 130;
                    } else {
                        basePrice = asset.symbol.startsWith('GBP') ? 1.3 : 1.1;
                    }
                    break;
                case 'index':
                    switch(asset.symbol) {
                        case 'US30': basePrice = 38000; break;
                        case 'SPX500': basePrice = 5200; break;
                        case 'NASDAQ': basePrice = 16500; break;
                        case 'GER30': basePrice = 18000; break;
                        case 'UK100': basePrice = 8000; break;
                        case 'FRA40': basePrice = 7500; break;
                        case 'JPN225': basePrice = 38000; break;
                        default: basePrice = 1000;
                    }
                    break;
                case 'commodity':
                    switch(asset.symbol) {
                        case 'XAUUSD': basePrice = 2000; break;
                        case 'XAGUSD': basePrice = 25; break;
                        case 'USOIL': basePrice = 80; break;
                        case 'UKOIL': basePrice = 85; break;
                        default: basePrice = 100;
                    }
                    break;
                case 'crypto':
                    switch(asset.symbol) {
                        case 'BTCUSD': basePrice = 60000; break;
                        case 'ETHUSD': basePrice = 3000; break;
                        case 'XRPUSD': basePrice = 0.5; break;
                        case 'LTCUSD': basePrice = 80; break;
                        case 'BCHUSD': basePrice = 250; break;
                        case 'ADAUSD': basePrice = 0.4; break;
                        case 'DOTUSD': basePrice = 6; break;
                        case 'DOGEUD': basePrice = 0.08; break;
                        default: basePrice = 1.0;
                    }
                    break;
                default:
                    basePrice = 1.0;
            }
            this.lastPrices[asset.symbol] = basePrice;
        });
        
        // حالة الاتصال
        this.connectionStatus = {
            lastConnected: null,
            lastDisconnected: null,
            connectionQuality: 'excellent' // excellent, good, poor
        };
        
        // التقويم الاقتصادي
        this.economicCalendar = [];
        
        // حالة الأسواق
        this.markets = {};
    }
    
    /**
     * الاتصال بـ API
     * @param {string} apiKey - مفتاح API للتحقق من صحة الاتصال
     * @returns {Promise} وعد بنتيجة الاتصال
     */
    connect(apiKey = '7d8f3e2a1c6b5940d2c7e8f9a3b1d5c0') {
        return new Promise((resolve, reject) => {
            if (this.connected) {
                console.log('Already connected to Forex API');
                resolve(true);
                return;
            }
            
            // التحقق من مفتاح API
            if (apiKey !== '7d8f3e2a1c6b5940d2c7e8f9a3b1d5c0') {
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
                
                console.log('Connected to Forex API (Simulated)');
                
                // تحديث التقويم الاقتصادي
                this._updateEconomicCalendar();
                
                // تحديث حالة الأسواق
                this._updateMarketStatus();
                
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
            console.log('Already disconnected from Forex API');
            return;
        }
        
        this.connected = false;
        this.connectionStatus.lastDisconnected = new Date();
        console.log('Disconnected from Forex API (Simulated)');
        
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
     * @param {string} type - نوع الأصول (اختياري: forex, index, commodity, crypto)
     * @returns {Array} قائمة الأصول
     */
    getAssets(type = null) {
        if (type) {
            return this.assets.filter(asset => asset.type === type);
        }
        return this.assets;
    }
    
    /**
     * الحصول على السعر الحالي لأصل معين
     * @param {string} symbol - رمز الأصل
     * @returns {number} السعر الحالي
     */
    getCurrentPrice(symbol) {
        if (!this.connected) {
            throw new Error('Not connected to API');
        }
        
        return this.lastPrices[symbol] || null;
    }
    
    /**
     * الحصول على بيانات الشموع لأصل معين
     * @param {string} symbol - رمز الأصل
     * @param {number} timeframe - الإطار الزمني بالدقائق
     * @param {number} count - عدد الشموع المطلوبة
     * @returns {Array} بيانات الشموع
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
        const asset = this.assets.find(a => a.symbol === symbol);
        const volatility = asset?.type === 'crypto' ? 0.02 : 
                          asset?.type === 'index' ? 0.01 : 
                          asset?.type === 'commodity' ? 0.008 : 0.002;
        
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
     * الحصول على التقويم الاقتصادي
     * @param {string} currency - عملة محددة (اختياري)
     * @returns {Array} بيانات التقويم الاقتصادي
     */
    getEconomicCalendar(currency = null) {
        if (!this.connected) {
            throw new Error('Not connected to API');
        }
        
        if (currency) {
            return this.economicCalendar.filter(event => event.currency === currency);
        }
        return this.economicCalendar;
    }
    
    /**
     * الحصول على حالة الأسواق
     * @returns {Object} حالة الأسواق
     */
    getMarketStatus() {
        if (!this.connected) {
            throw new Error('Not connected to API');
        }
        
        return this.markets;
    }
    
    /**
     * الحصول على جلسات التداول النشطة
     * @returns {Array} جلسات التداول
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
            },
            {
                name: 'أستراليا',
                timeRange: '22:00 - 07:00',
                active: (currentHour >= 22 || currentHour < 7)
            }
        ];
        
        return sessions;
    }
    
    /**
     * الحصول على بيانات السبريد (فرق السعر)
     * @param {string} symbol - رمز الأصل
     * @returns {number} قيمة السبريد
     */
    getSpread(symbol) {
        if (!this.connected) {
            throw new Error('Not connected to API');
        }
        
        const asset = this.assets.find(a => a.symbol === symbol);
        return asset ? asset.spread : null;
    }
    
    /**
     * تسجيل دالة استدعاء للأحداث
     * @param {string} event - نوع الحدث
     * @param {Function} callback - دالة الاستدعاء
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
            case 'marketStatus':
                this.callbacks.onMarketStatus = callback;
                break;
            case 'economicCalendar':
                this.callbacks.onEconomicCalendar = callback;
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
                let volatility;
                
                switch(asset.type) {
                    case 'crypto':
                        volatility = 0.005;
                        break;
                    case 'index':
                        volatility = 0.002;
                        break;
                    case 'commodity':
                        volatility = 0.001;
                        break;
                    default: // forex
                        volatility = 0.0005;
                }
                
                const newPrice = currentPrice * (1 + (Math.random() - 0.5) * volatility);
                this.lastPrices[asset.symbol] = newPrice;
                
                // استدعاء دالة الاستدعاء لتحديث السعر
                if (this.callbacks.onPrice) {
                    this.callbacks.onPrice({
                        symbol: asset.symbol,
                        price: newPrice,
                        timestamp: Date.now(),
                        spread: asset.spread
                    });
                }
            });
        }, 1000); // تحديث كل ثانية
    }
    
    /**
     * تحديث التقويم الاقتصادي
     * @private
     */
    _updateEconomicCalendar() {
        const now = new Date();
        const currentHour = now.getHours();
        
        // محاكاة بيانات التقويم الاقتصادي
        this.economicCalendar = [
            {
                time: `${(currentHour + 1) % 24}:30`,
                title: 'معدل البطالة الأمريكي',
                impact: 'high',
                currency: 'USD',
                forecast: '3.8%',
                previous: '3.9%'
            },
            {
                time: `${(currentHour + 2) % 24}:00`,
                title: 'مؤشر ISM للتصنيع',
                impact: 'medium',
                currency: 'USD',
                forecast: '52.5',
                previous: '51.8'
            },
            {
                time: `${(currentHour + 3) % 24}:15`,
                title: 'تصريحات البنك المركزي الأوروبي',
                impact: 'high',
                currency: 'EUR',
                forecast: '-',
                previous: '-'
            },
            {
                time: `${(currentHour + 4) % 24}:45`,
                title: 'مبيعات التجزئة البريطانية',
                impact: 'medium',
                currency: 'GBP',
                forecast: '0.3%',
                previous: '0.1%'
            },
            {
                time: `${(currentHour + 5) % 24}:30`,
                title: 'قرار سعر الفائدة الياباني',
                impact: 'high',
                currency: 'JPY',
                forecast: '0.1%',
                previous: '0.0%'
            },
            {
                time: `${(currentHour + 6) % 24}:00`,
                title: 'مؤشر أسعار المستهلك الأوروبي',
                impact: 'high',
                currency: 'EUR',
                forecast: '2.5%',
                previous: '2.4%'
            },
            {
                time: `${(currentHour + 7) % 24}:30`,
                title: 'الناتج المحلي الإجمالي الكندي',
                impact: 'medium',
                currency: 'CAD',
                forecast: '0.4%',
                previous: '0.3%'
            },
            {
                time: `${(currentHour + 8) % 24}:45`,
                title: 'مؤشر مديري المشتريات الصيني',
                impact: 'medium',
                currency: 'CNY',
                forecast: '51.2',
                previous: '50.9'
            },
            {
                time: `${(currentHour + 9) % 24}:00`,
                title: 'معدل التضخم الأسترالي',
                impact: 'medium',
                currency: 'AUD',
                forecast: '2.2%',
                previous: '2.1%'
            },
            {
                time: `${(currentHour + 10) % 24}:30`,
                title: 'تقرير الوظائف الأمريكي غير الزراعية',
                impact: 'high',
                currency: 'USD',
                forecast: '180K',
                previous: '165K'
            }
        ];
        
        // إرسال تحديث التقويم الاقتصادي
        if (this.callbacks.onEconomicCalendar) {
            this.callbacks.onEconomicCalendar(this.economicCalendar);
        }
    }
    
    /**
     * تحديث حالة الأسواق
     * @private
     */
    _updateMarketStatus() {
        const now = new Date();
        const currentHour = now.getHours();
        const currentDay = now.getDay(); // 0 = الأحد، 6 = السبت
        
        // محاكاة حالة الأسواق بناءً على الوقت الحالي
        this.markets = {
            forex: {
                name: 'فوركس',
                status: (currentDay >= 1 && currentDay <= 5) ? 'open' : 'closed'
            },
            otc: {
                name: 'سوق OTC',
                status: 'open',
                description: 'متاح 24/7 حتى في عطلات نهاية الأسبوع'
            },
            us_stocks: {
                name: 'الأسهم الأمريكية',
                status: (currentDay >= 1 && currentDay <= 5 && currentHour >= 14 && currentHour < 21) ? 'open' : 'closed'
            },
            eu_stocks: {
                name: 'الأسهم الأوروبية',
                status: (currentDay >= 1 && currentDay <= 5 && currentHour >= 9 && currentHour < 17) ? 'open' : 'closed'
            },
            asia_stocks: {
                name: 'الأسهم الآسيوية',
                status: (currentDay >= 1 && currentDay <= 5 && ((currentHour >= 0 && currentHour < 8) || (currentHour >= 23))) ? 'open' : 'closed'
            },
            crypto: {
                name: 'العملات الرقمية',
                status: 'open',
                description: 'متاح 24/7'
            },
            commodities: {
                name: 'السلع',
                status: (currentDay >= 1 && currentDay <= 5) ? 'open' : 'closed'
            },
            bonds: {
                name: 'السندات',
                status: (currentDay >= 1 && currentDay <= 5 && currentHour >= 14 && currentHour < 21) ? 'open' : 'closed'
            }
        };
        
        // إرسال تحديث حالة الأسواق
        if (this.callbacks.onMarketStatus) {
            this.callbacks.onMarketStatus(this.markets);
        }
    }
}

// تصدير الفئة للاستخدام في ملفات أخرى
window.ForexAPI = ForexAPI;