gsap.registerPlugin(ScrollTrigger);
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

// Menu Toggle Logic
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');
if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
}

// Navbar hide/show on scroll
let isScrollEnabled = false;
let lastScroll = 0;
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (!isScrollEnabled) {
        if (navbar) navbar.style.transform = 'translateY(0)';
        return;
    }
    const currentScroll = window.pageYOffset;
    if (currentScroll > lastScroll && currentScroll > 100) {
        if (navbar) navbar.style.transform = 'translateY(-100%)';
    } else {
        if (navbar) navbar.style.transform = 'translateY(0)';
    }
    lastScroll = currentScroll;
});

// SpotlightNavbar (mouse-tracked radial gradient)
if (!isTouchDevice && navbar) {
    let spotRaf = null;
    const updateSpot = (x, y) => {
        const r = navbar.getBoundingClientRect();
        navbar.style.setProperty('--spot-x', (x - r.left) + 'px');
        navbar.style.setProperty('--spot-y', (y - r.top) + 'px');
    };
    navbar.addEventListener('mousemove', (e) => {
        navbar.classList.add('is-spotlight');
        if (spotRaf) return;
        spotRaf = requestAnimationFrame(() => {
            updateSpot(e.clientX, e.clientY);
            spotRaf = null;
        });
    });
    navbar.addEventListener('mouseleave', () => navbar.classList.remove('is-spotlight'));
}

// Global Smooth Navigation Transition Logic
document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function(e) {
        if (isTouchDevice && this.classList.contains('service-row') && !this.classList.contains('active-touch')) {
            return;
        }

        const href = this.getAttribute('href');
        if (!href) return;
        if (href.startsWith('mailto:') || href.startsWith('tel:') || this.getAttribute('target') === '_blank') return;

        const hashIdx = href.indexOf('#');
        const linkPath = hashIdx >= 0 ? href.substring(0, hashIdx) : href;
        const linkHash = hashIdx >= 0 ? href.substring(hashIdx + 1) : '';

        // 1. Pure anchor (#section) → in-page scroll
        if (!linkPath) {
            e.preventDefault();
            if (linkHash) smoothScrollToHash(linkHash);
            if (menuToggle) menuToggle.classList.remove('active');
            if (navLinks) navLinks.classList.remove('active');
            return;
        }

        // 2. Same-page link (e.g. "index.html#work" when already on index.html) → in-page scroll
        const linkFile = linkPath.split('/').pop() || 'index.html';
        const currentFile = window.location.pathname.split('/').pop() || 'index.html';
        if (linkFile === currentFile && linkHash) {
            e.preventDefault();
            smoothScrollToHash(linkHash);
            if (menuToggle) menuToggle.classList.remove('active');
            if (navLinks) navLinks.classList.remove('active');
            return;
        }

        // 3. Cross-page → white-fade transition
        e.preventDefault();
        gsap.to('.page-transition', {
            opacity: 1,
            duration: 0.4,
            ease: "power2.inOut",
            onComplete: () => { window.location.href = href; }
        });
    });
});

// Smoothly scroll using Lenis
function smoothScrollToHash(hash) {
    const target = document.getElementById(hash);
    if (!target) return;
    if (typeof lenis !== 'undefined' && lenis && typeof lenis.scrollTo === 'function') {
        lenis.scrollTo(target, { offset: -80, duration: 1.2 });
    } else {
        target.scrollIntoView({ behavior: 'smooth' });
    }
}

// Lenis configuration hooked to GSAP ticker for mobile stability
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    smooth: true,
    smoothTouch: false,
    infinite: false
});
lenis.stop(); // Lock scroll initially

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

