// Para publicar una actualizacion: cambia este numero (V) y sube los archivos a GitHub.
const V='9',C='pastillas-v'+V,F=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png','config.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>Promise.all(F.map(u=>fetch(u+'?v='+V,{cache:'reload'}).then(r=>{if(!r.ok)throw new Error(u);return c.put(u,r)}).catch(x=>{if(u!=='config.js')throw x}))))));
self.addEventListener('message',e=>{if(e.data==='SKIP_WAITING')self.skipWaiting();if(e.data==='VER'&&e.source)e.source.postMessage({v:V})});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!=='pastillas-data').map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l)if('focus'in c)return c.focus();return clients.openWindow('./')}))});
// Aviso push: el servidor solo manda un "toque"; los nombres de las pastillas se leen aqui, del propio movil.
self.addEventListener('push',e=>e.waitUntil((async()=>{
let D=null;try{const c=await caches.open('pastillas-data'),r=await c.match('data');D=r&&await r.json()}catch(_){}
let an=null; // aviso de "hay version nueva" (solo si el servidor anuncia una version mayor que esta y no se ha mostrado ya)
if(D&&D.url){try{const N=await(await fetch(D.url+'/news',{cache:'no-store'})).json(),c=await caches.open('pastillas-data'),sn=await c.match('seen');
if(N.ver>+V&&String(N.id)!==(sn?await sn.text():'')){an=N;await c.put('seen',new Response(String(N.id)))}}catch(_){}
self.registration.update().catch(()=>{})}
const n=new Date(),m=n.getHours()*60+n.getMinutes(),pd=x=>String(x).padStart(2,'0'),dk=n.getFullYear()+'-'+pd(n.getMonth()+1)+'-'+pd(n.getDate());
let all=[],due=[];
if(D&&D.meds){const dn=D.day===dk?D.done:[];all=D.meds.filter(x=>x.d.includes((n.getDay()+6)%7)).filter(x=>{const[h,mi]=(x.t||D.times[x.s]).split(':');return Math.abs(+h*60+ +mi-m)<=3});due=all.filter(x=>!dn.includes(x.id))}
const o={icon:'icon-192.png',badge:'icon-192.png',vibrate:[400,200,400,200,400],tag:'pastillas',renotify:true,requireInteraction:true};
if(an)await self.registration.showNotification('Nueva versión de Mis Pastillas',{icon:'icon-192.png',badge:'icon-192.png',vibrate:[200,100,200],tag:'novedad',body:(an.text||'Hay una versión nueva.')+' Ábrela para actualizar.'});
if(due.length)await self.registration.showNotification('Hora de tus pastillas',{...o,body:due.map(x=>x.n).join(', ')});
else if(!an){if(all.length){await self.registration.showNotification('Pastillas al día',{...o,silent:true,requireInteraction:false,body:'Ya las marcaste como tomadas.'});(await self.registration.getNotifications({tag:'pastillas'})).forEach(x=>x.close())}
else await self.registration.showNotification('Recordatorio de Mis Pastillas',{...o,body:'Es hora de tomar tu pastilla.'})}
})()));
