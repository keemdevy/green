import http from 'node:http';

const port = Number(process.env.PORT || 17120);

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, service: 'green-api' }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Green API running' }));
});

server.listen(port, () => {
  console.log(`green api listening on ${port}`);
});
