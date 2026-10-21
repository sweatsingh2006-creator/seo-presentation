/**
 * INTERACTIVE.JS
 * Interactive Widgets: Stepper, History Timeline, Search Simulator, SERP Climb Demo
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initPhaseStepper();
    initHatSpectrum();
    initSearchSimulator();
    initOnSiteOffSiteInspector();
    initSerpClimbChecklist();
  });

  /**
   * SLIDE 4: SEO 5-PHASE STEPPER
   */
  const phaseData = [
    {
      title: "Phase 1: Research & Planning",
      sub: "Strategy Foundation & Discovery",
      deliverables: ["Search intent mapping (Inf/Nav/Tx)", "Competitor content gap analysis", "Keyword difficulty & volume matrix", "Site taxonomy & URL hierarchy"],
      kpis: "Target keyword list, priority roadmap, baseline traffic metrics."
    },
    {
      title: "Phase 2: On-Page Optimization",
      sub: "Content & Code Alignment",
      deliverables: ["Optimized <title> (<60 chars) & <meta> tags", "Strict single <h1> hierarchy with semantic <h2>/<h3>", "Image compression with WebP & rich descriptive alt", "Contextual internal linking with keyword anchors"],
      kpis: "Click-through rate (CTR), dwell time, keyword density hygiene."
    },
    {
      title: "Phase 3: Off-Page SEO",
      sub: "Digital PR & Authority Building",
      deliverables: ["High-authority editorial backlink acquisition", "Digital PR campaigns & unlinked brand mentions", "Guest contributions on authoritative industry blogs", "Nofollow vs dofollow link ratio hygiene"],
      kpis: "Domain Authority (DA/DR), referral traffic, backlink velocity."
    },
    {
      title: "Phase 4: Technical SEO",
      sub: "Infrastructure & Crawlability",
      deliverables: ["Clean robots.txt directives & XML sitemaps", "Core Web Vitals optimization (LCP, INP, CLS)", "Self-referencing canonical tags (rel='canonical')", "Mobile-first responsive viewport & HTTPS security"],
      kpis: "Zero crawl errors in GSC, 95+ Lighthouse score, TTFB < 200ms."
    },
    {
      title: "Phase 5: Monitoring & Maintenance",
      sub: "Iterative Engineering & Recovery",
      deliverables: ["Weekly Google Search Console crawl analysis", "Continuous 404 detection & 301 redirection", "Fighting content decay with updated data & dates", "Core Algorithm Update volatility auditing"],
      kpis: "SERP ranking stability, index coverage, organic revenue."
    }
  ];

  function initPhaseStepper() {
    const stepBtns = document.querySelectorAll('.phase-step-btn');
    const titleEl = document.getElementById('phaseDetailTitle');
    const subEl = document.getElementById('phaseDetailSub');
    const listEl = document.getElementById('phaseDeliverablesList');
    const kpiEl = document.getElementById('phaseKpiValue');

    if (!stepBtns.length || !titleEl) return;

    function renderPhase(index) {
      stepBtns.forEach((btn, i) => btn.classList.toggle('active', i === index));
      const data = phaseData[index];
      titleEl.textContent = data.title;
      subEl.textContent = data.sub;
      listEl.innerHTML = data.deliverables.map(item => `<li>${item}</li>`).join('');
      kpiEl.textContent = data.kpis;
    }

    stepBtns.forEach((btn, index) => {
      btn.addEventListener('click', () => renderPhase(index));
    });

    renderPhase(0);
  }

  /**
   * SLIDE 6: TECHNIQUES SPECTRUM
   */
  function initHatSpectrum() {
    const hatTabs = document.querySelectorAll('.hat-tab-btn');
    const hatCards = document.querySelectorAll('.hat-card');

    if (!hatTabs.length) return;

    hatTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.hat;
        hatTabs.forEach(t => t.classList.toggle('active', t === tab));
        hatCards.forEach(card => {
          if (target === 'all') {
            card.style.display = 'flex';
          } else {
            card.style.display = card.classList.contains(`${target}-hat`) ? 'flex' : 'none';
          }
        });
      });
    });
  }

  /**
   * SLIDE 7: KEYWORD RESEARCH & GOOGLE SEARCH SIMULATOR
   */
  const searchSuggestions = [
    { query: "what is technical seo", intent: "Informational", vol: "49,500/mo", kd: "42" },
    { query: "best seo audit tools 2026", intent: "Commercial", vol: "18,200/mo", kd: "68" },
    { query: "buy ahrefs subscription", intent: "Transactional", vol: "8,100/mo", kd: "79" },
    { query: "google search console login", intent: "Navigational", vol: "301,000/mo", kd: "12" },
    { query: "how to improve core web vitals", intent: "Informational", vol: "22,400/mo", kd: "54" }
  ];

  function initSearchSimulator() {
    const input = document.getElementById('fakeSearchInput');
    const dropdown = document.getElementById('fakeSuggestDropdown');
    const typingQuerySpan = document.getElementById('typingQueryDisplay');

    if (!input || !dropdown) return;

    // Render suggestions
    function renderDropdown(items) {
      dropdown.innerHTML = items.map(item => `
        <div class="suggest-item" data-query="${item.query}">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <span class="mono-xs" style="color: var(--ink-faint);">🔍</span>
            <span>${item.query}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="intent-pill">${item.intent}</span>
            <span class="mono-xs" style="color: var(--accent); font-weight: 600;">${item.vol}</span>
          </div>
        </div>
      `).join('');

      dropdown.querySelectorAll('.suggest-item').forEach(el => {
        el.addEventListener('click', () => {
          input.value = el.dataset.query;
          if (typingQuerySpan) typingQuerySpan.textContent = el.dataset.query;
        });
      });
    }

    renderDropdown(searchSuggestions);

    input.addEventListener('input', (e) => {
      const val = e.target.value.toLowerCase().trim();
      if (!val) {
        renderDropdown(searchSuggestions);
        return;
      }
      const filtered = searchSuggestions.filter(s => s.query.toLowerCase().includes(val));
      if (filtered.length > 0) {
        renderDropdown(filtered);
      } else {
        renderDropdown([{ query: val, intent: "Custom Query", vol: "Tracking...", kd: "--" }]);
      }
    });

    // Auto-type demo when slide 7 triggers
    let isTyping = false;
    window.addEventListener('slideChanged', (e) => {
      if (e.detail.index === 6 && !isTyping) { // Slide 7
        const demoText = "search engine optimization guide";
        input.value = "";
        let i = 0;
        isTyping = true;
        const typeInterval = setInterval(() => {
          if (i < demoText.length) {
            input.value += demoText.charAt(i);
            i++;
          } else {
            clearInterval(typeInterval);
            isTyping = false;
          }
        }, 65);
      }
    });
  }

  /**
   * SLIDE 8: ON-SITE vs OFF-SITE INSPECTOR
   */
  function initOnSiteOffSiteInspector() {
    const tagPills = document.querySelectorAll('.tag-inspect-pill');
    const previewBox = document.getElementById('inspectorPreviewBox');

    if (!tagPills.length || !previewBox) return;

    const inspectorData = {
      title: {
        type: "ON-SITE // HEAD METADATA",
        title: "<title> Primary Anchor",
        desc: "Optimal length: 50-60 characters. Must contain primary keyword near the beginning, followed by brand separator.",
        code: '<title>Search Engine Optimization Guide | AIT Pune</title>'
      },
      headings: {
        type: "ON-SITE // SEMANTIC HIERARCHY",
        title: "Exact Single <h1> Tag",
        desc: "Search crawlers build document outline starting from h1. Strictly one h1 per page, nested logically with h2 and h3.",
        code: '<h1>Search Engine Optimization</h1>\n<h2>How Search Engines Work</h2>'
      },
      alt: {
        type: "ON-SITE // ACCESSIBILITY & MEDIA",
        title: "Image Alt-Text Attributes",
        desc: "Enables Google Images indexing and screen reader accessibility. Must be descriptive, natural, without keyword stuffing.",
        code: '<img src="spider-bot.svg" alt="Googlebot crawler analyzing web graph hyperlinks">'
      },
      cwv: {
        type: "ON-SITE // CORE WEB VITALS",
        title: "Page Speed & Usability Signals",
        desc: "LCP (Largest Contentful Paint) < 2.5s, INP (Interaction to Next Paint) < 200ms, CLS (Cumulative Layout Shift) < 0.1.",
        code: 'LCP: 0.8s (Good) | INP: 42ms (Good) | CLS: 0.00 (Zero Shift)'
      },
      backlinks: {
        type: "OFF-SITE // HYPERLINK AUTHORITY",
        title: "Dofollow Inbound Backlinks",
        desc: "Editorial links from reputable .edu, .org, or high-DR domains act as peer-reviewed votes of algorithmic confidence.",
        code: '<a href="https://your-site.edu" rel="dofollow">Peer Cited Authority</a>'
      },
      anchor: {
        type: "OFF-SITE // ANCHOR TEXT HYGIENE",
        title: "Natural Anchor Distribution",
        desc: "Healthy link profiles maintain balanced anchor distributions: 40% branded, 30% natural/generic, 20% partial match, 10% exact match.",
        code: 'Anchor Profiles: Branded (40%) | Partial-Match (25%) | Naked URL (20%)'
      },
      pr: {
        type: "OFF-SITE // BRAND ENTITY RECOGNITION",
        title: "Digital PR & Brand Mentions",
        desc: "Google's Knowledge Graph extracts unlinked entity mentions across authoritative press publications to score brand authority.",
        code: '"Army Institute of Technology, Pune publishes comprehensive SEO study."'
      }
    };

    tagPills.forEach(pill => {
      pill.addEventListener('click', () => {
        tagPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const key = pill.dataset.inspect;
        const item = inspectorData[key];
        if (item) {
          previewBox.innerHTML = `
            <div class="mono-xs" style="color: var(--accent); margin-bottom: 0.25rem;">${item.type}</div>
            <h4 style="font-family: var(--font-serif); font-size: 1.3rem; margin-bottom: 0.4rem;">${item.title}</h4>
            <p style="font-size: var(--text-sm); margin-bottom: 0.75rem;">${item.desc}</p>
            <div class="xray-tag-preview">${escapeHtml(item.code)}</div>
          `;
        }
      });
    });
  }

  /**
   * SLIDE 13: CHECKLIST & DYNAMIC SERP CLIMB SIMULATION
   */
  function initSerpClimbChecklist() {
    const checkboxes = document.querySelectorAll('.serp-checklist-input');
    const serpRankEl = document.getElementById('liveSerpRank');
    const targetItem = document.getElementById('targetSerpItem');
    const serpContainer = document.getElementById('mockSerpList');
    const ctrProjectionEl = document.getElementById('projectedCtrValue');

    if (!checkboxes.length || !serpRankEl || !targetItem) return;

    const rankSchedule = [
      { checked: 0, rank: "#9", ctr: "1.4%", pos: 8 },
      { checked: 1, rank: "#8", ctr: "2.1%", pos: 7 },
      { checked: 2, rank: "#7", ctr: "3.2%", pos: 6 },
      { checked: 3, rank: "#6", ctr: "4.8%", pos: 5 },
      { checked: 4, rank: "#5", ctr: "7.2%", pos: 4 },
      { checked: 5, rank: "#4", ctr: "11.5%", pos: 3 },
      { checked: 6, rank: "#3", ctr: "18.6%", pos: 2 },
      { checked: 7, rank: "#2", ctr: "24.8%", pos: 1 },
      { checked: 8, rank: "#1", ctr: "39.6% (Top Result!)", pos: 0 }
    ];

    function updateRank() {
      let count = 0;
      checkboxes.forEach(cb => {
        if (cb.checked) count++;
      });

      const sched = rankSchedule[count];
      serpRankEl.textContent = sched.rank;
      if (ctrProjectionEl) ctrProjectionEl.textContent = sched.ctr;

      // Animate position in the SERP list
      if (serpContainer && targetItem) {
        if (sched.pos === 0) {
          serpContainer.prepend(targetItem);
          targetItem.style.borderColor = 'var(--accent)';
          targetItem.style.boxShadow = 'var(--shadow-print-accent)';
        } else {
          const children = Array.from(serpContainer.querySelectorAll('.mock-serp-item:not(#targetSerpItem)'));
          if (children[sched.pos]) {
            serpContainer.insertBefore(targetItem, children[sched.pos]);
          } else {
            serpContainer.appendChild(targetItem);
          }
        }
      }
    }

    checkboxes.forEach(cb => {
      cb.addEventListener('change', updateRank);
    });

    updateRank();
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
})();
