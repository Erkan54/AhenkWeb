/* ==========================================
   AHENK KAFE - Main JavaScript
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // Preloader
    // ==========================================
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
            document.body.style.overflow = '';
        }, 800);
    });

    // Fallback: hide preloader after 3 seconds
    setTimeout(() => {
        if (preloader && !preloader.classList.contains('hidden')) {
            preloader.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }, 3000);

    // ==========================================
    // Navbar Scroll Effect
    // ==========================================
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');
    
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Navbar background
        if (currentScroll > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Back to top button
        if (currentScroll > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }

        lastScroll = currentScroll;
    });

    // Back to top click
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ==========================================
    // Mobile Navigation
    // ==========================================
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // ==========================================
    // Active Nav Link on Scroll
    // ==========================================
    const sections = document.querySelectorAll('section[id]');
    
    const observerOptions = {
        root: null,
        rootMargin: '-30% 0px -70% 0px',
        threshold: 0
    };

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${entry.target.id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => navObserver.observe(section));

    // ==========================================
    // Menu Tabs
    // ==========================================
    const menuTabs = document.querySelectorAll('.menu-tab');
    const menuCategories = document.querySelectorAll('.menu-category');

    menuTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.dataset.category;

            // Update active tab
            menuTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Show corresponding menu category
            menuCategories.forEach(cat => {
                cat.classList.remove('active');
                if (cat.id === category) {
                    cat.classList.add('active');
                }
            });
        });
    });

    // ==========================================
    // Fetch and Render Menu from Firebase
    // ==========================================
    const menuLoader = document.getElementById('menuLoader');
    const menuGrids = {
        'sicak-icecekler': document.querySelector('#sicak-icecekler .menu-grid'),
        'sicak-kahveler': document.querySelector('#sicak-kahveler .menu-grid'),
        'soguk-kahveler': document.querySelector('#soguk-kahveler .menu-grid'),
        'soguk-icecekler': document.querySelector('#soguk-icecekler .menu-grid'),
        'tatlilar': document.querySelector('#tatlilar .menu-grid'),
        'sandvicler': document.querySelector('#sandvicler .menu-grid')
    };

    if (typeof firebase !== 'undefined' && firebase.firestore) {
        const db = firebase.firestore();
        
        db.collection('menu').where('active', '==', true).onSnapshot((snapshot) => {
            if(menuLoader) menuLoader.classList.add('hidden');
            
            const items = [];
            snapshot.forEach(doc => {
                items.push({ id: doc.id, ...doc.data() });
            });
            
            // Sort items in memory
            items.sort((a, b) => {
                const timeA = a.createdAt ? a.createdAt.toMillis() : 0;
                const timeB = b.createdAt ? b.createdAt.toMillis() : 0;
                return timeA - timeB;
            });
            
            // Clear grids
            Object.values(menuGrids).forEach(grid => {
                if(grid) grid.innerHTML = '';
            });

            // Populate grids
            items.forEach(item => {
                if (menuGrids[item.category]) {
                    const menuItem = document.createElement('div');
                    menuItem.className = 'menu-item';
                    const descHTML = item.description ? `<br><small style="color:var(--clr-text-light);font-size:0.8em">${item.description}</small>` : '';
                    
                    menuItem.innerHTML = `
                        <span class="item-name">${item.name}${descHTML}</span>
                        <span class="item-dots"></span>
                        <span class="item-price">${item.price}</span>
                    `;
                    menuGrids[item.category].appendChild(menuItem);
                }
            });
        }, (err) => {
            console.error('Menü yüklenirken hata oluştu:', err);
            if(menuLoader) {
                menuLoader.classList.remove('hidden');
                menuLoader.innerHTML = '<p>Menü yüklenemedi. Lütfen sayfayı yenileyin.</p>';
            }
        });
    }

    // ==========================================
    // Reviews Carousel
    // ==========================================
    const reviewsTrack = document.getElementById('reviewsTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const carouselDotsContainer = document.getElementById('carouselDots');
    const reviewCards = document.querySelectorAll('.review-card');
    
    let currentSlide = 0;
    let cardsPerView = getCardsPerView();
    let totalPages = Math.ceil(reviewCards.length / cardsPerView);

    function getCardsPerView() {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }

    function createDots() {
        carouselDotsContainer.innerHTML = '';
        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            if (i === currentSlide) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dot.setAttribute('aria-label', `Sayfa ${i + 1}`);
            carouselDotsContainer.appendChild(dot);
        }
    }

    function goToSlide(index) {
        currentSlide = Math.max(0, Math.min(index, totalPages - 1));
        updateCarousel();
    }

    function updateCarousel() {
        cardsPerView = getCardsPerView();
        totalPages = Math.ceil(reviewCards.length / cardsPerView);

        const cardWidth = reviewCards[0].getBoundingClientRect().width;
        let gap = 16;
        if (reviewCards.length > 1) {
            gap = Math.round(reviewCards[1].getBoundingClientRect().left - reviewCards[0].getBoundingClientRect().right);
            // Fallback in case they are stacked or overlapping
            if (gap <= 0) gap = parseInt(getComputedStyle(reviewsTrack).gap) || 16;
        }
        
        let stepMultiplier = (window.innerWidth <= 768) ? 1 : cardsPerView;
        let offset = currentSlide * (cardWidth + gap) * stepMultiplier;
        
        // Calculate maximum allowed scroll offset to prevent blank empty slides
        const maxOffset = Math.max(0, (reviewCards.length - cardsPerView) * (cardWidth + gap));
        if (offset > maxOffset) {
            offset = maxOffset;
        }

        reviewsTrack.style.transform = `translateX(-${offset}px)`;
        
        // Update dots
        const dots = carouselDotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    prevBtn.addEventListener('click', () => {
        if (currentSlide > 0) {
            currentSlide--;
            updateCarousel();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentSlide < totalPages - 1) {
            currentSlide++;
            updateCarousel();
        }
    });

    // Touch/swipe/mouse drag support
    let dragStartX = 0;
    let dragEndX = 0;
    let isDragging = false;

    // Touch events
    reviewsTrack.addEventListener('touchstart', (e) => {
        dragStartX = e.changedTouches[0].screenX;
        isDragging = true;
    }, { passive: true });

    reviewsTrack.addEventListener('touchend', (e) => {
        dragEndX = e.changedTouches[0].screenX;
        if (isDragging) {
            handleSwipe();
            isDragging = false;
        }
    }, { passive: true });

    // Mouse events
    reviewsTrack.addEventListener('mousedown', (e) => {
        dragStartX = e.screenX;
        dragEndX = e.screenX;
        isDragging = true;
        reviewsTrack.style.cursor = 'grabbing';
        e.preventDefault(); // Prevent text selection / native drag
    });

    reviewsTrack.addEventListener('mousemove', (e) => {
        if (isDragging) {
            dragEndX = e.screenX;
        }
    });

    reviewsTrack.addEventListener('mouseup', (e) => {
        if (isDragging) {
            dragEndX = e.screenX;
            reviewsTrack.style.cursor = 'grab';
            handleSwipe();
            isDragging = false;
        }
    });

    reviewsTrack.addEventListener('mouseleave', () => {
        if (isDragging) {
            reviewsTrack.style.cursor = 'grab';
            handleSwipe();
            isDragging = false;
        }
    });

    function handleSwipe() {
        const diff = dragStartX - dragEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentSlide < totalPages - 1) {
                currentSlide++;
            } else if (diff < 0 && currentSlide > 0) {
                currentSlide--;
            }
            updateCarousel();
        }
    }

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            cardsPerView = getCardsPerView();
            totalPages = Math.ceil(reviewCards.length / cardsPerView);
            currentSlide = Math.min(currentSlide, totalPages - 1);
            createDots();
            updateCarousel();
        }, 250);
    });

    // Auto-play carousel
    let autoPlayInterval = setInterval(() => {
        if (currentSlide < totalPages - 1) {
            currentSlide++;
        } else {
            currentSlide = 0;
        }
        updateCarousel();
    }, 5000);

    // Pause on hover
    reviewsTrack.addEventListener('mouseenter', () => {
        clearInterval(autoPlayInterval);
    });

    reviewsTrack.addEventListener('mouseleave', () => {
        autoPlayInterval = setInterval(() => {
            if (currentSlide < totalPages - 1) {
                currentSlide++;
            } else {
                currentSlide = 0;
            }
            updateCarousel();
        }, 5000);
    });

    // Initialize
    createDots();
    updateCarousel(); // Initialize transform and layout immediately!

    // ==========================================
    // Scroll Reveal Animations
    // ==========================================
    const revealElements = document.querySelectorAll(
        '.about-card, .gallery-card, .menu-content, .review-card, .contact-card, .contact-map, .feature-tag, .additional-reviewers, .section-header'
    );

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal', 'visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    });

    revealElements.forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });

    // Stagger about cards
    const aboutCards = document.querySelectorAll('.about-card');
    aboutCards.forEach((card, i) => {
        card.style.transitionDelay = `${i * 150}ms`;
    });

    // Stagger feature tags
    const featureTags = document.querySelectorAll('.feature-tag');
    featureTags.forEach((tag, i) => {
        tag.style.transitionDelay = `${i * 100}ms`;
    });

    // ==========================================
    // Smooth scroll for anchor links
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = navbar.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================================
    // Animate stats counter
    // ==========================================
    const statValues = document.querySelectorAll('.stat-value');
    let statsAnimated = false;

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsAnimated) {
                statsAnimated = true;
                animateStats();
            }
        });
    }, { threshold: 0.5 });

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        statsObserver.observe(heroStats);
    }

    function animateStats() {
        statValues.forEach(stat => {
            const text = stat.textContent;
            const num = parseFloat(text);
            if (isNaN(num)) return;

            const isDecimal = text.includes('.');
            const hasSuffix = text.includes('+');
            const duration = 1500;
            const startTime = Date.now();

            function update() {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                
                let current = eased * num;
                if (isDecimal) {
                    stat.textContent = current.toFixed(1) + (hasSuffix ? '+' : '');
                } else {
                    stat.textContent = Math.floor(current) + (hasSuffix ? '+' : '');
                }

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    stat.textContent = text;
                }
            }

            requestAnimationFrame(update);
        });
    }

    // ==========================================
    // Gallery Lightbox Modal
    // ==========================================
    const imageModal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    const modalCaption = document.getElementById('modalCaption');
    const modalClose = document.getElementById('modalClose');
    const galleryCards = document.querySelectorAll('.gallery-card');

    galleryCards.forEach(card => {
        card.addEventListener('click', () => {
            const img = card.querySelector('.gallery-img');
            const title = card.querySelector('.gallery-title')?.textContent || '';
            const desc = card.querySelector('.gallery-desc')?.textContent || '';
            
            if (img && imageModal) {
                modalImg.src = img.src;
                modalCaption.textContent = title + (desc ? ` — ${desc}` : '');
                imageModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    if (modalClose) {
        modalClose.addEventListener('click', () => {
            imageModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    if (imageModal) {
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal) {
                imageModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
});
