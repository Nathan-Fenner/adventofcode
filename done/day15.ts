import {
  debug,
  disableDebug,
  exploreBranches,
  input,
  iota,
  memoize,
  modifyVal,
  sorted,
  fixedStanzas,
  toNum,
  mod,
  record,
  egcd,
  Pos2,
  product,
  printGrid,
  parseGrid,
  gcd,
  div,
  assert,
} from "../common";

const points: { sensor: Pos2; beacon: Pos2 }[] = input
  .split("\n")
  .map((line) => {
    const parts = line
      .replace(/[^\d-]/g, " ")
      .trim()
      .split(/\s+/);
    return {
      sensor: new Pos2(toNum(parts[0]), toNum(parts[1])),
      beacon: new Pos2(toNum(parts[2]), toNum(parts[3])),
    };
  });

console.info(points);

function canBeSensor(guess: Pos2): boolean {
  for (const { beacon, sensor } of points) {
    if (guess === beacon) {
      return true;
    }
    const closestDist = beacon.distAdd(sensor);
    const myDist = sensor.distAdd(guess);
    if (myDist <= closestDist) {
      return false;
    }
  }
  return true;
}

let min = points[0].sensor;
let max = points[0].sensor;
for (const { beacon, sensor } of points) {
  const d = beacon.distAdd(sensor);
  min = new Pos2(Math.min(min.x, sensor.x - d), Math.min(min.y, sensor.y - d));
  max = new Pos2(Math.max(max.x, sensor.x + d), Math.max(max.y, sensor.y + d));
}

function mid(a: number, b: number): number {
  return Math.floor((a + b) / 2);
}

function checkSquare(min: Pos2, max: Pos2): Pos2 | null {
  // console.info(min, max);
  for (const { beacon, sensor } of points) {
    const d = beacon.distAdd(sensor);
    // Check if covered..
    if (
      sensor.distAdd(min) <= d &&
      sensor.distAdd(max) <= d &&
      sensor.distAdd(new Pos2(min.x, max.y)) <= d &&
      sensor.distAdd(new Pos2(max.x, min.y)) <= d
    ) {
      return null;
    }
  }
  if (min === max) {
    console.info("verify");

    return min;
  }
  // Otherwise, split in halve.
  if (Math.abs(min.x - max.x) >= Math.abs(min.y - max.y)) {
    return (
      checkSquare(min, new Pos2(mid(min.x, max.x), max.y)) ||
      checkSquare(new Pos2(mid(min.x, max.x) + 1, min.y), max)
    );
  } else {
    return (
      checkSquare(min, new Pos2(max.x, mid(min.y, max.y))) ||
      checkSquare(new Pos2(min.x, mid(min.y, max.y) + 1), max)
    );
  }
}

const maxSe = 4_000_000;
const tunMu = 4000000;
// x * tunMu + y

const found = checkSquare(new Pos2(0, 0), new Pos2(maxSe, maxSe));
console.info(found);
console.info(found!.x * maxSe + found!.y);
