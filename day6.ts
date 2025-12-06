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

const lines = input.split("\n").map((line) => line.trim().split(/\s+/));

let grandTotal = 0;
for (let i = 0; i < lines[0].length; i++) {
  const nums = lines.slice(0, lines.length - 1).map((line) => toNum(line[i]));
  console.info({ nums });
  if (lines.at(-1)![i] === "+") {
    grandTotal += sum(nums);
  } else {
    grandTotal += product(nums);
  }
}

console.info({ grandTotal });
