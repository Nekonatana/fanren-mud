/* ============================================================
 * 凡人修仙传MUD - Capacitor 原生桥接层
 * 当运行在 Capacitor 原生APP中时自动激活原生功能
 * 在纯浏览器/PWA模式下自动降级为Web实现
 * ============================================================ */

const NativeBridge = {
  // 检测是否在Capacitor原生环境中
  isNative: false,
  platform: 'web',
  plugins: {},

  async init() {
    try {
      // 动态检测Capacitor（不报错）
      if (typeof window !== 'undefined' && window.Capacitor) {
        const cap = window.Capacitor;
        this.isNative = cap.isNativePlatform();
        this.platform = cap.getPlatform();

        if (this.isNative) {
          await this.loadPlugins();
          this.setupNativeHandlers();
        }
      }
    } catch (e) {
      // 静默降级到Web模式
    }

    // PWA模式下的触摸反馈（振动）
    this.setupWebHaptics();
  },

  async loadPlugins() {
    try {
      // Capacitor 6 插件通过 registerPlugin 获取
      const cap = window.Capacitor;
      if (cap.registerPlugin) {
        this.plugins.haptics = cap.registerPlugin('Haptics');
        this.plugins.statusBar = cap.registerPlugin('StatusBar');
        this.plugins.app = cap.registerPlugin('App');
        this.plugins.keyboard = cap.registerPlugin('Keyboard');
        this.plugins.network = cap.registerPlugin('Network');
        this.plugins.splashScreen = cap.registerPlugin('SplashScreen');
        this.plugins.preferences = cap.registerPlugin('Preferences');
      }
    } catch (e) {}
  },

  async setupNativeHandlers() {
    // 配置状态栏
    try {
      if (this.plugins.statusBar) {
        await this.plugins.statusBar.setStyle({ style: 'DARK' });
        await this.plugins.statusBar.setBackgroundColor({ color: '#0a0e14' });
      }
    } catch (e) {}

    // 隐藏启动画面
    try {
      if (this.plugins.splashScreen) {
        await this.plugins.splashScreen.hide();
      }
    } catch (e) {}

    // Android 返回键处理
    try {
      if (this.plugins.app) {
        this.plugins.app.addListener('backButton', (data) => {
          // 如果有模态弹窗打开，先关闭弹窗
          var modal = document.getElementById('modal-overlay');
          if (modal && modal.style.display !== 'none') {
            if (typeof UI !== 'undefined' && UI.closeModal) {
              UI.closeModal();
            } else {
              modal.style.display = 'none';
            }
            return;
          }
          // 如果在标题画面，退出APP
          var titleScreen = document.getElementById('title-screen');
          if (titleScreen && titleScreen.style.display !== 'none') {
            this.plugins.app.exitApp();
            return;
          }
          // 否则询问是否退出
          if (confirm('确认退出游戏？')) {
            this.plugins.app.exitApp();
          }
        });
      }
    } catch (e) {}

    // 网络状态监听
    try {
      if (this.plugins.network) {
        this.plugins.network.addEventListener('networkStatusChange', (status) => {
          if (!status.connected) {
            if (typeof showToast === 'function') {
              showToast('网络已断开，游戏可离线继续', 'warn');
            }
          }
        });
      }
    } catch (e) {}

    // 键盘事件（iOS）
    try {
      if (this.plugins.keyboard) {
        this.plugins.keyboard.addEventListener('keyboardWillShow', function() {
          document.body.classList.add('keyboard-open');
        });
        this.plugins.keyboard.addEventListener('keyboardWillHide', function() {
          document.body.classList.remove('keyboard-open');
        });
      }
    } catch (e) {}
  },

  // ===== 触觉反馈 =====
  haptic(type) {
    type = type || 'light';
    if (this.isNative && this.plugins.haptics) {
      try {
        var styleMap = { light: 'LIGHT', medium: 'MEDIUM', heavy: 'HEAVY' };
        this.plugins.haptics.impact({ style: styleMap[type] || 'LIGHT' });
      } catch (e) {}
    } else if (navigator.vibrate) {
      // Web Vibration API 降级
      var durations = { light: 8, medium: 15, heavy: 25 };
      navigator.vibrate(durations[type] || 8);
    }
  },

  // 成功反馈
  hapticSuccess() {
    if (this.isNative && this.plugins.haptics) {
      try {
        this.plugins.haptics.notification({ type: 'SUCCESS' });
      } catch (e) {}
    } else if (navigator.vibrate) {
      navigator.vibrate([10, 30, 10]);
    }
  },

  // 警告反馈
  hapticWarning() {
    if (this.isNative && this.plugins.haptics) {
      try {
        this.plugins.haptics.notification({ type: 'WARNING' });
      } catch (e) {}
    } else if (navigator.vibrate) {
      navigator.vibrate([15, 50, 15]);
    }
  },

  // 错误反馈
  hapticError() {
    if (this.isNative && this.plugins.haptics) {
      try {
        this.plugins.haptics.notification({ type: 'ERROR' });
      } catch (e) {}
    } else if (navigator.vibrate) {
      navigator.vibrate([20, 40, 20, 40, 20]);
    }
  },

  // ===== 存储（使用Preferences替代localStorage，原生APP中更稳定）=====
  async getItem(key) {
    if (this.isNative && this.plugins.preferences) {
      try {
        var result = await this.plugins.preferences.get({ key: key });
        return result.value;
      } catch (e) {
        return localStorage.getItem(key);
      }
    }
    return localStorage.getItem(key);
  },

  async setItem(key, value) {
    if (this.isNative && this.plugins.preferences) {
      try {
        await this.plugins.preferences.set({ key: key, value: value });
        return;
      } catch (e) {
        localStorage.setItem(key, value);
      }
    } else {
      localStorage.setItem(key, value);
    }
  },

  async removeItem(key) {
    if (this.isNative && this.plugins.preferences) {
      try {
        await this.plugins.preferences.remove({ key: key });
        return;
      } catch (e) {
        localStorage.removeItem(key);
      }
    } else {
      localStorage.removeItem(key);
    }
  },

  // ===== Web模式下的触摸振动反馈 =====
  setupWebHaptics() {
    // 为所有按钮添加轻量振动反馈
    document.addEventListener('click', (e) => {
      var target = e.target;
      if (target && target.matches && target.matches('button, .choice-btn, .btn-menu, .btn-bottom, .btn-combat, .btn-title, .mtab')) {
        this.haptic('light');
      }
    }, { passive: true });
  },

  // ===== 获取平台信息 =====
  getInfo() {
    return {
      isNative: this.isNative,
      platform: this.platform,
      isIOS: this.platform === 'ios',
      isAndroid: this.platform === 'android',
      isWeb: this.platform === 'web',
    };
  }
};

// 自动初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() { NativeBridge.init(); });
} else {
  NativeBridge.init();
}

// 导出全局
window.NativeBridge = NativeBridge;
