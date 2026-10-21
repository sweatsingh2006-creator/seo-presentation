/**
 * ANIMATIONS.JS
 * GSAP + ScrollTrigger integration, Pipeline Visualization & Counter Animations
 */

(function () {
  'use strict';

  // Wait for DOM
  document.addEventListener('DOMContentLoaded', () => {
    initPipelineAnimation();
    initLighthouseCounters();
    initGSAPScrollTriggers();
  });

  /**
   * GSAP ScrollTrigger Integration
   */
  function initGSAPScrollTriggers() {
    if (typeof gsap === 'undefined') return;

    // Register ScrollTrigger if loaded
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Headline Mask Revealer
    const slides = document.querySelectorAll('.slide-section');
    slides.forEach((slide) => {
      const headings = slide.querySelectorAll('.reveal-inner');
      if (headings.length > 0) {
        gsap.fromTo(
          headings,
          { y: '110%', opacity: 0 },
          {
            y: '0%',
            opacity: 1,
            duration: 0.85,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: slide,
              start: 'top 60%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }
    });
  }

  /**
   * SLIDE 3: SEARCH ENGINE PIPELINE ANIMATION
   * Crawling -> Indexing -> Ranking
   */
  let pipelineTimer = null;
  let currentPipelineStep = 1;

  function initPipelineAnimation() {
    const step1Btn = document.getElementById('pipeBtnCrawl');
    const step2Btn = document.getElementById('pipeBtnIndex');
    const step3Btn = document.getElementById('pipeBtnRank');
    const autoBtn = document.getElementById('pipeBtnAuto');

    if (!step1Btn || !step2Btn || !step3Btn) return;

    step1Btn.addEventListener('click', () => setPipelineStep(1));
    step2Btn.addEventListener('click', () => setPipelineStep(2));
    step3Btn.addEventListener('click', () => setPipelineStep(3));

    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        if (pipelineTimer) {
          clearInterval(pipelineTimer);
          pipelineTimer = null;
          autoBtn.textContent = '▶ Auto Play';
          autoBtn.classList.remove('active');
        } else {
          autoBtn.textContent = '⏸ Pause';
          autoBtn.classList.add('active');
          pipelineTimer = setInterval(() => {
            currentPipelineStep = (currentPipelineStep % 3) + 1;
            setPipelineStep(currentPipelineStep);
          }, 2400);
        }
      });
    }

    // Default to Step 1
    setPipelineStep(1);

    // Auto-trigger when slide 3 becomes active
    window.addEventListener('slideChanged', (e) => {
      if (e.detail.index === 2) { // 0-indexed slide 3
        setPipelineStep(1);
      }
    });
  }

  function setPipelineStep(step) {
    currentPipelineStep = step;

    // Columns
    const colCrawl = document.getElementById('pipeColCrawl');
    const colIndex = document.getElementById('pipeColIndex');
    const colRank = document.getElementById('pipeColRank');

    // SVGs
    const spiderSvg = document.getElementById('spiderBotSvg');
    const indexSvg = document.getElementById('indexDbSvg');
    const rankSvg = document.getElementById('rankStackSvg');

    // Status description
    const statusText = document.getElementById('pipelineLiveStatus');

    [colCrawl, colIndex, colRank].forEach((col, idx) => {
      if (col) col.classList.toggle('active', idx + 1 === step);
    });

    // Reset animations
    if (spiderSvg) spiderSvg.classList.remove('is-animating');
    if (indexSvg) indexSvg.classList.remove('is-animating');

    if (step === 1) {
      if (spiderSvg) spiderSvg.classList.add('is-animating');
      if (statusText) {
        statusText.innerHTML = '<strong>PHASE 1 (CRAWLING):</strong> Googlebot spider parses sitemap &amp; traverses hyperlinked web graph, downloading HTML payload.';
      }
    } else if (step === 2) {
      if (indexSvg) indexSvg.classList.add('is-animating');
      if (statusText) {
        statusText.innerHTML = '<strong>PHASE 2 (INDEXING):</strong> Parser tokenizes terms, analyzes text structure, schemas, and commits documents into the Inverted Index DB.';
      }
    } else if (step === 3) {
      if (statusText) {
        statusText.innerHTML = '<strong>PHASE 3 (RANKING):</strong> Real-time query matching, PageRank evaluation, E-E-A-T scoring, and Core Web Vitals compute final SERP order.';
      }
    }
  }

  /**
   * SLIDE 7: LIGHTHOUSE 100/100/100/100 SCORE COUNTERS
   */
  function initLighthouseCounters() {
    let hasAnimated = false;

    window.addEventListener('slideChanged', (e) => {
      // Trigger on Slide 7 (0-indexed 6) or Slide 14
      if ((e.detail.index === 6 || e.detail.index === 13) && !hasAnimated) {
        hasAnimated = true;
        animateCounters();
      }
    });
  }

  function animateCounters() {
    const scoreElements = [
      { id: 'lhPerfScore', target: 100 },
      { id: 'lhAccScore', target: 100 },
      { id: 'lhBpScore', target: 100 },
      { id: 'lhSeoScore', target: 100 }
    ];

    scoreElements.forEach((item, index) => {
      const el = document.getElementById(item.id);
      if (!el) return;

      setTimeout(() => {
        let current = 0;
        const duration = 1200;
        const startTime = performance.now();

        function update(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const easedProgress = 1 - Math.pow(1 - progress, 3);
          current = Math.round(easedProgress * item.target);
          el.textContent = current;

          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            el.textContent = item.target;
          }
        }

        requestAnimationFrame(update);
      }, index * 120);
    });
  }
})();
