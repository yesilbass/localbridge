import 'dotenv/config';
import app from './app.js';
import authRoutes from './routes/auth.js';
import mentorRoutes from './routes/mentors.js';
import sessionRoutes from './routes/sessions.js';

// Legacy MySQL routes — local dev only, not deployed on Vercel (mysql2 is not
// in root node_modules, so these never run in the serverless function).
app.use('/api/auth', authRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/sessions', sessionRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
