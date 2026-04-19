const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/customerController');

// ── Public routes ─────────────────────────────────────────────────
router.get('/kantin', ctrl.getKantinAreas);
router.get('/kedai', ctrl.getKedai);
router.get('/kedai/:id', ctrl.getKedaiDetail);

// Task 2A: Ulasan Website tanpa login
router.get('/website-reviews', ctrl.getWebsiteReviews);
router.post('/website-reviews', ctrl.createWebsiteReview);

// ── Protected routes (customer) ───────────────────────────────────
router.post('/orders', authenticate, ctrl.createOrder);
router.get('/orders/my', authenticate, ctrl.getMyOrders);
router.get('/orders/:id', authenticate, ctrl.getOrderDetail);

// Task 2B: Ulasan makanan/kedai setelah login
router.post('/reviews', authenticate, ctrl.createReview);

// Task 6: Notifikasi
router.get('/notifications', authenticate, ctrl.getNotifications);
router.put('/notifications/read-all', authenticate, ctrl.markAllNotificationsRead);

module.exports = router;
