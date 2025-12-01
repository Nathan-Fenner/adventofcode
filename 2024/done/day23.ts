import { assert } from "console";
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

const gOriginal = parseGrid(input).grid;

const ortho = record({
  N: new Pos2(0, -1),
  E: new Pos2(1, 0),
  S: new Pos2(0, 1),
  W: new Pos2(-1, 0),
});

function dirOf(s: string): Pos2 {
  return s
    .split("")
    .map((x) => ortho[x])
    .reduce((a, b) => a.add(b), new Pos2(0, 0));
}

let checkOrders = [
  ["N", "NE", "NW"],
  ["S", "SE", "SW"],
  ["W", "NW", "SW"],
  ["E", "SE", "NE"],
];

function step(
  g: Map<Pos2, string>,
  checkOrders: string[][],
): [Map<Pos2, string>, boolean] {
  let moved = false;
  let movers = 0;
  const decide = new Map<Pos2, Pos2 | null>();
  for (const [p, v] of g) {
    if (v === "#") {
      if (p.neighborsDiag().every((q) => g.get(q) !== "#")) {
        continue;
      }
      // no elf in N, NE, NW, move north
      // no else S,SE,SW, move south
      // none in W,NWSW, move west
      // none in E,NE,SE, move east
      for (const check of checkOrders) {
        if (check.every((d) => g.get(dirOf(d).add(p)) !== "#")) {
          decide.set(p, p.add(dirOf(check[0])));
          movers++;
          break;
        }
      }
    }
  }
  const after = new Map<Pos2, string>();
  for (const [p, v] of g) {
    if (v !== "#") {
      continue;
    }
    const d = decide.get(p)!;
    if (!d || [...decide].filter((q) => q[1] === d).length > 1) {
      after.set(p, "#");
    } else {
      after.set(d, "#");
      moved = true;
    }
  }
  console.info({ movers, total: g.size });
  return [after, moved];
}

let g = gOriginal;
for (let round = 0; true; round++) {
  // console.info({ round, checkOrders });
  // printGrid(g);
  let moved = true;
  [g, moved] = step(g, checkOrders);
  if (!moved) {
    console.info("no move on round", round + 1);
    break;
  }
  checkOrders.push(checkOrders.shift()!);
}
printGrid(g);

let min = first(g.keys());
let max = first(g.keys());
for (const p of g.keys()) {
  min = new Pos2(Math.min(min.x, p.x), Math.min(min.y, p.y));
  max = new Pos2(Math.max(max.x, p.x), Math.max(max.y, p.y));
}

console.info((max.x - min.x + 1) * (max.y - min.y + 1) - g.size);