// === Custom Cursor (dot + ring + label) ===
if (!isTouchDevice) {
    const cursorEl = document.getElementById('cursor');
    if (cursorEl) {
        const ringEl = cursorEl.querySelector('.cursor-ring');
        const dotEl = cursorEl.querySelector('.cursor-dot');
        const labelEl = cursorEl.querySelector('.cursor-label');

        let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
        let dotX = mouseX, dotY = mouseY;
        let ringX = mouseX, ringY = mouseY;
        let hasMoved = false;

        const setVisible = (v) => cursorEl.classList.toggle('is-active', !!v);
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX; mouseY = e.clientY;
            if (!hasMoved) {
                dotX = mouseX; dotY = mouseY;
                ringX = mouseX; ringY = mouseY;
                hasMoved = true;
                document.documentElement.classList.add('has-custom-cursor');
                setVisible(true);
            }
        }, { passive: true });
        document.addEventListener('mouseleave', () => setVisible(false));
        document.addEventListener('mouseenter', () => { if (hasMoved) setVisible(true); });
        window.addEventListener('blur', () => setVisible(false));
        window.addEventListener('focus', () => { if (hasMoved) setVisible(true); });

        const setState = (state, label) => {
            cursorEl.classList.remove('is-hover', 'is-view', 'is-play', 'is-text');
            if (state) cursorEl.classList.add('is-' + state);
            if (labelEl) labelEl.textContent = label || '';
        };

        const HOST_SELECTOR = '[data-cursor], a, button, input, textarea, select';
        const applyForHost = (host) => {
            if (!host) { setState(null); return; }
            if (host.matches('input, textarea, select')) { setState('text'); return; }
            const t = host.getAttribute && host.getAttribute('data-cursor');
            if (t) {
                const lbl = host.getAttribute('data-cursor-label');
                if (t === 'view' || t === 'explore') setState('view', lbl || (t === 'explore' ? 'EXPLORE' : 'VIEW'));
                else if (t === 'play') setState('play', lbl || 'PLAY');
                else if (t === 'drag') setState('view', lbl || 'GRAB');
                else setState('hover');
                return;
            }
            if (host.matches('a, button')) { setState('hover'); return; }
            setState(null);
        };
        let lastHost = null;
        document.addEventListener('mouseover', (e) => {
            const host = e.target.closest(HOST_SELECTOR);
            if (host === lastHost) return;
            lastHost = host;
            applyForHost(host);
        });
        document.addEventListener('mouseout', (e) => {
            const newHost = e.relatedTarget ? e.relatedTarget.closest(HOST_SELECTOR) : null;
            if (newHost === lastHost) return;
            lastHost = newHost;
            applyForHost(newHost);
        });

        const render = () => {
            dotX += (mouseX - dotX) * 0.95;
            dotY += (mouseY - dotY) * 0.95;
            ringX += (mouseX - ringX) * 0.18;
            ringY += (mouseY - ringY) * 0.18;
            if (dotEl) dotEl.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
            if (ringEl) ringEl.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
            if (labelEl) labelEl.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
        };
        gsap.ticker.add(render);
    }

    // === Magnetic Buttons ===
    document.querySelectorAll('.magnetic').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(btn, { x: x * 0.4, y: y * 0.4, duration: 0.5, ease: "power2.out" });
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
        });
    });
}

