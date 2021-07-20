const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');
const LimitExceededError = require('./LimitExceededError');

const server = new http.Server();

const pathHasNesting = (pathname) => {
  const splitedPath = pathname.split('/');

  return splitedPath.length >= 2;
};

server.on('request', (req, res) => {
  try {
    const pathname = url.parse(req.url).pathname.slice(1);
    const filepath = path.join(__dirname, 'files', pathname);

    /**
     * #4
     */
    if (pathHasNesting(pathname)) {
      res.statusCode = 400;
      return res.end('[400] Nesting isn`t support');
    }

    // if (!fs.exists(filepath)) {
    //   res.statusCode = 409;
    //   return res.end('[409] File is exist');
    // }

    switch (req.method) {
      case 'POST':
        createFile(req, res, filepath);
        break;

      default:
        res.statusCode = 501;
        res.end('Not implemented');
    }
  } catch (error) {
    res.statusCode = 500;
    res.end(`[500] Server error. ${error}`);
  }
});

const createFile = (req, res, filepath) => {
  const createStream = fs.createWriteStream(filepath, {flags: 'wx'});
  const limitedStream = new LimitSizeStream({limit: 1024 * 1024, encoding: 'utf-8'});

  const destroyStreams = () => {
    createStream.destroy();
    limitedStream.destroy();
  };

  const successCreateFile = () => {
    res.statusCode = 201;
    return res.end(`[201] File created`);
  };

  const handleFileLimitSize = (error) => {
    destroyStreams();

    fs.unlink(filepath, () => {
      if (error.code === 'LIMIT_EXCEEDED') {
        res.statusCode = 413;
        return res.end('[413] File limit is exceeded');
      }

      throw new Error();
    });
  };

  const handleErrorCreateFile = (err) => {
    if (err.code === 'EEXIST') {
      res.statusCode = 409;
      return res.end('[409] File is exist');
    }

    throw new Error(error);
  };

  const handleAbortedReq = () => {
    destroyStreams();

    fs.unlink(filepath, (error) => {
      if (error) {
        throw new Error(error);
        return;
      }
    });
  };

  req
      .on('aborted', handleAbortedReq)
      .pipe(limitedStream)
      .on('error', handleFileLimitSize)
      .pipe(createStream)
      .on('error', handleErrorCreateFile)
      .on('finish', successCreateFile);
};

module.exports = server;
