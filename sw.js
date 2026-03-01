// Service Worker для КиноКлуб by Bartilio
const CACHE_NAME = 'kinoklub-v12';
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
    console.log('[SW] Установка Service Worker...');
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
    console.log('[SW] Активация Service Worker...');
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
    // Пропускаем API запросы к TMDB
    if (event.request.url.includes('api.themoviedb.org')) {
        return;
    }

    // Пропускаем запросы к Google Fonts
    if (event.request.url.includes('fonts.googleapis.com') || 
        event.request.url.includes('fonts.gstatic.com')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request)
                    .then((response) => {
                        // Не кэшируем неуспешные ответы
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Кэшируем новые файлы
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Возвращаем главную страницу для навигационных запросов
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                    });
            })
    );
});
