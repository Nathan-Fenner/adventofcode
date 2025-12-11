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

const countPaths = memoize(
  (from: string, dac: boolean, fft: boolean): number => {
    if (from === "out") {
      return dac && fft ? 1 : 0;
    }
    if (from === "dac") {
      dac = true;
    }
    if (from === "fft") {
      fft = true;
    }
    let sum = 0;
    for (const to of outEdges.get(from) ?? []) {
      sum += countPaths(to, dac, fft);
    }
    return sum;
  },
);

console.info(countPaths("svr", false, false));

// every from svr to out, that visit both dac and fft
