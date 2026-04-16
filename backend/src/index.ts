import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Symptothermie API is running' });
});

app.get('/api/cycles', (req, res) => {
  // TODO: Implement cycle data retrieval
  res.json({ cycles: [] });
});

app.post('/api/entries', (req, res) => {
  // TODO: Implement daily entry creation
  res.json({ message: 'Entry created' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
