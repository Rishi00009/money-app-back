const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Transaction = require('../models/Transaction'); // CRITICAL: Added this import
const { 
  addTransaction, 
  getTransactions, 
  deleteTransaction 
} = require('../controllers/transactionController');

// Standard Routes
router.post('/add', auth, addTransaction); 
router.get('/', auth, getTransactions); 
router.delete('/:id', auth, deleteTransaction); 

// @route    GET api/transactions/download
// @desc     Generate and stream CSV report
router.get('/download', auth, async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ msg: 'Please provide both from and to dates' });
    }

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
      // Escape commas in Note/CustomReason to prevent CSV column breaking
      const note = (t.customReason || '').replace(/,/g, ' '); 
      const date = new Date(t.date).toLocaleDateString();
      
      csv += `${date},${t.type},${t.category},${t.amount},${t.bank},${note}\n`;
    });

    // Set headers to trigger a download in the browser
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=Report_${from}_to_${to}.csv`);
    
    // Send the CSV string
    res.status(200).send(csv);

  } catch (err) {
    console.error("Download Error:", err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;