/**
 * IATTC Data Explorer Hub - Landing Page JavaScript
 * Provides interactive functionality and animations
 */

class LandingPageApp {
    constructor() {
        this.isLoaded = false;
        this.observers = [];
        this.animationQueue = [];
    }

    /**
     * Initialize the landing page
     */
    init() {
        this.setupIntersectionObserver();
        this.setupSmoothScrolling();
        this.setupAnimations();
        this.setupInteractiveElements();
        this.setupPerformanceOptimizations();
        this.isLoaded = true;
        
        console.log('🌊 IATTC Data Explorer Hub loaded successfully');
    }

    /**
     * Setup intersection observer for scroll animations
     */
    setupIntersectionObserver() {
        // Animation observer for fade-in effects
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    animationObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe elements for animation
        const animateElements = document.querySelectorAll(
            '.app-card, .info-card, .step, .hero-stats, .quick-start'
        );
        
        animateElements.forEach(element => {
            element.classList.add('animate-ready');
            animationObserver.observe(element);
        });

        this.observers.push(animationObserver);
    }

    /**
     * Setup smooth scrolling for anchor links
     */
    setupSmoothScrolling() {
        // Smooth scroll for any anchor links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    /**
     * Setup page animations
     */
    setupAnimations() {
        // Add CSS for animations
        this.injectAnimationCSS();

        // Hero title typing effect
        this.setupTypingEffect();

        // Floating animation for stats
        this.setupFloatingStats();

        // Parallax effect for header background
        this.setupParallaxEffect();
    }

    /**
     * Inject animation CSS
     */
    injectAnimationCSS() {
        const animationCSS = `
            .animate-ready {
                opacity: 0;
                transform: translateY(30px);
                transition: all 0.6s ease-out;
            }

            .animate-in {
                opacity: 1;
                transform: translateY(0);
            }

            .app-card.animate-ready {
                transform: translateY(50px) scale(0.95);
            }

            .app-card.animate-in {
                transform: translateY(0) scale(1);
            }

            .hero-stats .stat {
                transition: all 0.3s ease-out;
            }

            .hero-stats .stat:hover {
                transform: translateY(-5px);
            }

            .typing-cursor {
                animation: blink 1s infinite;
            }

            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }

            .floating {
                animation: float-gentle 4s ease-in-out infinite;
            }

            @keyframes float-gentle {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-8px); }
            }

            .parallax-bg {
                transform: translateY(var(--scroll-y, 0));
            }

            @media (prefers-reduced-motion: reduce) {
                .animate-ready,
                .animate-in,
                .floating,
                .parallax-bg {
                    animation: none !important;
                    transition: none !important;
                    transform: none !important;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = animationCSS;
        document.head.appendChild(styleSheet);
    }

    /**
     * Setup typing effect for hero title
     */
    setupTypingEffect() {
        const heroTitle = document.querySelector('.hero-title');
        if (!heroTitle) return;

        const originalText = heroTitle.textContent;
        const words = originalText.split(' ');
        
        // Only animate on larger screens
        if (window.innerWidth > 768) {
            heroTitle.innerHTML = '';
            
            let wordIndex = 0;
            const typeWords = () => {
                if (wordIndex < words.length) {
                    heroTitle.innerHTML += (wordIndex > 0 ? ' ' : '') + words[wordIndex];
                    wordIndex++;
                    setTimeout(typeWords, 150);
                } else {
                    // Add cursor for a moment, then remove
                    heroTitle.innerHTML += '<span class="typing-cursor">|</span>';
                    setTimeout(() => {
                        const cursor = heroTitle.querySelector('.typing-cursor');
                        if (cursor) cursor.remove();
                    }, 2000);
                }
            };

            // Start typing after a short delay
            setTimeout(typeWords, 500);
        }
    }

    /**
     * Setup floating animation for stats
     */
    setupFloatingStats() {
        const stats = document.querySelectorAll('.hero-stats .stat');
        stats.forEach((stat, index) => {
            // Add staggered floating animation
            setTimeout(() => {
                stat.classList.add('floating');
                stat.style.animationDelay = `${index * 0.5}s`;
            }, 1000 + (index * 200));
        });
    }

    /**
     * Setup parallax effect
     */
    setupParallaxEffect() {
        let ticking = false;
        
        const updateParallax = () => {
            const scrollY = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.header::before');
            
            parallaxElements.forEach(element => {
                const speed = 0.5;
                element.style.setProperty('--scroll-y', `${scrollY * speed}px`);
            });
            
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        });
    }

    /**
     * Setup interactive elements
     */
    setupInteractiveElements() {
        // App card hover effects
        this.setupAppCardEffects();
        
        // Button click analytics (could be used for tracking)
        this.setupButtonTracking();
        
        // Feature tag interactions
        this.setupFeatureTagEffects();
        
        // Add loading states to buttons
        this.setupButtonLoadingStates();
    }

    /**
     * Setup app card interactive effects
     */
    setupAppCardEffects() {
        const appCards = document.querySelectorAll('.app-card');
        
        appCards.forEach(card => {
            // Add subtle tilt effect on mouse move
            card.addEventListener('mousemove', (e) => {
                if (window.innerWidth <= 768) return; // Skip on mobile
                
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;
                
                card.style.transform = `
                    perspective(1000px) 
                    rotateX(${rotateX}deg) 
                    rotateY(${rotateY}deg) 
                    translateY(-8px)
                `;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });

            // Add click ripple effect
            card.addEventListener('click', (e) => {
                const ripple = document.createElement('div');
                const rect = card.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, transparent 70%);
                    border-radius: 50%;
                    pointer-events: none;
                    transform: scale(0);
                    animation: ripple 0.6s ease-out;
                `;
                
                card.style.position = 'relative';
                card.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
        });

