const fs = require('fs');
const path = require('path');
const { logLine } = require('../util/log-line');

const partTwo = true;
const check = partTwo ? 'some' : 'every';

function main() {
  const markers = loadFile();

}

main();

/**
 *
 * @returns [string[][], string[]]
 */
function loadFile() {
  const file = fs.readFileSync(
    path.join(
      __dirname,
      process.argv[2]))
  .toString();

  const matrix = file
    .split('\n')
    .map(x => x.split('').map(x => parseInt(x)));

  const coordsVisible = [];


  function checkEdge(x, y, start, max, getValue, change) {
    const initialValue = matrix[y][x];

    for (let i = start; i < max; i = change(i)) {
      const [checkX, checkY] = getValue(i);

      const value = matrix[checkY][checkX];
      if (value >= initialValue) {

        return false;
      }
    }

    return true;
  }

  function fromTop(x, y) {
    return checkEdge(x, y, 0, y, (currentY) => ([x, currentY]), y => y + 1);
  }

  function fromBottom(x, y) {
    return checkEdge(x, y, y + 1, matrix.length, (currentY) => ([x, currentY]), y => y + 1);
  }

  function fromRight(x, y) {
    return checkEdge(x, y, x + 1, matrix[y].length, (currentX) => ([currentX, y]), x => x + 1);
  }

  function fromLeft(x, y) {
    return checkEdge(x, y, 0, x, (currentX) => ([currentX, y]), x => x + 1);
  }

  const stop = new Date(Date.now()).getTime();
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      const edgesVisible = [
        fromTop(x, y),
        fromLeft(x, y),
        fromRight(x, y),
        fromBottom(x, y)
      ];

      if (edgesVisible.some(x => x > 0)) {
        coordsVisible.push({x, y});
      }
    }
  }

  //console.log(coordsVisible.map(([x,y]) => `${x}, ${y}: ${matrix[y][x]}`).join('\n'));

  logLine();

  console.log(`Counted ${coordsVisible.length} trees visible in ${new Date(Date.now()).getTime() - stop} milliseconds: `);
}
