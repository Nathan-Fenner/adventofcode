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

const lines = input.split("\n");

let grandTotal = 0;

const width = lines[0].length;
const height = lines.length;

let nums: number[] = [];
for (let x = width - 1; x >= 0; x--) {
  let digits: string = "";
  for (let y = 0; y < height - 1; y++) {
    if (lines[y][x] !== " ") {
      digits += lines[y][x];
    }
  }

  if (digits) {
    nums.push(toNum(digits));
  }

  const op = lines[height - 1][x];

  if (op === "+") {
    grandTotal += sum(nums);
    nums = [];
  } else if (op === "*") {
    grandTotal += product(nums);
    nums = [];
  }
}

console.info({ grandTotal });
