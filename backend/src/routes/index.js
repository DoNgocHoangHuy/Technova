const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const { auth, requireAdmin } = require('../middlewares/auth');
const authC = require('../controllers/authController');
const productC = require('../controllers/productController');
const categoryC = require('../controllers/categoryController');
const orderC = require('../controllers/orderController');
const userC = require('../controllers/userController');
const dashboardC = require('../controllers/dashboardController');

router.post('/auth/register', asyncHandler(authC.register));
router.post('/auth/login', asyncHandler(authC.login));
router.post('/auth/admin/login', asyncHandler(authC.adminLogin));
router.get('/auth/me', auth, asyncHandler(authC.me));
router.post('/auth/logout', asyncHandler(authC.logout));

router.get('/products', asyncHandler(productC.list));
router.get('/products/:id', asyncHandler(productC.get));
router.post('/products', auth, requireAdmin, asyncHandler(productC.create));
router.put('/products/:id', auth, requireAdmin, asyncHandler(productC.update));
router.delete('/products/:id', auth, requireAdmin, asyncHandler(productC.remove));

router.get('/categories', asyncHandler(categoryC.list));
router.post('/categories', auth, requireAdmin, asyncHandler(categoryC.create));
router.delete('/categories/:id', auth, requireAdmin, asyncHandler(categoryC.remove));

router.post('/orders', auth, asyncHandler(orderC.create));
router.get('/orders/my', auth, asyncHandler(orderC.myOrders));
router.get('/orders', auth, requireAdmin, asyncHandler(orderC.adminList));
router.patch('/orders/:id/status', auth, requireAdmin, asyncHandler(orderC.updateStatus));

router.get('/users', auth, requireAdmin, asyncHandler(userC.list));
router.patch('/users/:id/toggle', auth, requireAdmin, asyncHandler(userC.toggle));
router.get('/dashboard/stats', auth, requireAdmin, asyncHandler(dashboardC.stats));

module.exports = router;