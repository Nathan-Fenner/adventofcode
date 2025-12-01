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
} from "../common";

const groups = input.split("\n\n").map((group) =>
  group
    .split("\n")
    .map(toNum)
    .reduce((a, b) => a + b, 0),
);

const all = sorted(groups, (g) => ({ desc: g }));

console.info(all.slice(0, 3).reduce((a, b) => a + b, 0));
