const fs = require('fs');
const path = require('path');
const { logLine } = require('../util/log-line');
const order = ['rock', 'paper', 'scissors'];

const partTwo = true;
const matches = loadMatches();

printMatches();
logLine();
console.log('End Score is ' + matches.reduce((sum, match) => match.score + sum, 0));

function getScore(input) {
  return {
    'rock': 1,
    'paper': 2,
    'scissors': 3
  }[input];
}

function getBetter(type) {
  let counter = type + 1;

  if (counter === order.length) {
    counter = 0;
  }

  return counter;
}

function getWorse(type) {
  let counter = type - 1;

  if (counter < 0) {
    counter = order.length - 1;
  }

  return counter;
}

function getMatchScore(opponent, mine) {
  const mineIndex = order.indexOf(mine);
  const opponentIndex = order.indexOf(opponent);
  if (mineIndex === opponentIndex) {
    return 3;
  }

  let myCounter = getBetter(mineIndex);
  let opponentCounter = getBetter(opponentIndex);

  if (opponentIndex === myCounter) {
    return 6;
  }

  if (mineIndex === opponentCounter) {
    return 0;
  }

  return 3;
}

function decode(input) {
  return {
    A: 'rock',
    B: 'paper',
    C: 'scissors',
    X: 'rock',
    Y: 'paper',
    Z: 'scissors'
  } [input];
}

function decodeResultType(input) {
  return {
    X: {
      displayName: 'loose',
      resolver: (opponent) => order[getWorse(order.indexOf(opponent))]
    },
    Y: {
      displayName: 'draw',
      resolver: (opponent) => opponent
    },
    Z: {
      displayName: 'win',
      resolver: (opponent) => order[getBetter(order.indexOf(opponent))]
    },
  }[input];
}

function printMatches() {
  for (const match of matches) {
    console.log(`${match.opponent}     \tvs \t${match.mine} (${match.resultType?.displayName ||''})    \tresults in: ${match.score} (Choice ${getScore(match.mine)} + Result ${match.matchScore})`);
    //console.log(`${match.opponent}     \tvs \t${match.mine}     \t  red in: ${match.score} (Choice ${getScore(match.mine)} + Result ${match.matchScore})`);
  }
}

function loadMatches() {
  const file = fs.readFileSync(
    path.join(
      __dirname,
      process.argv[2]))
  .toString();

  return file
    .split('\n')
    .map(group => group
        .split(' ')
        .map(x => ({ original: x, decoded: decode(x) })))
    .map(([opponent, mine]) => ({
      opponent: opponent.decoded,
      mine: mine.decoded,
      resultType: partTwo  ? decodeResultType(mine.original) : null,
    }))
    .map(x => ({
      ...x,
      mine: x.resultType ? x.resultType.resolver(x.opponent) : x.mine
    }))
    .map(x => ({
      ...x,
      myScore: getScore(x.mine),
      opponentScore: getScore(x.opponent),
      matchScore: getMatchScore(x.mine, x.opponent),
    }))
    .map(x => ({
      ...x,
      score: x.matchScore + x.myScore
    }));
}
