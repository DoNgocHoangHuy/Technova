const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const { auth, requireAdmin } = require('../middlewares/auth');
const authC = require('../controllers/authController');
const productC = require('../controllers/productController');
const categoryC = require('../controllers/categoryController');
const orderC = require('../controllers/orderController');
const userC = require('../controllers/userController');
const dashboardC = require('../controllers/dashboardController');
const reviewC = require('../controllers/reviewController');
const wishlistC = require('../controllers/wishlistController');

router.post('/auth/register', asyncHandler(authC.register));
router.post('/auth/login', asyncHandler(authC.login));
router.get('/auth/me', auth, asyncHandler(authC.me));
router.put('/auth/profile', auth, asyncHandler(authC.updateProfile));
router.post('/auth/logout', asyncHandler(authC.logout));

router.get('/products', asyncHandler(productC.list));
router.get('/products/admin/all', auth, requireAdmin, asyncHandler(productC.adminList));
router.get('/products/:id', asyncHandler(productC.get));
router.get('/products/:id/reviews', asyncHandler(productC.reviews));
router.post('/products/:productId/reviews', auth, asyncHandler(reviewC.create));
router.post('/products', auth, requireAdmin, asyncHandler(productC.create));
router.put('/products/:id', auth, requireAdmin, asyncHandler(productC.update));
router.patch('/products/:id/toggle', auth, requireAdmin, asyncHandler(productC.toggle));
router.delete('/products/:id', auth, requireAdmin, asyncHandler(productC.remove));

router.get('/categories', asyncHandler(categoryC.list));
router.post('/categories', auth, requireAdmin, asyncHandler(categoryC.create));
router.put('/categories/:id', auth, requireAdmin, asyncHandler(categoryC.update));
router.delete('/categories/:id', auth, requireAdmin, asyncHandler(categoryC.remove));

router.post('/orders/quote', auth, asyncHandler(orderC.quote));
router.post('/orders', auth, asyncHandler(orderC.create));
router.get('/orders/my', auth, asyncHandler(orderC.myOrders));
router.get('/orders/my/:id', auth, asyncHandler(orderC.getMy));
router.patch('/orders/my/:id/cancel', auth, asyncHandler(orderC.cancelMy));
router.get('/orders', auth, requireAdmin, asyncHandler(orderC.adminList));
router.get('/orders/:id', auth, requireAdmin, asyncHandler(orderC.adminGet));
router.patch('/orders/:id/status', auth, requireAdmin, asyncHandler(orderC.updateStatus));

router.get('/wishlist', auth, asyncHandler(wishlistC.list));
router.post('/wishlist/:productId/toggle', auth, asyncHandler(wishlistC.toggle));

router.get('/users', auth, requireAdmin, asyncHandler(userC.list));
router.patch('/users/:id/toggle', auth, requireAdmin, asyncHandler(userC.toggle));
router.get('/dashboard/stats', auth, requireAdmin, asyncHandler(dashboardC.stats));

module.exports = router;
