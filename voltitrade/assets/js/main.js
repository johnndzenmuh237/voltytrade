/* =========================================================
   MAIN.JS — global site behaviour
   ========================================================= */

(function () {
  'use strict';

  /* ---- Mobile menu ---- */
  const burger = document.querySelector('.nav-burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
    mobileMenu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => mobileMenu.classList.remove('open'))
    );
  }

  /* ---- Theme toggle (dark / light), persisted ---- */
  const root = document.documentElement;
  const themeBtn = document.querySelector('.theme-toggle');
  const savedTheme = localStorage.getItem('cep-theme');
  if (savedTheme) root.setAttribute('data-theme', savedTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const next = current === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      localStorage.setItem('cep-theme', next);
      themeBtn.textContent = next === 'light' ? '☀' : '☾';
    });
    themeBtn.textContent = root.getAttribute('data-theme') === 'light' ? '☀' : '☾';
  }

  /* ---- Animated stat counters (IntersectionObserver) ---- */
  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length && 'IntersectionObserver' in window) {
    const animateCounter = (el) => {
      const target = parseFloat(el.dataset.counter);
      const suffix = el.dataset.suffix || '';
      const duration = 1200;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const value = target * (1 - Math.pow(1 - progress, 3)); // ease-out
        el.textContent = (target % 1 === 0 ? Math.floor(value) : value.toFixed(1)) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(c => obs.observe(c));
  }

  /* ---- Live market ticker strip (top of page) ----
     Pulls real prices from /api/prices (server-side proxy to
     CoinGecko). Falls back to the mock list below only if the
     request fails, so the page never breaks on a network hiccup. */
  const tickerTrack = document.querySelector('.ticker-track');
  const FALLBACK_PAIRS = [
    ['BTC/USDT', 67230.12, 2.31], ['ETH/USDT', 3489.55, 1.12], ['SOL/USDT', 178.40, -0.84],
    ['BNB/USDT', 612.30, 0.45], ['XRP/USDT', 0.612, -1.20], ['ADA/USDT', 0.452, 3.02],
    ['DOGE/USDT', 0.158, 4.55], ['AVAX/USDT', 39.21, -2.10], ['DOT/USDT', 6.88, 0.92],
    ['LINK/USDT', 14.62, 1.78]
  ];
  const COINGECKO_ID_TO_SYMBOL = {
    bitcoin: 'BTC', ethereum: 'ETH', solana: 'SOL', binancecoin: 'BNB',
    ripple: 'XRP', cardano: 'ADA', dogecoin: 'DOGE', 'avalanche-2': 'AVAX',
    polkadot: 'DOT', chainlink: 'LINK'
  };

  function renderTickerRows(pairs) {
    if (!tickerTrack) return;
    const rowsHtml = pairs.map(([sym, price, chg]) => {
      const cls = chg >= 0 ? 'up' : 'down';
      const arrow = chg >= 0 ? '▲' : '▼';
      const priceStr = price < 1 ? price.toFixed(3) : price.toLocaleString(undefined, { maximumFractionDigits: 2 });
      return `<span class="item">${sym} <strong>$${priceStr}</strong> <span class="${cls}">${arrow} ${Math.abs(chg).toFixed(2)}%</span></span>`;
    }).join('');
    tickerTrack.innerHTML = rowsHtml + rowsHtml; // duplicate for seamless scroll

    const heroTickerRows = document.querySelector('.ticker-rows');
    if (heroTickerRows) {
      heroTickerRows.innerHTML = pairs.slice(0, 4).map(([sym, price, chg]) => {
        const cls = chg >= 0 ? 'up' : 'down';
        const arrow = chg >= 0 ? '▲' : '▼';
        const priceStr = price < 1 ? price.toFixed(3) : price.toLocaleString(undefined, { maximumFractionDigits: 2 });
        return `<div class="ticker-row"><span>${sym}</span><span>$${priceStr}</span><span class="${cls}">${arrow} ${Math.abs(chg).toFixed(2)}%</span></div>`;
      }).join('');
    }
  }

  async function loadLivePrices() {
    try {
      const res = await fetch('/api/prices');
      if (!res.ok) throw new Error('Price feed unavailable');
      const { prices } = await res.json();
      const pairs = Object.entries(prices).map(([id, info]) => [
        `${COINGECKO_ID_TO_SYMBOL[id] || id.toUpperCase()}/USDT`,
        info.usd,
        info.usd_24h_change || 0
      ]);
      if (pairs.length) renderTickerRows(pairs);
      else renderTickerRows(FALLBACK_PAIRS);
    } catch (err) {
      renderTickerRows(FALLBACK_PAIRS); // no backend reachable (e.g. static file preview) — use mock data
    }
  }
  loadLivePrices();

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.faq-item .faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* ---- Generic dropdown for notifications/profile menus ---- */
  document.querySelectorAll('[data-dropdown-trigger]').forEach(trigger => {
    const panel = document.getElementById(trigger.dataset.dropdownTrigger);
    if (!panel) return;
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.toggle('open');
    });
    document.addEventListener('click', () => panel.classList.remove('open'));
  });

  /* ---- Markets table (markets.html) — real data via /api/markets ---- */
  const marketsTableBody = document.querySelector('[data-markets-table]');
  if (marketsTableBody) {
    (async function loadMarketsTable() {
      try {
        const res = await fetch('/api/markets');
        if (!res.ok) throw new Error('Markets unavailable');
        const { markets } = await res.json();
        marketsTableBody.innerHTML = markets.map((m, i) => {
          const chg = m.price_change_percentage_24h || 0;
          const cls = chg >= 0 ? 'delta-up' : 'delta-down';
          const sign = chg >= 0 ? '+' : '';
          return `<tr>
            <td class="mono">${i + 1}</td>
            <td><div class="coin-cell"><div class="coin-icon">${(m.symbol || '').toUpperCase().slice(0, 4)}</div><div><strong>${m.name}</strong><div style="font-size:.78rem;color:var(--muted);">${(m.symbol || '').toUpperCase()}</div></div></div></td>
            <td class="mono">$${m.current_price.toLocaleString(undefined, { maximumFractionDigits: 6 })}</td>
            <td class="mono ${cls}">${sign}${chg.toFixed(2)}%</td>
            <td class="mono">$${(m.market_cap || 0).toLocaleString()}</td>
            <td class="mono">$${(m.total_volume || 0).toLocaleString()}</td>
            <td><a href="exchange.html" class="btn btn-sm btn-ghost">Trade</a></td>
          </tr>`;
        }).join('');
      } catch (err) {
        marketsTableBody.innerHTML = `<tr><td colspan="7" class="text-center" style="color:var(--muted);padding:32px;">Live market data is temporarily unavailable. Please try again shortly.</td></tr>`;
      }
    })();
  }

})();
/**
 * mobile-nav-fix.js
 * Drop this script at the bottom of <body>, after your existing scripts.
 * It rebuilds the mobile drawer with a working Resources accordion,
 * a backdrop, and a close button — no changes to your HTML needed.
 */

