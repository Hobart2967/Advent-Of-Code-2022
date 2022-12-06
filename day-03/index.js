const fs = require('fs');
const path = require('path');
const { logLine } = require('../util/log-line');

const partTwo = true;
const priorityMap = buildPriorityMap();


function partOne() {
  const rucksacks = loadRucksacks();

  printCompartments(rucksacks);
  logLine();
  console.log(`The sum of all is ${rucksacks.reduce((sum, x) => x.score + sum, 0)}`);
}

/**
 *
 * @param {string[][]} arr
 * @param {number} len
 * @returns {string[][][]}
 */
function chunkArray(arr, chunk_size) {
  return arr
    .map((_,i) => i % chunk_size === 0
      ? arr.slice(i, i + chunk_size)
      : null)
    .filter(e => !!e);
}

function doPartTwo() {
  const rucksacks = loadFile();
  const chunkedRucksacks = chunkArray(rucksacks, 3);
  const chunks = chunkedRucksacks
    .map((chunk) => chunk[0].find(item => chunk.every(rucksack => rucksack.includes(item))));

  for (const chunk of chunks) {
    console.log('Chunk results in ' + chunk);
  }

  logLine();
  console.log(`Total score is ${chunks.reduce((prev, cur) => prev + priorityMap[cur], 0)}`);
}

if (partTwo) {
  doPartTwo();
} else {
  partOne();
}


function buildPriorityMap() {
  const map = {};

  for (let i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); i++) {
    const priority = i - 'a'.charCodeAt(0) + 1;

    map[String.fromCharCode(i)] = priority;
    map[priority] = String.fromCharCode(i);
  }

  for (let i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) {
    const priority = i - 'A'.charCodeAt(0) + 27;

    map[String.fromCharCode(i)] = priority;
    map[priority] = String.fromCharCode(i);
  }

  return map;
}

function printCompartments(rucksacks) {
  for (const rucksack of rucksacks) {
    console.log(`First: ${rucksack.second} Second: ${rucksack.seconds} - Score ${rucksack.score}`);
  }
}

function loadFile() {
  const file = fs.readFileSync(
    path.join(
      __dirname,
      process.argv[2]))
  .toString();

  return file
    .split('\n')
    .map(rucksack => rucksack.split(''));
}

function loadRucksacks() {
  return loadFile()
    .map(rucksack => ([
      rucksack.slice(0, rucksack.length / 2),
      rucksack.slice(rucksack.length / 2)
    ]))
    .map(([first, second]) => ({
      first: first.join(''),
      second: second.join(''),
      equality: first.find(x => second.includes(x))
    }))
    .map(x => ({
      ...x,
      score: priorityMap[x.equality]
    }))
}
