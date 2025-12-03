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

let total = 0;
for (const line of input.split("\n")) {
  const f = memoize((index: number, left: number): number => {
    if (index + left === line.length) {
      return toNum(line.slice(index));
    }
    if (index + left > line.length) {
      throw new Error("bad out of range");
    }
    // Include or exclude!
    const exclude = f(index + 1, left);
    const include =
      left >= 2
        ? toNum(line[index] + f(index + 1, left - 1).toString())
        : toNum(line[index]);
    return Math.max(exclude, include);
  });

  const best = f(0, 12);
  console.info({ best });
  total += best;
}
console.info({ total });
