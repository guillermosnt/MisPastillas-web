// Para publicar una actualizacion: cambia este numero (V) y sube los archivos a GitHub.
const V='6',C='pastillas-v'+V,F=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>Promise.all(F.map(u=>fetch(u+'?v='+V,{cache:'reload'}).then(r=>{if(!r.ok)throw new Error(u);return c.put(u,r)}))))));
self.addEventListener('message',e=>{if(e.data==='SKIP_WAITING')self.skipWaiting();if(e.data==='VER'&&e.source)e.source.postMessage({v:V})});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!=='pastillas-data').map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l)if('focus'in c)return c.focus();return clients.openWindow('./')}))});
// Aviso push: el servidor solo manda un "toque"; los nombres de las pastillas se leen aqui, del propio movil.
self.addEventListener('push',e=>e.waitUntil((async()=>{
let D=null;try{const c=await caches.open('pastillas-data'),r=await c.match('data');D=r&&await r.json()}catch(_){}
const n=new Date(),m=n.getHours()*60+n.getMinutes(),pd=x=>String(x).padStart(2,'0'),dk=n.getFullYear()+'-'+pd(n.getMonth()+1)+'-'+pd(n.getDate());
let all=[],due=[];
if(D&&D.meds){const dn=D.day===dk?D.done:[];all=D.meds.filter(x=>x.d.includes((n.getDay()+6)%7)).filter(x=>{const[h,mi]=(x.t||D.times[x.s]).split(':');return Math.abs(+h*60+ +mi-m)<=3});due=all.filter(x=>!dn.includes(x.id))}
const o={icon:'icon-192.png',badge:'icon-192.png',vibrate:[400,200,400,200,400],tag:'pastillas',renotify:true,requireInteraction:true};
if(all.length&&!due.length){await self.registration.showNotification('Pastillas al día',{...o,silent:true,requireInteraction:false,body:'Ya las marcaste como tomadas.'});(await self.registration.getNotifications({tag:'pastillas'})).forEach(x=>x.close());return}
await self.registration.showNotification(due.length?'Hora de tus pastillas':'Recordatorio de Mis Pastillas',{...o,body:due.length?due.map(x=>x.n).join(', '):'Es hora de tomar tu pastilla.'})})()));
