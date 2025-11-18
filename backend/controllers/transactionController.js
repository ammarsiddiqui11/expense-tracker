const Transaction = require("../models/transactionModel");

// CREATE
const addTransaction = async (req, res) => {
  try {
    const { type, description, amount } = req.body;

    if (!type || !description || !amount) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      description,
      amount,
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL for user
const getTransactions = async (req, res) => {
  try {
    const { 
      type, 
      startDate, 
      endDate, 
      minAmount, 
      maxAmount, 
      sort, 
      order = "desc", 
      page = 1, 
      limit = 10 
    } = req.query;

    // Base query
    let queryObject = { user: req.user._id };

    // Filter by type
    if (type) {
      queryObject.type = type.toLowerCase();
    }

    // Date range filter
    if (startDate || endDate) {
      queryObject.date = {};
      if (startDate) queryObject.date.$gte = new Date(startDate);
      if (endDate) queryObject.date.$lte = new Date(endDate);
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      queryObject.amount = {};
      if (minAmount) queryObject.amount.$gte = Number(minAmount);
      if (maxAmount) queryObject.amount.$lte = Number(maxAmount);
    }

    // Pagination setup
    const skip = (page - 1) * limit;

    // Sorting setup
    let sortOptions = {};
    if (sort) {
      sortOptions[sort] = order === "asc" ? 1 : -1;
    } else {
      sortOptions.createdAt = -1; // default newest first
    }

    // Fetch total count for pagination
    const total = await Transaction.countDocuments(queryObject);

    // Final query
    const transactions = await Transaction.find(queryObject)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      transactions
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    transaction.type = req.body.type || transaction.type;
    transaction.description = req.body.description || transaction.description;
    transaction.amount = req.body.amount || transaction.amount;

    await transaction.save();

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ message: "Transaction removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTransactionStats = async (req, res) => {
  try {
    const stats = await Transaction.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    stats.forEach((s) => {
      if (s._id === "income") totalIncome = s.totalAmount;
      if (s._id === "expense") totalExpense = s.totalAmount;
    });

    const balance = totalIncome - totalExpense;

    res.json({ 
      totalIncome, 
      totalExpense, 
      balance 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getTransactionStats
};
