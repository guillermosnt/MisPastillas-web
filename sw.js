const V='3',C='pastillas-v'+V,F=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>Promise.all(F.map(u=>fetch(u+'?v='+V,{cache:'reload'}).then(r=>{if(!r.ok)throw new Error(u);return c.put(u,r)}))))));
self.addEventListener('message',e=>{if(e.data==='SKIP_WAITING')self.skipWaiting();if(e.data==='VER'&&e.source)e.source.postMessage({v:V})});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l)if('focus'in c)return c.focus();return clients.openWindow('./')}))});
