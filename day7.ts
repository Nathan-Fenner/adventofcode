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

const g = parseGrid(input);

const visit = memoize((p: Pos2): number => {
  if (!g.grid.has(p)) {
    return 1;
  }
  if (g.grid.get(p) === "^") {
    return visit(p.shift(1, 0)) + visit(p.shift(-1, 0));
  }
  return visit(p.shift(0, 1));
});

for (const [p, v] of g.grid) {
  if (v === "S") {
    console.info("count", visit(p));
  }
}
