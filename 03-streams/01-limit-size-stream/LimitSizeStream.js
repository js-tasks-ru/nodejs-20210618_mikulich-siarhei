const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);

    this.options = options;
    this.totalSize = 0;
  }

  _transform(chunk, encoding, callback) {
    const str = chunk.toString(this.options.encoding);
    this.totalSize = this.totalSize + chunk.length;

    if (this.totalSize > this.options.limit) {
      callback(new (LimitExceededError));

      return;
    }
    callback(null, str);
  }
}

module.exports = LimitSizeStream;
