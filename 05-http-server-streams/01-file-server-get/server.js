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

server.on('request', (req, res) => {
  try {
    const pathname = url.parse(req.url).pathname.slice(1);

    const filepath = path.join(__dirname, 'files', pathname);

    switch (req.method) {
      case 'GET':

        fs.readFile(filepath, (err, content) => {
          if (pathHasNesting(pathname)) {
            res.statusCode = 400;
            return res.end('[400], File not found.');
          }

          if (err) {
            if (err.code === 'ENOENT') {
              res.statusCode = 404;
              return res.end('[404], File not found.');
            }

            res.statusCode = 500;
            return res.end('[500] Internal Server Error');
          }

          res.end(content);
        });

        break;

      default:
        res.statusCode = 501;
        res.end('Not implemented');
        server.close();
    }
  } catch (error) {
    console.error(error);
    server.close();
  }
});

module.exports = server;
