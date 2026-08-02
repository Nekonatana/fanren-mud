/* ============================================================
 * 凡人修仙传MUD - Service Worker v4
 * 离线缓存 + 自动更新 + 版本管理
 * ============================================================ */

const CACHE_VERSION = 'fanren-mud-v14-20260803-pwa9';
const CACHE_NAME = `${CACHE_VERSION}-${self.location.hostname}`;
const OFFLINE_URL = './index.html';
const APP_VERSION = 'v14.20260803.pwa9';

// 核心资源（安装时缓存）- version.json 不缓存，确保版本检测始终获取最新
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/data.js',
  './js/worlddata.js',
  './js/story.js',
  './js/worldmodel.js',
  './js/social.js',
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
        // 新SW已激活并控制所有客户端，发送UPDATE_READY通知客户端重载
        self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'UPDATE_READY', version: APP_VERSION });
          });
        });
      })
  );
});

// ============================================================
// 请求拦截：策略化缓存
// ============================================================
self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) {
    return;
  }

  // SW脚本本身 → 网络优先（确保浏览器能检测到SW更新）
  if (req.url.indexOf('sw.js') !== -1) {
    event.respondWith(
      fetch(req, { cache: 'no-cache' })
        .then((resp) => {
          return resp;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // 版本检测文件 → 网络优先（始终获取最新）
  if (req.url.indexOf('version.json') !== -1) {
    event.respondWith(
      fetch(req, { cache: 'no-cache' })
        .then((resp) => {
          const respClone = resp.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, respClone));
          return resp;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // 导航请求 → 网络优先（始终拉取最新HTML）
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((resp) => {
          if (resp && resp.status === 200) {
            const respClone = resp.clone();
            caches.open(CACHE_NAME).then((c) => c.put('./index.html', respClone));
          }
          return resp;
        })
        .catch(() => caches.match('./index.html').then((cached) => {
          return cached || caches.match('./');
        }))
    );
    return;
  }

  // 静态资源 → stale-while-revalidate
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

  // 强制更新：清除所有缓存，通知客户端重载
  // 关键修复：旧SW不直接发送FORCE_RELOAD，而是等待新SW激活后发送UPDATE_READY
  if (event.data === 'FORCE_UPDATE') {
    // Step 1: 清除所有旧缓存
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => {
      // Step 2: 检查是否有新SW正在等待激活
      const reg = self.registration;
      if (reg && reg.waiting) {
        // 有新SW在等待，通知它立即激活
        self.skipWaiting();
        // 新SW的activate事件会发送UPDATE_READY给客户端
      } else {
        // 没有新SW，直接通知客户端重载
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => client.postMessage({ type: 'FORCE_RELOAD' }));
        });
      }
    });
  }
});