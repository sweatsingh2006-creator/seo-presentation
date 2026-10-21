/**
 * PRESENTATION.JS
 * Core Slide Deck Navigation, Projector Controls & Custom Editorial Cursor
 */

(function () {
  'use strict';

  // State
  let currentSlideIndex = 0;
  const slides = Array.from(document.querySelectorAll('.slide-section'));
  const totalSlides = slides.length;
  let isNavigating = false;

  // DOM Elements
  const progressBar = document.getElementById('presentationProgressBar');
  const currentCounterEl = document.getElementById('hudCurrentSlide');
  const totalCounterEl = document.getElementById('hudTotalSlides');
  const prevBtn = document.getElementById('hudPrevBtn');
  const nextBtn = document.getElementById('hudNextBtn');
  const menuBtn = document.getElementById('hudMenuBtn');
  const fullscreenBtn = document.getElementById('hudFullscreenBtn');
  const navigatorModal = document.getElementById('slideNavigatorModal');
  const closeNavigatorBtn = document.getElementById('closeNavigatorBtn');
  const navigatorGrid = document.getElementById('navigatorGrid');

  // Custom Cursor Elements
  const cursorDot = document.querySelector('.custom-cursor-dot');
  const cursorRing = document.querySelector('.custom-cursor-ring');

  /**
   * Initialize Presentation System
   */
  function init() {
    if (totalCounterEl) {
      totalCounterEl.textContent = String(totalSlides).padStart(2, '0');
    }

    setupIntersectionObserver();
    setupKeyboardNavigation();
    setupPresenterControls();
    setupSlideNavigator();
    setupCustomCursor();
    updateSlideState(0);

    // Ensure presentation mode class is active
    document.documentElement.classList.add('presentation-mode');
    document.body.classList.add('presentation-mode');
  }

  /**
   * Slide Intersection Observer for natural scroll-snapping
   */
  function setupIntersectionObserver() {
    const observerOptions = {
      root: null,
      threshold: 0.55
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = slides.indexOf(entry.target);
          if (index !== -1 && index !== currentSlideIndex) {
            updateSlideState(index);
          }
        }
      });
    }, observerOptions);

    slides.forEach(slide => observer.observe(slide));
  }

  /**
   * Update active slide UI & trigger reveals
   */
  function updateSlideState(index) {
    currentSlideIndex = index;

    // Update Counter
    if (currentCounterEl) {
      currentCounterEl.textContent = String(index + 1).padStart(2, '0');
    }

    // Update Progress Bar
    if (progressBar) {
      const progressPercent = ((index + 1) / totalSlides) * 100;
      progressBar.style.width = `${progressPercent}%`;
    }

    // Update active classes for animation triggering
    slides.forEach((slide, i) => {
      if (i === index) {
        slide.classList.add('is-active');
        // Announce slide title for screen readers
        const heading = slide.querySelector('h1, h2');
        if (heading) {
          heading.setAttribute('tabindex', '-1');
        }
      } else {
        slide.classList.remove('is-active');
      }
    });

    // Update URL hash without breaking history
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, null, `#slide-${index + 1}`);
    }

    // Update modal active state
    if (navigatorGrid) {
      const navItems = navigatorGrid.querySelectorAll('.nav-slide-item');
      navItems.forEach((item, i) => {
        item.classList.toggle('active', i === index);
      });
    }

    // Broadcast slide changed event for interactive widgets
    window.dispatchEvent(new CustomEvent('slideChanged', { detail: { index } }));
  }

  /**
   * Navigate to specific slide index
   */
  function goToSlide(index, smooth = true) {
    if (index < 0 || index >= totalSlides) return;
    isNavigating = true;

    slides[index].scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: 'start'
    });

    updateSlideState(index);

    setTimeout(() => {
      isNavigating = false;
    }, 450);
  }

  function nextSlide() {
    if (currentSlideIndex < totalSlides - 1) {
      goToSlide(currentSlideIndex + 1);
    }
  }

  function prevSlide() {
    if (currentSlideIndex > 0) {
      goToSlide(currentSlideIndex - 1);
    }
  }

  /**
   * Keyboard Navigation
   */
  function setupKeyboardNavigation() {
    window.addEventListener('keydown', (e) => {
      // Don't intercept if user is typing in an active text input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ': // Spacebar
          e.preventDefault();
          nextSlide();
          break;

        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          prevSlide();
          break;

        case 'Home':
          e.preventDefault();
          goToSlide(0);
          break;

        case 'End':
          e.preventDefault();
          goToSlide(totalSlides - 1);
          break;

        case 'm':
        case 'M':
          e.preventDefault();
          toggleNavigator();
          break;

        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;

        case 'p':
        case 'P':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            window.print();
          }
          break;

        case 'Escape':
          if (navigatorModal && navigatorModal.classList.contains('is-open')) {
            toggleNavigator(false);
          }
          break;
      }
    });
  }

  /**
   * Presenter HUD Controls
   */
  function setupPresenterControls() {
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (menuBtn) menuBtn.addEventListener('click', () => toggleNavigator());
    if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);

    // Start presentation CTA on cover slide
    const startDeckBtn = document.getElementById('startPresentationBtn');
    if (startDeckBtn) {
      startDeckBtn.addEventListener('click', (e) => {
        e.preventDefault();
        nextSlide();
      });
    }

    // Restart presentation CTA on last slide
    const restartDeckBtn = document.getElementById('restartPresentationBtn');
    if (restartDeckBtn) {
      restartDeckBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToSlide(0);
      });
    }
  }

  /**
   * Fullscreen Toggle
   */
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  /**
   * Slide Navigator Modal (Press M)
   */
  function setupSlideNavigator() {
    if (!navigatorModal || !navigatorGrid) return;

    // Populate grid
    navigatorGrid.innerHTML = '';
    slides.forEach((slide, index) => {
      const heading = slide.querySelector('h1, h2');
      const categoryTag = slide.querySelector('.slide-category-tag');
      const title = heading ? heading.textContent.replace(/\s+/g, ' ').trim() : `Slide ${index + 1}`;
      const category = categoryTag ? categoryTag.textContent.trim() : 'MODULE';

      const item = document.createElement('a');
      item.href = `#slide-${index + 1}`;
      item.className = `nav-slide-item ${index === currentSlideIndex ? 'active' : ''}`;
      item.innerHTML = `
        <span class="nav-slide-num">${String(index + 1).padStart(2, '0')}</span>
        <div>
          <div class="mono-xs" style="color: var(--ink-faint); margin-bottom: 2px;">${category}</div>
          <div class="nav-slide-title">${title}</div>
        </div>
      `;

      item.addEventListener('click', (e) => {
        e.preventDefault();
        goToSlide(index);
        toggleNavigator(false);
      });

      navigatorGrid.appendChild(item);
    });

    if (closeNavigatorBtn) {
      closeNavigatorBtn.addEventListener('click', () => toggleNavigator(false));
    }

    navigatorModal.addEventListener('click', (e) => {
      if (e.target === navigatorModal) {
        toggleNavigator(false);
      }
    });
  }

  function toggleNavigator(forceState) {
    if (!navigatorModal) return;
    const shouldOpen = forceState !== undefined ? forceState : !navigatorModal.classList.contains('is-open');
    navigatorModal.classList.toggle('is-open', shouldOpen);

    if (shouldOpen) {
      // Focus first active item
      const activeItem = navigatorGrid.querySelector('.nav-slide-item.active') || navigatorGrid.querySelector('.nav-slide-item');
      if (activeItem) activeItem.focus();
    }
  }

  /**
   * Custom Editorial Magnetic Cursor
   */
  function setupCustomCursor() {
    if (!cursorDot || !cursorRing) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    });

    // Smooth ring lag
    function renderRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      requestAnimationFrame(renderRing);
    }
    renderRing();

    // Hover effect on interactive elements
    const hoverTargets = 'a, button, input, label, select, summary, .interactive-item, .tag-inspect-pill, .timeline-node-card';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverTargets)) {
        document.body.classList.add('cursor-hover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverTargets)) {
        document.body.classList.remove('cursor-hover');
      }
    });
  }

  // Handle URL hash on load
  window.addEventListener('load', () => {
    init();
    if (window.location.hash) {
      const match = window.location.hash.match(/#slide-(\d+)/);
      if (match && match[1]) {
        const targetIndex = parseInt(match[1], 10) - 1;
        if (targetIndex >= 0 && targetIndex < totalSlides) {
          goToSlide(targetIndex, false);
        }
      }
    }
  });

  // Expose global methods for inline clicks
  window.PresentationApp = {
    goToSlide,
    nextSlide,
    prevSlide,
    toggleNavigator,
    toggleFullscreen
  };
})();
