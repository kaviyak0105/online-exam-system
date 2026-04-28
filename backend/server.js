const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'https://subtle-faloodeh-e5e49c.netlify.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth.routes');
const examRoutes = require('./routes/exam.routes');
const questionRoutes = require('./routes/question.routes');
const resultRoutes = require('./routes/result.routes');
const progressRoutes = require('./routes/progress.routes');

app.use('/api/auth', authRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/question', questionRoutes);
app.use('/api/result', resultRoutes);
app.use('/api/progress', progressRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Online Examination System API Running! 🎓' });
});

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected!');
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log('❌ MongoDB Connection Error:', err);
  });