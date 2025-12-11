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

const outEdges = new Map(
  input.split("\n").map((line) => {
    const [left, right] = line.split(": ");
    return [left, right.split(" ")];
  }),
);

const countPaths = memoize((from: string): number => {
  if (from === "out") {
    return 1;
  }
  let sum = 0;
  for (const to of outEdges.get(from) ?? []) {
    sum += countPaths(to);
  }
  return sum;
});

console.info(countPaths("you"));
