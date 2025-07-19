// إعداد المتغيرات العامة
let chart;
let candleSeries;
let currentSymbol = 'EURUSD';
let currentTimeframe = 1; // بالدقائق
let signalType = 'candle-close';
let currentStrategy = 'combined';

// إنشاء كائن API لـ Pocket Option
let pocketOptionAPI = new PocketOptionAPI();
// إنشاء كائن API للفوركس
let forexAPI = new ForexAPI();
// تحديد API النشط حاليًا (pocket-option أو forex)
let activeAPI = 'pocket-option';
let markets = {};
let economicNews = [];
let tradingSessions = [];

// متغيرات إضافية لواجهة برمجة الفوركس
let forexSymbols = [];
let forexSpreads = {};
let forexLeverage = 100; // الرافعة المالية الافتراضية
let forexAccountBalance = 10000; // رصيد الحساب الافتراضي

// تحديث حالة الاتصال في واجهة المستخدم
function updateConnectionStatus(isConnected, details = {}) {
    const statusElement = document.querySelector('.integration-status');
    const statusTextElement = document.querySelector('.integration-status span');
    const toggleButton = document.getElementById('toggle-connection');
    const apiTypeElement = document.getElementById('api-type');
    
    if (isConnected) {
        statusElement.classList.add('connected');
        statusElement.classList.remove('disconnected');
        statusTextElement.textContent = 'متصل بالسوق المباشر';
        
        if (details.quality) {
            let qualityText = '';
            switch(details.quality) {
                case 'excellent': qualityText = ' (جودة ممتازة)'; break;
                case 'good': qualityText = ' (جودة جيدة)'; break;
                case 'poor': qualityText = ' (جودة ضعيفة)'; break;
            }
            statusTextElement.textContent += qualityText;
        }
        
        // تحديث نوع API المتصل
        if (apiTypeElement) {
            apiTypeElement.textContent = activeAPI === 'pocket-option' ? 'Pocket Option API' : 'Forex API';
        }
        
        toggleButton.innerHTML = '<i class="fas fa-power-off"></i> قطع الاتصال';
        toggleButton.classList.remove('connect');
    } else {
        statusElement.classList.remove('connected');
        statusElement.classList.add('disconnected');
        statusTextElement.textContent = 'غير متصل';
        
        toggleButton.innerHTML = '<i class="fas fa-power-off"></i> إعادة الاتصال';
        toggleButton.classList.add('connect');
    }
}

// الاتصال بـ API
pocketOptionAPI.on('connect', (data) => {
    console.log('Connection event received:', data);
    updateConnectionStatus(true, { quality: data?.quality || 'good' });
    
    // تحديث البيانات من API
    markets = pocketOptionAPI.getMarketStatus();
    economicNews = pocketOptionAPI.getEconomicNews();
    tradingSessions = pocketOptionAPI.getActiveSessions();
    
    // تحديث واجهة المستخدم
    updateMarketStatus();
    updateEconomicNews();
    updateTradingSessions();
    updateSymbolSelect(); // تحديث قائمة الرموز مع بيانات API
    updateProfitPercentage(); // تحديث نسبة الربح المعروضة
});

pocketOptionAPI.on('disconnect', (data) => {
    console.log('Disconnected from Pocket Option API', data);
    updateConnectionStatus(false);
    
    // تحديث قائمة الرموز بالبيانات الافتراضية عند قطع الاتصال
    updateSymbolSelect();
});

pocketOptionAPI.on('price', (data) => {
    // تحديث السعر الحالي إذا كان الرمز المحدد
    if (data.symbol === currentSymbol) {
        // يمكن استخدام هذا لتحديث السعر المباشر في واجهة المستخدم
        // console.log(`New price for ${data.symbol}: ${data.price}`);
    }
});

pocketOptionAPI.on('error', (error) => {
    console.error('API Error:', error);
    alert(`خطأ في الاتصال: ${error.message}`);
    
    // تحديث حالة الاتصال وقائمة الرموز عند حدوث خطأ
    updateConnectionStatus(false);
    updateSymbolSelect();
});

// الاتصال بـ API عند بدء التطبيق
// استخدام مفتاح API للتحقق من صحة الاتصال
const apiKey = '5c69b5827bb172a741bc236aad283efa';
pocketOptionAPI.connect(apiKey)
    .then((result) => {
        console.log('Connected to Pocket Option API', result);
        updateConnectionStatus(true, { quality: pocketOptionAPI.connectionStatus?.connectionQuality || 'good' });
    })
    .catch(err => {
        console.error('Failed to connect to Pocket Option API:', err);
        updateConnectionStatus(false);
    });