// WebGL Particle Wave System (Disabled on Mobile)
if (!isTouchDevice) {
    try {
        const container = document.getElementById('webgl-container');
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 30;
        camera.position.y = 10;
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const geometry = new THREE.BufferGeometry();
        const count = 3000;
        const positions = new Float32Array(count * 3);
        const scales = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 100;
            positions[i3 + 1] = 0;
            positions[i3 + 2] = (Math.random() - 0.5) * 100;
            scales[i] = Math.random();
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

        const material = new THREE.ShaderMaterial({
            depthWrite: false,
            blending: THREE.NormalBlending,
            vertexColors: true,
            uniforms: { uTime: { value: 0 } },
            vertexShader: `
                uniform float uTime;
                attribute float aScale;
                varying vec3 vColor;
                void main() {
                    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                    modelPosition.y += sin(modelPosition.x * 0.1 + uTime) * 3.0;
                    modelPosition.y += sin(modelPosition.z * 0.1 + uTime * 0.8) * 3.0;
                    vec4 viewPosition = viewMatrix * modelPosition;
                    gl_Position = projectionMatrix * viewPosition;
                    gl_PointSize = (8.0 * aScale) * (1.0 / - viewPosition.z);
                    vColor = vec3(0.05, 0.05, 0.05);
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                void main() {
                    float strength = distance(gl_PointCoord, vec2(0.5));
                    strength = 1.0 - strength;
                    strength = pow(strength, 3.0);
                    vec3 color = mix(vec3(1.0), vColor, strength);
                    gl_FragColor = vec4(color, strength * 0.6);
                }
            `
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
        const windowHalfX = window.innerWidth / 2, windowHalfY = window.innerHeight / 2;

        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX - windowHalfX) * 0.05;
            mouseY = (event.clientY - windowHalfY) * 0.05;
        });

        const clock = new THREE.Clock();
        function animateWebGL() {
            requestAnimationFrame(animateWebGL);
            targetX = mouseX * 0.5;
            targetY = mouseY * 0.5;
            scene.rotation.y += 0.05 * (targetX - scene.rotation.y);
            scene.rotation.x += 0.05 * (targetY - scene.rotation.x);
            material.uniforms.uTime.value = clock.getElapsedTime();
            renderer.render(scene, camera);
        }
        animateWebGL();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    } catch (e) {
        console.warn('WebGL unavailable; skipping particle system.', e);
    }
}

