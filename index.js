class UserActivityMonitor {
    constructor(options = {}) {
        // 配置项
        this.options = {
            inactiveThreshold: options.inactiveThreshold || 60000, // 默认60秒无操作视为不活跃
            storageKey: options.storageKey || 'user_activity_data',
            sendInterval: options.sendInterval || 30000, // 数据发送间隔，默认30秒
            endpoint: options.endpoint || '/api/activity-log',
            ipEndpoint: options.ipEndpoint || 'https://api.ipify.org?format=json', // IP获取接口
            noActivityThreshold: options.noActivityThreshold || 10000 // 默认10秒无操作视为不活跃
        };

        // 状态变量
        this.isActive = true;                    // 用户是否活跃
        this.isWindowFocused = true;             // 窗口是否聚焦
        this.hasRecentInteraction = true;        // 是否有最近的交互
        this.lastActivityTime = Date.now();      // 上次活动时间
        this.lastInteractionTime = Date.now();   // 上次交互时间
        this.activeTime = 0;                     // 活跃时间累计
        this.sessionStartTime = Date.now();
        this.loginTime = new Date().toISOString();
        this.sessionId = this._generateUUID();
        this.userInfo = null;

        // 初始化
        this._init();
    }

    async _init() {
        // 获取用户信息
        await this._getUserInfo();

        // 添加事件监听器
        this._setupEventListeners();
        
        // 启动活跃度检查
        this._startActivityCheck();

        // 定期保存数据
        this._startDataSync();
    }

    async _getUserInfo() {
        try {
            // 获取IP地址
            const ipResponse = await fetch(this.options.ipEndpoint);
            const ipData = await ipResponse.json();
            const userIP = ipData.ip;

            // 收集设备信息
            const deviceInfo = this._getDeviceInfo();

            // 合并所有信息
            this.userInfo = {
                sessionId: this.sessionId,
                loginTime: this.loginTime,
                id: userIP,
                ip: userIP,
                ...deviceInfo,
                timestamp: Date.now()
            };

            console.log('User info collected:', this.userInfo);
        } catch (error) {
            console.error('Error getting user info:', error);
            // 如果获取IP失败，使用备用ID
            this.userInfo = {
                sessionId: this.sessionId,
                loginTime: this.loginTime,
                id: 'unknown_' + Date.now(),
                ...this._getDeviceInfo(),
                timestamp: Date.now()
            };
        }
    }

    _getDeviceInfo() {
        const ua = navigator.userAgent;
        const deviceInfo = {
            // 操作系统
            os: this._getOS(ua),
            // 操作系统版本
            osVersion: this._getOSVersion(ua),
            // 浏览器
            browser: this._getBrowser(ua),
            // 浏览器版本
            browserVersion: this._getBrowserVersion(ua),
            // 设备类型
            deviceType: this._getDeviceType(ua),
            // 设备型号
            deviceModel: this._getDeviceModel(ua),
            // 屏幕信息
            screen: {
                width: window.screen.width,
                height: window.screen.height,
                colorDepth: window.screen.colorDepth,
                pixelRatio: window.devicePixelRatio || 1
            },
            // 浏览器窗口信息
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            // 硬件信息
            hardware: {
                cores: navigator.hardwareConcurrency || 'unknown',
                memory: navigator.deviceMemory ? navigator.deviceMemory + 'GB' : 'unknown',
                platform: navigator.platform
            },
            // 语言设置
            language: navigator.language || navigator.userLanguage,
            // 时区
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        return deviceInfo;
    }

    _getOS(ua) {
        if (ua.includes('Windows')) return 'Windows';
        if (ua.includes('Mac')) return 'MacOS';
        if (ua.includes('Linux')) return 'Linux';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
        return 'Unknown';
    }

    _getOSVersion(ua) {
        let version = 'Unknown';
        if (ua.includes('Windows')) {
            version = ua.match(/Windows NT (\d+\.\d+)/) ? ua.match(/Windows NT (\d+\.\d+)/)[1] : 'Unknown';
        } else if (ua.includes('Mac')) {
            version = ua.match(/Mac OS X (\d+[._]\d+[._]\d+)/) ? ua.match(/Mac OS X (\d+[._]\d+[._]\d+)/)[1].replace(/_/g, '.') : 'Unknown';
        } else if (ua.includes('Android')) {
            version = ua.match(/Android (\d+\.\d+)/) ? ua.match(/Android (\d+\.\d+)/)[1] : 'Unknown';
        } else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) {
            version = ua.match(/OS (\d+_\d+)/) ? ua.match(/OS (\d+_\d+)/)[1].replace(/_/g, '.') : 'Unknown';
        }
        return version;
    }

    _getBrowser(ua) {
        if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
        if (ua.includes('Edg')) return 'Edge';
        if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
        return 'Unknown';
    }

    _getBrowserVersion(ua) {
        let version = 'Unknown';
        if (ua.includes('Chrome') && !ua.includes('Edg')) {
            version = ua.match(/Chrome\/(\d+\.\d+)/) ? ua.match(/Chrome\/(\d+\.\d+)/)[1] : 'Unknown';
        } else if (ua.includes('Firefox')) {
            version = ua.match(/Firefox\/(\d+\.\d+)/) ? ua.match(/Firefox\/(\d+\.\d+)/)[1] : 'Unknown';
        } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
            version = ua.match(/Version\/(\d+\.\d+)/) ? ua.match(/Version\/(\d+\.\d+)/)[1] : 'Unknown';
        } else if (ua.includes('Edg')) {
            version = ua.match(/Edg\/(\d+\.\d+)/) ? ua.match(/Edg\/(\d+\.\d+)/)[1] : 'Unknown';
        }
        return version;
    }

    _getDeviceType(ua) {
        if (ua.includes('Mobile')) return 'Mobile';
        if (ua.includes('Tablet')) return 'Tablet';
        return 'Desktop';
    }

    _getDeviceModel(ua) {
        let model = 'Unknown';
        if (ua.includes('iPhone')) {
            model = 'iPhone';
        } else if (ua.includes('iPad')) {
            model = 'iPad';
        } else if (ua.includes('Android')) {
            // 尝试获取Android设备型号
            const match = ua.match(/\(Linux;.*?;\s([^)]+)\)/);
            if (match) {
                model = match[1].split(';').pop().trim();
            }
        }
        return model;
    }

    _setupEventListeners() {
        // 使用事件委托和节流来优化性能
        const activityEvents = [
            'mousedown', 'mousemove', 'keydown', 
            'scroll', 'touchstart', 'click'
        ];

        const throttledHandler = this._throttle(this._handleActivity.bind(this), 1000);
        activityEvents.forEach(event => {
            document.addEventListener(event, throttledHandler, { passive: true });
        });

        // 页面可见性变化监听
        document.addEventListener('visibilitychange', this._handleVisibilityChange.bind(this));
        window.addEventListener('focus', this._handleWindowFocus.bind(this));
        window.addEventListener('blur', this._handleWindowBlur.bind(this));

        // 页面关闭时保存数据
        window.addEventListener('beforeunload', () => this._saveData());
    }

    _throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    _handleActivity() {
        const now = Date.now();
        this.lastInteractionTime = now;
        this.hasRecentInteraction = true;
    }

    _handleVisibilityChange() {
        this.isWindowFocused = !document.hidden;
    }

    _handleWindowFocus() {
        this.isWindowFocused = true;
    }

    _handleWindowBlur() {
        this.isWindowFocused = false;
    }

    _startActivityCheck() {
        this.activityCheckInterval = setInterval(() => {
            const now = Date.now();
            const timeSinceLastInteraction = now - this.lastInteractionTime;
            
            // 使用配置的阈值检查是否超过无操作时间
            if (timeSinceLastInteraction > this.options.noActivityThreshold) {
                this.hasRecentInteraction = false;
            }
            
            this._updateActiveTime();
        }, 1000); // 每秒检查一次
    }

    _updateActiveTime() {
        const now = Date.now();
        // 只有在窗口聚焦且有最近交互时才累加时间
        if (this.isWindowFocused && this.hasRecentInteraction) {
            this.activeTime += now - this.lastActivityTime;
        }
        this.lastActivityTime = now;
    }

    // 修改数据保存方法，加入更多信息
    _saveData() {
        this._updateActiveTime();
        
        const activityData = {
            ...this.userInfo,
            sessionId: this.sessionId,
            loginTime: this.loginTime,
            activeTime: this.activeTime,
            isWindowFocused: this.isWindowFocused,
            hasRecentInteraction: this.hasRecentInteraction,
            timestamp: Date.now()
        };

        // 发送到服务器
        this._sendToServer(activityData);
    }

    async _sendToServer(data) {
        try {
            const response = await fetch(this.options.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            console.log('活动数据发送成功');
        } catch (error) {
            console.error('发送活动数据时出错:', error);
        }
    }

    // 提供公共方法获取用户信息
    getUserInfo() {
        return {
            ...this.userInfo,
            activeTime: this.activeTime,
            isActive: this.isActive,
            isWindowFocused: this.isWindowFocused
        };
    }

    // 提供公共方法获取活跃时间
    getActiveTime() {
        return Math.floor(this.activeTime / 1000); // 转换为秒
    }

    _startDataSync() {
        setInterval(() => {
            this._saveData();
        }, this.options.sendInterval);
    }

    _generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

// 使用示例：
/*
const activityMonitor = new UserActivityMonitor({
    inactiveThreshold: 300000, // 5分钟无操作视为不活跃
    sendInterval: 60000, // 每分钟同步一次数据
    endpoint: 'https://your-api-endpoint/activity-log',
    ipEndpoint: 'https://api.ipify.org?format=json' // 可选，自定义IP获取接口
});

// 获取用户信息
console.log(activityMonitor.getUserInfo());

// 获取活跃时间（秒）
console.log('Active time:', activityMonitor.getActiveTime());
*/