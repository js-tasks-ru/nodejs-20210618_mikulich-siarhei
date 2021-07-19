const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

const pathHasNesting = (path) => {
  const splitedPath = path.split('/');
  const isFile = splitedPath.slice(-1)[0].split('.').length > 2;

  return splitedPath.length >= 2 && !isFile;
};

const getFile = (req, res, filepath) => {
  const chunks = [];
  const stream = fs.createReadStream(filepath);

  stream.on('data', (chunk) => {
    chunks.push(chunk);
  });

  stream.on('end', () => {
    const content = Buffer.concat(chunks).toString('utf-8');

    return res.end(content);
  });

  stream.on('error', (err) => {
    if (err.code === 'ENOENT') {
      res.statusCode = 404;
      return res.end('[404], File not found.');
    }

    throw new Error();
  });
};

server.on('request', (req, res) => {
  try {
    const pathname = url.parse(req.url).pathname.slice(1);

    const filepath = path.join(__dirname, 'files', pathname);

    if (pathHasNesting(pathname)) {
      res.statusCode = 400;
      return res.end('[400], Nesting is not supported.');
    }

    switch (req.method) {
      case 'GET':
        getFile(req, res, filepath);

        break;

      default:
        res.statusCode = 501;
        res.end('Not implemented');
    }
  } catch (error) {
    res.statusCode = 500;
    res.end('[500] Internal Server Error');
    console.error(error);
    server.close();
  }
});

module.exports = server;
