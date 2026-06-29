/* =========================================================
   DASHBOARD.JS — dashboard widgets & interactions
   ========================================================= */

(function () {
  'use strict';

  /* ---- Sidebar toggle on mobile ---- */
  const sidebarToggle = document.querySelector('[data-sidebar-toggle]');
  const sidebar = document.querySelector('.dash-sidebar');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 && sidebar.classList.contains('open') &&
          !sidebar.contains(e.target) && e.target !== sidebarToggle) {
        sidebar.classList.remove('open');
      }
    });
  }

  /* ---- Render portfolio balance mini chart ---- */
  document.querySelectorAll('[data-chart="balance"]').forEach(canvas => {
    if (window.CEPChart) {
      CEPChart.line(canvas, CEPChart.randomWalk(28, 12000, 350));
    }
  });

  /* ---- Render asset allocation donut ---- */
  document.querySelectorAll('[data-chart="allocation"]').forEach(canvas => {
    if (window.CEPChart) {
      CEPChart.donut(canvas, [
        { label: 'BTC', value: 45, color: getComputedStyle(document.documentElement).getPropertyValue('--mint') },
        { label: 'ETH', value: 28, color: getComputedStyle(document.documentElement).getPropertyValue('--gold') },
        { label: 'Altcoins', value: 17, color: '#8B7CFF' },
        { label: 'Stablecoins', value: 10, color: getComputedStyle(document.documentElement).getPropertyValue('--muted') }
      ]);
    }
  });

  /* ---- Tab switching (generic, used across widgets) ---- */
  document.querySelectorAll('.tab-row').forEach(row => {
    row.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      row.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  /* ---- Security toggles ---- */
  document.querySelectorAll('.toggle').forEach(t => {
    t.addEventListener('click', () => t.classList.toggle('on'));
  });

  /* ---- Mock transactions table population ---- */
  const txBody = document.querySelector('[data-tx-table]');
  if (txBody) {
    const TYPES = ['Deposit', 'Withdrawal', 'Trade', 'Staking reward'];
    const COINS = ['BTC', 'ETH', 'SOL', 'USDT'];
    const rows = Array.from({ length: 8 }, () => {
      const type = TYPES[Math.floor(Math.random() * TYPES.length)];
      const coin = COINS[Math.floor(Math.random() * COINS.length)];
      const amt = (Math.random() * 2).toFixed(4);
      const status = Math.random() > 0.15 ? 'Completed' : 'Pending';
      const date = new Date(Date.now() - Math.random() * 1e10).toLocaleDateString();
      return `<tr>
        <td>${date}</td>
        <td>${type}</td>
        <td class="mono">${amt} ${coin}</td>
        <td><span class="pill ${status === 'Completed' ? 'pill-up' : 'pill-down'}">${status}</span></td>
      </tr>`;
    }).join('');
    txBody.innerHTML = rows;
  }

  /* ---- Copy-to-clipboard for wallet addresses / API keys ---- */
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.dataset.copy;
      navigator.clipboard?.writeText(text).then(() => {
        const original = btn.textContent;
        btn.textContent = 'Copied';
        setTimeout(() => (btn.textContent = original), 1500);
      });
    });
  });

})();