// Preloader & Entrance Reveal Logic
const initPage = () => {
    if (document.documentElement.classList.contains('is-ready')) return;
    document.documentElement.classList.add('is-ready');

    // Split hero title immediately to prevent layout shifts/jitter later
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        new SplitType(heroTitle, { types: 'lines, words' });
        heroTitle.querySelectorAll('.line').forEach(line => {
            const wrapper = document.createElement('div');
            wrapper.classList.add('line-wrap');
            line.parentNode.insertBefore(wrapper, line);
            wrapper.appendChild(line);
        });
    }

    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        new SplitType(heroSubtitle, { types: 'lines, words' });
        heroSubtitle.querySelectorAll('.line').forEach(line => {
            const wrapper = document.createElement('div');
            wrapper.classList.add('line-wrap');
            line.parentNode.insertBefore(wrapper, line);
            wrapper.appendChild(line);
        });
    }

    const words = ["STRATEGY", "DESIGN", "AUTOMATION", "PRODUCTS"];
    const wordEl = document.getElementById('preloader-word');
    const counterEl = document.getElementById('counter');
    const loadingBar = document.getElementById('loading-bar');

    // Hide hero parts initially
    gsap.set('.hero-title, .hero-subtitle, .hero-cta, .hero-actions, .hero-trust, .hero-stats', { opacity: 0 });

    let countObj = { val: 0 }, wordIndex = 0;
    const tl = gsap.timeline();
    const cycleInterval = setInterval(() => {
        wordIndex++;
        if (wordIndex < words.length && wordEl) {
            wordEl.innerText = words[wordIndex];
        }
    }, 250);

    tl.to(countObj, {
        val: 100,
        duration: 1,
        ease: "power2.inOut",
        onUpdate: () => { if (counterEl) counterEl.innerText = Math.floor(countObj.val); }
    }, 0)
    .to(loadingBar, { width: "100%", duration: 1, ease: "power2.inOut" }, 0)
    .to('.preloader-content', { opacity: 0, duration: 0.3, onStart: () => clearInterval(cycleInterval) })
    .to('.preloader-panel.top', { yPercent: -100, duration: 0.7, ease: "power4.inOut" }, "-=0.1")
    .to('.preloader-panel.bottom', { yPercent: 100, duration: 0.7, ease: "power4.inOut" }, "-=0.7")
    .set('.preloader', { display: 'none', onComplete: () => {
        isScrollEnabled = true;
        lenis.start();
        initScrollAnimations();
    } })
    .to('.page-transition', { opacity: 0, duration: 0.2 }, "-=0.8")
    .to('.hero-title', { opacity: 1, duration: 0.1 }, "-=0.5")
    .fromTo('.hero-title .word', { y: 100, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 1, ease: "power4.out" }, "-=0.5")
    .fromTo('.hero-subtitle', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power2.out" }, "-=0.8")
    .fromTo('.navbar', { y: -100, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, "-=0.8")
    .fromTo('.hero-actions', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.7")
    .fromTo('.hero-trust', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.6")
    .fromTo('.hero-stats', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.5")
    .fromTo('.hero-cta', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.5)" }, "-=0.5");
};

// Wait for DOM & fonts ready
Promise.all([
    document.fonts.ready,
    new Promise(resolve => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', resolve);
        } else {
            resolve();
        }
    })
]).then(initPage);

// Scroll Animations Core
function initScrollAnimations() {
    // Split texts
    document.querySelectorAll('.split-text:not(.hero-title):not(.hero-subtitle)').forEach(el => {
        new SplitType(el, { types: 'lines, words' });
        el.querySelectorAll('.line').forEach(line => {
            const wrapper = document.createElement('div');
            wrapper.classList.add('line-wrap');
            line.parentNode.insertBefore(wrapper, line);
            wrapper.appendChild(line);
        });
    });

    document.querySelectorAll('h2.split-text, .founder-quote.split-text, .cta-title').forEach(el => {
        gsap.from(el.querySelectorAll('.word'), {
            scrollTrigger: { trigger: el, start: "top 85%" },
            y: 100,
            opacity: 0,
            stagger: 0.02,
            duration: 1,
            ease: "power4.out"
        });
    });

    // Marquees
    gsap.to('.marquee-track', { xPercent: -50, ease: "none", duration: 15, repeat: -1 });
    gsap.to('#tech-track', { xPercent: -50, ease: "none", duration: 25, repeat: -1 });

    // Services rows interaction (Desktop preview + Mobile accordion)
    const serviceRows = document.querySelectorAll('.service-row');
    const previewImgs = document.querySelectorAll('.preview-img');
    const previewDetails = document.querySelectorAll('.preview-detail-item');
    let activeTouchIndex = -1;

    serviceRows.forEach(row => {
        const idx = row.getAttribute('data-index');

        row.addEventListener('mouseenter', () => {
            if (!isTouchDevice) {
                previewImgs.forEach(img => img.classList.remove('active'));
                previewDetails.forEach(detail => detail.classList.remove('active'));

                const targetImg = document.getElementById(`pimg-${idx}`);
                const targetDetail = document.getElementById(`pdetail-${idx}`);
                if (targetImg) targetImg.classList.add('active');
                if (targetDetail) targetDetail.classList.add('active');
            }
        });

        row.addEventListener('click', function(e) {
            if (isTouchDevice) {
                const idx = this.getAttribute('data-index');
                if (activeTouchIndex !== idx) {
                    e.preventDefault();
                    serviceRows.forEach(r => r.classList.remove('active-touch'));
                    this.classList.add('active-touch');
                    activeTouchIndex = idx;
                }
            }
        });
    });

    if (isTouchDevice) {
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.services-list')) {
                serviceRows.forEach(r => r.classList.remove('active-touch'));
                activeTouchIndex = -1;
            }
        });
    }

    // Parallax scrolling for work cards
    document.querySelectorAll('.work-item:not(.is-screenshot), #founder-img').forEach(item => {
        const img = item.tagName === 'IMG' ? item : item.querySelector('img');
        if (img) {
            gsap.to(img, {
                yPercent: -15,
                ease: "none",
                scrollTrigger: { trigger: item, start: "top bottom", end: "bottom top", scrub: true }
            });
        }
    });

    // Process Line progress bar animation (scaleX on desktop, scaleY on mobile)
    const processLine = document.getElementById('process-line');
    const processTrigger = document.getElementById('process-trigger');
    if (processLine && processTrigger) {
        let processST = null;
        const buildProcessLine = () => {
            if (processST) { processST.kill(); processST = null; }
            const isMobile = window.innerWidth <= 768;
            gsap.set(processLine, { clearProps: 'transform' });
            if (isMobile) {
                gsap.set(processLine, { scaleY: 0, transformOrigin: 'top center' });
            } else {
                gsap.set(processLine, { scaleX: 0, transformOrigin: 'left center' });
            }
            processST = ScrollTrigger.create({
                trigger: processTrigger,
                start: 'top 80%',
                end: 'bottom 60%',
                scrub: 0.6,
                animation: gsap.to(processLine, isMobile ? { scaleY: 1, ease: 'none' } : { scaleX: 1, ease: 'none' })
            });
        };
        buildProcessLine();
        let processResizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(processResizeTimer);
            processResizeTimer = setTimeout(buildProcessLine, 150);
        });
    }

    // Metric Countup
    const animateMetric = (el) => {
        const target = parseInt(el.getAttribute('data-target'));
        if (isNaN(target)) return;
        gsap.fromTo(el, { innerHTML: 0 }, { innerHTML: target, duration: 2, snap: { innerHTML: 1 }, ease: "power2.out" });
    };

    document.querySelectorAll('#metrics-section .metric-val').forEach(val => {
        ScrollTrigger.create({
            trigger: "#metrics-section",
            start: "top 80%",
            once: true,
            onEnter: () => animateMetric(val)
        });
    });

    const heroMetricVals = document.querySelectorAll('.hero-stats .metric-val');
    if (heroMetricVals.length) {
        ScrollTrigger.create({
            trigger: '.hero-stats',
            start: 'top 90%',
            once: true,
            onEnter: () => heroMetricVals.forEach(animateMetric)
        });
    }

    // Word Morphing loop
    const morphTrack = document.getElementById('morph-track');
    if (morphTrack) {
        const morphWords = morphTrack.querySelectorAll('.morph-word');
        let morphIdx = 0;
        morphTrack.style.minWidth = '0';
        morphWords.forEach(w => { w.style.opacity = '0'; });
        const measure = () => Array.from(morphWords).map(w => w.offsetWidth);
        let widths = measure();
        let maxW = Math.max(...widths, 160);
        morphWords.forEach(w => { w.style.opacity = ''; });
        morphTrack.style.minWidth = '';
        morphTrack.style.width = maxW + 'px';
        let lastW = window.innerWidth;
        window.addEventListener('resize', () => {
            if (Math.abs(window.innerWidth - lastW) < 50) return;
            lastW = window.innerWidth;
            widths = measure();
            maxW = Math.max(...widths, 160);
            morphTrack.style.width = maxW + 'px';
        });
        setInterval(() => {
            morphWords[morphIdx].classList.remove('is-active');
            morphIdx = (morphIdx + 1) % morphWords.length;
            morphWords[morphIdx].classList.add('is-active');
        }, 2400);
    }

    // Testimonials Carousel Loop
    initTestimonialsCarousel();
}

