// 缓存名称
const CACHE_NAME = 'math-practice-v1';
// 需要缓存的文件列表
const FILES_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icons/manifest-icon-192.maskable.png',
  './icons/manifest-icon-512.maskable.png'
];

// 安装Service Worker
self.addEventListener('install', event => {
  console.log('[Service Worker] 安装中...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] 缓存应用文件');
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => {
        console.log('[Service Worker] 跳过等待，立即激活');
        return self.skipWaiting();
      })
  );
});

// 激活Service Worker
self.addEventListener('activate', event => {
  console.log('[Service Worker] 激活中...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] 删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('[Service Worker] 已控制所有客户端');
      return self.clients.claim();
    })
  );
});

// 拦截网络请求
self.addEventListener('fetch', event => {
  // 跳过非GET请求
  if (event.request.method !== 'GET') return;
  
  // 跳过Chrome扩展请求
  if (event.request.url.indexOf('chrome-extension') > -1) return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果在缓存中找到，返回缓存
        if (response) {
          console.log('[Service Worker] 从缓存提供:', event.request.url);
          return response;
        }
        
        // 否则从网络获取
        console.log('[Service Worker] 从网络获取:', event.request.url);
        return fetch(event.request)
          .then(response => {
            // 检查是否有效响应
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 克隆响应以缓存
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            console.error('[Service Worker] 获取失败:', error);
            // 可以在这里返回一个离线页面
            return new Response('网络连接失败，请检查网络设置', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// 处理后台同步（如果需要）
self.addEventListener('sync', event => {
  console.log('[Service Worker] 后台同步:', event.tag);
});

// 处理推送通知（如果需要）
self.addEventListener('push', event => {
  console.log('[Service Worker] 推送通知:', event);
  
  const title = '四则运算练习';
  const options = {
    body: '新的练习等待挑战！',
    icon: './icons/manifest-icon-192.maskable.png',    // ✅ 已修改的图标路径
    badge: './icons/manifest-icon-192.maskable.png'   // ✅ 已修改的图标路径
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 处理通知点击
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] 通知被点击');
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(clientList => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});