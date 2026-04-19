const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/adminController');

router.use(authenticate, authorize('admin'));

// Users
router.get('/users', ctrl.getUsers);
router.post('/users', ctrl.createUser);
router.put('/users/:id', ctrl.updateUser);
router.delete('/users/:id', ctrl.deleteUser);

// Dashboard
router.get('/dashboard', ctrl.getDashboard);

// Kedai
router.get('/kedai', ctrl.getKedai);
router.put('/kedai/:id/verify', ctrl.verifyKedai);
router.delete('/kedai/:id', ctrl.deleteKedai);

// Kantin areas
router.get('/kantin', ctrl.getKantin);
router.post('/kantin', ctrl.createKantin);
router.put('/kantin/:id', ctrl.updateKantin);
router.delete('/kantin/:id', ctrl.deleteKantin);

// Orders
router.get('/orders', ctrl.getOrders);

// Ulasan website (admin view + reply)
router.get('/website-reviews', ctrl.getWebsiteReviews);
router.post('/website-reviews/:id/reply', ctrl.replyWebsiteReview);
router.delete('/website-reviews/:id/reply', ctrl.deleteWebsiteReviewReply);

module.exports = router;
