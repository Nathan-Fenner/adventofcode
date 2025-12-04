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
for (const p of g.grid) {
  if (p[1] === "@") {
    let block = 0;
    for (const n of p[0].neighborsDiag()) {
      if (g.grid.get(n) === "@") {
        block += 1;
      }
    }
    if (block < 4) {
      count += 1;
    }
  }
}
console.info({ count });
