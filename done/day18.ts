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
  rangeInclusive,
  Pos3,
} from "../common";

console.info(input);

const pts = new Set(
  input.split("\n").map((p) => {
    const [x, y, z] = p.split(",");
    return new Pos3(toNum(x), toNum(y), toNum(z));
  }),
);

let min = [...pts][0];
let max = min;
for (const p of pts) {
  min = new Pos3(
    Math.min(min.x, p.x),
    Math.min(min.y, p.y),
    Math.min(min.z, p.z),
  );
  max = new Pos3(
    Math.max(max.x, p.x),
    Math.max(max.y, p.y),
    Math.max(max.z, p.z),
  );
}

function isOut(p: Pos3): boolean {
  return (
    p.x < min.x ||
    p.x > max.x ||
    p.y < min.y ||
    p.y > max.y ||
    p.z < min.z ||
    p.z > max.z
  );
}

const isInsideCache = new Map<Pos3, boolean>();

function findInside(p: Pos3, block: ReadonlySet<Pos3>): boolean {
  if (isInsideCache.has(p)) {
    return isInsideCache.get(p)!;
  }
  const queue = new Set([p]);
  let out = false;
  for (const q of queue) {
    if (isOut(q)) {
      out = true;
      continue;
    }
    for (const n of q.neighborsOrtho()) {
      if (!block.has(n)) {
        queue.add(n);
      }
    }
  }
  for (const q of queue) {
    isInsideCache.set(q, out);
  }

  return out;
}

let sides = 0;
for (const p of pts) {
  for (const q of p.neighborsOrtho()) {
    if (!pts.has(q)) {
      if (findInside(q, pts)) {
        sides++;
      }
    }
  }
}

console.info(sides);
