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

let at = 50;
let count = 0;
for (const line of input.split("\n")) {
  const dir = line.startsWith("R") ? 1 : -1;
  let num = toNum(line.slice(1));

  while (num > 0) {
    at += dir;
    at = mod(at, 100);
    if (at === 0) {
      count += 1;
    }
    num -= 1;
  }
}

console.info({ count });
