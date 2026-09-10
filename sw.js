const CACHE_NAME = 'stok-jalur-1112-v1';

// Daftar file yang akan di-cache untuk penggunaan offline
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://www.image2url.com/r2/default/files/1785642175342-6f1d4abc-728d-4f28-8c4a-3b499c8b88c5.png',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
];

// Instalasi Service Worker dan simpan aset ke cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// Aktivasi dan bersihkan cache versi lama jika ada pembaruan
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Tangkap permintaan jaringan
self.addEventListener('fetch', (event) => {
  // PENTING: Bypass script Google Apps Script (Backend Spreadsheet) agar selalu memanggil jaringan,
  // karena data ini dinamis dan tidak boleh di-cache secara statis.
  if (event.request.url.includes('script.google.com') || event.request.url.includes('script.googleusercontent.com')) {
    return; // Biarkan browser menangani request ini secara default
  }

  // Untuk aset statis (HTML, CSS, JS, Gambar), gunakan strategi Cache First, fall back to Network
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Cache miss - fetch dari jaringan
        return fetch(event.request).catch(() => {
            // Jika offline dan aset tidak ada di cache, bisa tambahkan fallback halaman offline di sini
            console.log('Offline: Resource not found in cache.');
        });
      })
  );
});