function initTestimonialsCarousel() {
    const carousel = document.getElementById('testi-carousel');
    if (!carousel) return;
    if (carousel.dataset.initialized === '1') return;
    carousel.dataset.initialized = '1';

    const slides = carousel.querySelectorAll('.testi-slide');
    const dotsContainer = document.getElementById('testi-dots');
    const counterEl = document.getElementById('testi-counter');
    const progressBar = document.getElementById('testi-progress-bar');
    if (!slides.length || !dotsContainer) return;

    const total = slides.length;
    const INTERVAL = 5500;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let currentIndex = 0;
    let progress = 0;
    let lastTime = performance.now();
    let isPaused = false;
    let isVisible = !document.hidden;

    const pad = (n) => String(n).padStart(2, '0');

    dotsContainer.innerHTML = '';
    const dots = [];
    for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'testi-dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Testimonial ${i + 1} of ${total}`);
        dot.addEventListener('click', () => goTo(i, true));
        dotsContainer.appendChild(dot);
        dots.push(dot);
    }

    const updateCounter = () => {
        if (counterEl) counterEl.innerHTML = `${pad(currentIndex + 1)} <span>/ ${pad(total)}</span>`;
    };

    const goTo = (index, userInitiated = false) => {
        const next = ((index % total) + total) % total;
        if (next === currentIndex) return;
        slides[currentIndex].classList.remove('is-active');
        dots[currentIndex].classList.remove('is-active');
        currentIndex = next;
        slides[currentIndex].classList.add('is-active');
        dots[currentIndex].classList.add('is-active');
        updateCounter();
        if (userInitiated) {
            progress = 0;
            lastTime = performance.now();
            if (progressBar) progressBar.style.width = '0%';
        }
    };

    let rafId = 0;
    const tick = (now) => {
        if (isPaused || !isVisible || prefersReducedMotion) {
            lastTime = now;
            if (progressBar && progressBar.style.width !== '0%') progressBar.style.width = '0%';
            return;
        }
        const dt = now - lastTime;
        lastTime = now;
        progress += dt;
        const pct = Math.min(100, (progress / INTERVAL) * 100);
        if (progressBar) progressBar.style.width = pct + '%';
        if (progress >= INTERVAL) {
            goTo((currentIndex + 1) % total);
            progress = 0;
            if (progressBar) progressBar.style.width = '0%';
        }
    };

    const loop = (now) => {
        tick(now);
        rafId = requestAnimationFrame(loop);
    };

    carousel.addEventListener('mouseenter', () => { isPaused = true; });
    carousel.addEventListener('mouseleave', () => { isPaused = false; lastTime = performance.now(); });
    carousel.addEventListener('focusin', () => { isPaused = true; });
    carousel.addEventListener('focusout', () => { isPaused = false; lastTime = performance.now(); });

    document.addEventListener('visibilitychange', () => {
        isVisible = !document.hidden;
        if (isVisible) lastTime = performance.now();
    });

    let touchStartX = 0;
    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    carousel.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(dx) > 50) {
            if (dx < 0) goTo((currentIndex + 1) % total, true);
            else goTo((currentIndex - 1 + total) % total, true);
        }
    }, { passive: true });

    carousel.tabIndex = 0;
    carousel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); goTo((currentIndex - 1 + total) % total, true); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); goTo((currentIndex + 1) % total, true); }
    });

    updateCounter();
    if (progressBar) progressBar.style.width = '0%';
    if (!prefersReducedMotion) rafId = requestAnimationFrame(loop);
}