// سجل الإشارات (محاكاة)
const signalsHistory = [
    { type: 'buy', asset: 'EUR/USD', time: '12:30', result: 'win' },
    { type: 'sell', asset: 'GBP/USD', time: '12:15', result: 'loss' },
    { type: 'buy', asset: 'BTC/USD', time: '12:00', result: 'win' }
];

// بيانات الشموع من API
function generateCandleData(symbol, timeframe, count = 100) {
    // استخدام API النشط للحصول على بيانات الشموع إذا كان متصلاً
    if (activeAPI === 'pocket-option' && pocketOptionAPI && pocketOptionAPI.connected) {
        try {
            return pocketOptionAPI.getCandles(symbol, timeframe, count);
        } catch (error) {
            console.error('Error getting candles from Pocket Option API:', error);
            // استخدام البيانات المحلية كاحتياطي في حالة الخطأ
        }
    } else if (activeAPI === 'forex' && forexAPI && forexAPI.connected) {
        try {
            return forexAPI.getCandles(symbol, timeframe, count);
        } catch (error) {
            console.error('Error getting candles from Forex API:', error);
            // استخدام البيانات المحلية كاحتياطي في حالة الخطأ
        }
    }
    
    // استخدام البيانات المحلية إذا لم يكن متصلاً بـ API
    const data = [];
    let time = new Date();
    time.setMinutes(Math.floor(time.getMinutes() / timeframe) * timeframe);
    time.setSeconds(0);
    time.setMilliseconds(0);
    
    // تحديد السعر الأساسي حسب الزوج
    let basePrice;
    switch(symbol) {
        case 'EURUSD': basePrice = 1.1; break;
        case 'GBPUSD': basePrice = 1.3; break;
        case 'USDJPY': basePrice = 150; break;
        case 'BTCUSD': basePrice = 60000; break;
        case 'ETHUSD': basePrice = 3000; break;
        case 'XAUUSD': basePrice = 2000; break;
        case 'US30': basePrice = 38000; break;
        case 'SPX500': basePrice = 5200; break;
        case 'NASDAQ': basePrice = 16500; break;
        case 'XAGUSD': basePrice = 25; break;
        default: basePrice = 1.1;
    }
    
    // إنشاء بيانات الشموع
    for (let i = count - 1; i >= 0; i--) {
        // تحديد التقلب حسب نوع الأصل
        let volatility;
        if (symbol.includes('BTC') || symbol.includes('ETH')) {
            volatility = 0.02; // عملات رقمية
        } else if (symbol.includes('US30') || symbol.includes('SPX') || symbol.includes('NASDAQ')) {
            volatility = 0.01; // مؤشرات
        } else if (symbol.includes('XAU') || symbol.includes('XAG') || symbol.includes('OIL')) {
            volatility = 0.008; // سلع
        } else {
            volatility = 0.002; // فوركس
        }
        
        const open = basePrice * (1 + (Math.random() - 0.5) * volatility);
        const high = open * (1 + Math.random() * volatility);
        const low = open * (1 - Math.random() * volatility);
        const close = (open + high + low) / 3 + (Math.random() - 0.5) * volatility * basePrice;
        
        const timestamp = time.getTime() / 1000 - i * timeframe * 60;
        
        data.push({
            time: timestamp,
            open: open,
            high: high,
            low: low,
            close: close,
            volume: Math.floor(Math.random() * 1000) // إضافة حجم التداول
        });
    }
    
    return data;
}

// إنشاء الرسم البياني
function createChart() {
    const chartElement = document.getElementById('chart');
    
    // إنشاء الرسم البياني
    chart = LightweightCharts.createChart(chartElement, {
        width: chartElement.clientWidth,
        height: 400,
        layout: {
            backgroundColor: '#161b22',
            textColor: '#d1d5db',
            fontSize: 12,
            fontFamily: 'Cairo, sans-serif',
        },
        grid: {
            vertLines: {
                color: 'rgba(42, 46, 57, 0.5)',
            },
            horzLines: {
                color: 'rgba(42, 46, 57, 0.5)',
            },
        },
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
        },
        rightPriceScale: {
            borderColor: 'rgba(197, 203, 206, 0.8)',
        },
        timeScale: {
            borderColor: 'rgba(197, 203, 206, 0.8)',
            timeVisible: true,
            secondsVisible: false,
        },
    });

    // إضافة سلسلة الشموع
    candleSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderDownColor: '#ef5350',
        borderUpColor: '#26a69a',
        wickDownColor: '#ef5350',
        wickUpColor: '#26a69a',
    });

    // تحميل البيانات الأولية
    updateChartData();

    // إضافة مؤشرات فنية
    addTechnicalIndicators();

    // تعديل حجم الرسم البياني عند تغيير حجم النافذة
    window.addEventListener('resize', () => {
        if (chart) {
            chart.applyOptions({
                width: chartElement.clientWidth,
            });
        }
    });
}

