const fs = require('fs');
const path = require('path');
const { logLine } = require('../util/log-line');

const partTwo = true;
const check = partTwo ? 'some' : 'every';

function main() {
  const markers = loadFile();

}

main();

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

  const fileSystem = {
    path: '',
    files: [],
    folders: []
  };

  lines.splice(0, 1);

  let cwd = '/';
  for (let i = 0; i < lines.length; i++) {
    console.log('Command:' + lines[i]);
    [cwd, i] = parseCommand(i, lines, fileSystem, cwd);
  }

  calculateDirectorySize(fileSystem);

  let directoriesToDelete = [];
  findDirectoriesToDelete(fileSystem, directoriesToDelete)

  for (const dir of directoriesToDelete) {
    console.log(`${getPath(dir)} has a size of ${dir.size}`)
  }

  const dirSum = directoriesToDelete
    .reduce((dirSum, dir) => dirSum + dir.size, 0);

  console.log('Dir sum is ' + dirSum);

  const directories = listDirectories(fileSystem);

  const diskSize = 70000000;

  const free = diskSize - fileSystem.size;
  const required = 30000000;
  const remaining = required - free;

  directories
    .sort((a, b) => a.size - b.size);

  const theDirectory = directories
    .find(x => x.size >= remaining);

  console.log(`Directory ${getPath(theDirectory)} is the directory to delete with a size of ${theDirectory.size}`);
}


function listDirectories(entry, currentList = []) {
  currentList.push(entry);

  entry.folders.forEach(x => listDirectories(x, currentList));
  return currentList;
}

function getPath(entry) {
  const segments = [];
  while (entry.parent) {
    segments.push(entry.path);
    entry = entry.parent;
  }
  return `/${path.join(...segments)}`;
}

function calculateDirectorySize(entry) {
  const directFolderSize = entry.files.reduce((prev, cur) => prev + cur.size, 0);

  entry.size = directFolderSize + entry.folders.reduce((prev, subFolder) => prev + calculateDirectorySize(subFolder), 0);
  return entry.size;
}

function findDirectoriesToDelete(entry, directoriesToDelete) {
  if (entry.size <= 100000) {
    directoriesToDelete.push(entry);
  }

  entry.folders.forEach(subFolder => findDirectoriesToDelete(subFolder, directoriesToDelete));
}

function parseCommand(num, lines, fileSystem, cwd) {
  const cmd = lines[num];

  const [_, bin, args] = /([a-zA-Z-_]+) ?(.*)/.exec(cmd);

  switch (bin) {
    case 'cd':
      cwd = args === '/' ? args : path.join(cwd, args);
      break;
    case 'ls':
      num = collectFiles(cwd, lines, num + 1, fileSystem);
      break;
  }

  return [cwd, num];
}

function getFileSystemFolder(location, fileSystem) {
  if (location === '/') {
    return fileSystem;
  }

  const segments = location
    .split(path.sep);

  let currentEntry = null;
  for (const segment of segments) {
    if (!currentEntry) {
      currentEntry = fileSystem;
      continue;
    }

    let next = currentEntry.folders.find(x => x.path === segment);

    if (!next) {
      next = {
        path: segment,
        parent: currentEntry,
        files: [],
        folders: []
      };

      currentEntry.folders.push(next);
    }

    currentEntry = next;
  }

  return currentEntry;
}

function collectFiles(cwd, lines, i, fileSystem) {
  const folder = getFileSystemFolder(cwd, fileSystem);

  while (i < lines.length && !lines[i].startsWith('$')) {
    const entry = lines[i];

    i++;

    if (/^dir ([a-zA-Z0-9-_.]+)$/g.test(entry)) {
      const [_, dirName] = /^dir ([a-zA-Z0-9-_.]+)$/g.exec(entry);

      folder.folders.push({
        path: dirName,
        parent: folder,
        files: [],
        folders: []
      });
      continue;

    }

    const [__, size, name] = /^(\d+) ([a-zA-Z0-9-_.]+)$/g.exec(entry);
    folder.files.push({
      name,
      parent: folder,
      size: parseInt(size)
    });
  }

  return i - 1;
}
