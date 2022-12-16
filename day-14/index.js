const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const SAND = chalk.bgBlack(chalk.hex('c2b280')('⡿'));
const AIR = chalk.bgBlack(chalk.black('.'));
const ROCK = chalk.bgGray(chalk.gray('#'));

async function loadFile() {
  const file = fs.readFileSync(
    path.join(
      __dirname,
      process.argv[2]))
  .toString();

  let lines = parseLines(file);
  const fieldInfo = getFieldInfo(lines);

  console.log('Normalizing values...')
  lines = lines.map(({points}) => ({
    points,
    normalizedPoints: points.map(point => normalize(point, fieldInfo))
  }));
  console.log('');

  const field = Array.from(new Array(fieldInfo.y.size))
    .map(() => Array.from(new Array(fieldInfo.x.size))
      .map(() => AIR));

  //drawSand(field, fieldInfo);
  drawRocks(lines, field, fieldInfo);

  drawField(fieldInfo, field);

  const sandBlocks = [];
  while (true)  {
    /*console.log('\033[2J');
    drawField(fieldInfo, field);*/

    if (!sandBlocks.length || sandBlocks.every(x => x.blocked)) {
      const sandBlock = {
        blocked: false,
        point: { x: 500, y: 0}
      };
      sandBlocks.push(sandBlock);
      drawPoint(field, SAND, normalize(sandBlock.point, fieldInfo));
      continue;
    }

    const currentSandBlock = sandBlocks.find(x => !x.blocked);
    if (canFall(currentSandBlock, field, fieldInfo)) {
      let normalizedSandPoint = normalize(currentSandBlock.point, fieldInfo);
      drawPoint(field, AIR, normalizedSandPoint);

      normalizedSandPoint = getNextPoint(normalizedSandPoint, field);
      if (normalizedSandPoint.y > fieldInfo.y.size - 1 || normalizedSandPoint.x < 0 || normalizedSandPoint.x > fieldInfo.x.size - 1) {
        console.log(`Abyss reached with ${sandBlocks.length - 1} sandblocks`)
        return;
      }
      currentSandBlock.point = denormalize(normalizedSandPoint, fieldInfo);

      drawPoint(field, SAND, normalizedSandPoint);
    }

    updateCollision(currentSandBlock, field, fieldInfo);

    //await new Promise(resolve => setTimeout(() => resolve(), 100));
  }
}

function getNextPoint(point, field) {
  const {x, y} = point;

  if ([AIR, undefined].includes(field[y + 1][x])) {
    return {
      x,
      y: y + 1
    };
  }

  if ([AIR, undefined].includes(field[y + 1][x - 1])) {
    return {
      x: x - 1,
      y: y + 1
    };
  }

  if ([AIR, undefined].includes(field[y + 1][x + 1])) {
    return {
      x: x + 1,
      y: y + 1
    };
  }

  return null;
}

function updateCollision(sandBlock, field, fieldInfo) {
  if (canFall(sandBlock, field, fieldInfo)) {
    return;
  }

  sandBlock.blocked = true;
}

function canFall(block, field, fieldInfo) {
  const { x, y } = normalize(block.point, fieldInfo);
  if ([AIR, undefined].includes(field[y + 1][x])) {
    return true;
  }

  if ([AIR, undefined].includes(field[y + 1][x - 1])) {
    return true;
  }

  if ([AIR, undefined].includes(field[y + 1][x + 1])) {
    return true;
  }

  return false;
}

function parseLines(file) {
  return file
    .split('\n')
    .map(line => ({
      points: line
        .split(' -> ')
        .map(point => point
          .split(',')
          .map(x => parseInt(x)))
        .map(([x, y]) => ({ x, y }))
    }));
}

function getFieldInfo(lines) {
  const fieldMeta = {
    x: {
      min: Math.min(500, ...getValues(x => x.x, lines)),
      max: Math.max(500, ...getValues(x => x.x, lines)),
    },
    y: {
      min: Math.min(0, ...getValues(x => x.y, lines)),
      max: Math.max(0, ...getValues(x => x.y, lines)),
    }
  };

  const fieldInfo = {
    x: {
      ...fieldMeta.x,
      size: fieldMeta.x.max - fieldMeta.x.min + 1
    },
    y: {
      ...fieldMeta.y,
      size: fieldMeta.y.max - fieldMeta.y.min + 1
    },
  };
  return fieldInfo;
}

function drawRocks(lines, field, fieldInfo) {
  for (const line of lines) {
    const availablePoints = [...line.points];
    let from = availablePoints.shift();

    do {
      let to = availablePoints.shift();
      drawRock(from, to, field, fieldInfo);
      from = to;
    } while (availablePoints.length);
  }
}

function drawField(fieldInfo, field) {
  console.log(`H: ${fieldInfo.x.min} (0) to ${fieldInfo.x.max} (${fieldInfo.x.size}) `);
  console.log(`V: ${fieldInfo.y.min} (0) to ${fieldInfo.y.max} (${fieldInfo.y.size}) `);
  console.log('');
  console.log('   ' + Array.from(new Array(fieldInfo.x.size))
    .map((_, i) => i).join(''));

  for (let y = 0; y < field.length; y++) {
    const line = field[y];

    for (let x = 0; x < line.length; x++) {
      if (x === 0) {
        process.stdout.write(String(y).padStart(2, ' ') + ' ');
      }

      const point = line[x];

      process.stdout.write(point || AIR);
    }

    process.stdout.write('\n');
  }
}

function drawRock(from, to, field, fieldInfo) {
  let propertyAccessor = from.x === to.x
    ? 'y'
    : 'x';

  let staticValueAccessor = from.x === to.x
    ? 'x'
    : 'y';

  const fromPosition = Math.min(from[propertyAccessor], to[propertyAccessor]);
  const toPosition = Math.max(from[propertyAccessor], to[propertyAccessor]);

  for (let i = fromPosition; i <= toPosition; i++) {
    const nextPoint = {
      [propertyAccessor]: i,
      [staticValueAccessor]: from[staticValueAccessor]
    };
    drawPoint(field, ROCK, normalize(nextPoint, fieldInfo));
  }
}

function drawPoint(field, type, point) {
  const {x, y} = point;
  field[y][x] = type;
}

function denormalize(point, field) {
  return {
    x: point.x + field.x.min,
    y: point.y + field.y.min
  }
}

function normalize(point, field) {
  return {
    x: point.x - field.x.min,
    y: point.y - field.y.min
  }
}

function getValues(getter, lines) {
  return lines
    .map(x => x.points.map(getter))
    .reduce((previousLinesPoints, points) =>([ ...previousLinesPoints, ...points ]), []);
}

loadFile();

function getIndentationStart(indentationLevel) {
  return Array.from(new Array(indentationLevel * 2)).map(() => ' ').join('');
}