// إضافة المؤشرات الفنية
function addTechnicalIndicators() {
    // إضافة المتوسط المتحرك البسيط (SMA)
    const sma20 = chart.addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
        title: 'SMA 20',
    });

    const sma50 = chart.addLineSeries({
        color: '#FF6D00',
        lineWidth: 2,
        title: 'SMA 50',
    });

    // حساب المتوسط المتحرك
    const calculateSMA = (data, period) => {
        const result = [];
        for (let i = period - 1; i < data.length; i++) {
            let sum = 0;
            for (let j = 0; j < period; j++) {
                sum += data[i - j].close;
            }
            result.push({
                time: data[i].time,
                value: sum / period
            });
        }
        return result;
    };

    // الحصول على بيانات الشموع
    const candleData = generateCandleData(currentSymbol, currentTimeframe);
    
    // تعيين بيانات المتوسط المتحرك
    sma20.setData(calculateSMA(candleData, 20));
    sma50.setData(calculateSMA(candleData, 50));
}

// تحديث بيانات الرسم البياني
function updateChartData() {
    const data = generateCandleData(currentSymbol, currentTimeframe);
    candleSeries.setData(data);
    
    // إضافة إشارة تداول على الرسم البياني
    const lastCandle = data[data.length - 1];
    const signalPrice = lastCandle.close;
    const signalTime = lastCandle.time;
    
    // تحديد نوع الإشارة (شراء أو بيع) بناءً على الاستراتيجية
    const signalType = generateSignal(data);
    
    // إضافة علامة على الرسم البياني
    candleSeries.setMarkers([
        {
            time: signalTime,
            position: signalType === 'buy' ? 'belowBar' : 'aboveBar',
            color: signalType === 'buy' ? '#2196F3' : '#FF5252',
            shape: signalType === 'buy' ? 'arrowUp' : 'arrowDown',
            text: signalType === 'buy' ? 'شراء' : 'بيع'
        }
    ]);
    
    // تحديث الإشارة الحالية في واجهة المستخدم
    updateCurrentSignal(signalType, currentSymbol, signalPrice);
}

// الحصول على السعر الحالي
function getCurrentPrice(symbol) {
    if (activeAPI === 'pocket-option' && pocketOptionAPI && pocketOptionAPI.connected) {
        return pocketOptionAPI.getCurrentPrice(symbol);
    } else if (activeAPI === 'forex' && forexAPI && forexAPI.connected) {
        return forexAPI.getCurrentPrice(symbol);
    }
    
    // إرجاع سعر عشوائي إذا لم يكن متصلاً
    let basePrice;
    switch(symbol) {
        case 'EURUSD': basePrice = 1.1; break;
        case 'GBPUSD': basePrice = 1.3; break;
        case 'USDJPY': basePrice = 150; break;
        case 'BTCUSD': basePrice = 60000; break;
        case 'ETHUSD': basePrice = 3000; break;
        case 'XAUUSD': basePrice = 2000; break;
        case 'US30': basePrice = 38000; break;
        case 'SPX500': basePrice = 5200; break;
        case 'NASDAQ': basePrice = 16500; break;
        case 'XAGUSD': basePrice = 25; break;
        default: basePrice = 1.1;
    }
    
    // تحديد التقلب حسب نوع الأصل
    let volatility;
    if (symbol.includes('BTC') || symbol.includes('ETH')) {
        volatility = 0.02; // عملات رقمية
    } else if (symbol.includes('US30') || symbol.includes('SPX') || symbol.includes('NASDAQ')) {
        volatility = 0.01; // مؤشرات
    } else if (symbol.includes('XAU') || symbol.includes('XAG') || symbol.includes('OIL')) {
        volatility = 0.008; // سلع
    } else {
        volatility = 0.002; // فوركس
    }
    
    return basePrice * (1 + (Math.random() - 0.5) * volatility);
}

// توليد إشارة تداول بناءً على الاستراتيجية المحددة
function generateSignal(data) {
    // استخدام استراتيجية بسيطة للتوضيح
    // في التطبيق الحقيقي، يمكن استخدام خوارزميات أكثر تعقيدًا
    
    const lastCandle = data[data.length - 1];
    const prevCandle = data[data.length - 2];
    
    // استراتيجية بسيطة: إذا كان سعر الإغلاق أعلى من سعر الفتح، فهي إشارة شراء، وإلا فهي إشارة بيع
    if (lastCandle.close > prevCandle.close) {
        return 'buy';
    } else {
        return 'sell';
    }
}

