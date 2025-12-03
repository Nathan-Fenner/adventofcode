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
  let best = 0;
  for (let i = 0; i < line.length - 1; i++) {
    for (let j = i + 1; j < line.length; j++) {
      const num = toNum(line[i] + line[j]);
      best = Math.max(best, num);
    }
  }
  console.info({ best });
  total += best;
}
console.info({ total });
