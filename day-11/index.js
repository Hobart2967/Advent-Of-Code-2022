const path = require('path');
const fs = require('fs');
const vm = require('vm');
const { logLine } = require('../util/log-line');

const verbose = false;
const rounds = 10000;

async function loadFile() {
  const file = fs.readFileSync(
    path.join(
      __dirname,
      process.argv[2]))
  .toString();

  const groups = file.split('\n\n');
  const monkeyData = groups
    .map(x => parseProperties(x.split('\n')));

  console.log('Starting inspections...');
  const monkeys = monkeyData.map(parseMonkey);

  const primeProduct = monkeys.reduce((prev, cur) => prev * cur.divisor, 1);
  for (let i = 0; i < rounds; i++) {
    for (const monkey of monkeys) {
      if (verbose) {
        console.log(`Monkey ${monkey.id}`);
      }

      if (monkey.items.length === 0) {
        continue;
      }

      // Part 1
      //startInspection(monkey, monkeys, (newWorryLevel) => Math.floor(newWorryLevel / 3));

      // Part 2
      startInspection(monkey, monkeys, (newWorryLevel) => newWorryLevel % primeProduct);

      // await new Promise(resolve => setTimeout(resolve, 1000));
    }

    /*for (const monkey of monkeys) {
      monkey.items = monkey.catchingItems;
    }*/

    const roundNumber = i + 1;
    if (!(roundNumber % 1000) || roundNumber / 20 === 1 || roundNumber / 1 === 1) {
      console.log(`After round ${ i + 1 }, the monkeys are holding items with these worry levels:`);
      //console.log(monkeys.map(x => `Monkey ${x.id}: ${x.items.join(', ')}`).join('\n'));
      console.log(monkeys
        .map(monkey => `Monkey ${monkey.id} inspected items ${monkey.inspectionCount} times.`)
        .join('\n'));
    }
    //
    //logLine();
  }



  const result = monkeys
    .sort((a, b) => b.inspectionCount - a.inspectionCount)
    .slice(0, 2)
    .reduce((prev, cur) => prev * cur.inspectionCount, 1);

  console.log(result);
}

function startInspection(sourceMonkey, monkeys, nerf) {
  if (sourceMonkey.inspectionCount === undefined) {
    sourceMonkey.inspectionCount = 0;
  }

  while (sourceMonkey.items.length) {
    const item = sourceMonkey.items.shift();

    if (verbose) {
      console.log(`  Monkey inspects an item with a worry level of ${item}`);
    }

    let newWorryLevel = sourceMonkey.operation(item)
    if (verbose) {
      console.log(`    New worry level is ${newWorryLevel}`);
    }


    newWorryLevel = nerf(newWorryLevel);

    if (verbose) {
      console.log(`    Monkey gets bored with the item. Worry level is nerfed to ${newWorryLevel}`);
    }

    const testResult = sourceMonkey.test(newWorryLevel);
    if (verbose) {
      console.log(`    Current worry level is ${testResult ? '' : 'not '} divisible by ${sourceMonkey.divisor}`);
    }

    const target = sourceMonkey.targets[testResult]
    if (verbose) {
      console.log(`    Item with worry level ${newWorryLevel} is thrown to monkey ${target}`);
    }

    const targetMonkey = monkeys.find(x => x.id === target);
    targetMonkey.items.push(newWorryLevel);
    sourceMonkey.inspectionCount++;
  }
}

function parseMonkey(monkeyData) {
  const nameKey = Object.keys(monkeyData).find(x => x.startsWith('Monkey'));

  const id = parseInt(nameKey.replace(/Monkey (.*)/g, '$1'));
  const operationCode = `${monkeyData.$children.Operation
    .replace(/old/g, 'oldVal')
    .replace(/new/g, 'newVal')};`;

  if (verbose) {
    console.log(operationCode.toString());
  }

  const operation = (oldVal) => {
    if (verbose) {
      console.log('oldVal', oldVal);
      console.log(operationCode);
    }
    return vm.runInNewContext(operationCode, { oldVal: parseInt(oldVal), newVal: null })
  };

  const items = monkeyData.$children['Starting items']
    .replace(/ /g, '')
    .split(',');

  const divisor = parseInt(monkeyData.$children['Test']
    .replace(/divisible by (.*)/g, '$1'));

  test = (value) => value % divisor === 0;

  const targets = {
    [true]: parseInt(monkeyData.$children.$children['If true']
              .replace(/throw to monkey (.*)/g, '$1')),
    [false]: parseInt(monkeyData.$children.$children['If false']
              .replace(/throw to monkey (.*)/g, '$1'))
  };

  return {
    id,
    operation,
    items,
    catchingItems: [],
    test,
    divisor,
    targets
  };
}

function getIndentationStart(indentationLevel) {
  return Array.from(new Array(indentationLevel * 2)).map(() => ' ').join('');
}

function parseProperties(propertyLines, indentationLevel = 0, container = {}) {
  const currentIndentationStart = getIndentationStart(indentationLevel);
  const nextLevelIndentationStart = getIndentationStart(indentationLevel + 1);
  for (let lineNumber = 0; lineNumber < propertyLines.length; lineNumber++) {
    const line = propertyLines[lineNumber];

    container.$children = container.$children || {};

    if (line.startsWith(nextLevelIndentationStart)) {
      let endIndex = propertyLines.findIndex(x => !x.startsWith(currentIndentationStart));
      if (endIndex < 0) {
        endIndex = undefined;
      }

      const childrenLines = propertyLines.slice(lineNumber, endIndex);
      parseProperties(childrenLines, indentationLevel + 1, container.$children);

      if (endIndex < 0) {
        break;
      }

      lineNumber = endIndex - 1;
      continue;
    }

    const [property, value] = line.split(':');
    container[property.replace(/^[ ]+/g, '')] = value.replace(/^[ ]+/g, '');
  }

  return container;
}

loadFile();