// تحديث الإشارة الحالية في واجهة المستخدم
function updateCurrentSignal(signalType, symbol, price) {
    const currentSignalElement = document.querySelector('.current-signal');
    const signalBadge = currentSignalElement.querySelector('.signal-badge');
    const signalAsset = currentSignalElement.querySelector('.signal-asset');
    const signalTime = currentSignalElement.querySelector('.signal-time');
    const strengthBar = currentSignalElement.querySelector('.strength-bar');
    const strengthValue = currentSignalElement.querySelector('.strength-value');
    
    // تحديث نوع الإشارة (شراء أو بيع)
    signalBadge.className = 'signal-badge';
    signalBadge.classList.add(signalType);
    signalBadge.innerHTML = signalType === 'buy' ? 
        '<i class="fas fa-arrow-up"></i> شراء' : 
        '<i class="fas fa-arrow-down"></i> بيع';
    
    // تحديث تفاصيل الإشارة
    signalAsset.textContent = formatSymbol(symbol);
    
    // تحديث وقت الإشارة
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    signalTime.textContent = timeString;
    
    // تحديث قوة الإشارة (قيمة عشوائية للتوضيح)
    const strength = Math.floor(Math.random() * 30) + 70; // قيمة بين 70 و 100
    strengthBar.style.width = `${strength}%`;
    strengthValue.textContent = `${strength}%`;
}

// تنسيق رمز الزوج
function formatSymbol(symbol) {
    switch(symbol) {
        case 'EURUSD': return 'EUR/USD';
        case 'GBPUSD': return 'GBP/USD';
        case 'USDJPY': return 'USD/JPY';
        case 'BTCUSD': return 'BTC/USD';
        case 'ETHUSD': return 'ETH/USD';
        case 'XAUUSD': return 'XAU/USD (Gold)';
        default: return symbol;
    }
}

// تحديث حالة الأسواق
function updateMarketStatus() {
    const marketStatusContainer = document.getElementById('market-status-container');
    marketStatusContainer.innerHTML = '';
    
    // الحصول على بيانات الأسواق من API النشط إذا كان متصلاً
    if (activeAPI === 'pocket-option' && pocketOptionAPI && pocketOptionAPI.connected) {
        markets = pocketOptionAPI.getMarketStatus();
    } else if (activeAPI === 'forex' && forexAPI && forexAPI.connected) {
        markets = forexAPI.getMarketStatus();
    }
    
    for (const [key, market] of Object.entries(markets)) {
        const marketItem = document.createElement('div');
        marketItem.className = `market-item ${market.status}`;
        
        // إضافة وصف السوق إذا كان متاحًا
        const descriptionHtml = market.description ? `<span class="market-description">${market.description}</span>` : '';
        
        marketItem.innerHTML = `
            <span class="market-name">${market.name}</span>
            <span class="status">${market.status === 'open' ? 'مفتوح' : 'مغلق'}</span>
            ${descriptionHtml}
        `;
        marketStatusContainer.appendChild(marketItem);
    }
}

// تحديث الأخبار الاقتصادية
function updateEconomicNews() {
    const newsContainer = document.getElementById('news-container');
    newsContainer.innerHTML = '';
    
    // الحصول على بيانات الأخبار من API النشط إذا كان متصلاً
    if (activeAPI === 'pocket-option' && pocketOptionAPI && pocketOptionAPI.connected) {
        economicNews = pocketOptionAPI.getEconomicNews();
    } else if (activeAPI === 'forex' && forexAPI && forexAPI.connected) {
        economicNews = forexAPI.getEconomicNews();
    }
    
    for (const news of economicNews) {
        const newsItem = document.createElement('div');
        newsItem.className = `news-item ${news.impact}-impact`;
        newsItem.innerHTML = `
            <div class="news-time">${news.time}</div>
            <div class="news-content">
                <div class="news-title">${news.title}</div>
                <div class="news-impact">${getImpactText(news.impact)}</div>
            </div>
        `;
        newsContainer.appendChild(newsItem);
    }
}

// الحصول على نص تأثير الخبر
function getImpactText(impact) {
    switch(impact) {
        case 'high': return 'تأثير قوي';
        case 'medium': return 'تأثير متوسط';
        case 'low': return 'تأثير منخفض';
        default: return 'تأثير غير معروف';
    }
}