// BFCache page restoration handler
window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.style.display = 'none';
    document.documentElement.classList.add('is-ready');
    if (typeof gsap !== 'undefined') {
        try {
            gsap.killTweensOf('.page-transition, .preloader, .navbar, .hero-title, .hero-subtitle, .hero-cta, .hero-actions, .hero-trust, .hero-stats');
            gsap.set('.page-transition, .preloader, .navbar, .hero-title, .hero-subtitle, .hero-cta, .hero-actions, .hero-trust, .hero-stats', { clearProps: 'all' });
            gsap.set('.page-transition', { opacity: 0 });
            gsap.set('.navbar, .hero-title, .hero-subtitle, .hero-cta, .hero-actions, .hero-trust, .hero-stats', { opacity: 1, y: 0, scale: 1 });
        } catch (err) {}
    }
    const pt = document.querySelector('.page-transition');
    if (pt) pt.style.opacity = '0';
    document.querySelectorAll('.navbar, .hero-title, .hero-subtitle, .hero-cta, .hero-actions, .hero-trust, .hero-stats').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
    });
    isScrollEnabled = true;
    if (typeof lenis !== 'undefined' && lenis) {
        lenis.start();
        lenis.scrollTo(0, { immediate: true });
    }
    window.scrollTo(0, 0);
    try { initScrollAnimations(); } catch (err) {}
});

// Safety force-reveal backup
setTimeout(() => {
    if (document.documentElement.classList.contains('is-ready')) return;
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.style.display = 'none';
    document.documentElement.classList.add('is-ready');
    const pt = document.querySelector('.page-transition');
    if (pt) pt.style.opacity = '0';
    document.querySelectorAll('.navbar, .hero-title, .hero-subtitle, .hero-cta, .hero-actions, .hero-trust, .hero-stats').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
    });
    isScrollEnabled = true;
    if (typeof lenis !== 'undefined' && lenis) {
        lenis.start();
    }
    if (typeof gsap !== 'undefined') {
        try { initScrollAnimations(); } catch (e) {}
    }
}, 1500);

