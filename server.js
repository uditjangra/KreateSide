const http = require('node:http');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');

const port = Number(process.env.PORT) || 3000;
const root = __dirname;
const types = { '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8' };
const sendJson = (res, status, data) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(data)); };

async function readBody(req) {
  const chunks = []; let size = 0;
  for await (const chunk of req) { size += chunk.length; if (size > 100000) throw new Error('too-large'); chunks.push(chunk); }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
async function saveEnquiry(req, res) {
  try {
    const body = await readBody(req);
    const required = ['name', 'email', 'business', 'service', 'timeline', 'requirements'];
    if (required.some((key) => !String(body[key] || '').trim())) return sendJson(res, 400, { error: 'Please complete all required fields.' });
    if (!/^\S+@\S+\.\S+$/.test(String(body.email))) return sendJson(res, 400, { error: 'Please enter a valid email address.' });
    const enquiry = Object.fromEntries([...required, 'phone'].map((key) => [key, String(body[key] || '').trim()]));
    enquiry.id = `ks_${Date.now()}`; enquiry.receivedAt = new Date().toISOString();
    await fsp.mkdir(path.join(root, 'data'), { recursive: true });
    await fsp.appendFile(path.join(root, 'data', 'enquiries.ndjson'), `${JSON.stringify(enquiry)}\n`);
    sendJson(res, 201, { message: 'Thanks — your project details have been received.' });
  } catch (error) { sendJson(res, error.message === 'too-large' || error instanceof SyntaxError ? 400 : 500, { error: 'We could not send your enquiry. Please try again.' }); }
}
http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'POST' && url.pathname === '/api/enquiries') return saveEnquiry(req, res);
  if (!['GET', 'HEAD'].includes(req.method)) return sendJson(res, 405, { error: 'Method not allowed.' });
  const requested = url.pathname === '/' ? 'index.html' : url.pathname === '/portfolio' ? 'portfolio.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '');
  const filePath = path.resolve(root, requested);
  if (!filePath.startsWith(root + path.sep)) return sendJson(res, 403, { error: 'Forbidden.' });
  try {
    if (!(await fsp.stat(filePath)).isFile()) throw new Error('missing');
    res.writeHead(200, { 'Content-Type': types[path.extname(filePath)] || 'application/octet-stream' });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(filePath).pipe(res);
  } catch { sendJson(res, 404, { error: 'Not found.' }); }
}).listen(port, () => console.log(`KreateSide is running at http://localhost:${port}`));