// تحديث جلسات التداول
function updateTradingSessions() {
    const sessionsContainer = document.getElementById('sessions-container');
    sessionsContainer.innerHTML = '';
    
    // الحصول على بيانات جلسات التداول من API النشط إذا كان متصلاً
    if (activeAPI === 'pocket-option' && pocketOptionAPI && pocketOptionAPI.connected) {
        tradingSessions = pocketOptionAPI.getActiveSessions();
    } else if (activeAPI === 'forex' && forexAPI && forexAPI.connected) {
        tradingSessions = forexAPI.getActiveSessions();
    }
    
    for (const session of tradingSessions) {
        const sessionItem = document.createElement('div');
        sessionItem.className = `session-item ${session.active ? 'active' : ''}`;
        sessionItem.innerHTML = `
            <span class="session-name">${session.name}</span>
            <span class="session-time">${session.timeRange}</span>
        `;
        sessionsContainer.appendChild(sessionItem);
    }
}

// تحديث سجل الإشارات
function updateSignalsHistory() {
    const historyContainer = document.querySelector('.signals-history');
    const historyItems = historyContainer.querySelectorAll('.history-item');
    
    // إزالة العناصر القديمة
    historyItems.forEach(item => item.remove());
    
    // إضافة العناصر الجديدة
    for (const signal of signalsHistory) {
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${signal.result}`;
        historyItem.innerHTML = `
            <div class="history-signal ${signal.type}">${signal.type === 'buy' ? 'شراء' : 'بيع'}</div>
            <div class="history-asset">${signal.asset}</div>
            <div class="history-time">${signal.time}</div>
            <div class="history-result">${signal.result === 'win' ? 'ربح' : 'خسارة'}</div>
        `;
        historyContainer.appendChild(historyItem);
    }
}

// إضافة إشارة جديدة إلى السجل
function addSignalToHistory(type, asset, result) {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // إضافة الإشارة الجديدة في بداية المصفوفة
    signalsHistory.unshift({
        type: type,
        asset: asset,
        time: timeString,
        result: result
    });
    
    // الاحتفاظ بآخر 10 إشارات فقط
    if (signalsHistory.length > 10) {
        signalsHistory.pop();
    }
    
    // تحديث واجهة المستخدم
    updateSignalsHistory();
}

// تم استبدال هذه الدالة بـ updateConnectionStatus
// لا حاجة لدالة updatePocketOptionStatus لأنها مكررة

// محاكاة تحديث الإشارات بشكل دوري
function simulateSignalUpdates() {
    setInterval(() => {
        // توليد إشارة جديدة
        const signalType = Math.random() > 0.5 ? 'buy' : 'sell';
        const symbols = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'BTC/USD'];
        const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        const result = Math.random() > 0.7 ? 'win' : 'loss';
        
        // إضافة الإشارة إلى السجل
        addSignalToHistory(signalType, randomSymbol, result);
        
        // تحديث الرسم البياني إذا كان الرمز المحدد هو نفسه
        if (formatSymbol(currentSymbol) === randomSymbol) {
            updateChartData();
        }
    }, 60000); // تحديث كل دقيقة
}

// محاكاة تحديث الأخبار الاقتصادية
function simulateNewsUpdates() {
    setInterval(() => {
        // تحديث وقت الأخبار
        economicNews.forEach(news => {
            const [hours, minutes] = news.time.split(':');
            let newsTime = new Date();
            newsTime.setHours(parseInt(hours));
            newsTime.setMinutes(parseInt(minutes));
            
            // إضافة دقيقة واحدة
            newsTime.setMinutes(newsTime.getMinutes() - 1);
            
            // تحديث الوقت
            news.time = `${newsTime.getHours().toString().padStart(2, '0')}:${newsTime.getMinutes().toString().padStart(2, '0')}`;
        });
        
        // تحديث واجهة المستخدم
        updateEconomicNews();
    }, 60000); // تحديث كل دقيقة
}

// محاكاة تحديث حالة الأسواق
function simulateMarketUpdates() {
    setInterval(() => {
        // تحديث حالة الأسواق بناءً على الوقت الحالي
        const now = new Date();
        const hour = now.getHours();
        
        // تحديث حالة سوق الأسهم الأمريكية
        if (hour >= 14 && hour < 21) { // 14:00 - 21:00 بتوقيت أوروبا
            markets.us_stocks.status = 'open';
        } else {
            markets.us_stocks.status = 'closed';
        }
        
        // تحديث واجهة المستخدم
        updateMarketStatus();
    }, 300000); // تحديث كل 5 دقائق
}

// محاكاة تحديث جلسات التداول
function simulateSessionUpdates() {
    setInterval(() => {
        // تحديث حالة الجلسات بناءً على الوقت الحالي
        const now = new Date();
        const hour = now.getHours();
        
        // جلسة آسيا: 00:00 - 09:00
        tradingSessions[0].active = (hour >= 0 && hour < 9);
        
        // جلسة أوروبا: 08:00 - 17:00
        tradingSessions[1].active = (hour >= 8 && hour < 17);
        
        // جلسة أمريكا: 13:00 - 22:00
        tradingSessions[2].active = (hour >= 13 && hour < 22);
        
        // تحديث واجهة المستخدم
        updateTradingSessions();
    }, 300000); // تحديث كل 5 دقائق
}

// تحديث قائمة الرموز
function updateSymbolSelect() {
    const symbolSelect = document.getElementById('symbol-select');
    
    // حفظ الرمز المحدد حاليًا
    const currentlySelected = symbolSelect.value;
    
    // مسح القائمة الحالية
    symbolSelect.innerHTML = '';
    
    // الحصول على قائمة الأصول من API النشط إذا كان متصلاً
    let assets = [];
    
    if (activeAPI === 'pocket-option' && pocketOptionAPI && pocketOptionAPI.connected) {
        assets = pocketOptionAPI.getAssets();
    } else if (activeAPI === 'forex' && forexAPI && forexAPI.connected) {
        assets = forexAPI.getAssets();
    } else {
        // استخدام قائمة افتراضية إذا لم يكن متصلاً
        if (activeAPI === 'pocket-option') {
            assets = [
                { symbol: 'EURUSD', name: 'EUR/USD', type: 'forex', profitPercent: 85 },
                { symbol: 'GBPUSD', name: 'GBP/USD', type: 'forex', profitPercent: 83 },
                { symbol: 'USDJPY', name: 'USD/JPY', type: 'forex', profitPercent: 82 },
                { symbol: 'BTCUSD', name: 'BTC/USD', type: 'crypto', profitPercent: 90 },
                { symbol: 'ETHUSD', name: 'ETH/USD', type: 'crypto', profitPercent: 88 },
                { symbol: 'XAUUSD', name: 'XAU/USD (Gold)', type: 'commodity', profitPercent: 87 }
            ];
        } else { // Forex API
            assets = [
                { symbol: 'EURUSD', name: 'EUR/USD', type: 'forex', profitPercent: 85, spread: 1.2 },
                { symbol: 'GBPUSD', name: 'GBP/USD', type: 'forex', profitPercent: 83, spread: 1.5 },
                { symbol: 'USDJPY', name: 'USD/JPY', type: 'forex', profitPercent: 82, spread: 1.3 },
                { symbol: 'AUDUSD', name: 'AUD/USD', type: 'forex', profitPercent: 84, spread: 1.4 },
                { symbol: 'USDCAD', name: 'USD/CAD', type: 'forex', profitPercent: 81, spread: 1.8 },
                { symbol: 'NZDUSD', name: 'NZD/USD', type: 'forex', profitPercent: 80, spread: 1.9 },
                { symbol: 'XAUUSD', name: 'XAU/USD (Gold)', type: 'commodity', profitPercent: 87, spread: 3.8 }
            ];
        }
    }
    
    // إضافة الخيارات إلى القائمة المنسدلة
    assets.forEach(asset => {
        const option = document.createElement('option');
        option.value = asset.symbol;
        option.textContent = `${asset.name} (${asset.profitPercent}%)`;
        option.dataset.profit = asset.profitPercent;
        option.dataset.type = asset.type;
        option.dataset.api = activeAPI; // إضافة معلومات عن API المصدر
        
        // إضافة معلومات السبريد لأصول الفوركس
        if (activeAPI === 'forex' && asset.spread) {
            option.dataset.spread = asset.spread;
        }
        
        symbolSelect.appendChild(option);
        
        // إعادة تحديد الرمز المحدد سابقًا
        if (asset.symbol === currentlySelected) {
            option.selected = true;
        }
    });
    
    // تحديث نسبة الربح في واجهة المستخدم
    updateProfitPercentage();
}

// تحديث نسبة الربح في واجهة المستخدم
function updateProfitPercentage() {
    const symbolSelect = document.getElementById('symbol-select');
    const selectedOption = symbolSelect.options[symbolSelect.selectedIndex];
    const profitPercent = selectedOption?.dataset.profit || 85;
    const symbolType = selectedOption?.dataset.type || 'forex';
    const apiSource = selectedOption?.dataset.api || activeAPI;
    
    // تحديث نسبة الربح في واجهة المستخدم
    const profitElement = document.querySelector('.profit-percentage');
    if (profitElement) {
        profitElement.textContent = `${profitPercent}%`;
    }
    
    // تحديث معلومات السبريد إذا كان متاحًا (خاص بـ Forex API)
    if (apiSource === 'forex' && forexAPI && forexAPI.connected) {
        const currentSymbol = selectedOption?.value;
        if (currentSymbol) {
            try {
                const spread = forexAPI.getSpread(currentSymbol);
                const spreadElement = document.querySelector('.signal-spread');
                if (!spreadElement) {
                    // إنشاء عنصر السبريد إذا لم يكن موجودًا
                    const signalDetails = document.querySelector('.signal-details');
                    const spreadDiv = document.createElement('div');
                    spreadDiv.className = 'signal-spread';
                    spreadDiv.innerHTML = `<i class="fas fa-exchange-alt"></i> السبريد: <span class="spread-value">${spread}</span> نقطة`;
                    signalDetails.appendChild(spreadDiv);
                } else {
                    // تحديث قيمة السبريد
                    const spreadValue = spreadElement.querySelector('.spread-value');
                    if (spreadValue) {
                        spreadValue.textContent = spread;
                    }
                }
            } catch (error) {
                console.error('Error getting spread:', error);
            }
        }
    } else {
        // إزالة عنصر السبريد إذا كان API غير Forex
        const spreadElement = document.querySelector('.signal-spread');
        if (spreadElement) {
            spreadElement.remove();
        }
    }
}

// إعداد أحداث النقر
function setupEventListeners() {
    // تغيير الرمز
    document.getElementById('symbol-select').addEventListener('change', (e) => {
        currentSymbol = e.target.value;
        updateChartData();
        addTechnicalIndicators();
        updateProfitPercentage();
    });
    
    // تغيير الإطار الزمني
    document.querySelectorAll('.timeframe-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // إزالة الفئة النشطة من جميع الأزرار
            document.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
            
            // إضافة الفئة النشطة إلى الزر المحدد
            btn.classList.add('active');
            
            // تحديث الإطار الزمني
            currentTimeframe = parseInt(btn.dataset.timeframe);
            
            // تحديث الرسم البياني
            updateChartData();
            addTechnicalIndicators();
        });
    });
    
    // تغيير نوع الإشارة
    document.getElementById('signal-type-select').addEventListener('change', (e) => {
        signalType = e.target.value;
    });
    
    // تغيير الاستراتيجية
    document.getElementById('strategy-select').addEventListener('change', (e) => {
        currentStrategy = e.target.value;
        updateChartData();
    });
    
    // زر تبديل API
    document.getElementById('api-toggle').addEventListener('click', () => {
        if (activeAPI === 'pocket-option') {
            activeAPI = 'forex';
            document.getElementById('api-type').textContent = 'Forex API';
            
            // قطع الاتصال بـ Pocket Option إذا كان متصلاً
            if (pocketOptionAPI && pocketOptionAPI.connected) {
                pocketOptionAPI.disconnect();
                updateConnectionStatus(false);
            }
            
            // الاتصال بـ Forex API إذا لم يكن متصلاً
            if (forexAPI && !forexAPI.connected) {
                const forexApiKey = '7d8f3e2a1c6b5940d2c7e8f9a3b1d5c0';
                forexAPI.connect(forexApiKey)
                    .then(() => {
                        updateConnectionStatus(true, { quality: forexAPI.connectionStatus?.connectionQuality || 'good' });
                    })
                    .catch(err => {
                        console.error('Failed to connect to Forex API:', err);
                        updateConnectionStatus(false);
                    });
            }
        } else {
            activeAPI = 'pocket-option';
            document.getElementById('api-type').textContent = 'Pocket Option API';
            
            // قطع الاتصال بـ Forex إذا كان متصلاً
            if (forexAPI && forexAPI.connected) {
                forexAPI.disconnect();
                updateConnectionStatus(false);
            }
            
            // الاتصال بـ Pocket Option إذا لم يكن متصلاً
            if (pocketOptionAPI && !pocketOptionAPI.connected) {
                const pocketOptionApiKey = '5c69b5827bb172a741bc236aad283efa';
                pocketOptionAPI.connect(pocketOptionApiKey)
                    .then(() => {
                        updateConnectionStatus(true, { quality: pocketOptionAPI.connectionStatus?.connectionQuality || 'good' });
                    })
                    .catch(err => {
                        console.error('Failed to connect to Pocket Option API:', err);
                        updateConnectionStatus(false);
                    });
            }
        }
        
        // تحديث قائمة الرموز والمخطط
        updateSymbolSelect();
        updateProfitPercentage();
        updateChartData();
    });
    
    // زر الاتصال/قطع الاتصال
    const toggleConnectionBtn = document.getElementById('toggle-connection');
    toggleConnectionBtn.addEventListener('click', () => {
        if (activeAPI === 'pocket-option') {
            if (pocketOptionAPI.connected) {
                // قطع الاتصال
                pocketOptionAPI.disconnect();
                toggleConnectionBtn.innerHTML = '<i class="fas fa-power-off"></i> إعادة الاتصال';
                toggleConnectionBtn.classList.add('connect');
            } else {
                // إعادة الاتصال
                // استخدام مفتاح API للتحقق من صحة الاتصال
                const apiKey = '5c69b5827bb172a741bc236aad283efa';
                pocketOptionAPI.connect(apiKey)
                    .then(() => {
                        toggleConnectionBtn.innerHTML = '<i class="fas fa-power-off"></i> قطع الاتصال';
                        toggleConnectionBtn.classList.remove('connect');
                    })
                    .catch(err => {
                        console.error('Failed to reconnect:', err);
                        alert('فشل إعادة الاتصال بـ API');
                    });
            }
        } else { // Forex API
            if (forexAPI.connected) {
                // قطع الاتصال
                forexAPI.disconnect();
                toggleConnectionBtn.innerHTML = '<i class="fas fa-power-off"></i> إعادة الاتصال';
                toggleConnectionBtn.classList.add('connect');
            } else {
                // إعادة الاتصال
                // استخدام مفتاح API للتحقق من صحة الاتصال
                const apiKey = '7d8f3e2a1c6b5940d2c7e8f9a3b1d5c0';
                forexAPI.connect(apiKey)
                    .then(() => {
                        toggleConnectionBtn.innerHTML = '<i class="fas fa-power-off"></i> قطع الاتصال';
                        toggleConnectionBtn.classList.remove('connect');
                    })
                    .catch(err => {
                        console.error('Failed to reconnect:', err);
                        alert('فشل إعادة الاتصال بـ API');
                    });
            }
        }
    });
}

// تهيئة التطبيق
function initApp() {
    // تهيئة كائنات API
    pocketOptionAPI = new PocketOptionAPI();
    forexAPI = new ForexAPI();
    
    // إعداد مستمعي أحداث API لـ Pocket Option
    pocketOptionAPI.on('connect', (data) => {
        if (activeAPI === 'pocket-option') {
            updateConnectionStatus(true, { quality: data?.quality || 'good' });
            
            // تحديث البيانات من API
            markets = pocketOptionAPI.getMarketStatus();
            economicNews = pocketOptionAPI.getEconomicNews();
            tradingSessions = pocketOptionAPI.getActiveSessions();
            
            // تحديث واجهة المستخدم
            updateMarketStatus();
            updateEconomicNews();
            updateTradingSessions();
            updateSymbolSelect();
            updateProfitPercentage();
        }
    });
    
    pocketOptionAPI.on('disconnect', (data) => {
        if (activeAPI === 'pocket-option') {
            updateConnectionStatus(false);
        }
    });
    
    // إعداد مستمعي أحداث API لـ Forex
    forexAPI.on('connect', (data) => {
        if (activeAPI === 'forex') {
            updateConnectionStatus(true, { quality: data?.quality || 'good' });
            
            // تحديث البيانات من API
            markets = forexAPI.getMarketStatus();
            economicNews = forexAPI.getEconomicNews();
            tradingSessions = forexAPI.getActiveSessions();
            
            // تحديث واجهة المستخدم
            updateMarketStatus();
            updateEconomicNews();
            updateTradingSessions();
            updateSymbolSelect();
            updateProfitPercentage();
        }
    });
    
    forexAPI.on('disconnect', (data) => {
        if (activeAPI === 'forex') {
            updateConnectionStatus(false);
        }
    });
    
    // تحديث حالة الأسواق
    updateMarketStatus();
    
    // تحديث الأخبار الاقتصادية
    updateEconomicNews();
    
    // تحديث جلسات التداول
    updateTradingSessions();
    
    // تحديث سجل الإشارات
    updateSignalsHistory();
    
    // إنشاء الرسم البياني
    createChart();
    
    // تحديث قائمة الرموز
    updateSymbolSelect();
    
    // إعداد أحداث النقر
    setupEventListeners();
    
    // بدء المحاكاة
    simulateSignalUpdates();
    simulateNewsUpdates();
    simulateMarketUpdates();
    simulateSessionUpdates();
}

// تشغيل التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initApp);