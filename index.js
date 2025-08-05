require('dotenv').config();
const express = require('express');
const app = express();

const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middlewares/authMiddleware');

app.get('/', (req, res) => {
  res.send('API is working');
});

app.use(express.json());

app.use('/api/auth', authRoutes);

// Example protected route
app.get('/api/profile', authMiddleware, async (req, res) => {
  res.json({ message: `Welcome user ${req.user.userId}` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});



