const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { 
  addTransaction, 
  getTransactions, 
  deleteTransaction 
} = require('../controllers/transactionController');

// CHANGE THIS LINE: Remove "-transaction"
router.post('/add', auth, addTransaction); 

// Keep these as they are
router.get('/', auth, getTransactions); 
router.delete('/:id', auth, deleteTransaction); 

// @route    GET api/transactions/download
router.get('/download', auth, async (req, res) => {
  try {
    const { from, to } = req.query; // Get dates from URL: ?from=...&to=...
    
    // Filter by date and user
    const transactions = await Transaction.find({
      user: req.user.id,
      date: {
        $gte: new Date(from),
        $lte: new Date(to)
      }
    }).sort({ date: -1 });

    // Create CSV Header
    let csv = "Date,Type,Category,Amount,Bank,Note\n";

    // Add Data Rows
    transactions.forEach(t => {
      csv += `${new Date(t.date).toLocaleDateString()},${t.type},${t.category},${t.amount},${t.bank},${t.customReason || ''}\n`;
    });

    // Set headers to trigger a download in the browser
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=Report_${from}_to_${to}.csv`);
    res.status(200).send(csv);

  } catch (err) {
    res.status(500).send('Server Error');
  }
});
module.exports = router;