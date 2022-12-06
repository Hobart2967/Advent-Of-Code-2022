const fs = require('fs');
const path = require('path');
const { logLine } = require('../util/log-line');

const partTwo = true;
const check = partTwo ? 'some' : 'every';

function main() {
  const rucksacks = loadAssignments();

  printAssignments(rucksacks);
}

main();

function printAssignments(groups) {
  for (const group of groups.filter(x => x.including)) {
    console.log(`${group.first[0]}-${group.first[1]}\t${group.including ? 'DOES' : 'NOT'} includes ${group.second[0]}-${group.second[1]}`);
  }

  logLine();
  console.log(`Total count of inclusions is ${groups.filter(x => x.including).length}`)
}

function loadFile() {
  const file = fs.readFileSync(
    path.join(
      __dirname,
      process.argv[2]))
  .toString();

  return file
    .split('\n')
    .map(assignments => assignments.split(','));
}

function loadAssignments() {
  const elveGroups = loadFile()
    .map(assignment => assignment.map(x => x.split('-').map(x => parseInt(x))));

  return elveGroups
    .map(assignments => assignments.map(assignment => ({
      assignment,
      order: Array.from(new Array(assignment[1] - assignment[0] + 1))
        .map((_, i) => i + assignment[0])
    })))
    .map((assignments) => ({
      first: assignments[0].assignment,
      second: assignments[1].assignment,
      including: assignments.some(first =>
        first.order[check](section =>
          assignments
            .filter(second => second !== first)
            .some(second => second.order.includes(section))))
    }))
}
