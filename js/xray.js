/**
 * XRAY.JS
 * Real-Time DOM SEO X-Ray Diagnostics Engine & Side HUD Inspector
 * Triggered via key 'X' or UI buttons
 */

(function () {
  'use strict';

  let isXrayActive = false;

  // DOM Elements
  const xrayDrawer = document.getElementById('seoXrayDrawer');
  const closeXrayBtn = document.getElementById('closeXrayBtn');
  const mastheadBtn = document.getElementById('xrayToggleMasthead');
  const hudBtn = document.getElementById('xrayToggleHud');
  const caseStudyBtn = document.getElementById('openXrayCaseStudyBtn');

  // Diagnostic target fields
  const titleTextEl = document.getElementById('xrayDocTitle');
  const titleCountEl = document.getElementById('xrayTitleChars');
  const titleMeterFill = document.getElementById('xrayTitleMeterFill');
  const descTextEl = document.getElementById('xrayDocDesc');
  const descCountEl = document.getElementById('xrayDescChars');
  const descMeterFill = document.getElementById('xrayDescMeterFill');
  const canonicalUrlEl = document.getElementById('xrayCanonicalUrl');
  const wordCountEl = document.getElementById('xrayWordCount');
  const h1CountEl = document.getElementById('xrayH1Count');
  const h2CountEl = document.getElementById('xrayH2Count');
  const h3CountEl = document.getElementById('xrayH3Count');
  const altCoverageEl = document.getElementById('xrayAltCoverage');
  const schemaTypeEl = document.getElementById('xraySchemaType');
  const internalLinksEl = document.getElementById('xrayInternalLinks');
  const externalLinksEl = document.getElementById('xrayExternalLinks');

  function init() {
    setupEventListeners();
  }

  function setupEventListeners() {
    // Keyboard 'X' toggle
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        toggleXray();
      }
    });

    if (mastheadBtn) mastheadBtn.addEventListener('click', () => toggleXray());
    if (hudBtn) hudBtn.addEventListener('click', () => toggleXray());
    if (caseStudyBtn) caseStudyBtn.addEventListener('click', () => toggleXray(true));
    if (closeXrayBtn) closeXrayBtn.addEventListener('click', () => toggleXray(false));
  }

  /**
   * Toggle X-Ray mode
   */
  function toggleXray(forceState) {
    isXrayActive = forceState !== undefined ? forceState : !isXrayActive;

    document.body.classList.toggle('seo-xray-active', isXrayActive);
    if (xrayDrawer) {
      xrayDrawer.classList.toggle('is-open', isXrayActive);
    }

    // Toggle button active states
    [mastheadBtn, hudBtn].forEach(btn => {
      if (btn) btn.classList.toggle('active', isXrayActive);
    });

    if (isXrayActive) {
      runLiveDomAudit();
    }
  }

  /**
   * Run Live DOM Diagnostic Extraction
   */
  function runLiveDomAudit() {
    // 1. Document Title
    const title = document.title || '';
    const titleLen = title.length;
    if (titleTextEl) titleTextEl.textContent = `"${title}"`;
    if (titleCountEl) titleCountEl.textContent = `${titleLen} / 60 chars (Optimal: 50-60)`;
    if (titleMeterFill) {
      const pct = Math.min((titleLen / 60) * 100, 100);
      titleMeterFill.style.width = `${pct}%`;
      titleMeterFill.className = (titleLen >= 45 && titleLen <= 65) ? 'char-meter-fill' : 'char-meter-fill warn';
    }

    // 2. Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    const descContent = metaDesc ? metaDesc.getAttribute('content') : '';
    const descLen = descContent.length;
    if (descTextEl) descTextEl.textContent = descContent ? `"${descContent}"` : 'Missing <meta name="description">';
    if (descCountEl) descCountEl.textContent = `${descLen} / 160 chars (Optimal: 150-160)`;
    if (descMeterFill) {
      const pct = Math.min((descLen / 160) * 100, 100);
      descMeterFill.style.width = `${pct}%`;
      descMeterFill.className = (descLen >= 140 && descLen <= 165) ? 'char-meter-fill' : 'char-meter-fill warn';
    }

    // 3. Canonical Link
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalUrlEl) {
      canonicalUrlEl.textContent = canonicalLink ? canonicalLink.getAttribute('href') : 'Missing canonical link';
    }

    // 4. Word Count
    const textNodes = document.body.innerText || '';
    const words = textNodes.trim().split(/\s+/).filter(w => w.length > 0).length;
    if (wordCountEl) wordCountEl.textContent = `${words.toLocaleString()} words`;

    // 5. Heading Structure
    const h1s = document.querySelectorAll('h1').length;
    const h2s = document.querySelectorAll('h2').length;
    const h3s = document.querySelectorAll('h3').length;

    if (h1CountEl) {
      h1CountEl.textContent = `${h1s} (Target: Exactly 1)`;
      h1CountEl.className = h1s === 1 ? 'xray-stat-val optimal' : 'xray-stat-val highlight';
    }
    if (h2CountEl) h2CountEl.textContent = `${h2s} headings`;
    if (h3CountEl) h3CountEl.textContent = `${h3s} subsections`;

    // 6. Image Alt Coverage
    const mediaElements = Array.from(document.querySelectorAll('img, svg[role="img"], svg[aria-label]'));
    let withAlt = 0;
    mediaElements.forEach(el => {
      if (el.tagName === 'IMG' && el.getAttribute('alt')) withAlt++;
      else if (el.tagName === 'svg' && (el.getAttribute('aria-label') || el.querySelector('title'))) withAlt++;
    });

    const totalMedia = mediaElements.length || 1;
    const coveragePct = Math.round((withAlt / totalMedia) * 100);
    if (altCoverageEl) {
      altCoverageEl.textContent = `${coveragePct}% (${withAlt}/${totalMedia} audited)`;
      altCoverageEl.className = coveragePct >= 95 ? 'xray-stat-val optimal' : 'xray-stat-val highlight';
    }

    // 7. Schema.org JSON-LD
    const schemaScript = document.querySelector('script[type="application/ld+json"]');
    if (schemaTypeEl && schemaScript) {
      try {
        const json = JSON.parse(schemaScript.textContent);
        const types = json['@graph'] ? json['@graph'].map(item => item['@type']).join(', ') : json['@type'];
        schemaTypeEl.textContent = types || 'Valid JSON-LD Detected';
      } catch (e) {
        schemaTypeEl.textContent = 'JSON-LD parse error';
      }
    }

    // 8. Link breakdown
    const links = Array.from(document.querySelectorAll('a[href]'));
    let internal = 0;
    let external = 0;
    links.forEach(a => {
      const href = a.getAttribute('href');
      if (href.startsWith('#') || href.startsWith('/') || href.includes(window.location.hostname)) {
        internal++;
      } else if (href.startsWith('http')) {
        external++;
      }
    });

    if (internalLinksEl) internalLinksEl.textContent = `${internal} internal anchors`;
    if (externalLinksEl) externalLinksEl.textContent = `${external} citations`;
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', init);

  // Expose
  window.SeoXray = {
    toggle: toggleXray,
    audit: runLiveDomAudit
  };
})();
