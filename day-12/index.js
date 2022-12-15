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

  const nodes = file
    .split('\n')
    .map(x => x.split(''));

  const horizontalSize = nodes[0].length;
  const verticalSize = nodes.length;

  const directAccessMap = Array.from(new Array(verticalSize)).map(() => Array.from(new Array(verticalSize)));

  let map = nodes
    .map((line, y) =>
      line.map((node, x) => ({
        node,
        x, y,
        weight: ['S', 'E'].includes(node) ? 0 : node.charCodeAt(0),
        checked: false
      })))
    .reduce((prev, cur) => ([...prev, ...cur]), [])
    .map(node => ({
      ...node,
      name: getNodeName(node),
      costs: node.node === 'S' ? 0 : null,
      predecessors: []
    }));

  for (const node of map) {
    directAccessMap[node.y][node.x] = node;
  }

  map.forEach(node => {
    node.neighbors = getNeighbors(node, directAccessMap, horizontalSize, verticalSize)
      .map(neighbor => ({
        node: neighbor,
        costsToReach: getCosts(node, neighbor)
      }))
      .filter(x => x.costsToReach <= 1);
  });

  const graph = new Graph();
  for (const node of map) {
    const neighbors = node.neighbors
      .reduce((prev, cur) => ({
        ...prev,
        [cur.node.name]: cur.costsToReach + 1 // Workaround for node-dijkstra (does not accept zero-costs)
      }), {});

    graph.addNode(
      node.name,
      neighbors);
  }


  const resultingPath = graph.path('S', 'E', );
  const resultingPath2 = graph.path('E', 'a', { reverse: true});
  console.log(`The path to the end is ${resultingPath.length - 1} steps long:\n\t${resultingPath.join(' -> ')}`);
//  const startNode = map.find(x => x.node === 'S');

  // let queue = [];
  // queue.push(startNode);
  // let currentPath = [];
  // while(queue.length) {
  //   let nextQueue = [];

  //   for (const queuedNode of queue) {
  //     if (queuedNode.node === 'S') {
  //       queuedNode.costs = 0;
  //     }

  //     for (const { node: neighbor } of node.neighbors) {
  //       neighbor.predecessor = queuedNode;

  //       let currentCosts = 0;
  //       let currentNode = neighbor;
  //       let currentPredecessor = queuedNode;
  //       while (currentPredecessor) {
  //         currentCosts += currentPredecessor.neighbors
  //           .find(({ node }) => node === neighbor)
  //           .costsToReach;

  //         currentPredecessor = currentPredecessor.predecessor;
  //       }

  //       nextQueue.push(neighbor);
  //     }

  //     queuedNode.checked = true;
  //   }

  //   queue = nextQueue.sort((a, b) => a.costs - b.costs);
  // }
}

function overrideStartEndWeight(nodeType, weight) {
  if (nodeType === 'S') {
    return 'a'.charCodeAt(0);
  }

  if (nodeType === 'E') {
    return 'z'.charCodeAt(0);
  }

  return weight;
}

function getCosts(source, target) {
  let [sourceWeight, targetWeight] = [source, target].map(x =>
    overrideStartEndWeight(x.node, x.weight));

  return Math.abs(sourceWeight - targetWeight);
}

function getNodeName(node) {
  if (node.node === 'S' || node.node === 'E') {
    return node.node;
  }

  return `${node.x}-${node.y}`;
}

function getNeighbors(node, directAccessMap, horizontalSize, verticalSize) {
  const neighbors = []
  const upper = { x: node.x, y: node.y - 1};
  if (upper.y >= 0) {
    neighbors.push(upper)
  }

  const lower = { x: node.x, y: node.y + 1};
  if (lower.y <= verticalSize - 1) {
    neighbors.push(lower);
  }

  const left = { x: node.x - 1, y: node.y };
  if (left.x >= 0) {
    neighbors.push(left);
  }

  const right = { x: node.x + 1, y: node.y };
  if (right.x <= horizontalSize - 1) {
    neighbors.push(right);
  }

  const neighborNodes = neighbors
    .map(neighbor => directAccessMap[neighbor.y][neighbor.x])
    .filter(x => !!x);

  return neighborNodes
}

loadFile();
