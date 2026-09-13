const API = '/api';
const $ = id => document.getElementById(id);

async function api(path, options = {}) {
  const response = await fetch(API + path, {
    credentials: 'include',
    ...options,
    headers: {'Content-Type': 'application/json', ...(options.headers || {})}
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Có lỗi xảy ra');
  return data;
}

function showError(message) {
  const box = $('error');
  box.textContent = message;
  box.hidden = false;
}

function redirectAfterLogin() {
  const params = new URLSearchParams(location.search);
  const redirect = params.get('redirect');
  if (redirect === 'checkout') {
    location.href = '/?checkout=1';
  } else {
    location.href = '/';
  }
}

async function login(e) {
  e.preventDefault();
  $('error').hidden = true;
  const button = $('submit');
  button.disabled = true;
  try {
    await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: $('email').value.trim(),
        password: $('password').value
      })
    });
    redirectAfterLogin();
  } catch (err) {
    showError(err.message);
  } finally {
    button.disabled = false;
  }
}

async function register(e) {
  e.preventDefault();
  $('error').hidden = true;
  if ($('password').value !== $('confirmPassword').value) {
    showError('Mật khẩu nhập lại không khớp');
    return;
  }
  const button = $('submit');
  button.disabled = true;
  try {
    await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullname: $('fullname').value.trim(),
        email: $('email').value.trim(),
        password: $('password').value
      })
    });
    location.href = '/login.html?registered=1';
  } catch (err) {
    showError(err.message);
  } finally {
    button.disabled = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  if ($('loginForm') && params.get('registered') === '1') {
    const box = $('success');
    if (box) { box.textContent = 'Đăng ký thành công. Vui lòng đăng nhập để vào cửa hàng.'; box.hidden = false; }
    history.replaceState({}, '', '/login.html');
  }
  if ($('loginForm')) $('loginForm').addEventListener('submit', login);
  if ($('registerForm')) $('registerForm').addEventListener('submit', register);
});
