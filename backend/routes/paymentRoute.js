const express = require("express");
const router = express.Router();
const { getCompanyWithPayments, createPayment, checkPaymentIdExists,paymentSuccess } = require('../controllers/paymentcontroller');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, roleMiddleware(['Admin']), createPayment);
router.get('/generateid', authMiddleware, roleMiddleware(['Admin']), checkPaymentIdExists);
router.get('/:id', authMiddleware, roleMiddleware(['Admin']), getCompanyWithPayments);
router.put('/succes/:orderId', paymentSuccess);


module.exports = router; 
