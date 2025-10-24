(function() {
  'use strict';

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.documentElement.classList.add('reduced-motion');
  }

  // Enhanced scroll animations with Intersection Observer
  class ScrollAnimations {
    constructor() {
      this.observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
      };
      
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      }, this.observerOptions);
      
      this.init();
    }
    
    init() {
      // Observe all cards for scroll animations
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        this.observer.observe(card);
      });
      
      // Observe info items for staggered animations
      const infoItems = document.querySelectorAll('.info-item, .hobby-item, .project-item, .contact-item');
      infoItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
        this.observer.observe(item);
      });
    }
  }

  // Enhanced sidebar navigation
  class SidebarNavigation {
    constructor() {
      this.sidebar = document.querySelector('.sidebar');
      this.sideLinks = document.querySelectorAll('.side-link');
      this.sections = [];
      this.activeSection = null;
      this.isScrolling = false;
      
      this.init();
    }
    
    init() {
      // Get all sections
      this.sections = Array.from(this.sideLinks).map(link => {
        const href = link.getAttribute('href');
        return document.querySelector(href);
      }).filter(Boolean);
      
      // Setup intersection observer for active section detection
      this.setupSectionObserver();
      
      // Setup click handlers
      this.setupClickHandlers();
      
      // Setup mobile sidebar toggle
      this.setupMobileToggle();
    }
    
    setupSectionObserver() {
      const observer = new IntersectionObserver((entries) => {
        if (this.isScrolling) return;
        
        const visibleSections = entries.filter(entry => entry.isIntersecting);
        if (visibleSections.length === 0) return;
        
        // Find the most visible section
        const mostVisible = visibleSections.reduce((prev, current) => 
          current.intersectionRatio > prev.intersectionRatio ? current : prev
        );
        
        this.setActiveSection(mostVisible.target.id);
      }, {
        root: null,
        rootMargin: '-20% 0px -20% 0px',
        threshold: [0.1, 0.3, 0.5, 0.7, 0.9]
      });
      
      this.sections.forEach(section => observer.observe(section));
    }
    
    setupClickHandlers() {
      this.sideLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const href = link.getAttribute('href');
          const target = document.querySelector(href);
          
          if (target) {
            this.isScrolling = true;
            
            // Smooth scroll to section
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
            
            // Set active immediately
            this.setActiveSection(target.id);
            
            // Reset scrolling flag after animation
            setTimeout(() => {
              this.isScrolling = false;
            }, 1000);
            
            // Close mobile sidebar if open
            this.closeMobileSidebar();
          }
        });
      });
    }
    
    setupMobileToggle() {
      // Create mobile menu button
      const menuButton = document.createElement('button');
      menuButton.className = 'mobile-menu-btn';
      menuButton.innerHTML = `
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `;
      menuButton.setAttribute('aria-label', 'Toggle navigation menu');
      
      // Add to body
      document.body.appendChild(menuButton);
      
      // Toggle sidebar on click
      menuButton.addEventListener('click', () => {
        this.toggleMobileSidebar();
      });
      
      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!this.sidebar.contains(e.target) && !menuButton.contains(e.target)) {
          this.closeMobileSidebar();
        }
      });
    }
    
    setActiveSection(sectionId) {
      // Remove active class from all links and cards
      this.sideLinks.forEach(link => link.classList.remove('active'));
      document.querySelectorAll('.card').forEach(card => card.classList.remove('active'));
      
      // Add active class to current link
      const activeLink = document.querySelector(`.side-link[href="#${sectionId}"]`);
      if (activeLink) {
        activeLink.classList.add('active');
      }
      
      // Add active class to corresponding card
      const activeCard = document.querySelector(`#${sectionId}`)?.closest('.card');
      if (activeCard) {
        activeCard.classList.add('active');
      }
    }
    
    toggleMobileSidebar() {
      this.sidebar.classList.toggle('open');
    }
    
    closeMobileSidebar() {
      this.sidebar.classList.remove('open');
    }
  }

  // Enhanced lightbox with better UX
  class Lightbox {
    constructor() {
      this.overlay = null;
      this.currentIndex = -1;
      this.images = [];
      this.isOpen = false;
      
      this.init();
    }
    
    init() {
      this.createOverlay();
      this.setupImageHandlers();
      this.setupKeyboardNavigation();
    }
    
    createOverlay() {
      this.overlay = document.createElement('div');
      this.overlay.className = 'lightbox-overlay';
      this.overlay.innerHTML = `
        <div class="lightbox-content">
          <button class="lightbox-close" aria-label="Close lightbox">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <button class="lightbox-prev" aria-label="Previous image">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="lightbox-next" aria-label="Next image">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <img class="lightbox-image" alt="">
          <div class="lightbox-counter">
            <span class="current">1</span> / <span class="total">1</span>
          </div>
        </div>
      `;
      
      document.body.appendChild(this.overlay);
      
      // Add styles
      this.addLightboxStyles();
    }
    
    addLightboxStyles() {
      const style = document.createElement('style');
      style.textContent = `
        .lightbox-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        
        .lightbox-overlay.open {
          opacity: 1;
          visibility: visible;
        }
        
        .lightbox-content {
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .lightbox-image {
          max-width: 100%;
          max-height: 100%;
          border-radius: 8px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          transition: transform 0.3s ease;
        }
        
        .lightbox-close,
        .lightbox-prev,
        .lightbox-next {
          position: absolute;
          background: rgba(0, 0, 0, 0.5);
          border: none;
          color: white;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
        }
        
        .lightbox-close {
          top: 20px;
          right: 20px;
        }
        
        .lightbox-prev {
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
        }
        
        .lightbox-next {
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
        }
        
        .lightbox-close:hover,
        .lightbox-prev:hover,
        .lightbox-next:hover {
          background: rgba(0, 0, 0, 0.7);
          transform: translateY(-50%) scale(1.1);
        }
        
        .lightbox-close:hover {
          transform: scale(1.1);
        }
        
        .lightbox-counter {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.5);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          backdrop-filter: blur(10px);
        }
        
        @media (max-width: 768px) {
          .lightbox-prev,
          .lightbox-next {
            width: 40px;
            height: 40px;
          }
          
          .lightbox-prev {
            left: 10px;
          }
          
          .lightbox-next {
            right: 10px;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    setupImageHandlers() {
      const images = document.querySelectorAll('.card-image img');
      this.images = Array.from(images);
      
      images.forEach((img, index) => {
        img.addEventListener('click', () => {
          this.open(index);
        });
      });
    }
    
    setupKeyboardNavigation() {
      document.addEventListener('keydown', (e) => {
        if (!this.isOpen) return;
        
        switch (e.key) {
          case 'Escape':
            this.close();
            break;
          case 'ArrowLeft':
            this.previous();
            break;
          case 'ArrowRight':
            this.next();
            break;
        }
      });
      
      // Close button
      this.overlay.querySelector('.lightbox-close').addEventListener('click', () => {
        this.close();
      });
      
      // Navigation buttons
      this.overlay.querySelector('.lightbox-prev').addEventListener('click', () => {
        this.previous();
      });
      
      this.overlay.querySelector('.lightbox-next').addEventListener('click', () => {
        this.next();
      });
      
      // Close on overlay click
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.close();
        }
      });
    }
    
    open(index) {
      if (index < 0 || index >= this.images.length) return;
      
      this.currentIndex = index;
      this.isOpen = true;
      
      const img = this.overlay.querySelector('.lightbox-image');
      const current = this.overlay.querySelector('.current');
      const total = this.overlay.querySelector('.total');
      
      img.src = this.images[index].src;
      img.alt = this.images[index].alt || '';
      current.textContent = index + 1;
      total.textContent = this.images.length;
      
      this.overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    
    close() {
      this.isOpen = false;
      this.overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
    
    next() {
      const nextIndex = (this.currentIndex + 1) % this.images.length;
      this.open(nextIndex);
    }
    
    previous() {
      const prevIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
      this.open(prevIndex);
    }
  }

  // Enhanced card interactions
  class CardInteractions {
    constructor() {
      this.cards = document.querySelectorAll('.card');
      this.init();
    }
    
    init() {
      this.cards.forEach(card => {
        this.addCardEffects(card);
      });
    }
    
    addCardEffects(card) {
      // Parallax effect on mouse move
      card.addEventListener('mousemove', (e) => {
        if (prefersReducedMotion) return;
        
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
      });
      
      // Reset transform on mouse leave
      card.addEventListener('mouseleave', () => {
        if (prefersReducedMotion) return;
        
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      });
    }
  }

  // Performance optimized scroll handler
  class ScrollHandler {
    constructor() {
      this.ticking = false;
      this.lastScrollY = 0;
      
      this.init();
    }
    
    init() {
      window.addEventListener('scroll', () => {
        if (!this.ticking) {
          requestAnimationFrame(() => {
            this.handleScroll();
            this.ticking = false;
          });
          this.ticking = true;
        }
      });
    }
    
    handleScroll() {
      const scrollY = window.scrollY;
      const direction = scrollY > this.lastScrollY ? 'down' : 'up';
      
      // Add scroll-based effects here if needed
      
      this.lastScrollY = scrollY;
    }
  }

  // Initialize everything when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    try {
      new ScrollAnimations();
      new SidebarNavigation();
      new Lightbox();
      new CardInteractions();
      new ScrollHandler();
    } catch (error) {
      console.warn('Some features failed to initialize:', error);
    }
  });

  // Add mobile menu button styles
  const mobileMenuStyles = document.createElement('style');
  mobileMenuStyles.textContent = `
    .mobile-menu-btn {
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 100;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      width: 48px;
      height: 48px;
      display: none;
      align-items: center;
      justify-content: center;
      color: var(--text-primary);
      cursor: pointer;
      transition: all var(--transition-fast);
      backdrop-filter: blur(10px);
    }
    
    .mobile-menu-btn:hover {
      background: var(--surface-hover);
      transform: scale(1.05);
    }
    
    .mobile-menu-btn svg {
      width: 20px;
      height: 20px;
      stroke: currentColor;
    }
    
    @media (max-width: 768px) {
      .mobile-menu-btn {
        display: flex;
      }
    }
  `;
  document.head.appendChild(mobileMenuStyles);

})();