import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 5173;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, 'dist');

app.use(express.json());

// Mock API: login endpoint used by the E2E tests via cy.intercept.
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'user@example.com' && password === 'correct-password') {
    return res.status(200).json({ ok: true, user: { email } });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

// Serve the built SPA assets.
app.use(express.static(distPath));

// SPA fallback: every other GET returns index.html so client-side routes work.
app.get('*', (_req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Mock API + SPA server listening on http://localhost:${PORT}`);
});
