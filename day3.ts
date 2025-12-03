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
    if (left === 1) {
      let m = 0;
      for (let i = index; i < line.length; i++) {
        m = Math.max(m, toNum(line[i]));
      }
      return m;
    }
    // Include or exclude!
    const exclude = f(index + 1, left);
    const include = toNum(line[index] + f(index + 1, left - 1).toString());
    return Math.max(exclude, include);
  });

  const best = f(0, 12);
  total += best;
}
console.info({ total });
