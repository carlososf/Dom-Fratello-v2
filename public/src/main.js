/* ============================================================
   DOM FRATELLO — MAIN.JS
   ============================================================ */

/* ── Navbar scroll ────────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ── Mobile menu ─────────────────────────────────────── */
const burger = document.getElementById('navBurger');
const mobileMenu = document.getElementById('navMobileMenu');
burger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
});

mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

/* ── Dropdown Pedidos & Informações ─────────────────── */
const btnPedidos = document.getElementById('btnPedidos');
const pedidosDropdown = document.getElementById('pedidosDropdown');

function openPedidos() {
    closeCardapio(); // fecha outro
    pedidosDropdown.classList.add('open');
    btnPedidos.setAttribute('aria-expanded', 'true');
    pedidosDropdown.setAttribute('aria-hidden', 'false');
}

function closePedidos() {
    pedidosDropdown.classList.remove('open');
    btnPedidos.setAttribute('aria-expanded', 'false');
    pedidosDropdown.setAttribute('aria-hidden', 'true');
}

btnPedidos.addEventListener('click', (e) => {
    e.stopPropagation();
    pedidosDropdown.classList.contains('open') ? closePedidos() : openPedidos();
});

/* ── Dropdown Cardápio ──────────────────────────────── */
const btnCardapio = document.getElementById('btnCardapio');
const cardapioDropdown = document.getElementById('cardapioDropdown');

function openCardapio() {
    closePedidos(); // fecha outro
    cardapioDropdown.classList.add('open');
    btnCardapio.setAttribute('aria-expanded', 'true');
    cardapioDropdown.setAttribute('aria-hidden', 'false');
}

function closeCardapio() {
    cardapioDropdown.classList.remove('open');
    btnCardapio.setAttribute('aria-expanded', 'false');
    cardapioDropdown.setAttribute('aria-hidden', 'true');
}

if(btnCardapio) {
    btnCardapio.addEventListener('click', (e) => {
        if(cardapioDropdown) {
            e.stopPropagation();
            cardapioDropdown.classList.contains('open') ? closeCardapio() : openCardapio();
        }
    });

    cardapioDropdown.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => setTimeout(closeCardapio, 100));
    });
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('#pedidosWrap')) closePedidos();
    if (!e.target.closest('#cardapioWrap')) closeCardapio();
});

pedidosDropdown.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setTimeout(closePedidos, 100));
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closePedidos();
        closeCardapio();
    }
});

// ── Reveal on scroll (Intersection Observer) ──
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
});

revealEls.forEach(el => revealObserver.observe(el));

// ── Smooth scroll para links âncora ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            const navH = navbar.offsetHeight;
            const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});

// ── Formulário de contato (Removido, stub) ──

// ── Parallax suave no hero ──
const heroBgs = document.querySelectorAll('.hero-half-bg');
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight * 2.5) {
        heroBgs.forEach(bg => {
            bg.style.transform = `scale(1.05) translateY(${scrollY * 0.18}px)`;
        });
    }
}, { passive: true });

// ── Active nav link no scroll ──
const sections = document.querySelectorAll('section[id], footer[id]');
const navLinksAll = document.querySelectorAll('.nav-links a');

// ── Carrossel com Efeito Fade (A Casa) ──
function initFadeCarousel(carouselId) {
    const container = document.getElementById(carouselId);
    if (!container) return;
    
    const imgs = container.querySelectorAll('img');
    let current = 0;

    setInterval(() => {
        imgs[current].classList.remove('active');
        current = (current + 1) % imgs.length;
        imgs[current].classList.add('active');
    }, 4500);
}

// ── Auto-scroll carrossel (Tradicionais) ──
function autoScrollCarousel(carouselId) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;

    let scrollInterval;
    const startScroll = () => {
        clearInterval(scrollInterval);
        scrollInterval = setInterval(() => {
            if (carousel.scrollLeft >= (carousel.scrollWidth - carousel.clientWidth - 1)) {
                carousel.scrollLeft = 0;
            } else {
                carousel.scrollLeft += 1;
            }
        }, 20);
    };

    const stopScroll = () => clearInterval(scrollInterval);

    carousel.addEventListener('mouseenter', stopScroll);
    carousel.addEventListener('mouseleave', startScroll);
    carousel.addEventListener('touchstart', stopScroll, {passive: true});
    carousel.addEventListener('touchend', startScroll, {passive: true});

    startScroll();
}

// Iniciar componentes
document.addEventListener('DOMContentLoaded', () => {
    initFadeCarousel('casaCarouselFade');
    autoScrollCarousel('tradicionaisCarousel');
    
    // Inicializar ícones Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
