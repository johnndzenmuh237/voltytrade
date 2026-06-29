/* =========================================================
   PORTFOLIO.JS — holdings table + allocation chart
   ========================================================= */

(function () {
  'use strict';

  const HOLDINGS = [
    { coin: 'BTC', name: 'Bitcoin', amount: 0.842, price: 67230, chg: 2.31 },
    { coin: 'ETH', name: 'Ethereum', amount: 4.12, price: 3489, chg: 1.12 },
    { coin: 'SOL', name: 'Solana', amount: 38.5, price: 178.4, chg: -0.84 },
    { coin: 'USDT', name: 'Tether', amount: 5200, price: 1, chg: 0.0 },
    { coin: 'LINK', name: 'Chainlink', amount: 120, price: 14.62, chg: 1.78 }
  ];

  const body = document.querySelector('[data-holdings-table]');
  if (body) {
    body.innerHTML = HOLDINGS.map(h => {
      const value = (h.amount * h.price).toLocaleString(undefined, { maximumFractionDigits: 2 });
      const chgCls = h.chg >= 0 ? 'delta-up' : 'delta-down';
      const chgSign = h.chg >= 0 ? '+' : '';
      return `<tr>
        <td><div class="coin-cell"><div class="coin-icon">${h.coin}</div><div><strong>${h.name}</strong><div style="font-size:.78rem;color:var(--muted);">${h.coin}</div></div></div></td>
        <td class="mono">${h.amount}</td>
        <td class="mono">$${h.price.toLocaleString()}</td>
        <td class="mono ${chgCls}">${chgSign}${h.chg}%</td>
        <td class="mono">$${value}</td>
      </tr>`;
    }).join('');
  }

  const totalEl = document.querySelector('[data-portfolio-total]');
  if (totalEl) {
    const total = HOLDINGS.reduce((s, h) => s + h.amount * h.price, 0);
    totalEl.textContent = '$' + total.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

})();
