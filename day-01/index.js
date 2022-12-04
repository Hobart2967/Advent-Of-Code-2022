const fs = require('fs');
const path = require('path');
const { cursorTo } = require('readline');
const { logLine } = require('../util/log-line');

const elves = loadElves();

printElves();
orderElves();
printBestElf();

function orderElves() {
  elves.sort((a, b) => b.totalCaloriesCarried - a.totalCaloriesCarried);
}

function printBestElf() {
  logLine();

  //const highestCalories = elves.reduce((cur, prev) => Math.max(cur, prev.totalCaloriesCarried), 0);
  //const bestElfIndex = elves.findIndex(elf => elf.totalCaloriesCarried === highestCalories)

  // Part 2
  const bestElfIndex = 0;

  console.log(`Best MVP elf is the ${bestElfIndex} with ${elves[bestElfIndex].totalCaloriesCarried} calories carried.`);

  // Part 2
  console.log(`Second MVP elf is carrying ${elves[1].totalCaloriesCarried} calories`);
  console.log(`Third MVP elf is carrying ${elves[2].totalCaloriesCarried} calories.`);

  logLine();

  const topThree = elves.slice(0, 3).reduce((sum, elf) => elf.totalCaloriesCarried + sum, 0);
  console.log(`In total, they are carrying ${topThree} calories`);
}

function printElves() {
  for (let elfIndex = 0; elfIndex < elves.length; elfIndex++) {
    const elf = elves[elfIndex];
    console.log(`${elfIndex}. Elf is carrying ${elf.totalCaloriesCarried} calories`);
  }
}

function loadElves() {
  const file = fs.readFileSync(
    path.join(
      __dirname,
      process.argv[2]))
  .toString();

  return file
    .split('\n\n')
    .map(group => ({
      items: group
        .split('\n')
        .map(x => parseInt(x))
    }))
    .map(group => ({
      ...group,
      totalCaloriesCarried: group.items.reduce((a, b) => a + b, 0)
    }));
}
