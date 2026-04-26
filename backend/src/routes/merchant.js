const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/merchantController');

router.use(authenticate, authorize('merchant'));

// Kedai
router.get('/kedai', ctrl.getMyKedai);
router.post('/kedai', ctrl.createKedai);
router.put('/kedai/:id', ctrl.updateKedai);

// Menu
router.get('/menu', ctrl.getMenu);
router.post('/menu', ctrl.createMenu);
router.put('/menu/:id', ctrl.updateMenu);
router.delete('/menu/:id', ctrl.deleteMenu);

// Orders
router.get('/orders', ctrl.getOrders);
router.put('/orders/:id/status', ctrl.updateOrderStatus);
router.get('/stats', ctrl.getStats);

// Ulasan kedai (merchant view + reply)
router.get('/reviews', ctrl.getMyReviews);
router.post('/reviews/:id/reply', ctrl.replyReview);

module.exports = router;
