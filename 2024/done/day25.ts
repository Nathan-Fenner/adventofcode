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
} from "../../common";

console.info(input);

const val = record({
  "2": 2,
  "1": 1,
  "0": 0,
  "-": -1,
  "=": -2,
});

const valRev = record({
  "2": 2,
  "1": 1,
  "0": 0,
  "-1": "-",
  "-2": "=",
});

function valOf(s: string): number {
  let q = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charAt(s.length - 1 - i);
    q += val[c] * 5 ** i;
  }
  return q;
}

let sum = 0;
for (const x of input.split("\n")) {
  sum += valOf(x);
}

console.info({ sum });

function snaf(x: number): string {
  if (x === 0) {
    return "";
  }
  let r = mod(x, 5);
  if (r >= 3) {
    r -= 5;
  }

  return snaf((x - r) / 5) + valRev[r];
}

// convert to snafu

console.info(snaf(sum));
