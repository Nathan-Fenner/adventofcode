import { assert } from "console";
import { parse } from "path";
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
  printGrid,
  parseGrid,
  gcd,
  div,
  rangeInclusive,
  Pos3,
  first,
  ValueType,
  sum,
  product,
} from "./common";

console.info(input);

const pts = input.split("\n").map((line) => {
  const [xs, ys] = line.split(",");
  return new Pos2(toNum(xs), toNum(ys));
});

const nums = sorted(
  new Set([...pts.map((p) => p.x), ...pts.map((p) => p.y)]),
  (x) => x,
);
console.info({ nums });

const compress = (v: number): number => {
  if (nums.includes(v)) {
    return nums.indexOf(v) * 2;
  }
  if (v < nums[0]) {
    return -1;
  }
  const first = nums.findIndex((x) => v > x);
  return first * 2 + 1;
};

const compressPoint = (p: Pos2): Pos2 => {
  return new Pos2(compress(p.x), compress(p.y));
};

const compressedGrid = new Map<Pos2, string>();
let last = pts.at(-1)!;
for (const p of pts) {
  console.info("last=", last, "p=", p);
  const c1 = compressPoint(last);
  const c2 = compressPoint(p);
  console.info("c1=", c1, "c2=", c2);
  compressedGrid.set(compressPoint(p), "O");
  const dir = new Pos2(Math.sign(c2.x - c1.x), Math.sign(c2.y - c1.y));
  console.info("dir=", dir);
  let next = c1.add(dir);
  while (next !== c2) {
    console.info("next=", next);
    compressedGrid.set(next, "X");
    next = next.add(dir);
  }
  last = p;
}

// Flood fill the outside.
const min = new Pos2(
  Math.min(...[...compressedGrid.keys()].map((p) => p.x)) - 1,
  Math.min(...[...compressedGrid.keys()].map((p) => p.y)) - 1,
);
const max = new Pos2(
  Math.max(...[...compressedGrid.keys()].map((p) => p.x)) + 1,
  Math.max(...[...compressedGrid.keys()].map((p) => p.y)) + 1,
);

const queue = new Set([min]);
for (const p of queue) {
  if (compressedGrid.has(p)) {
    continue;
  }
  if (p.x < min.x || p.y < min.y || p.x > max.x || p.y > max.y) {
    continue;
  }
  compressedGrid.set(p, "!");
  for (const n of p.neighborsOrtho()) {
    queue.add(n);
  }
}

for (let x = min.x; x <= max.x; x++) {
  for (let y = min.y; y <= max.y; y++) {
    if (!compressedGrid.has(new Pos2(x, y))) {
      compressedGrid.set(new Pos2(x, y), "X");
    }
  }
}

const isGood = memoize((a: Pos2, b: Pos2): boolean => {
  const c1 = compressPoint(a);
  const c2 = compressPoint(b);

  const ok = (p: Pos2): boolean => {
    return compressedGrid.get(p) !== "!";
  };

  for (let x = Math.min(c1.x, c2.x); x <= Math.max(c1.x, c2.x); x++) {
    if (!ok(new Pos2(x, c1.y))) {
      return false;
    }
    if (!ok(new Pos2(x, c2.y))) {
      return false;
    }
  }

  for (let y = Math.min(c1.y, c2.y); y <= Math.max(c1.y, c2.y); y++) {
    if (!ok(new Pos2(c1.x, y))) {
      return false;
    }
    if (!ok(new Pos2(c2.x, y))) {
      return false;
    }
  }
  return true;
});

printGrid(compressedGrid);

let maxArea = 0;
for (const p of pts) {
  for (const q of pts) {
    if (!isGood(p, q)) {
      continue;
    }
    const area = (Math.abs(p.x - q.x) + 1) * (Math.abs(p.y - q.y) + 1);
    maxArea = Math.max(maxArea, area);
  }
}

console.info({ maxArea });
