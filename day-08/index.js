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

  const coords = [];


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

  function scoreToTop(x, y) {
    const elements = matrix.slice(0, y).map(xItems => xItems[x]);
    elements.reverse();
    const index = elements.findIndex(currentX => currentX >= matrix[y][x]);
    if (index < 0)  {
      return y;
    }

    return index + 1;
  }

  function scoreToLeft(x, y) {
    const elements = matrix[y].slice(0, x);
    elements.reverse();
    const index = elements.findIndex(currentX => currentX >= matrix[y][x]);
    if (index < 0)  {
      return x;
    }

    return index + 1;
  }

  function scoreToRight(x, y) {
    const elements = matrix[y].slice(x + 1);
    const index = elements.findIndex(currentX => currentX >= matrix[y][x]);
    if (index < 0)  {
      return matrix[y].length - x - 1;
    }

    return index + 1;
  }

  function scoreToBottom(x, y) {
    const elements = matrix.slice(y + 1).map(xItems => xItems[x]);
    const index = elements.findIndex(currentX => currentX >= matrix[y][x]);
    if (index < 0)  {
      return matrix.length - y - 1;
    }

    return index + 1;
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

      const scores = {
        top: scoreToTop(x, y),
        left: scoreToLeft(x, y),
        right: scoreToRight(x, y),
        bottom: scoreToBottom(x, y),
      };

      coords.push({
        value: matrix[y][x],
        x,
        y,
        visible: edgesVisible.some(x => x),
        score: Object.values(scores).reduce((cur, prev) => prev*cur, 1),
        scores,
      });
    }
  }

  //console.log(coordsVisible.map(([x,y]) => `${x}, ${y}: ${matrix[y][x]}`).join('\n'));

  logLine();

  console.log(`Counted ${coords.filter(x => x.visible).length} trees visible in ${new Date(Date.now()).getTime() - stop} milliseconds: `);
  console.log(`Highest Tree Score is ${Math.max(...coords.map(x => x.score))} `);
}
