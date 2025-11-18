// server.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();
app.use(express.json());
app.use(cors())

app.use('/api/auth', authRoutes);
app.use("/api/transactions", transactionRoutes);


// health
app.get('/', (req, res) => res.send('Finance Tracker API up'));

// connect DB & start
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/finance-tracker';

mongoose.connect(MONGO_URI)
  .then(()=> {
    console.log('Mongo connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('DB connect error', err);
    process.exit(1);
  });
