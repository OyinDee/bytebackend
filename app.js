
const express = require('express');
const dotenv = require('dotenv');
const sequelize = require('./config/database');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/auth', authRoutes);
app.use('/user', userRoutes);

// Sync database and start server
sequelize.sync().then(() => {
  app.listen(8080, () => {
    console.log('Server running on http://localhost:8080');
  });
});
