import app from '../app.js';

export default function handler(req, res) {
  console.log(`[${req.method}] ${req.url}`);
  app(req, res);
}