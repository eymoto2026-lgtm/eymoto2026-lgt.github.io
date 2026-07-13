// ============================================================
// SERVICE WORKER - EYMOTO MENSAJERO
// ============================================================

const CACHE_NAME = 'eymoto-mensajero-v3';

// 🔑 TU CLAVE PÚBLICA VAPID
const PUBLIC_VAPID_KEY = 'BBEttrPXOd_g48FOmoUSZXhIZSvjQcMtS3v-brxC9EY2RK1x231ta93eFh5l9s3xjXnSwNUawfmyCdWg4haTSUU';

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll([
                '/mensajero.html',
                '/'
            ]);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(name) {
                    return name !== CACHE_NAME;
                }).map(function(name) {
                    return caches.delete(name);
                })
            );
        })
    );
    return self.clients.claim();
});

self.addEventListener('push', function(event) {
    console.log('📢 Push recibido en Service Worker');
    
    let data = {};
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data = {
                title: '📦 Nuevo pedido disponible',
                body: '¡Un pedido está esperando por ti!'
            };
        }
    }
    
    const title = data.title || '📦 Nuevo pedido disponible';
    const options = {
        body: data.body || '¡Un pedido está esperando por ti!',
        icon: data.icon || 'https://eymoto2026-lgtm.github.io/eymoto2026-lgt.github.io/icono.png',
        badge: data.badge || 'https://eymoto2026-lgtm.github.io/eymoto2026-lgt.github.io/badge.png',
        vibrate: [300, 100, 300, 100, 400],
        tag: data.tag || 'nuevo-pedido',
        renotify: true,
        requireInteraction: true,
        data: {
            url: '/mensajero.html',
            pedidoId: data.pedidoId || null,
            tiendaId: data.tiendaId || null
        },
        actions: [
            { action: 'abrir', title: '📦 Ver pedido' },
            { action: 'cerrar', title: 'Cerrar' }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    console.log('🔘 Clic en notificación');
    event.notification.close();
    
    if (event.action === 'abrir' || !event.action) {
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then(function(clientList) {
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url.includes('mensajero') && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow('/mensajero.html');
                }
            })
        );
    }
});

console.log('✅ Service Worker EyMoto cargado');
