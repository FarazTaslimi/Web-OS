// weblogin.js – WebOS Lock Screen (localStorage, no external HTML dependencies)
(async function () {
    console.log('[WebLogin] Starting lock screen…');

    // Check power state
    try {
        const res = await fetch('/api/status');
        const data = await res.json();
        if (data.power !== 'on') {
            window.location.href = 'index.html';
            return;
        }
    } catch (err) {
        console.warn('[WebLogin] Status check failed, continuing anyway.');
    }

    // Check authentication token (localStorage)
    const token = localStorage.getItem('authToken');
    if (token) {
        try {
            const verifyRes = await fetch('/api/verify-token', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (verifyRes.ok) {
                console.log('[WebLogin] Valid session found, loading desktop directly');
                await loadDesktop();
                return;
            } else {
                localStorage.removeItem('authToken');
            }
        } catch (e) {
            console.warn('[WebLogin] Token verification failed');
            localStorage.removeItem('authToken');
        }
    }

    // Load config (wallpaper) and user data
    let config = { lockScreen: { wallpaper: '', accent: '#60cdff' } };
    let user = { username: 'User', avatar: '' };
    try {
        const [cfgRes, uRes] = await Promise.all([
    fetch('/system/data/config.json').catch(() => ({ ok: false })),
    fetch('/api/user').catch(() => ({ ok: false }))
]);
if (cfgRes.ok) config = await cfgRes.json();
if (uRes.ok) {
    const u = await uRes.json();
    user = { username: u.username, avatar: u.avatar };
}
    } catch (err) {
        console.warn('[WebLogin] Could not load config/user, using defaults.');
    }

    // Build lock screen UI
    buildLockScreen(user, config);
    console.log('[WebLogin] Lock screen DOM built');

    // Bind events after DOM is ready
    setTimeout(() => {
        initEvents();
    }, 60);

    // Helper to load desktop (client libraries and start UI services)
    async function loadDesktop() {
    const root = document.getElementById('root');
    if (root) root.innerHTML = '';
    await loadScript('system/lib/index.js');
    // صبر کن تا همه کتابخونه‌ها لود بشن
    await new Promise(r => setTimeout(r, 100));
    if (window.ServiceManager) {
        await window.ServiceManager.startAll();
        console.log('[WebLogin] Desktop loaded successfully.');
    } else {
        console.error('[WebLogin] ServiceManager not available');
    }
}

    async function loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.head.appendChild(script);
        });
    }
})();

