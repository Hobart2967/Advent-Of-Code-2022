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
  let file;

  if (typeof window !== 'undefined') {
    file = document.getElementById('file').value
  } else {
    const fs = require('fs');
    const path = require('path');

    file = fs.readFileSync(
      path.join(
        __dirname,
        process.argv[2]))
    .toString();
  }

  const movements = file
    .split('\n')
    .filter(x => !!x)
    .map(x => /([A-Z]) (\d+)/g.exec(x))
    .map(([_, direction, amount]) => ({
      amount: parseInt(amount),
      direction
    }));

  const knotCount = 9;

  let position = {
    start: {
      y: 16,
      x: 12,
    },
    head: {
      x: 0,
      y: 0,
    },
    tail: {

    }
  }

  position.head.x = position.start.x
  position.head.y = position.start.y

  for (let i = 1; i <= knotCount; i++) {
    const {x, y} = position.start;
    position.tail[i] = { x, y };
  }


  const height = 25;
  const width = 25;

  function printGrid(title) {
    const op = document.getElementById('currentOp');
    op.innerText = title;

    const grid = document.getElementById('grid');
    grid.innerHTML = '';

    for (let y = 1; y <= height; y++) {
      for (let x = 1; x <= width; x++) {
        const div = document.createElement('div');
        if (position.head.x === x && position.head.y === y) {
          div.innerText = 'H';
          grid.appendChild(div);
          continue;
        }

        let found = false;
        for (const knotNumber of Object.keys(position.tail)) {
          if (position.tail[knotNumber].x === x && position.tail[knotNumber].y === y) {
            div.innerText = knotNumber;
            found = true;
            break;
          }
        }

        if (found) {
          grid.appendChild(div);
          continue;
        }


        if (position.start.x === x && position.start.y === y) {
          div.innerText = 'S';
          grid.appendChild(div);
          continue;
        }

        div.innerText = '';
        grid.appendChild(div);
      }
    }

    const coords = document.getElementById('coords');
    coords.innerHTML = '';


    const div = document.createElement('div');
    div.innerText = `H - x: ${position.head.x} y: ${position.head.y}`;
    coords.appendChild(div);

    for (const pos in position.tail) {
      const div = document.createElement('div');
      div.innerText = `${pos} - x: ${position.tail[pos].x} y: ${position.tail[pos].y}`;
      coords.appendChild(div);
    }

  }
  /*function printGrid(title) {

    logLine(title);

    for (let y = 1; y <= height; y++) {
      for (let x = 1; x <= width; x++) {
        if (position.head.x === x && position.head.y === y) {
          process.stdout.write('H');
          continue;
        }

        let found = false;
        for (const knotNumber of Object.keys(position.tail)) {
          if (position.tail[knotNumber].x === x && position.tail[knotNumber].y === y) {
            process.stdout.write(knotNumber);
            found = true;
            break;
          }
        }

        if (found) {
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
  }*/

  /*async function getKeypress() {
    return new Promise(resolve => {
      var stdin = process.stdin
      stdin.setRawMode(true) // so get each keypress
      stdin.resume() // resume stdin in the parent process
      stdin.once('data', onData) // like on but removes listener also
      function onData(buffer) {
        stdin.setRawMode(false)
        const key = buffer.toString();
        if (key === 'x') {
          process.exit(1);
        }
        resolve(key)
      }
    })
  }*/

  async function getKeypress() {
    return new Promise(resolve => document.getElementById('btn')
      .addEventListener('click', () => resolve(), {
        once: true
      }));
  }

  function updateKnotPosition(tailXStep, tailYStep) {
    let knots = {
      0: position.head,
      ...position.tail
    };

    for (const position in knots) {

      if (position === '0') {
        continue;
      }

      const head = knots[(parseInt(position) - 1).toString()];
      const tail = knots[position];

      const moveLeftRight = Math.abs(tail.x - head.x) > 1;
      const moveUpDown = Math.abs(tail.y - head.y) > 1;
      const horizontalDistance = Math.abs(tail.x - head.x);
      const verticalDistance = Math.abs(tail.y - head.y);

      const moveDiagonally = horizontalDistance === 2 && verticalDistance === 1 || horizontalDistance === 1 && verticalDistance === 2;

      if (moveDiagonally) {
        tailXStep = tail.x - head.x;
        tailYStep = tail.y - head.y;

        tailXStep = tailXStep / Math.abs(tailXStep) * - 1;
        tailYStep = tailYStep / Math.abs(tailYStep) * - 1;

        tail.x += tailXStep;
        tail.y += tailYStep;
      } else if (moveLeftRight && !moveUpDown) {
        tail.x += tailXStep;
      } else if(!moveLeftRight && moveUpDown)  {
        tail.y += tailYStep;
      }
    }
  }

  printGrid('Initial State');

  const tailPositions = [];

  const tails = Object.keys(position.tail);
  const lastTail = tails[tails.length - 1];
  tailPositions.push(`${position.tail[lastTail].x}-${position.tail[lastTail].y}`);

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

      updateKnotPosition(position.head.x - xBefore, position.head.y - yBefore);

      printGrid(`${movement.direction} ${movement.amount}`);

      tailPositions.push(`${position.tail[lastTail].x}-${position.tail[lastTail].y}`);

      //await
      await getKeypress();
    }
  }


  function printTouchGrid(positions) {
    positions = positions
      .map(x => x.split('-'))
      .map(x => x.map(y => parseInt(y)))
      .map(([x, y]) => ({ x, y }));

    // const height = 21;
    // const width = 26;
    for (let y = 1; y <= height; y++) {
      for (let x = 1; x <= width; x++) {
        if (x === position.start.x && position.start.y === y) {
          process.stdout.write('s');
        } else if (positions.some(position => position.x === x && position.y === y)) {
          process.stdout.write('#');
        } else {
          process.stdout.write('.');
        }
      }
      process.stdout.write('\n');
    }
  }

  const uniquePositions = Array.from(new Set(tailPositions));
  console.log(uniquePositions.length, uniquePositions);
 // printTouchGrid(uniquePositions);
}