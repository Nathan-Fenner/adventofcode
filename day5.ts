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

const [rangesT, listT] = input.split("\n\n");

const ranges = rangesT
  .trim()
  .split("\n")
  .map((line) => {
    const [start, end] = line.split("-");
    return {
      start: toNum(start),
      end: toNum(end),
    };
  });

const values = listT.trim().split("\n").map(toNum);

const isFresh = (value: number): boolean => {
  for (const range of ranges) {
    if (value >= range.start && value <= range.end) {
      return true;
    }
  }
  return false;
};

let count = 0;
for (const v of values) {
  if (isFresh(v)) {
    console.info({ v });
    count += 1;
  }
}
console.info({ count });

const sortedRanges = sorted(ranges, (r) => [r.start, r.end]);

let total = 0;
let activeSince = sortedRanges[0].start;
let activeUntil = sortedRanges[0].end;
for (const r of sortedRanges) {
  if (r.start > activeUntil) {
    total += activeUntil - activeSince + 1;

    activeSince = r.start;
    activeUntil = r.end;
  } else {
    activeUntil = Math.max(activeUntil, r.end);
  }
}

total += activeUntil - activeSince + 1;
console.info({ total });
