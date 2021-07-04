const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    console.log(options);
    this.options = options || {};
    this.partRaw = '';
  }

  _transform(chunk, encoding, callback) {
    const str = chunk.toString(this.options.encoding);

    if (!str.includes(os.EOL)) {
      this.partRaw += str;
      callback();
      return;
    }

    const splitedString = str.split(os.EOL).map((itemStr, index) => {
      if (index === 0) {
        return this.partRaw + itemStr;
      }

      return itemStr;
    });

    this.partRaw = '';

    const indexLastItem = splitedString.length - 1;

    splitedString.forEach((i, index) => {
      if (index === indexLastItem && i !== '') {
        this.partRaw += i;
        return;
      }

      this.push(i);
    });

    callback();
  }

  _flush(callback) {
    if (this.partRaw) {
      this.push(this.partRaw);
    }

    callback();
  }
}

module.exports = LineSplitStream;
