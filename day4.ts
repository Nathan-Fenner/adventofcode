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
} from "./common";

console.info(input);

const g = parseGrid(input);

let count = 0;

const recheck = new Set<Pos2>();
for (const p of g.grid.keys()) {
  recheck.add(p);
}

for (const p of recheck) {
  recheck.delete(p);
  if (g.grid.get(p) !== "@") {
    continue;
  }

  let block = 0;
  for (const n of p.neighborsDiag()) {
    if (g.grid.get(n) === "@") {
      block += 1;
    }
  }
  if (block < 4) {
    count += 1;
    g.grid.set(p, "_");
    for (const n of p.neighborsDiag()) {
      recheck.add(n);
    }
  }
}
console.info({ count });
