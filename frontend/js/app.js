const API = '/api';
let products = [];
let categories = [];
let cart = JSON.parse(localStorage.getItem('technovaCart') || '[]');
let user = null;

const $ = id => document.getElementById(id);
const money = n => '$' + Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });

async function api(path, opt = {}) {
  const r = await fetch(API + path, {
    credentials: 'include',
    ...opt,
    headers: { 'Content-Type': 'application/json', ...(opt.headers || {}) }
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Error(j.message || 'Request failed');
  return j;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));
}

function saveCart() {
  localStorage.setItem('technovaCart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const el = $('cartCount');
  if (el) el.textContent = cart.reduce((sum, x) => sum + Number(x.quantity || 0), 0);
}

async function load() {
  categories = (await api('/categories')).data;
  $('category').innerHTML = '<option value="">Tất cả danh mục</option>' +
    categories.map(c => `<option value="${escapeHtml(c.slug)}">${escapeHtml(c.name)}</option>`).join('');

  $('categoryCards').innerHTML = categories.map(c =>
    `<button class="category-card" data-category="${escapeHtml(c.slug)}">◉<br>${escapeHtml(c.name)}</button>`
  ).join('');

  document.querySelectorAll('[data-category]').forEach(b => b.addEventListener('click', () => {
    $('category').value = b.dataset.category;
    loadProducts();
    $('productsSection')?.scrollIntoView({ behavior: 'smooth' });
  }));

  await loadProducts();
  await syncCart();
}

async function loadProducts() {
  const q = new URLSearchParams({
    search: $('search')?.value || '',
    category: $('category')?.value || '',
    sort: $('sort')?.value || 'newest'
  });
  products = (await api('/products?' + q)).data;
  renderProducts();
  await syncCart(false);
}

function renderProducts() {
  const target = $('products');
  if (!target) return;

  target.innerHTML = products.map(p => `
    <article class="card">
      <img src="${escapeHtml(p.image || '/favicon.svg')}" alt="${escapeHtml(p.name)}" loading="lazy"
           onerror="this.onerror=null;this.src='/favicon.svg';">
      <div class="card-body">
        <div class="muted">${escapeHtml(p.brand)} · ${escapeHtml(p.category?.name || '')}</div>
        <h3>${escapeHtml(p.name)}</h3>
        <div class="price">${money(p.salePrice ?? p.price)} <span class="old">${p.salePrice ? money(p.price) : ''}</span></div>
        <p class="muted">${p.stock} còn lại</p>
        <button class="primary full" data-add="${p._id}" ${p.stock < 1 ? 'disabled' : ''}>
          ${p.stock < 1 ? 'Hết hàng' : 'Thêm vào giỏ'}
        </button>
      </div>
    </article>`).join('') || '<div class="empty">Không có sản phẩm phù hợp.</div>';

  document.querySelectorAll('[data-add]').forEach(b =>
    b.addEventListener('click', () => add(b.dataset.add))
  );
}

async function syncCart(render = true) {
  if (!cart.length) {
    updateCartCount();
    if (render) renderCart();
    return;
  }

  const valid = new Map(products.map(p => [p._id, p]));
  cart = cart.filter(i => valid.has(i.product) && valid.get(i.product).stock > 0);
  cart.forEach(i => {
    i.quantity = Math.min(Number(i.quantity) || 1, valid.get(i.product).stock);
  });
  saveCart();
  if (render) renderCart();
}

function add(id) {
  const p = products.find(x => x._id === id);
  if (!p || p.stock < 1) return alert('Sản phẩm đã hết hàng');

  const x = cart.find(i => i.product === id);
  if (x) {
    if (x.quantity >= p.stock) return alert('Không thể thêm quá số lượng tồn kho');
    x.quantity++;
  } else {
    cart.push({ product: id, quantity: 1 });
  }

  saveCart();
  renderCart();
  $('cart')?.classList.add('open');
}

function renderCart() {
  const itemsEl = $('cartItems');
  if (!itemsEl) return;

  let total = 0;
  const rows = cart.map(i => {
    const p = products.find(x => x._id === i.product);
    if (!p) return '';
    const t = (p.salePrice ?? p.price) * i.quantity;
    total += t;
    return `<div class="cart-item">
      <img src="${escapeHtml(p.image || '/favicon.svg')}" alt="${escapeHtml(p.name)}" onerror="this.onerror=null;this.src='/favicon.svg';">
      <div style="flex:1"><b>${escapeHtml(p.name)}</b><div>${money(t)} × ${i.quantity}</div></div>
      <button data-remove="${p._id}">✕</button>
    </div>`;
  }).join('');

  itemsEl.innerHTML = rows || '<div class="empty">Giỏ hàng trống.</div>';
  $('cartTotal').textContent = money(total);

  document.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => {
    cart = cart.filter(x => x.product !== b.dataset.remove);
    saveCart();
    renderCart();
  }));
  updateCartCount();
}

