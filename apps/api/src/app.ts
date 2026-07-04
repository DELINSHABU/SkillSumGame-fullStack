import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { authRoutes } from './routes/auth';
import { profileRoutes } from './routes/profile';
import { masteryRoutes } from './routes/mastery';
import { sessionRoutes } from './routes/sessions';
import { achievementRoutes } from './routes/achievements';
import { dailyRoutes } from './routes/daily';

export function createApp() {
  const app = new Hono();

  if (process.env.NODE_ENV !== 'test') app.use(logger());

  app.get('/api/health', (c) => c.json({ ok: true }));
  app.route('/api/auth', authRoutes);
  app.route('/api/profile', profileRoutes);
  app.route('/api/mastery', masteryRoutes);
  app.route('/api/sessions', sessionRoutes);
  app.route('/api/achievements', achievementRoutes);
  app.route('/api/daily', dailyRoutes);

  app.notFound((c) => c.json({ error: 'Not found' }, 404));
  app.onError((err, c) => {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  });

  return app;
}
