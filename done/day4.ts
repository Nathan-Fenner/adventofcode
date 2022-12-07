import { profile } from "console";
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
} from "../common";

console.info(input);
const lines = input
  .split("\n")
  .map((line) => line.split(",").map((part) => part.split("-").map(toNum)));

function cont(a: number[], b: number[]) {
  const u1 = Math.min(a[0], b[0]);
  const u2 = Math.max(a[1], b[1]);

  return a[1] - a[0] + b[1] - b[0] + 1 > u2 - u1;
}

let c = 0;
for (const line of lines) {
  if (cont(line[0], line[1])) {
    c += 1;
  }
}
console.info(cont([4, 4], [5, 7]));
console.info(c);