async function refreshUser() {
  try {
    user = (await api('/auth/me')).data.user;
  } catch {
    user = null;
  }
  updateAccountUI();
}

function updateAccountUI() {
  const btn = $('accountBtn');
  if (!btn) return;

  if (user) {
    btn.href = '#';
    btn.textContent = 'Đăng xuất';
    btn.title = `Đang đăng nhập: ${user.fullname}`;
  } else {
    btn.href = '/login.html';
    btn.textContent = 'Đăng nhập';
    btn.title = 'Đăng nhập';
  }
}

function openModal(id) {
  $(id)?.classList.add('open');
}

function closeModal(id) {
  $(id)?.classList.remove('open');
}

async function logout() {
  await api('/auth/logout', { method: 'POST' }).catch(() => {});
  user = null;
}

document.addEventListener('DOMContentLoaded', () => {
  $('accountBtn')?.addEventListener('click', async e => {
    if (!user) return;
    e.preventDefault();
    if (confirm(`Đăng xuất tài khoản ${user.fullname}?`)) {
      await logout();
      location.href = '/login.html';
    }
  });

  $('cartBtn')?.addEventListener('click', () => {
    renderCart();
    openModal('cart');
  });

  document.querySelectorAll('[data-close]').forEach(b =>
    b.addEventListener('click', () => closeModal(b.dataset.close))
  );

  $('checkoutBtn')?.addEventListener('click', async () => {
    if (!cart.length) return alert('Giỏ hàng trống');
    await refreshUser();
    if (!user) {
      closeModal('cart');
      location.href = '/login.html?redirect=checkout';
      return;
    }
    closeModal('cart');
    openModal('checkout');
  });

  $('checkoutForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const submit = e.submitter;
    submit.disabled = true;
    try {
      await api('/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: cart,
          shippingAddress: {
            fullname: $('shipName').value.trim(),
            phone: $('shipPhone').value.trim(),
            address: $('shipAddress').value.trim()
          },
          paymentMethod: $('payment').value
        })
      });
      cart = [];
      saveCart();
      closeModal('checkout');
      $('checkoutForm').reset();
      await loadProducts();
      alert('Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại TECHNOVA.');
    } catch (e) {
      alert(e.message);
      await loadProducts();
    } finally {
      submit.disabled = false;
    }
  });

  let timer;
  $('search')?.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(loadProducts, 300);
  });
  $('category')?.addEventListener('change', loadProducts);
  $('sort')?.addEventListener('change', loadProducts);

  (async () => {
    await refreshUser();
    if (!user) {
      location.replace('/login.html');
      return;
    }
    await load();

    const params = new URLSearchParams(location.search);
    if (params.get('checkout') === '1') {
      history.replaceState({}, '', '/');
      if (cart.length) openModal('checkout');
    }
  })().catch(e => {
    console.error(e);
    alert('Không thể tải dữ liệu cửa hàng: ' + e.message);
  });
});
