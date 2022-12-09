const fs = require('fs');
const path = require('path');
const { logLine } = require('../util/log-line');

const partTwo = true;
const check = partTwo ? 'some' : 'every';

async function main() {
  const markers = await loadFile();

}

main();

/**
 *
 * @returns [string[][], string[]]
 */
async function loadFile() {
  const file = fs.readFileSync(
    path.join(
      __dirname,
      process.argv[2]))
  .toString();

  const movements = file
    .split('\n')
    .map(x => /([A-Z]) (\d+)/g.exec(x))
    .map(([_, direction, amount]) => ({
      amount: parseInt(amount),
      direction
    }));

  let position = {
    start: {
      y: 5,
      x: 1,
    },
    head: {
      y: 5,
      x: 1
    },
    tail: {
      y: 5,
      x: 1
    }
  }

  function printGrid(title) {

    logLine(title);

    for (let y = 1; y <= 5; y++) {
      for (let x = 1; x <= 6; x++) {
        if (position.head.x === x && position.head.y === y) {
          process.stdout.write('H');
          continue;
        }

        if (position.tail.x === x && position.tail.y === y) {
          process.stdout.write('T');
          continue;
        }

        if (position.start.x === x && position.start.y === y) {
          process.stdout.write('S');
          continue;
        }

        process.stdout.write('.');
      }

      process.stdout.write('\n');
    }
  }

  async function getKeypress() {
    return new Promise(resolve => {
      var stdin = process.stdin
      stdin.setRawMode(true) // so get each keypress
      stdin.resume() // resume stdin in the parent process
      stdin.once('data', onData) // like on but removes listener also
      function onData(buffer) {
        stdin.setRawMode(false)
        resolve(buffer.toString())
      }
    })
  }

  function updateTailPosition(xStep, yStep) {
    const xSteps = Math.abs(xStep);
    const ySteps = Math.abs(yStep);

    if (xSteps > 0 && ySteps === 0) {
      if (Math.abs(position.tail.x - position.head.x) > 1) {
        position.tail.x += xStep;
        if (position.tail.y !== position.head.y) {
          position.tail.y = position.head.y
        }
      }
    }

    if (xSteps === 0 && ySteps >= 0) {
      if (Math.abs(position.tail.y - position.head.y) > 1) {
        position.tail.y += yStep;
        if (position.tail.x !== position.head.x) {
          position.tail.x = position.head.x
        }
      }
    }
  }

  printGrid('Initial State');

  const tailPositions = [];
  tailPositions.push(`${position.tail.x}-${position.tail.y}`);

  for (const movement of movements) {
    for (let step = 0; step < movement.amount; step++) {
      let xBefore = position.head.x;
      let yBefore = position.head.y;

      const steps = {
        'R': 1,
        'L': -1,
        'U': -1,
        'D': 1
      };

      const changedAxis = {
        'R': 'x',
        'L': 'x',
        'U': 'y',
        'D': 'y'
      };

      position.head[changedAxis[movement.direction]] += steps[movement.direction];

      updateTailPosition(position.head.x - xBefore, position.head.y - yBefore);

      printGrid(`${movement.direction} ${movement.amount}`);

      tailPositions.push(`${position.tail.x}-${position.tail.y}`);
      //await getKeypress();
    }
  }

  const uniquePositions = Array.from(new Set(tailPositions));
  console.log(uniquePositions.length, uniquePositions);
}