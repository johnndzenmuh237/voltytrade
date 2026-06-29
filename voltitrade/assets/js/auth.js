/* =========================================================
   AUTH.JS — real client-side wiring for register/login forms
   Talks to the actual backend in server.js. No mock data,
   no localStorage pretend-auth: success here means a real
   session cookie was set by the server.
   ========================================================= */

(function () {
  'use strict';

  function showError(message) {
    const el = document.getElementById('form-error');
    if (!el) return alert(message);
    el.textContent = message;
    el.style.display = 'block';
  }

  function hideError() {
    const el = document.getElementById('form-error');
    if (el) el.style.display = 'none';
  }

  function setLoading(button, loading, loadingText, normalText) {
    if (!button) return;
    button.disabled = loading;
    button.textContent = loading ? loadingText : normalText;
  }

  /* ---- Register ---- */
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideError();
      const submitBtn = document.getElementById('register-submit');
      setLoading(submitBtn, true, 'Creating account…', 'Create account');

      const payload = {
        firstName: document.getElementById('fname').value.trim(),
        lastName: document.getElementById('lname').value.trim(),
        email: document.getElementById('reg-email').value.trim(),
        password: document.getElementById('reg-password').value
      };

      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (!res.ok) {
          showError(data.error || 'Something went wrong. Please try again.');
          setLoading(submitBtn, false, '', 'Create account');
          return;
        }

        // Real session cookie is now set by the server — go straight to the dashboard.
        window.location.href = '/dashboard/dashboard.html';
      } catch (err) {
        showError('Could not reach the server. Check your connection and try again.');
        setLoading(submitBtn, false, '', 'Create account');
      }
    });
  }

  /* ---- Login ---- */
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideError();
      const submitBtn = document.getElementById('login-submit');
      setLoading(submitBtn, true, 'Logging in…', 'Log in');

      const payload = {
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value
      };

      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (!res.ok) {
          showError(data.error || 'Incorrect email or password.');
          setLoading(submitBtn, false, '', 'Log in');
          return;
        }

        window.location.href = '/dashboard/dashboard.html';
      } catch (err) {
        showError('Could not reach the server. Check your connection and try again.');
        setLoading(submitBtn, false, '', 'Log in');
      }
    });
  }

})();
