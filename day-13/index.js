const path = require('path');
const fs = require('fs');
const vm = require('vm');
const Graph = require('node-dijkstra');

async function loadFile() {
  const file = fs.readFileSync(
    path.join(
      __dirname,
      process.argv[2]))
  .toString();

  const pairs = file
    .split('\n\n')
    .map(x => x.split('\n').map(x => JSON.parse(x)));

  let indices = []

  for (let i = 1; i <= pairs.length; i++) {
    const pair = pairs[i - 1];
    console.log(`== Pair ${i} ==`);
    const result = compare(pair, 0, indices);
    if (result < 0) {
      indices.push(i);
    }

    console.log('\n');
  }

  console.log(indices.reduce((prev, cur) => prev + cur, 0));

  const dividerPackets = [
    [[2]],
    [[6]]
  ];

  const allPackets = pairs
    .reduce((prev, cur) => [...prev, ...cur], [])
    .concat(dividerPackets);

  allPackets.sort((a, b) => compare([a, b], 0, []));

  const [packageA, packageB] = dividerPackets.map(x => allPackets.findIndex(y => y === x));
  console.log(packageA + 1, packageB + 1, (packageA + 1) * (packageB + 1));
}

function getIndentationStart(indentationLevel) {
  return Array.from(new Array(indentationLevel * 2)).map(() => ' ').join('');
}


function compare(pair, indentation = 0, indices) {
  let [first, second] = pair;

  console.log(`${getIndentationStart(indentation)}- Compare ${JSON.stringify(first)} vs ${JSON.stringify(second)}`);

  if (typeof first === 'number' && typeof second === 'number') {
    if (first < second) {
      console.log(`${getIndentationStart(indentation + 1)}- Left side is smaller, so inputs are in the right order`);
      return -1;
    }

    if (first > second) {
      console.log(`${getIndentationStart(indentation + 1)}- Left side is larger, so inputs are not in the right order`);
      return 1;
    }

    if (first === second) {
      return 0;
    }
  }

  if (Array.isArray(first) && typeof second === 'number') {
    console.log(`${getIndentationStart(indentation)}- Mixed types; convert right to [${second}] and retry comparison`);
    second = [second];
  }

  if (typeof first === 'number' && Array.isArray(second)) {
    console.log(`${getIndentationStart(indentation)}- Mixed types; convert left to [${first}] and retry comparison`);
    first = [first];
  }

  for (let i = 0; i < Math.max(first.length, second.length); i++) {
    if (first[i] === undefined) {
      console.log(`${getIndentationStart(indentation + 1)}- Left side ran out of items, so inputs are in the right order`);
      return -1;
    }

    if (second[i] === undefined) {
      console.log(`${getIndentationStart(indentation + 1)}- Right side ran out of items, so inputs are not in the right order`);
      return 1;
    }

    const result = compare([first[i], second[i]], indentation + 1, indices);
    if (Math.abs(result) === 1) {
      return result;
    }
  }

  return 0;
}

loadFile();