// Custom Dropdown select drawer logic
const dropdown = document.getElementById('serviceDropdown');
const trigger = document.getElementById('dropdownTrigger');
const panel = document.getElementById('dropdownPanel');
const hiddenInput = document.getElementById('serviceInput');
if (dropdown && trigger && panel && hiddenInput) {
    const options = dropdown.querySelectorAll('.dropdown-option');
    let focusedIndex = -1;

    function openDropdown() {
        dropdown.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        focusedIndex = -1;
        if (window.innerWidth <= 768) {
            document.documentElement.classList.add('lenis-stopped');
            lenis.stop();
        }
    }
    function closeDropdown() {
        dropdown.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
        focusedIndex = -1;
        clearFocus();
        document.documentElement.classList.remove('lenis-stopped');
        lenis.start();
    }
    function toggleDropdown() {
        dropdown.classList.contains('open') ? closeDropdown() : openDropdown();
    }
    function clearFocus() {
        options.forEach(o => o.classList.remove('focused'));
    }
    function focusOption(index) {
        clearFocus();
        if (index < 0) index = options.length - 1;
        if (index >= options.length) index = 0;
        focusedIndex = index;
        options[focusedIndex].classList.add('focused');
        options[focusedIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    function selectOption(option) {
        const value = option.dataset.value;
        const text = option.textContent.trim();
        hiddenInput.value = value;
        const selectedEl = document.getElementById('dropdownSelected');
        if (selectedEl) selectedEl.textContent = text;
        dropdown.classList.add('has-value');
        options.forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
        closeDropdown();
        dropdown.classList.remove('error');
        dropdown.classList.add('valid');
    }

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown();
    });

    trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleDropdown(); }
        else if (e.key === 'Escape') { closeDropdown(); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); if (!dropdown.classList.contains('open')) openDropdown(); focusOption(0); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); if (!dropdown.classList.contains('open')) openDropdown(); focusOption(options.length - 1); }
    });

    options.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            selectOption(option);
        });
        option.addEventListener('mouseenter', () => {
            if (window.innerWidth > 768) {
                clearFocus();
                option.classList.add('focused');
            }
        });
    });

    panel.addEventListener('mousemove', (e) => {
        if (window.innerWidth <= 768) return;
        const target = e.target.closest('.dropdown-option');
        if (target) { clearFocus(); target.classList.add('focused'); }
    });

    document.addEventListener('click', (e) => {
        if (dropdown.classList.contains('open') && !dropdown.contains(e.target)) {
            closeDropdown();
        }
    });

    const backdrop = dropdown.querySelector('.dropdown-backdrop');
    if (backdrop) backdrop.addEventListener('click', (e) => {
        e.stopPropagation();
        closeDropdown();
    });

    dropdown.addEventListener('keydown', (e) => {
        if (!dropdown.classList.contains('open')) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); focusOption(focusedIndex + 1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); focusOption(focusedIndex - 1); }
        else if (e.key === 'Enter' && focusedIndex >= 0) { e.preventDefault(); selectOption(options[focusedIndex]); }
    });
}

// Dummy Form Submission Handler
const contactForm = document.getElementById('contactForm');
const contactResult = document.getElementById('contactFormResult');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // Check dropdown select field
        if (!hiddenInput.value) {
            dropdown.classList.add('error');
            openDropdown();
            return;
        }
        const btn = contactForm.querySelector('button[type=submit]');
        if (btn) btn.innerHTML = 'Sending… <span class="arrow">→</span>';
        if (contactResult) {
            contactResult.style.display = 'block';
            contactResult.innerHTML = 'Please wait...';
            contactResult.className = 'form-result form-result--pending';
        }

        setTimeout(function() {
            if (contactResult) {
                contactResult.innerHTML = 'Message simulated successfully! We will connect soon.';
                contactResult.className = 'form-result form-result--success';
            }
            if (btn) btn.innerHTML = 'Sent ✓';
        }, 1200);
    });
}
