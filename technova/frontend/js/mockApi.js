/**
 * Mock API Service replacing backend fetch calls with data.json + localStorage
 * Includes SHA-256 password hashing for Admin and User accounts
 */

const STORAGE_KEY_DB = 'technova_mock_db';
const STORAGE_KEY_SESSION = 'technova_session';

const ADMIN_HASH = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9";
const USER_HASH = "e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446";

const DEFAULT_DB = {
  users: [
    {
      _id: "user_admin_01",
      fullname: "TECHNOVA Admin",
      email: "admin@technova.com",
      password: ADMIN_HASH,
      role: "admin",
      isActive: true,
      createdAt: "2026-01-01T00:00:00.000Z"
    },
    {
      _id: "user_customer_01",
      fullname: "Nguyễn Văn A",
      email: "user@technova.com",
      password: USER_HASH,
      role: "user",
      isActive: true,
      phone: "0901234567",
      createdAt: "2026-01-15T00:00:00.000Z"
    }
  ],
  categories: [
    { _id: "cat_01", name: "Smartphones", slug: "smartphones" },
    { _id: "cat_02", name: "Laptops", slug: "laptops" },
    { _id: "cat_03", name: "Tablets", slug: "tablets" },
    { _id: "cat_04", name: "Audio", slug: "audio" },
    { _id: "cat_05", name: "Gaming", slug: "gaming" },
    { _id: "cat_06", name: "Cameras", slug: "cameras" },
    { _id: "cat_07", name: "Wearables", slug: "wearables" }
  ],
  products: [
    {
      _id: "prod_01",
      name: "iPhone 17 Pro",
      brand: "Apple",
      price: 1199,
      salePrice: 1099,
      stock: 20,
      category: "cat_01",
      image: "https://images.unsplash.com/photo-1592286927505-1def25115481?w=700",
      description: "iPhone 17 Pro - Apple. Sản phẩm công nghệ chính hãng với chip A19 Pro siêu mạnh mẽ.",
      isActive: true,
      createdAt: "2026-02-01T00:00:00.000Z"
    },
    {
      _id: "prod_02",
      name: "Galaxy S25 Ultra",
      brand: "Samsung",
      price: 1299,
      salePrice: 1199,
      stock: 15,
      category: "cat_01",
      image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=700",
      description: "Galaxy S25 Ultra - Samsung. Camera 200MP đột phá và bút S-Pen thông minh.",
      isActive: true,
      createdAt: "2026-02-02T00:00:00.000Z"
    },
    {
      _id: "prod_03",
      name: "MacBook Pro 14",
      brand: "Apple",
      price: 1999,
      salePrice: 1849,
      stock: 10,
      category: "cat_02",
      image: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?w=700",
      description: "MacBook Pro 14 - Apple. Hiệu năng đỉnh cao với vi xử lý Apple Silicon.",
      isActive: true,
      createdAt: "2026-02-03T00:00:00.000Z"
    },
    {
      _id: "prod_04",
      name: "Dell XPS 13",
      brand: "Dell",
      price: 1399,
      salePrice: 1249,
      stock: 12,
      category: "cat_02",
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700",
      description: "Dell XPS 13 - Dell. Thiết kế siêu mỏng nhẹ, màn hình hiển thị sống động.",
      isActive: true,
      createdAt: "2026-02-04T00:00:00.000Z"
    },
    {
      _id: "prod_05",
      name: "iPad Pro",
      brand: "Apple",
      price: 999,
      salePrice: 899,
      stock: 18,
      category: "cat_03",
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=700",
      description: "iPad Pro - Apple. Màn hình Ultra Retina XDR đỉnh cao công nghệ.",
      isActive: true,
      createdAt: "2026-02-05T00:00:00.000Z"
    },
    {
      _id: "prod_06",
      name: "Sony WH-1000XM5",
      brand: "Sony",
      price: 399,
      salePrice: 349,
      stock: 30,
      category: "cat_04",
      image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=700",
      description: "Sony WH-1000XM5 - Sony. Tai nghe chống ồn chủ động hàng đầu thế giới.",
      isActive: true,
      createdAt: "2026-02-06T00:00:00.000Z"
    },
    {
      _id: "prod_07",
      name: "PlayStation 5",
      brand: "Sony",
      price: 499,
      salePrice: 449,
      stock: 8,
      category: "cat_05",
      image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=700",
      description: "PlayStation 5 - Sony. Trải nghiệm chơi game 4K chân thực và mượt mà.",
      isActive: true,
      createdAt: "2026-02-07T00:00:00.000Z"
    },
    {
      _id: "prod_08",
      name: "Canon EOS R6",
      brand: "Canon",
      price: 2499,
      salePrice: 2299,
      stock: 6,
      category: "cat_06",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=700",
      description: "Canon EOS R6 - Canon. Máy ảnh Mirrorless chuyên nghiệp cho nhiếp ảnh gia.",
      isActive: true,
      createdAt: "2026-02-08T00:00:00.000Z"
    },
    {
      _id: "prod_09",
      name: "Apple Watch Ultra",
      brand: "Apple",
      price: 799,
      salePrice: 749,
      stock: 14,
      category: "cat_07",
      image: "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=700",
      description: "Apple Watch Ultra - Apple. Đồng hồ thông minh siêu bền bỉ dành cho thể thao chuyên nghiệp.",
      isActive: true,
      createdAt: "2026-02-09T00:00:00.000Z"
    }
  ],
  orders: [
    {
      _id: "ord_01",
      user: {
        _id: "user_customer_01",
        fullname: "Nguyễn Văn A",
        email: "user@technova.com"
      },
      items: [
        {
          product: "prod_06",
          name: "Sony WH-1000XM5",
          price: 349,
          quantity: 1
        }
      ],
      total: 349,
      shippingAddress: {
        fullname: "Nguyễn Văn A",
        phone: "0901234567",
        address: "123 Nguyễn Huệ, Quận 1, TP.HCM"
      },
      paymentMethod: "cod",
      status: "completed",
      createdAt: "2026-02-10T10:30:00.000Z"
    }
  ]
};