(function () {
  "use strict";

  /* ── 1. Grab elements ──────────────────────────────────────── */
  const navToggle   = document.querySelector(".nav-toggle");
  const drawer      = document.querySelector(".mobile-drawer");

  if (!navToggle || !drawer) return; // nothing to fix

  /* ── 2. Inject a backdrop div (once) ──────────────────────── */
  let backdrop = document.querySelector(".mobile-drawer-backdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.className = "mobile-drawer-backdrop";
    document.body.appendChild(backdrop);
  }

  /* ── 3. Inject a close button inside the drawer (once) ────── */
  if (!drawer.querySelector(".mobile-drawer-close")) {
    const closeBtn = document.createElement("button");
    closeBtn.className  = "mobile-drawer-close";
    closeBtn.setAttribute("aria-label", "Close menu");
    closeBtn.innerHTML  =
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
         <path d="M18 6 6 18M6 6l12 12"/>
       </svg>`;
    drawer.prepend(closeBtn);
    closeBtn.addEventListener("click", closeDrawer);
  }

  /* ── 4. Rebuild the Resources section as an accordion ──────── */
  //
  // The original HTML lists Resources sub-links as flat <a> tags.
  // We replace them with a toggle button + collapsible sub-list.
  //
  const subLinkDefs = [
    { href: "whitepaper.html",                 label: "Whitepaper"    },
    { href: "team.html",                        label: "Team"          },
    { href: "faq.html",                         label: "FAQ"           },
    { href: "blog.html",                        label: "Blog"          },
    { href: "documentation/installation.html",  label: "Documentation" },
  ];

  // Remove any leftover flat sub-links that may already be in the drawer
  // (they were added in the original HTML for the Resources section)
  const existingSubHrefs = subLinkDefs.map(d => d.href);
  drawer.querySelectorAll("a").forEach(a => {
    if (existingSubHrefs.some(h => a.getAttribute("href") === h)) {
      a.remove();
    }
  });

  // Find the Contact link — we'll insert the accordion before it
  const contactLink = [...drawer.querySelectorAll("a")].find(
    a => a.getAttribute("href") === "contact.html" &&
         a.textContent.trim() === "Contact"
  );

  if (contactLink && !drawer.querySelector(".mobile-parent-btn")) {
    // Build the accordion toggle
    const parentBtn = document.createElement("button");
    parentBtn.className = "mobile-parent-btn";
    parentBtn.setAttribute("aria-expanded", "false");
    parentBtn.innerHTML =
      `Resources
       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
         <path d="M6 9l6 6 6-6"/>
       </svg>`;

    // Build the collapsible sub-list
    const subList = document.createElement("div");
    subList.className = "mobile-sub-links";
    subLinkDefs.forEach(({ href, label }) => {
      const a = document.createElement("a");
      a.href = href;
      a.textContent = label;
      subList.appendChild(a);
    });

    // Toggle logic
    parentBtn.addEventListener("click", () => {
      const open = subList.classList.toggle("is-open");
      parentBtn.classList.toggle("is-open", open);
      parentBtn.setAttribute("aria-expanded", String(open));
    });

    // Insert before the Contact link
    drawer.insertBefore(parentBtn, contactLink);
    drawer.insertBefore(subList, contactLink);
  }

  /* ── 5. Open / close helpers ───────────────────────────────── */
  function openDrawer() {
    drawer.classList.add("is-open");
    backdrop.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden"; // prevent page scroll
  }

  function closeDrawer() {
    drawer.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  /* ── 6. Wire up toggle button & backdrop ──────────────────── */
  navToggle.addEventListener("click", () => {
    const isOpen = drawer.classList.contains("is-open");
    isOpen ? closeDrawer() : openDrawer();
  });

  backdrop.addEventListener("click", closeDrawer);

  // Close on Escape key
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) {
      closeDrawer();
    }
  });

  // Close when a final destination link (not the Resources toggle) is tapped
  drawer.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", closeDrawer);
  });
  // Also close on future sub-links added dynamically
  drawer.addEventListener("click", e => {
    if (e.target.tagName === "A") closeDrawer();
  });

})();
