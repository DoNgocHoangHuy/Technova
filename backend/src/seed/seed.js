const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { ADMIN_EMAIL, ADMIN_PASSWORD } = require('../config/env');

const categories = ['Smartphones', 'Laptops', 'Tablets', 'Audio', 'Gaming', 'Cameras', 'Wearables'];
const products = [
  ['iPhone 17 Pro', 'Apple', 1199, 1099, 20, 'Smartphones', 'https://images.unsplash.com/photo-1592286927505-1def25115481?w=700'],
  ['Galaxy S25 Ultra', 'Samsung', 1299, 1199, 15, 'Smartphones', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=700'],
  ['MacBook Pro 14', 'Apple', 1999, 1849, 10, 'Laptops', 'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?w=700'],
  ['Dell XPS 13', 'Dell', 1399, 1249, 12, 'Laptops', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700'],
  ['iPad Pro', 'Apple', 999, 899, 18, 'Tablets', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=700'],
  ['Sony WH-1000XM5', 'Sony', 399, 349, 30, 'Audio', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=700'],
  ['PlayStation 5', 'Sony', 499, 449, 8, 'Gaming', 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=700'],
  ['Canon EOS R6', 'Canon', 2499, 2299, 6, 'Cameras', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=700'],
  ['Apple Watch Ultra', 'Apple', 799, 749, 14, 'Wearables', 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=700']
];

(async () => {
  await connectDB();

  // Use save() so the User pre-save hook hashes the admin password.
  let admin = await User.findOne({ email: ADMIN_EMAIL }).select('+password');
  if (!admin) {
    admin = new User({ fullname: 'TECHNOVA Admin', email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' });
  } else {
    admin.fullname = 'TECHNOVA Admin';
    admin.password = ADMIN_PASSWORD;
    admin.role = 'admin';
    admin.isActive = true;
  }
  await admin.save();

  const catMap = {};
  for (const name of categories) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const c = await Category.findOneAndUpdate({ name }, { $set: { slug } }, { upsert: true, new: true });
    catMap[name] = c._id;
  }

  for (const [name, brand, price, salePrice, stock, cat, image] of products) {
    // Seed is intentionally non-destructive: existing admin edits (image, price, stock, etc.)
    // are preserved when the server is restarted or npm run seed is executed again.
    const exists = await Product.findOne({ name });
    if (!exists) {
      await Product.create({
        name, brand, price, salePrice, stock, image, category: catMap[cat],
        isActive: true,
        description: `${name} - ${brand}. Sản phẩm công nghệ chính hãng.`,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()
      });
    }
  }

  console.log(`Seed complete. Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });
