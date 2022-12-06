const fs = require('fs');
const path = require('path');
const { logLine } = require('../util/log-line');

const partTwo = true;
const check = partTwo ? 'some' : 'every';

function main() {
  const stacks = loadStacks();

  printAssignments(stacks);
}

main();

/**
 *
 * @param {string[][]} stacks
 */
function printAssignments(stacks) {
  console.log('Message is ' + stacks.map(x => x.pop()).join(''));
}

function chunkArray(arr, chunk_size) {
  return arr
    .map((_,i) => i % chunk_size === 0
      ? arr.slice(i, i + chunk_size)
      : null)
    .filter(e => !!e);
}

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

  const crateStacks = [];

  const lines = file
    .split('\n');

  const separator = lines.findIndex(x => !x);
  stackInitLines = lines.splice(0, separator - 1);
  const [countLine] = lines.splice(0, 1);
  const counts =
    countLine
      .split(' ')
      .filter(x => /\d/.test(x));

  const maxCount = Math.max(...counts);
  for (let i = 0; i < maxCount; i++) {
    crateStacks.push([]);
  }

  lines.splice(0, 1);

  for(const stackInitLine of stackInitLines) {
    const commands = chunkArray(stackInitLine
      .split(''), 4);

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i].join('');

      const crate = command
        .replace(/.*([A-Z]).*/g, '$1')
        .replace(/ /g, '');;
      if (!crate) {
        continue;
      }

      crateStacks[i].unshift(crate);
    }
  }

  return [crateStacks, lines]
}

/**
 *
 * @returns string[][]
 */
function loadStacks() {
  const [stacks, assignments] = loadFile();

  for(const assignment of assignments) {
    let [_, count, source, target] = /move (\d+) from (\d+) to (\d+)/g.exec(assignment);
    [count, source, target] = [count, source, target].map(x => parseInt(x));

    target--;
    source--;

    const movedItems = stacks[source].splice(count * -1, count);
    //movedItems.reverse();
    stacks[target].push(...movedItems);
  }

  return stacks;
}
