import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const app = express();
const port = Number(process.env.PORT || 3000);
const coreApi = process.env.CORE_API_BASE_URL || 'http://localhost:8000';

app.disable('x-powered-by');
app.use('/api', createProxyMiddleware({ target: coreApi, changeOrigin: true }));
for (const route of ['health', 'docs', 'redoc', 'openapi.json']) {
  app.use(`/${route}`, createProxyMiddleware({ target: coreApi, changeOrigin: true }));
}
for (const dir of ['site','web','internal','login','design','shared','cms-preview']) {
  app.use(`/${dir}`, express.static(path.join(root, dir)));
}
app.get('/', (_req, res) => res.sendFile(path.join(root, 'site', 'index.html')));
app.listen(port, () => console.log(`NusaSec website listening on :${port}`));
