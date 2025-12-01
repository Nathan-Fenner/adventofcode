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
} from "../common";

console.info(input);

const g = parseGrid(input).grid;

const dirOf = record({
  ">": new Pos2(1, 0),
  v: new Pos2(0, 1),
  "^": new Pos2(0, -1),
  "<": new Pos2(-1, 0),
});

const blizzards: { at: Pos2; dir: Pos2 }[] = [];
for (const [p, v] of g) {
  if (v === "#" || v === ".") {
    continue;
  }
  blizzards.push({ at: p, dir: dirOf[v] });
}

function stepBlizzards() {
  for (const b of blizzards) {
    b.at = b.at.add(b.dir);
    if (g.get(b.at) === "#") {
      // teleport back
      while (g.get(b.at.sub(b.dir)) !== "#") {
        b.at = b.at.sub(b.dir);
      }
    }
  }
}

class Progress extends ValueType {
  constructor(public readonly at: Pos2, public readonly pass: number) {
    super([at, pass]);
  }
}

let reachable = new Set<Progress>([new Progress(new Pos2(1, 0), 0)]);

function isOut(p: Pos2): boolean {
  return !g.has(p.shift(0, 1));
}
function isIn(p: Pos2): boolean {
  return !g.has(p.shift(0, -1));
}

for (let step = 0; true; step++) {
  console.info({ step });

  const newReachable = new Set<Progress>();
  for (const pr of reachable) {
    newReachable.add(pr);
    for (const n of pr.at.neighborsOrtho()) {
      newReachable.add(new Progress(n, pr.pass));
    }
  }
  const inbliz = new Set<Pos2>(blizzards.map((b) => b.at));
  for (const p of newReachable) {
    if (!g.has(p.at) || g.get(p.at) === "#" || inbliz.has(p.at)) {
      newReachable.delete(p);
    }
  }

  stepBlizzards();
  reachable = newReachable;

  const atEnd = [...reachable].find((q) => q.pass === 0 && isOut(q.at));
  if (atEnd) {
    reachable.add(new Progress(atEnd.at, 1));
  }
  const atBegin = [...reachable].find((q) => q.pass === 1 && isIn(q.at));
  if (atBegin) {
    reachable.add(new Progress(atBegin.at, 2));
  }
  if ([...reachable].some((q) => isOut(q.at) && q.pass === 2)) {
    console.info(step);
    break;
  }
}
