const CACHE_NAME = "theos-laundry-v2";
const FILES_TO_CACHE = [
    "/theos-laundry/",
    "/theos-laundry/index.html",
    "/theos-laundry/style.css",
    "/theos-laundry/script.js",
    "/theos-laundry/manifest.json",
    "/theos-laundry/icons/icon-192.png",
    "/theos-laundry/icons/icon-512.png"
];
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(FILES_TO_CACHE);
            })
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
});
