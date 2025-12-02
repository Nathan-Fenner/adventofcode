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

const lines = input.split("\n");

const isValid = (s: string): boolean => {
  for (let n = 2; n <= s.length; n++) {
    if (s.length % n === 0 && s === s.slice(0, s.length / n).repeat(n)) {
      return false;
    }
  }
  return true;
};

const process = (line: string): void => {
  const ranges = line.split(",").map((part) => ({
    low: toNum(part.split("-")[0]),
    high: toNum(part.split("-")[1]),
  }));

  let sum = 0;
  for (const range of ranges) {
    for (let value = range.low; value <= range.high; value++) {
      if (!isValid(value.toString())) {
        console.info("invalid", value);
        sum += value;
      }
    }
  }

  console.info({ sum });
};

for (const line of lines) {
  process(line);
}