        // Add ripple animation CSS
        const rippleCSS = `
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = rippleCSS;
        document.head.appendChild(styleSheet);
    }

    /**
     * Setup button tracking and analytics
     */
    setupButtonTracking() {
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const href = button.getAttribute('href');
                const appType = href?.includes('catch-by-flag') ? 'catch-data' : 'geo-mapping';
                
                // Log for analytics (replace with your analytics service)
                console.log(`Button clicked: ${appType} explorer`);
                
                // Could integrate with Google Analytics, Mixpanel, etc.
                // gtag('event', 'click', { event_category: 'navigation', event_label: appType });
            });
        });
    }

    /**
     * Setup feature tag effects
     */
    setupFeatureTagEffects() {
        const featureTags = document.querySelectorAll('.feature-tag');
        
        featureTags.forEach(tag => {
            tag.addEventListener('mouseenter', () => {
                // Add subtle scaling animation
                tag.style.transform = 'translateY(-2px) scale(1.05)';
            });
            
            tag.addEventListener('mouseleave', () => {
                tag.style.transform = '';
            });
        });
    }

    /**
     * Setup button loading states
     */
    setupButtonLoadingStates() {
        const appButtons = document.querySelectorAll('.btn[href]');
        
        appButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Add loading state
                const originalText = button.innerHTML;
                button.innerHTML = `
                    <svg class="btn-icon animate-spin" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                `;
                
                // Reset after navigation (in case user goes back)
                setTimeout(() => {
                    button.innerHTML = originalText;
                }, 1000);
            });
        });

        // Add spinning animation CSS
        const spinCSS = `
            .animate-spin {
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = spinCSS;
        document.head.appendChild(styleSheet);
    }

    /**
     * Setup performance optimizations
     */
    setupPerformanceOptimizations() {
        // Lazy load images if any are added
        this.setupLazyLoading();
        
        // Optimize scroll performance
        this.setupScrollOptimization();
        
        // Preload application pages on hover
        this.setupPreloading();
    }

    /**
     * Setup lazy loading for images
     */
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });

            this.observers.push(imageObserver);
        }
    }

    /**
     * Setup scroll performance optimization
     */
    setupScrollOptimization() {
        let ticking = false;
        
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    // Add scroll-based effects here
                    this.updateScrollProgress();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    /**
     * Update scroll progress indicator
     */
    updateScrollProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = scrollTop / docHeight;
        
        // Could add a progress bar at the top of the page
        document.documentElement.style.setProperty('--scroll-progress', scrollPercent);
    }

    /**
     * Setup preloading for better performance
     */
    setupPreloading() {
        const appButtons = document.querySelectorAll('.btn[href]');
        
        appButtons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                const href = button.getAttribute('href');
                if (href && !button.dataset.preloaded) {
                    // Preload the page
                    const link = document.createElement('link');
                    link.rel = 'prefetch';
                    link.href = href;
                    document.head.appendChild(link);
                    
                    button.dataset.preloaded = 'true';
                }
            });
        });
    }

    /**
     * Add Easter egg functionality
     */
    setupEasterEggs() {
        let clickCount = 0;
        const logo = document.querySelector('.logo-icon');
        
        if (logo) {
            logo.addEventListener('click', () => {
                clickCount++;
                
                if (clickCount === 5) {
                    // Show hidden message
                    const message = document.createElement('div');
                    message.style.cssText = `
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: rgba(37, 99, 235, 0.95);
                        color: white;
                        padding: 2rem;
                        border-radius: 1rem;
                        text-align: center;
                        z-index: 10000;
                        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                    `;
                    message.innerHTML = `
                        <h3>🎉 You found the Easter egg!</h3>
                        <p>Thanks for exploring sustainable fisheries data!</p>
                        <button onclick="this.parentNode.remove()" style="margin-top: 1rem; padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer;">Close</button>
                    `;
                    document.body.appendChild(message);
                    
                    setTimeout(() => message.remove(), 5000);
                    clickCount = 0;
                }
            });
        }
    }

    /**
     * Cleanup function
     */
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
        this.animationQueue = [];
        this.isLoaded = false;
    }
}

// Initialize the landing page app
document.addEventListener('DOMContentLoaded', () => {
    const app = new LandingPageApp();
    app.init();
    
    // Setup Easter eggs
    app.setupEasterEggs();
    
    // Make app globally available for debugging
    window.landingApp = app;
});

// Handle page visibility changes for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when page is hidden
        document.body.classList.add('page-hidden');
    } else {
        // Resume animations when page is visible
        document.body.classList.remove('page-hidden');
    }
});

// Add CSS for page visibility
const visibilityCSS = `
    .page-hidden * {
        animation-play-state: paused !important;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = visibilityCSS;
document.head.appendChild(styleSheet);