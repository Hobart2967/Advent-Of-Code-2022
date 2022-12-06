const fs = require('fs');
const path = require('path');
const { logLine } = require('../util/log-line');

const partTwo = true;
const check = partTwo ? 'some' : 'every';

function main() {
  const markers = loadFile();

  printAssignments(markers);
}

main();

function printAssignments(markers) {
  for(let i = 1; i <= markers.length; i++) {
    const marker = markers[i -1];
    console.log(`${i}. Marker at position ${marker}`);
  }
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

  const lines = file
    .split('\n');

  return lines
    .map(message => {
      let marker = 0;
      let currentLetters = [];

      const groupSize = 14;

      for (const letter of message.split('')) {
        marker++;
        if (currentLetters.length < groupSize) {
          currentLetters.push(letter);
          continue;
        }

        currentLetters.shift();
        currentLetters.push(letter);

        if (Array.from(new Set(currentLetters)).length === groupSize) {
          break;
        }
      }

      return marker;
    })
}