/**
 * SHA-256 Password Hashing Utility
 * @param {string} password 
 * @returns {Promise<string>} Hexadecimal SHA-256 hash string
 */
async function hashPassword(password) {
  if (!password) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Ensure default admin & user accounts exist with correct SHA-256 password hashes
 */
function syncAccountHashes(db) {
  if (!db || !Array.isArray(db.users)) return;

  let admin = db.users.find(u => u.email.toLowerCase() === 'admin@technova.com');
  if (admin) {
    admin.password = ADMIN_HASH;
    admin.role = 'admin';
    admin.isActive = true;
  } else {
    db.users.push({
      _id: "user_admin_01",
      fullname: "TECHNOVA Admin",
      email: "admin@technova.com",
      password: ADMIN_HASH,
      role: "admin",
      isActive: true,
      createdAt: new Date().toISOString()
    });
  }

  let user = db.users.find(u => u.email.toLowerCase() === 'user@technova.com');
  if (user) {
    user.password = USER_HASH;
    user.role = 'user';
    user.isActive = true;
  } else {
    db.users.push({
      _id: "user_customer_01",
      fullname: "Nguyễn Văn A",
      email: "user@technova.com",
      password: USER_HASH,
      role: "user",
      isActive: true,
      phone: "0901234567",
      createdAt: new Date().toISOString()
    });
  }
}

/**
 * Load Database from localStorage or fallback to /data.json / DEFAULT_DB
 */
async function loadDb() {
  let db = null;
  const localData = localStorage.getItem(STORAGE_KEY_DB);
  if (localData) {
    try {
      db = JSON.parse(localData);
    } catch (e) {
      console.error('Failed to parse mock DB from localStorage', e);
    }
  }

  if (!db) {
    try {
      const response = await fetch('/data.json');
      if (response.ok) {
        db = await response.json();
      }
    } catch (err) {
      console.warn('Could not fetch /data.json, using default inlined dataset', err);
    }
  }

  if (!db) {
    db = JSON.parse(JSON.stringify(DEFAULT_DB));
  }

  syncAccountHashes(db);
  saveDb(db);
  return db;
}

/**
 * Save current Database state to localStorage
 */
function saveDb(db) {
  localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(db));
}

/**
 * Main mock API router replacing fetch API calls
 * @param {string} path API Endpoint path (e.g. '/auth/login', '/products')
 * @param {Object} options Request options (method, body, headers, etc.)
 */
