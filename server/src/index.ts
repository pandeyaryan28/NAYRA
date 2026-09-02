import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import tasksRouter from './routes/tasks.js';
import calendarRouter from './routes/calendar.js';
import keepRouter from './routes/keep.js';
import pomodoroRouter from './routes/pomodoro.js';
import caloriesRouter from './routes/calories.js';
import assistantRouter from './routes/assistant.js';
import statsRouter from './routes/stats.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/keep', keepRouter);
app.use('/api/pomodoro', pomodoroRouter);
app.use('/api/calories', caloriesRouter);
app.use('/api/assistant', assistantRouter);
app.use('/api/stats', statsRouter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Nayra Command Core',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Nayra Backend Server listening on http://localhost:${PORT}`);
});
