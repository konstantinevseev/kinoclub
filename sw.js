// Service Worker для КиноКлуб by Bartilio
const CACHE_NAME = 'kinoklub-v13';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './app.js',
    './styles.css',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Установка Service Worker v13...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Кэширование файлов...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                console.log('[SW] Все файлы закэшированы');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Ошибка кэширования:', error);
            })
    );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
    console.log('[SW] Активация Service Worker v13...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[SW] Удаление старого кэша:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] Service Worker активирован');
                return self.clients.claim();
            })
    );
});

// Обработка запросов
self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);
    
    // Пропускаем API запросы к TMDB
    if (requestUrl.hostname.includes('themoviedb.org')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // Пропускаем запросы к Google Fonts
    if (requestUrl.hostname.includes('googleapis.com') || 
        requestUrl.hostname.includes('gstatic.com')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // Для навигационных запросов всегда возвращаем index.html
    if (event.request.mode === 'navigate') {
        event.respondWith(
            caches.match('./index.html')
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        // Обновляем кэш в фоне
                        fetch('./index.html')
                            .then((response) => {
                                if (response.ok) {
                                    caches.open(CACHE_NAME)
                                        .then((cache) => cache.put('./index.html', response));
                                }
                            })
                            .catch(() => {});
                        return cachedResponse;
                    }
                    return fetch(event.request);
                })
                .catch(() => caches.match('./index.html'))
        );
        return;
    }

    // Для остальных запросов - cache first, then network
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request)
                    .then((response) => {
                        // Не кэшируем неуспешные ответы
                        if (!response || response.status !== 200) {
                            return response;
                        }

                        // Кэшируем новые файлы
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    });
            })
    );
});
