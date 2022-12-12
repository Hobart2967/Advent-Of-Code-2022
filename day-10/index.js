const fs = require('fs');
const chalk = require('chalk');
const path = require('path');
const { cursorTo } = require('readline');
const { logLine } = require('../util/log-line');

async function main() {
  const file = fs.readFileSync(
    path.join(
      __dirname,
      process.argv[2]))
  .toString();

  const commands = file
    .split('\n');

  const instructions = [];
  let cycle = 1;
  for (const command of commands) {
    if (command === 'noop') {
      instructions.push({ type: 'noop', cycle });
    }

    if (/^addx -?\d+$/g.test(command)) {
      const [_, value] = /^addx (-?\d+)$/g.exec(command);
      cycle++;
      instructions.push({ type: 'addx', value: parseInt(value), cycle: cycle + 1});
    }

    cycle++;
  }

  let X = 1;
  const signalStrengths = [];
  const cyclesToCompletion = Math.max(220, ...instructions.map(x => x.cycle));

  const displayConfig = {
    width: 40,
    height: 6,
  }

  const display = Array.from(new Array(displayConfig.height)).map(() =>
    Array.from(new Array(displayConfig.width)));

  for (let i = 1; i <= cyclesToCompletion; i++) {
    const instruction = instructions.find(x => x.cycle === i);


    if (instruction && instruction.type === 'noop' && instruction.cycle === i) {
      console.log(`(${i}) [noop]`);
    } else if(instruction && instruction.cycle === i) {
      console.log(`(${i}) [addx](${instruction.value}), X: ${X}`);
      X += instruction.value;
      console.log(`(${i}.END) ===> X: ${X}`);
    }

    let lineNumber = Math.floor((i - 1) / displayConfig.width);
    let horizontalPosition = (i - 1) % displayConfig.width;

    const positions = Array.from(new Array(3)).map((_, i) => X + i - 1);
    if (positions.includes(horizontalPosition)) {
      display[lineNumber][horizontalPosition] = chalk.red('█');
    } else {
      display[lineNumber][horizontalPosition] = ' ';
    }


    const signalStrength = X * i;
    //console.log(`===> Signal Strength: ${signalStrength}`);

    const monitoredCycles = [20, 60, 100, 140, 180, 220]
    if (monitoredCycles.includes(i)) {
      signalStrengths.push({i, signalStrength, X});
    }
  }

  console.log('signalStrengths', signalStrengths);
  console.log('strengthSum', signalStrengths.reduce((prev, cur) => cur.signalStrength + prev, 0))

  for (let y = 0; y < displayConfig.height; y++) {
    for (let x = 0; x < displayConfig.width; x++) {
      process.stdout.write(display[y][x] || '.');
    }
    process.stdout.write('\n');
  }
}

main();