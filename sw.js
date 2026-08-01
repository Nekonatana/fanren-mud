/* ============================================================
 * 凡人修仙传MUD - Service Worker v3
 * 离线缓存 + 自动更新 + 版本管理
 * ============================================================ */

const CACHE_VERSION = 'fanren-mud-v14-pwa';
const CACHE_NAME = `${CACHE_VERSION}-${self.location.hostname}`;
const OFFLINE_URL = './index.html';
const APP_VERSION = 'v14.20260731-pwa2';

// 核心资源（安装时缓存）
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './version.json',
  './css/style.css',
  './js/data.js',
  './js/worlddata.js',
  './js/story.js',
  './js/engine.js',
  './js/worldengine.js',
  './js/worldexpand_data.js',
  './js/worldexpand.js',
  './js/worldexpand2_data.js',
  './js/worldexpand2.js',
  './js/worldexpand3.js',
  './js/worldexpand4_data.js',
  './js/worldexpand4.js',
  './js/worldexpand5_data.js',
  './js/worldexpand5.js',
  './js/worldexpand6_data.js',
  './js/worldexpand6.js',
  './js/worldexpand7_data.js',
  './js/worldexpand7.js',
  './js/worldexpand8_data.js',
  './js/worldexpand8.js',
  './js/native-bridge.js',
  './js/main.js',
  './img/icon-192.png',
  './img/icon-512.png',
  './img/icon-192-maskable.png',
  './img/icon-512-maskable.png',
  './img/icon.svg'
];

// ============================================================
// 安装：预缓存核心资源
// ============================================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

// ============================================================
// 激活：清理旧缓存 + 通知客户端
// ============================================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        );
      })
      .then(() => self.clients.claim())
      .then(() => {
        // 通知所有客户端：SW已激活，可能是新版本
        self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'SW_ACTIVATED', version: APP_VERSION });
          });
        });
      })
  );
});

// ============================================================
// 请求拦截：缓存优先 + 网络更新（stale-while-revalidate）
// ============================================================
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // 只处理同源 GET 请求
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) {
    return;
  }

  // 导航请求 → 缓存优先，后台检查更新
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then((cached) => {
        const fetchPromise = fetch(req)
          .then((resp) => {
            const respClone = resp.clone();
            caches.open(CACHE_NAME).then((c) => c.put('./index.html', respClone));
            return resp;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // 静态资源 → stale-while-revalidate 策略
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((resp) => {
          if (resp && resp.status === 200 && resp.type === 'basic') {
            const respClone = resp.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, respClone));
          }
          return resp;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

// ============================================================
// 消息通信：处理来自客户端的命令
// ============================================================
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // 手动检查更新 - 通过 version.json 检查远程版本
  if (event.data === 'CHECK_UPDATE') {
    self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: 'UPDATE_CHECKING' });
      });
    });
    // 优先检查 version.json（轻量、快速、可靠）
    fetch('./version.json', { cache: 'no-cache' })
      .then((resp) => resp.json())
      .then((data) => {
        const latestVersion = data.version || null;
        const changelog = data.changelog || '';
        self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'UPDATE_RESULT',
              currentVersion: APP_VERSION,
              latestVersion: latestVersion,
              changelog: changelog,
              hasUpdate: latestVersion && latestVersion !== APP_VERSION
            });
          });
        });
      })
      .catch(() => {
        // 回退：检查 index.html 中的版本标记
        fetch('./index.html', { cache: 'no-cache' })
          .then((resp) => resp.text())
          .then((html) => {
            const match = html.match(/data-app-version="([^"]+)"/);
            const latestVersion = match ? match[1] : null;
            self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
              clients.forEach((client) => {
                client.postMessage({
                  type: 'UPDATE_RESULT',
                  currentVersion: APP_VERSION,
                  latestVersion: latestVersion,
                  hasUpdate: latestVersion && latestVersion !== APP_VERSION
                });
              });
            });
          })
          .catch(() => {
            self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
              clients.forEach((client) => {
                client.postMessage({ type: 'UPDATE_RESULT', error: true });
              });
            });
          });
      });
  }

  // 强制更新：清除所有缓存并重新加载
  if (event.data === 'FORCE_UPDATE') {
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => {
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => client.postMessage({ type: 'FORCE_RELOAD' }));
      });
    });
  }
});
