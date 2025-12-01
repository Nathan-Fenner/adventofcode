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
} from "../common";

console.info(input);

let nums = input
  .split("\n")
  .map(toNum) // toNum = (s: string): number => parseInt(s, 10)
  .map((x) => x * 811589153)
  .map((x, i) => ({ x, i }));

for (let it = 0; it < 10; it++) {
  for (let i = 0; i < nums.length; i++) {
    const j = nums.findIndex((q) => q.i === i);
    const q = nums[j];
    nums.splice(j, 1);
    const newIndex = (j + q.x + nums.length) % nums.length;
    nums.splice(newIndex, 0, q);
  }
}
console.info(nums.map((q) => q.x));

const j0 = nums.findIndex((q) => q.x === 0);
const a = nums[(j0 + 1000) % nums.length].x;
const b = nums[(j0 + 2000) % nums.length].x;
const c = nums[(j0 + 3000) % nums.length].x;
console.info(a, b, c);
console.info(a + b + c);
