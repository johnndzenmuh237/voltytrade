/* =========================================================
   AUTH-GUARD.JS — protects dashboard pages on the client side
   This is a belt-and-suspenders check: server.js already
   redirects unauthenticated requests to /dashboard/* at the
   HTTP level. This script additionally fetches the real user
   record so the page can render actual account data instead
   of a placeholder name.
   ========================================================= */

(function () {
  'use strict';

  async function loadCurrentUser() {
    try {
      const res = await fetch('/api/me', { credentials: 'same-origin' });
      if (!res.ok) {
        window.location.href = '/auth/login.html';
        return;
      }
      const user = await res.json();
      document.querySelectorAll('[data-user-firstname]').forEach(el => el.textContent = user.firstName);
      document.querySelectorAll('[data-user-fullname]').forEach(el => el.textContent = `${user.firstName} ${user.lastName}`);
      document.querySelectorAll('[data-user-email]').forEach(el => el.textContent = user.email);
    } catch (err) {
      // Network failure — don't bounce the user, just leave placeholders.
      console.error('Could not load account info:', err);
    }
  }

  document.querySelectorAll('[data-logout]').forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try {
        await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
      } finally {
        window.location.href = '/auth/login.html';
      }
    });
  });

  loadCurrentUser();
})();
