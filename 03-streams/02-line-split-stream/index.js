const LineSplitStream = require('./LineSplitStream');
const fs = require('fs');


const lines = new LineSplitStream({
  encoding: 'utf-8',
});

fs.createReadStream('./text.txt', {highWaterMark: 13})
    .pipe(lines)
    .pipe(fs.createWriteStream('new-text.txt'));

function onData(line) {
  console.log(line);
}

lines.on('data', onData);