function initEvents() {
    // Clock update
    function tick() {
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        const t = document.getElementById('__lockTime');
        const d = document.getElementById('__lockDate');
        const r = document.getElementById('__trayTime');
        if (t) t.textContent = time;
        if (d) d.textContent = date;
        if (r) r.textContent = time;
    }
    setInterval(tick, 1000);
    tick();

    // Reveal login panel
    let shown = false;
    function revealLogin() {
        if (shown) return;
        shown = true;
        const cw = document.getElementById('__clockWrap');
        const hi = document.getElementById('__hint');
        const lw = document.getElementById('__loginWrap');
        const gb = document.getElementById('__glassBlur');
        if (cw) {
            cw.style.transition = 'opacity 0.4s, transform 0.5s cubic-bezier(.2,.9,.3,1)';
            cw.style.opacity = '0';
            cw.style.transform = 'translate(-50%,-60%) scale(0.9)';
            setTimeout(() => { if (cw) cw.style.visibility = 'hidden'; }, 450);
        }
        if (hi) hi.style.opacity = '0';
        if (gb) requestAnimationFrame(() => gb.classList.add('active'));
        setTimeout(() => {
            if (lw) {
                lw.classList.add('active');
                document.getElementById('__pwInput')?.focus();
            }
        }, 220);
    }
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('#__powerBtn') || e.target.closest('#__powerMenu')) return;
        if (e.target.closest('#__wifiBtn')) return;
        revealLogin();
    });
    document.body.addEventListener('keydown', () => { if (!shown) revealLogin(); });

    // Login logic
    async function doLogin() {
        const inp = document.getElementById('__pwInput');
        const btn = document.getElementById('__loginBtn');
        if (!inp) return;
        const pw = inp.value.trim();
        if (!pw) { inp.focus(); return; }
        if (btn) { btn.disabled = true; btn.classList.add('loading'); }
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: pw })
            });
            if (res.ok) {
                const userData = await res.json();
                const token = btoa(Date.now() + ':' + userData.user.username);
                localStorage.setItem('authToken', token);
                sessionStorage.setItem('loggedIn', 'true');

                // Remove the login panel (fade out)
                const lw = document.getElementById('__loginWrap');
                if (lw) lw.style.opacity = '0';

                // Load desktop directly (no redirect)
                await loadDesktop();
            } else {
                inp.value = '';
                inp.classList.add('shake');
                setTimeout(() => inp.classList.remove('shake'), 500);
                const err = document.getElementById('__loginErr');
                if (err) {
                    err.classList.add('show');
                    setTimeout(() => err.classList.remove('show'), 2500);
                }
            }
        } catch (e) { console.error(e); }
        if (btn) { btn.disabled = false; btn.classList.remove('loading'); }
    }
    document.getElementById('__pwInput')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });
    document.getElementById('__loginBtn')?.addEventListener('click', doLogin);

    // Power menu
    const pb = document.getElementById('__powerBtn');
    const pm = document.getElementById('__powerMenu');
    pb?.addEventListener('click', (e) => { e.stopPropagation(); pm?.classList.toggle('hidden'); });

    document.getElementById('__sleepBtn')?.addEventListener('click', async () => {
        await fetch('/api/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ power: 'sleep' }) });
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
    });
    document.getElementById('__hibernateBtn')?.addEventListener('click', async () => {
        localStorage.setItem('webos_hibernate_snapshot', JSON.stringify({ timestamp: Date.now() }));
        await fetch('/api/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ power: 'hibernate' }) });
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
    });
    document.getElementById('__shutdownBtn')?.addEventListener('click', async () => {
        await fetch('/api/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ power: 'off' }) });
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = 'index.html';
    });
    document.getElementById('__restartBtn')?.addEventListener('click', () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
    });

    document.addEventListener('click', (e) => {
        if (pm && !pm.contains(e.target) && !pb?.contains(e.target)) pm.classList.add('hidden');
    });

    // Mock WiFi panel (visual only, no real API calls)
    const wifiBtn = document.getElementById('__wifiBtn');
    let wifiPanel = null;
    let wifiOpen = false;

    function closeWifiPanel() {
        if (!wifiPanel) return;
        wifiPanel.style.opacity = '0';
        wifiPanel.style.transform = 'translateY(8px) scale(0.97)';
        setTimeout(() => { if (wifiPanel) { wifiPanel.remove(); wifiPanel = null; } }, 180);
        wifiOpen = false;
    }

    wifiBtn?.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (wifiOpen) { closeWifiPanel(); return; }
        wifiOpen = true;

        wifiPanel = document.createElement('div');
        wifiPanel.className = 'lk-wifi-panel';
        wifiPanel.innerHTML = '<div style="text-align:center;padding:10px;opacity:.5;font-size:.8rem;">Mock networks</div>';

        Object.assign(wifiPanel.style, {
            position: 'fixed',
            width: '260px',
            background: 'rgba(12,14,24,0.95)',
            backdropFilter: 'blur(40px) saturate(160%)',
            webkitBackdropFilter: 'blur(40px) saturate(160%)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '14px',
            zIndex: '999',
            color: 'white',
            fontFamily: "'Outfit', system-ui, sans-serif",
            boxShadow: '0 24px 60px rgba(0,0,0,.7)',
            opacity: '0',
            transform: 'translateY(8px) scale(0.97)',
            transition: 'opacity 0.2s ease, transform 0.25s cubic-bezier(.2,.9,.3,1)',
        });

        document.body.appendChild(wifiPanel);

        function positionPanel() {
            const btnRect = wifiBtn.getBoundingClientRect();
            let right = window.innerWidth - btnRect.right;
            const panelW = 260;
            if (btnRect.right - panelW < 8) right = window.innerWidth - panelW - 8;
            let bottom = window.innerHeight - btnRect.top + 10;
            wifiPanel.style.right = right + 'px';
            wifiPanel.style.bottom = bottom + 'px';
            wifiPanel.style.left = 'auto';
            wifiPanel.style.top = 'auto';
        }

        positionPanel();
        requestAnimationFrame(() => {
            positionPanel();
            requestAnimationFrame(() => {
                wifiPanel.style.opacity = '1';
                wifiPanel.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Mock content (no fetch)
        wifiPanel.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                <span style="font-weight:500;">Wi-Fi</span>
                <div class="wifi-toggle-pill" id="lk-wifi-toggle-mock">
                    <div class="wifi-toggle-thumb"></div>
                </div>
            </div>
            <div class="wifi-networks-list" style="max-height:200px; overflow-y:auto;">
                <div class="wifi-network-item" data-ssid="MockNetwork_5G" style="display:flex; align-items:center; gap:8px; padding:6px 0; cursor:pointer;">
                    <span>📶</span> <span style="flex:1;">MockNetwork_5G</span> <span>🔒</span>
                </div>
                <div class="wifi-network-item" data-ssid="Guest_WiFi" style="display:flex; align-items:center; gap:8px; padding:6px 0; cursor:pointer;">
                    <span>📶</span> <span style="flex:1;">Guest_WiFi</span>
                </div>
                <div class="wifi-network-item" data-ssid="Office_Net" style="display:flex; align-items:center; gap:8px; padding:6px 0; cursor:pointer;">
                    <span>📶</span> <span style="flex:1;">Office_Net</span> <span>🔒</span>
                </div>
            </div>
        `;

        const toggle = wifiPanel.querySelector('#lk-wifi-toggle-mock');
        if (toggle) {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                toggle.classList.toggle('off');
            });
        }
        wifiPanel.querySelectorAll('.wifi-network-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                closeWifiPanel();
            });
        });
        positionPanel();
    });

    document.addEventListener('click', (e) => {
        if (!wifiPanel) return;
        if (wifiBtn && (e.target === wifiBtn || wifiBtn.contains(e.target))) return;
        if (wifiPanel.contains(e.target)) return;
        closeWifiPanel();
    });
}

// ========== buildLockScreen (full original version) ==========
function buildLockScreen(user, config) {
    document.body.classList.remove('fade-out');

    // Load font
    if (!document.querySelector('link[href*="Outfit"]')) {
        const fontLink = document.createElement('link');
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500&display=swap';
        document.head.appendChild(fontLink);
    }

    const accent = config.lockScreen?.accent || '#60cdff';
    const wallpaper = config.lockScreen?.wallpaper || '';
    
    let bgStyle = '';
    if (wallpaper) {
        bgStyle = `background-image: url('${wallpaper}'); background-size: cover; background-position: center; background-repeat: no-repeat;`;
    }

    const avatarHTML = user.avatar
        ? `<img class="lk-avatar" src="${user.avatar}" alt="avatar">`
        : `<div class="lk-avatar lk-avatar-icon">
               <svg viewBox="0 0 48 48" fill="none">
                 <circle cx="24" cy="18" r="9" fill="rgba(255,255,255,0.75)"/>
                 <path d="M6 44c0-9.94 8.06-18 18-18s18 8.06 18 18" stroke="rgba(255,255,255,0.75)" stroke-width="2.5" fill="none"/>
               </svg>
           </div>`;

    document.body.innerHTML = `
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
body{
  width:100vw;height:100vh;overflow:hidden;
  position:relative;
  font-family:'Outfit',system-ui,sans-serif;
  color:#fff;
  background-color:#04060f;
  ${bgStyle}
  -webkit-font-smoothing:antialiased;
}
.lk-blur, .lk-clock, .lk-login, .lk-pill, .lk-pbtn, .lk-pmenu {
  will-change: transform, opacity;
}
/* Blobs – only visible if no wallpaper, otherwise they are overlayed but we can hide them when wallpaper exists? We'll keep them light */
.lk-bg{position:absolute;inset:0;z-index:0;pointer-events:none; ${wallpaper ? 'opacity:0.3;' : ''}}
.lk-b{position:absolute;border-radius:50%;filter:blur(120px);animation:bd 20s ease-in-out infinite alternate;}
.lk-b1{width:750px;height:600px;background:radial-gradient(circle,#0d2060,transparent 70%);top:-20%;left:-15%;opacity:.9;animation-duration:22s;}
.lk-b2{width:600px;height:500px;background:radial-gradient(circle,#083a5e,transparent 70%);bottom:-15%;right:-10%;opacity:.75;animation-direction:alternate-reverse;animation-duration:16s;}
.lk-b3{width:400px;height:400px;background:radial-gradient(circle,#180830,transparent 70%);top:35%;left:40%;opacity:.6;animation-duration:28s;}
@keyframes bd{from{transform:translate(0,0) scale(1);}to{transform:translate(35px,25px) scale(1.08);}}
.lk-grain{position:absolute;inset:0;z-index:1;pointer-events:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
  opacity:.5;
}
.lk-blur{position:absolute;inset:0;z-index:2;pointer-events:none;
  backdrop-filter:blur(0px) brightness(1);
  -webkit-backdrop-filter:blur(0px) brightness(1);
  background:rgba(0,0,0,0);
  transition:backdrop-filter .65s ease, background .55s ease;
}
.lk-blur.active{
  backdrop-filter:blur(36px) brightness(.65);
  -webkit-backdrop-filter:blur(36px) brightness(.65);
  background:rgba(0,2,15,.38);
}
.lk-clock{
  position:absolute;top:42%;left:50%;
  transform:translate(-50%,-50%);
  text-align:center;z-index:5;
  animation:cfade .9s cubic-bezier(.2,.9,.3,1) .15s both;
}
@keyframes cfade{from{opacity:0;transform:translate(-50%,-44%);}to{opacity:1;transform:translate(-50%,-50%);}}
.lk-time{
  font-size:clamp(5rem,12vw,9rem);
  font-weight:200;letter-spacing:-3px;line-height:1;
  text-shadow:0 6px 60px rgba(0,0,0,.55);
}
.lk-date{
  font-size:clamp(.9rem,1.8vw,1.4rem);
  font-weight:300;color:rgba(255,255,255,.68);
  margin-top:10px;letter-spacing:.4px;
  text-shadow:0 2px 18px rgba(0,0,0,.4);
}
.lk-hint{
  position:absolute;bottom:18%;left:50%;
  transform:translateX(-50%);
  font-size:.7rem;font-weight:300;
  color:rgba(255,255,255,.32);
  letter-spacing:2.5px;text-transform:uppercase;
  z-index:5;
  animation:cfade 1s ease .9s both, hf 2.5s ease-in-out infinite alternate;
  transition:opacity .3s;
}
@keyframes hf{from{transform:translateX(-50%) translateY(0);}to{transform:translateX(-50%) translateY(-6px);}}
.lk-login{
  position:absolute;top:50%;left:50%;
  transform:translate(-50%,-46%) scale(.96);
  z-index:6;
  display:flex;flex-direction:column;align-items:center;gap:18px;
  opacity:0;pointer-events:none;
  transition:opacity .45s ease,transform .5s cubic-bezier(.2,.9,.3,1);
}
.lk-login.active{opacity:1;pointer-events:auto;transform:translate(-50%,-50%) scale(1);}
/* Avatar – clean rounded image, no dark ring */
.lk-avatar{
  width:150px;
  height:150px;
  border-radius:50%;
  object-fit:cover;
  box-shadow:0 8px 28px rgba(0,0,0,.35);
  transition:transform 0.2s ease;
}
.lk-avatar-icon{
  background:rgba(255,255,255,.12);
  display:flex;
  align-items:center;
  justify-content:center;
  width:150px;
  height:150px;
  border-radius:50%;
}
.lk-avatar-icon svg{width:64px;height:64px;opacity:0.85;}
@keyframes apop{from{transform:scale(.6);opacity:0;}to{transform:scale(1);opacity:1;}}
.lk-uname{font-size:1.65rem;font-weight:400;color:#fff;letter-spacing:.3px;text-shadow:0 2px 16px rgba(0,0,0,.5);margin-top:6px;}
.lk-pw-wrap{position:relative;width:290px;}
.lk-pw{
  width:100%;padding:13px 48px 13px 20px;
  background:rgba(255,255,255,.07);
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  border:1px solid rgba(255,255,255,.13);border-radius:14px;
  color:#fff;font-family:'Outfit',system-ui,sans-serif;
  font-size:.95rem;font-weight:300;text-align:center;letter-spacing:.5px;
  outline:none;
  box-shadow:0 4px 20px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.05);
  transition:border .25s,box-shadow .25s,background .2s;
}
.lk-pw::placeholder{color:rgba(255,255,255,.27);letter-spacing:.3px;}
.lk-pw:focus{
  border-color:${accent}66;background:rgba(255,255,255,.1);
  box-shadow:0 4px 20px rgba(0,0,0,.3),0 0 0 3px ${accent}28,inset 0 1px 0 rgba(255,255,255,.07);
}
.lk-pw.shake{animation:shk .45s cubic-bezier(.36,.07,.19,.97) both;border-color:#ff6b6b88!important;}
@keyframes shk{10%,90%{transform:translateX(-3px);}20%,80%{transform:translateX(4px);}30%,50%,70%{transform:translateX(-5px);}40%,60%{transform:translateX(5px);}}
.lk-pw-btn{
  position:absolute;right:8px;top:50%;transform:translateY(-50%);
  width:32px;height:32px;border-radius:9px;
  background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.11);
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  color:rgba(255,255,255,.65);outline:none;
  transition:background .2s,color .2s,border-color .2s;
}
.lk-pw-btn:hover{background:${accent}33;border-color:${accent}55;color:${accent};}
.lk-pw-btn svg{width:15px;height:15px;}
.lk-err{
  font-size:.76rem;color:#ff8585;
  opacity:0;transform:translateY(-5px);
  transition:opacity .25s,transform .25s;letter-spacing:.3px;
}
.lk-err.show{opacity:1;transform:translateY(0);}
.lk-tray{
  position:absolute;bottom:24px;left:24px;
  z-index:10;display:flex;align-items:center;gap:5px;
  animation:cfade 1s ease .6s both;
}
.lk-pill{
  display:flex;align-items:center;gap:5px;
  padding:6px 12px;
  background:rgba(255,255,255,.055);
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  border:1px solid rgba(255,255,255,.09);border-radius:12px;
  font-size:.7rem;font-weight:300;color:rgba(255,255,255,.6);letter-spacing:.2px;
  cursor:pointer;
  transition:background .2s;
}
.lk-pill:hover{background:rgba(255,255,255,.1);}
.lk-pill svg{width:13px;height:13px;opacity:.7;flex-shrink:0;}
.lk-power-wrap{
  position:absolute;bottom:24px;right:24px;
  z-index:10;
  animation: cfade 1s ease .6s both;
  transform-origin: bottom right;
}
@keyframes cfade{from{opacity:0;}to{opacity:1;}}
.lk-clock{ animation: cfadeClock .9s cubic-bezier(.2,.9,.3,1) .15s both; }
@keyframes cfadeClock{from{opacity:0;transform:translate(-50%,-44%);}to{opacity:1;transform:translate(-50%,-50%);}}
.lk-pbtn{
  width:44px;height:44px;border-radius:13px;
  background:rgba(255,255,255,.05);
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  border:1px solid rgba(255,255,255,.09);
  box-shadow:0 4px 18px rgba(0,0,0,.4);
  color:rgba(255,255,255,.65);
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;outline:none;
  transition:background .2s,color .2s,border-color .2s,box-shadow .2s;
}
.lk-pbtn:hover{background:rgba(255,60,60,.15);border-color:rgba(255,60,60,.3);color:#ff8585;box-shadow:0 4px 18px rgba(0,0,0,.4),0 0 20px rgba(255,60,60,.2);}
.lk-pbtn svg{width:19px;height:19px;}
.lk-pmenu{
  position:absolute;bottom:52px;right:0;
  background:rgba(12,14,24,.85);
  backdrop-filter:blur(40px) saturate(160%);-webkit-backdrop-filter:blur(40px) saturate(160%);
  border:1px solid rgba(255,255,255,.08);border-radius:16px;
  padding:6px;min-width:185px;
  box-shadow:0 24px 60px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.02);
  animation:mpop .2s cubic-bezier(.34,1.56,.64,1) both;
  transform-origin:bottom right;
}
@keyframes mpop{from{opacity:0;transform:scale(.9) translateY(8px);}to{opacity:1;transform:scale(1) translateY(0);}}
.lk-pmenu.hidden{display:none;}
.lk-mi{
  padding:10px 15px;border-radius:10px;
  color:rgba(255,255,255,.82);cursor:pointer;
  font-size:.86rem;font-weight:300;
  display:flex;align-items:center;gap:11px;
  transition:background .15s;
}
.lk-mi:hover{background:rgba(255,255,255,.08);}
.lk-mi svg{width:16px;height:16px;flex-shrink:0;opacity:.9;}
/* WiFi panel styles */
.lk-wifi-panel { z-index: 20; animation: fadeIn 0.2s; }
@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
.wifi-toggle-pill {
    width: 40px; height: 22px; background: #60cdff; border-radius: 11px;
    position: relative; cursor: pointer;
}
.wifi-toggle-pill.off { background: rgba(255,255,255,0.2); }
.wifi-toggle-thumb {
    position: absolute; top: 3px; left: 3px; width: 16px; height: 16px;
    background: white; border-radius: 50%; transition: left 0.2s;
}
.wifi-toggle-pill:not(.off) .wifi-toggle-thumb { left: 21px; }
.wifi-network-item:hover { background: rgba(255,255,255,0.1); border-radius: 8px; }
</style>
<div class="lk-bg">
  <div class="lk-b lk-b1"></div>
  <div class="lk-b lk-b2"></div>
  <div class="lk-b lk-b3"></div>
</div>
<div class="lk-grain"></div>
<div class="lk-blur" id="__glassBlur"></div>

<div class="lk-clock" id="__clockWrap">
  <div class="lk-time" id="__lockTime">--:--</div>
  <div class="lk-date" id="__lockDate">Loading…</div>
</div>

<div class="lk-hint" id="__hint">Click anywhere to unlock</div>

<div class="lk-login" id="__loginWrap">
  ${avatarHTML}
  <div class="lk-uname">${user.username || 'User'}</div>
  <div class="lk-pw-wrap">
    <input class="lk-pw" id="__pwInput" type="password" placeholder="Password or PIN" autocomplete="current-password"/>
    <button class="lk-pw-btn" id="__loginBtn">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9,4 13,8 9,12"/><line x1="3" y1="8" x2="13" y2="8"/></svg>
    </button>
  </div>
  <div class="lk-err" id="__loginErr">Incorrect password. Try again.</div>
</div>

<div class="lk-tray">
  <div class="lk-pill" id="__wifiBtn">
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 10.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm0-4a4.5 4.5 0 0 1 3.18 1.32l-1.42 1.42A2.5 2.5 0 0 0 5.24 9.74L3.82 8.32A4.5 4.5 0 0 1 8 6.5zm0-4a8.5 8.5 0 0 1 6.01 2.49l-1.42 1.42A6.5 6.5 0 0 0 1.41 10.91L-.01 9.49A8.5 8.5 0 0 1 8 2.5z"/>
    </svg>
    Wi-Fi
  </div>
  <div class="lk-pill">
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3">
      <rect x="1" y="5" width="11" height="7" rx="1.5"/>
      <rect x="2.5" y="6.5" width="6" height="4" rx=".7" fill="currentColor" stroke="none"/>
      <path d="M13 7.5v2" stroke-linecap="round"/>
    </svg>
    100%
  </div>
  <div class="lk-pill" id="__trayTime">--:--</div>
</div>

<div class="lk-power-wrap">
  <div class="lk-pmenu hidden" id="__powerMenu">
    <!-- Sleep -->
    <div class="lk-mi" id="__sleepBtn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      Sleep
    </div>
    <!-- Hibernate with clock icon -->
    <div class="lk-mi" id="__hibernateBtn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="12" x2="12" y2="7"/>
        <line x1="12" y1="12" x2="15" y2="12"/>
      </svg>
      Hibernate
    </div>
    <!-- Shut down -->
    <div class="lk-mi" id="__shutdownBtn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
      Shut down
    </div>
    <!-- Restart -->
    <div class="lk-mi" id="__restartBtn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
      Restart
    </div>
  </div>
  <button class="lk-pbtn" id="__powerBtn">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
  </button>
</div>
`;
}