        // ─── PRECISION SCISSOR LOADER ──────────────────────
        document.addEventListener('DOMContentLoaded', () => {
            const loader = document.getElementById('loader');
            const trigger = document.getElementById('scissor-trigger');
            const tapes = document.querySelectorAll('.diag-tape');
            if(!loader || !trigger) return;

            let isDragging = false;
            let startY = 0;
            let cutLevels = [false, false, false]; 

            const startDrag = (e) => {
                isDragging = true;
                startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
                trigger.classList.add('cutting');
                if (e.type === 'mousedown') e.preventDefault();
            };

            const doDrag = (e) => {
                if (!isDragging) return;
                let cY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
                const diff = startY - cY; 
                const screenH = window.innerHeight;
                
                if (diff > 0) {
                    trigger.style.transform = `translateY(${-diff}px)`;
                    const currentPosRatio = (startY - diff) / screenH;
                    
                    if (currentPosRatio < 0.6 && !cutLevels[0]) {
                        tapes[0].classList.add('tape-cut');
                        trigger.classList.add('snip');
                        setTimeout(() => trigger.classList.remove('snip'), 200);
                        cutLevels[0] = true;
                    }
                    if (currentPosRatio < 0.4 && !cutLevels[1]) {
                        tapes[1].classList.add('tape-cut');
                        trigger.classList.add('snip');
                        setTimeout(() => trigger.classList.remove('snip'), 200);
                        cutLevels[1] = true;
                    }
                    if (currentPosRatio < 0.2 && !cutLevels[2]) {
                        tapes[2].classList.add('tape-cut');
                        trigger.classList.add('snip');
                        setTimeout(() => trigger.classList.remove('snip'), 200);
                        cutLevels[2] = true;
                        setTimeout(() => {
                            loader.classList.add('loader-fade');
                            setTimeout(() => loader.remove(), 800);
                        }, 500);
                    }
                }
            };

            const stopDrag = () => {
                if (isDragging) {
                    isDragging = false;
                    trigger.classList.remove('cutting');
                    if (!cutLevels[2]) {
                        trigger.style.transform = 'translateY(0)';
                    }
                }
            };

            trigger.addEventListener('mousedown', startDrag);
            trigger.addEventListener('touchstart', startDrag);
            window.addEventListener('mousemove', doDrag);
            window.addEventListener('touchmove', doDrag, { passive: false });
            window.addEventListener('mouseup', stopDrag);
            window.addEventListener('touchend', stopDrag);
        });

        // ─── CURSOR ───────────────────────────────────────
        const cur = document.getElementById('cur');
        const curR = document.getElementById('cur-r');
        let cx = 0, cy = 0, rx = 0, ry = 0;
        document.addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; cur.style.left = cx + 'px'; cur.style.top = cy + 'px'; });
        (function loop() { rx += (cx - rx) * .1; ry += (cy - ry) * .1; curR.style.left = rx + 'px'; curR.style.top = ry + 'px'; requestAnimationFrame(loop); })();
        document.querySelectorAll('a,button,.social,.proof-card,.craft,.proj-row').forEach(el => {
            el.addEventListener('mouseenter', () => { cur.style.width = '5px'; cur.style.height = '5px'; curR.style.width = '40px'; curR.style.height = '40px'; curR.style.borderColor = 'rgba(155,53,16,.6)'; });
            el.addEventListener('mouseleave', () => { cur.style.width = '8px'; cur.style.height = '8px'; curR.style.width = '28px'; curR.style.height = '28px'; curR.style.borderColor = 'rgba(155,53,16,.35)'; });
        });

        // ─── INK DISPLACEMENT BG ─────────────────────────
        const cvs = document.getElementById('cvs');
        const ctx = cvs.getContext('2d');
        let W, H, pts = [];
        let mx = -9999, my = -9999, smx = -9999, smy = -9999;

        const COLS = 48, ROWS = 36;

        function build() {
            W = cvs.width = window.innerWidth;
            H = cvs.height = window.innerHeight;
            pts = [];
            const cw = W / COLS, ch = H / ROWS;
            for (let i = 0; i <= COLS; i++)
                for (let j = 0; j <= ROWS; j++)
                    pts.push({
                        wx: i * cw, wy: j * ch,
                        ox: 0, oy: 0, vx: 0, vy: 0,
                        // each point gets a colour character
                        c: Math.random() < .5 ? 0 : Math.random() < .6 ? 1 : 2
                        // 0=ember 1=gold 2=silver
                    });
        }
        window.addEventListener('resize', build);
        build();

        document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
        document.addEventListener('mouseleave', () => { mx = -9999; my = -9999; });

        const RADIUS = 140;
        const STRENGTH = 22;

        function frame() {
            // smooth mouse
            smx += (mx - smx) * .07;
            smy += (my - smy) * .07;

            ctx.clearRect(0, 0, W, H);

            pts.forEach(p => {
                const dx = p.wx - smx, dy = p.wy - smy;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const f = Math.max(0, (RADIUS - dist) / RADIUS);
                const f2 = f * f;

                // spring toward displaced position
                const tx = f2 * (dx / Math.max(dist, 1)) * STRENGTH;
                const ty = f2 * (dy / Math.max(dist, 1)) * STRENGTH;

                p.vx += (tx - p.ox) * .18;
                p.vy += (ty - p.oy) * .18;
                p.vx *= .82; p.vy *= .82;
                p.ox += p.vx; p.oy += p.vy;

                const fx = p.wx + p.ox, fy = p.wy + p.oy;
                const moved = Math.sqrt(p.ox * p.ox + p.oy * p.oy);
                const base = .055;
                const extra = f2 * .7;
                const a = base + extra;

                // color per point
                let r, g, b;
                if (moved > 0.3) {
                    if (p.c === 0) { r = 180; g = 60; b = 14; }       // ember
                    else if (p.c === 1) { r = 196; g = 130; b = 20; } // gold
                    else { r = 180; g = 175; b = 168; }             // silver
                } else {
                    r = 180; g = 175; b = 168;
                }

                // draw vertical stroke from rest to displaced
                if (moved > 0.15) {
                    ctx.strokeStyle = `rgba(${r},${g},${b},${Math.min(a, 0.75)})`;
                    ctx.lineWidth = moved > 4 ? 1.2 : .5;
                    ctx.beginPath();
                    ctx.moveTo(p.wx, p.wy);
                    ctx.lineTo(fx, fy);
                    ctx.stroke();
                }

                // dot at displaced pos
                if (moved > 0.5) {
                    ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(a * .8, .65)})`;
                    ctx.beginPath();
                    ctx.arc(fx, fy, moved > 5 ? 1.3 : .7, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            requestAnimationFrame(frame);
        }
        frame();

        // ─── REVEAL ───────────────────────────────────────
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('on'); });
        }, { threshold: .1 });
        document.querySelectorAll('.rv,.rv2,.rv3').forEach(el => obs.observe(el));

        // ─── MOBILE MENU ──────────────────────────────────
        function toggleMenu() { document.getElementById('mob').classList.toggle('open'); }

        // ─── EMAIL ────────────────────────────────────────
        function sendMsg() {
            const m = document.getElementById('msg').value.trim();
            const s = document.getElementById('status');
            if (!m) { s.textContent = 'say something first.'; return; }
            s.textContent = 'opening...';
            window.open('mailto:biafgiabraham17@gmail.com?subject=Collab%20from%20site&body=' + encodeURIComponent(m));
            document.getElementById('msg').value = '';
            setTimeout(() => { s.textContent = ''; }, 3000);
        }
        document.getElementById('msg').addEventListener('keydown', e => { if (e.ctrlKey && e.key === 'Enter') sendMsg(); });