async function api(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};
  const db = await loadDb();

  // Simulate minimal async delay for realism
  await new Promise(resolve => setTimeout(resolve, 50));

  // --- AUTH ROUTES ---
  if (path === '/auth/login' && method === 'POST') {
    const { email, password } = body;
    const inputHash = await hashPassword(password);
    const user = db.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase().trim());

    if (!user || user.password !== inputHash) {
      throw new Error('Email hoặc mật khẩu không chính xác');
    }
    if (!user.isActive) {
      throw new Error('Tài khoản đã bị khóa');
    }

    const sessionUser = { _id: user._id, fullname: user.fullname, email: user.email, role: user.role };
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionUser));
    return { message: 'Đăng nhập thành công', data: { user: sessionUser } };
  }

  if (path === '/auth/admin/login' && method === 'POST') {
    const { email, password } = body;
    const inputHash = await hashPassword(password);
    const user = db.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase().trim());

    if (!user || user.password !== inputHash) {
      throw new Error('Email hoặc mật khẩu không chính xác');
    }
    if (!user.isActive) {
      throw new Error('Tài khoản đã bị khóa');
    }
    if (user.role !== 'admin') {
      throw new Error('Tài khoản không phải admin');
    }

    const sessionUser = { _id: user._id, fullname: user.fullname, email: user.email, role: user.role };
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionUser));
    return { message: 'Đăng nhập admin thành công', data: { user: sessionUser } };
  }

  if (path === '/auth/register' && method === 'POST') {
    const { fullname, email, password } = body;
    const trimmedEmail = (email || '').toLowerCase().trim();

    if (db.users.some(u => u.email.toLowerCase() === trimmedEmail)) {
      throw new Error('Email đã được sử dụng');
    }

    const hashedPassword = await hashPassword(password);
    const newUser = {
      _id: 'user_' + Date.now(),
      fullname: (fullname || '').trim(),
      email: trimmedEmail,
      password: hashedPassword,
      role: 'user',
      isActive: true,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDb(db);

    return { message: 'Đăng ký thành công', data: { user: { _id: newUser._id, fullname: newUser.fullname, email: newUser.email, role: newUser.role } } };
  }

  if (path === '/auth/me' && method === 'GET') {
    const sessionData = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!sessionData) {
      throw new Error('Chưa đăng nhập');
    }
    const sessionUser = JSON.parse(sessionData);
    const currentUser = db.users.find(u => u._id === sessionUser._id);
    if (!currentUser || !currentUser.isActive) {
      localStorage.removeItem(STORAGE_KEY_SESSION);
      throw new Error('Tài khoản không tồn tại hoặc đã bị khóa');
    }
    return { data: { user: { _id: currentUser._id, fullname: currentUser.fullname, email: currentUser.email, role: currentUser.role } } };
  }

  if (path === '/auth/logout' && method === 'POST') {
    localStorage.removeItem(STORAGE_KEY_SESSION);
    return { message: 'Đăng xuất thành công' };
  }

  // --- CATEGORIES ---
  if (path === '/categories' && method === 'GET') {
    return { data: db.categories };
  }

  // --- PRODUCTS ---
  if (path.startsWith('/products') && method === 'GET') {
    const queryString = path.includes('?') ? path.split('?')[1] : '';
    const params = new URLSearchParams(queryString);
    const search = (params.get('search') || '').toLowerCase().trim();
    const categorySlug = params.get('category') || '';
    const sort = params.get('sort') || 'newest';

    const catMap = new Map(db.categories.map(c => [c._id, c]));

    let list = db.products.map(p => {
      const catObj = typeof p.category === 'object' ? p.category : (catMap.get(p.category) || { name: '', slug: '' });
      return { ...p, category: catObj };
    });

    if (search) {
      list = list.filter(p => p.name.toLowerCase().includes(search) || p.brand.toLowerCase().includes(search));
    }

    if (categorySlug) {
      list = list.filter(p => p.category?.slug === categorySlug || p.category?._id === categorySlug);
    }

    if (sort === 'priceAsc') {
      list.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    } else if (sort === 'priceDesc') {
      list.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    } else {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return { data: list };
  }

  if (path === '/products' && method === 'POST') {
    const newProduct = {
      _id: 'prod_' + Date.now(),
      name: body.name,
      brand: body.brand,
      category: body.category,
      price: Number(body.price),
      salePrice: body.salePrice === null || body.salePrice === '' ? null : Number(body.salePrice),
      stock: Number(body.stock),
      image: body.image,
      description: body.description,
      isActive: body.isActive ?? true,
      createdAt: new Date().toISOString()
    };
    db.products.push(newProduct);
    saveDb(db);
    return { message: 'Tạo sản phẩm thành công', data: newProduct };
  }

  const prodPutMatch = path.match(/^\/products\/([^/]+)$/);
  if (prodPutMatch && method === 'PUT') {
    const prodId = prodPutMatch[1];
    const index = db.products.findIndex(p => p._id === prodId);
    if (index === -1) throw new Error('Không tìm thấy sản phẩm');
    db.products[index] = {
      ...db.products[index],
      name: body.name,
      brand: body.brand,
      category: body.category,
      price: Number(body.price),
      salePrice: body.salePrice === null || body.salePrice === '' ? null : Number(body.salePrice),
      stock: Number(body.stock),
      image: body.image,
      description: body.description,
      isActive: body.isActive ?? db.products[index].isActive
    };
    saveDb(db);
    return { message: 'Cập nhật sản phẩm thành công', data: db.products[index] };
  }

  if (prodPutMatch && method === 'DELETE') {
    const prodId = prodPutMatch[1];
    db.products = db.products.filter(p => p._id !== prodId);
    saveDb(db);
    return { message: 'Xóa sản phẩm thành công' };
  }

  // --- ORDERS ---
  if (path === '/orders' && method === 'GET') {
    return { data: db.orders };
  }

  if (path === '/orders' && method === 'POST') {
    const sessionData = localStorage.getItem(STORAGE_KEY_SESSION);
    const sessionUser = sessionData ? JSON.parse(sessionData) : null;
    if (!sessionUser) throw new Error('Vui lòng đăng nhập để đặt hàng');

    const orderItems = [];
    let total = 0;

    for (const item of body.items || []) {
      const prod = db.products.find(p => p._id === item.product);
      if (!prod) throw new Error('Sản phẩm không tồn tại');
      if (prod.stock < item.quantity) throw new Error(`Sản phẩm ${prod.name} không đủ số lượng tồn kho`);

      prod.stock -= item.quantity;
      const unitPrice = prod.salePrice ?? prod.price;
      const itemTotal = unitPrice * item.quantity;
      total += itemTotal;

      orderItems.push({
        product: prod._id,
        name: prod.name,
        price: unitPrice,
        quantity: item.quantity
      });
    }

    const newOrder = {
      _id: 'ord_' + Date.now(),
      user: {
        _id: sessionUser._id,
        fullname: body.shippingAddress?.fullname || sessionUser.fullname,
        email: sessionUser.email
      },
      items: orderItems,
      total: total,
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    db.orders.unshift(newOrder);
    saveDb(db);
    return { message: 'Đặt hàng thành công', data: newOrder };
  }

  const orderStatusMatch = path.match(/^\/orders\/([^/]+)\/status$/);
  if (orderStatusMatch && method === 'PATCH') {
    const orderId = orderStatusMatch[1];
    const order = db.orders.find(o => o._id === orderId);
    if (!order) throw new Error('Không tìm thấy đơn hàng');
    order.status = body.status;
    saveDb(db);
    return { message: 'Cập nhật trạng thái thành công', data: order };
  }

  // --- USERS ---
  if (path === '/users' && method === 'GET') {
    return { data: db.users };
  }

  const userToggleMatch = path.match(/^\/users\/([^/]+)\/toggle$/);
  if (userToggleMatch && method === 'PATCH') {
    const userId = userToggleMatch[1];
    const user = db.users.find(u => u._id === userId);
    if (!user) throw new Error('Không tìm thấy người dùng');
    user.isActive = !user.isActive;
    saveDb(db);
    return { message: 'Cập nhật trạng thái người dùng thành công', data: user };
  }

  // --- DASHBOARD STATS ---
  if (path === '/dashboard/stats' && method === 'GET') {
    const activeProducts = db.products.length;
    const customersCount = db.users.filter(u => u.role === 'user').length;
    const ordersCount = db.orders.length;
    const totalRevenue = db.orders.reduce((sum, o) => o.status !== 'cancelled' ? sum + Number(o.total || 0) : sum, 0);

    return {
      data: {
        products: activeProducts,
        customers: customersCount,
        orders: ordersCount,
        revenue: totalRevenue
      }
    };
  }

  throw new Error(`Mock API 404: ${method} ${path} không tồn tại`);
}

// Expose globally
window.api = api;
window.hashPassword = hashPassword;
