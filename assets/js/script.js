        document.addEventListener('DOMContentLoaded', () => {
            // ─── PRECISION SCISSOR LOADER ──────────────────────
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
                document.body.style.overflow = 'hidden'; 
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
                            window.scrollTo(0, 0); 
                            document.body.style.overflow = 'auto'; 
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

            // ─── CURSOR ───────────────────────────────────────
            const cur = document.getElementById('cur');
            const curR = document.getElementById('cur-r');
            let cx = 0, cy = 0, rx = 0, ry = 0;
            document.addEventListener('mousemove', e => { 
                cx = e.clientX; 
                cy = e.clientY; 
                if(cur) {
                    cur.style.left = cx + 'px'; 
                    cur.style.top = cy + 'px'; 
                }
            });
            (function loop() { 
                rx += (cx - rx) * .1; 
                ry += (cy - ry) * .1; 
                if(curR) {
                    curR.style.left = rx + 'px'; 
                    curR.style.top = ry + 'px'; 
                }
                requestAnimationFrame(loop); 
            })();
            document.querySelectorAll('a,button,.social,.proof-card,.craft,.proj-row').forEach(el => {
                el.addEventListener('mouseenter', () => { 
                    if(cur && curR) {
                        cur.style.width = '5px'; cur.style.height = '5px'; 
                        curR.style.width = '40px'; curR.style.height = '40px'; 
                        curR.style.borderColor = 'rgba(155,53,16,.6)'; 
                    }
                });
                el.addEventListener('mouseleave', () => { 
                    if(cur && curR) {
                        cur.style.width = '8px'; cur.style.height = '8px'; 
                        curR.style.width = '28px'; curR.style.height = '28px'; 
                        curR.style.borderColor = 'rgba(155,53,16,.35)'; 
                    }
                });
            });

            // ─── INK DISPLACEMENT BG ─────────────────────────
            const cvs = document.getElementById('cvs');
            if(!cvs) return;
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
                            c: Math.random() < .5 ? 0 : Math.random() < .6 ? 1 : 2
                        });
            }
            window.addEventListener('resize', build);
            build();

            document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
            document.addEventListener('mouseleave', () => { mx = -9999; my = -9999; });

            // ─── MAGNETIC VOID PARTICLES ──────────────────────
            class MagneticParticles {
                constructor() {
                    this.canvas = document.getElementById('canvas');
                    if(!this.canvas) return;
                    this.ctx = this.canvas.getContext('2d');
                    this.particles = [];
                    const isMobile = window.innerWidth < 768;
                    this.count = isMobile ? 60 : 180; 
                    this.mouse = { x: -1000, y: -1000 };
                    this.init();
                }

                init() {
                    if(!this.canvas) return;
                    this.resize();
                    window.addEventListener('resize', () => this.resize());
                    window.addEventListener('mousemove', e => {
                        this.mouse.x = e.clientX;
                        this.mouse.y = e.clientY;
                    });

                    for (let i = 0; i < this.count; i++) {
                        const isMobile = window.innerWidth < 768;
                        this.particles.push({
                            x: Math.random() * this.canvas.width,
                            y: Math.random() * this.canvas.height,
                            baseX: 0,
                            baseY: 0,
                            size: Math.random() * (isMobile ? 1.5 : 2.5) + 0.5,
                            speed: Math.random() * 0.5 + 0.2,
                            angle: Math.random() * Math.PI * 2,
                            color: `rgba(180, 150, 120, ${Math.random() * 0.3})`
                        });
                    }
                    this.animate();
                }

                resize() {
                    this.canvas.width = window.innerWidth;
                    this.canvas.height = window.innerHeight;
                }

                animate() {
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    const isMobile = window.innerWidth < 768;

                    this.particles.forEach(p => {
                        p.angle += 0.005;
                        p.x += Math.cos(p.angle) * p.speed;
                        p.y += Math.sin(p.angle) * p.speed;

                        const dx = this.mouse.x - p.x;
                        const dy = this.mouse.y - p.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const force = (isMobile ? 150 : 300) - dist;

                        if (force > 0) {
                            const angle = Math.atan2(dy, dx);
                            p.x -= Math.cos(angle) * (force * 0.02);
                            p.y -= Math.sin(angle) * (force * 0.02);
                        }

                        if (p.x < 0 || p.x > this.canvas.width) p.x = Math.random() * this.canvas.width;
                        if (p.y < 0 || p.y > this.canvas.height) p.y = Math.random() * this.canvas.height;

                        this.ctx.fillStyle = p.color;
                        this.ctx.beginPath();
                        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        this.ctx.fill();
                    });
                    requestAnimationFrame(() => this.animate());
                }
            }
            new MagneticParticles();

            const RADIUS = 140;
            const STRENGTH = 22;

            function frame() {
                smx += (mx - smx) * .07;
                smy += (my - smy) * .07;
                ctx.clearRect(0, 0, W, H);
                pts.forEach(p => {
                    const dx = p.wx - smx, dy = p.wy - smy;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const f = Math.max(0, (RADIUS - dist) / RADIUS);
                    const f2 = f * f;
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
                    let r, g, b;
                    if (moved > 0.3) {
                        if (p.c === 0) { r = 180; g = 60; b = 14; }       
                        else if (p.c === 1) { r = 196; g = 130; b = 20; } 
                        else { r = 180; g = 175; b = 168; }             
                    } else {
                        r = 180; g = 175; b = 168;
                    }
                    if (moved > 0.15) {
                        ctx.strokeStyle = `rgba(${r},${g},${b},${Math.min(a, 0.75)})`;
                        ctx.lineWidth = moved > 4 ? 1.2 : .5;
                        ctx.beginPath(); ctx.moveTo(p.wx, p.wy); ctx.lineTo(fx, fy); ctx.stroke();
                    }
                    if (moved > 0.5) {
                        ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(a * .8, .65)})`;
                        ctx.beginPath(); ctx.arc(fx, fy, moved > 5 ? 1.3 : .7, 0, Math.PI * 2); ctx.fill();
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
            window.toggleMenu = function() { document.getElementById('mob').classList.toggle('open'); };

            // ─── EMAIL ────────────────────────────────────────
            window.sendMsg = function() {
                const m = document.getElementById('msg').value.trim();
                const s = document.getElementById('status');
                if (!m) { s.textContent = 'say something first.'; return; }
                s.textContent = 'opening...';
                window.open('mailto:biafgiabraham17@gmail.com?subject=Collab%20from%20site&body=' + encodeURIComponent(m));
                document.getElementById('msg').value = '';
                setTimeout(() => { s.textContent = ''; }, 3000);
            };
            document.getElementById('msg').addEventListener('keydown', e => { if (e.ctrlKey && e.key === 'Enter') window.sendMsg(); });
        });
