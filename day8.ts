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

const points = input.split("\n").map((line) => {
  const nums = line.split(",");
  return new Pos3(toNum(nums[0]), toNum(nums[1]), toNum(nums[2]));
});

const group = new Map<Pos3, number>();
for (let i = 0; i < points.length; i++) {
  group.set(points[i], i);
}
let pairs: { a: Pos3; b: Pos3; distance: number }[] = [];
for (const a of points) {
  for (const b of points) {
    if (b === a) {
      break;
    }
    pairs.push({
      a,
      b,
      distance: Math.sqrt(
        (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2,
      ),
    });
  }
}

pairs = sorted(pairs, (x) => x.distance);
let links = 0;
let linkTried = 0;
let lastConnection: null | { a: Pos3; b: Pos3 } = null;
for (const { a, b } of pairs) {
  // if (linkTried >= 1000) {
  //   break;
  // }
  linkTried += 1;
  // console.info("combine", a, b);
  if (group.get(a) === group.get(b)) {
    // console.info("already linked");
    continue;
  }
  lastConnection = { a, b };
  links += 1;
  const ga = group.get(a)!;
  const gb = group.get(b)!;
  for (const k of group.keys()) {
    if (group.get(k) === ga) {
      group.set(k, gb);
    }
  }
}

const groupsLeft = new Set(group.values());
console.info(groupsLeft.size);

const circuitSize = new Map<number, number>();
for (const v of group.values()) {
  circuitSize.set(v, (circuitSize.get(v) ?? 0) + 1);
}

console.info(
  product(sorted([...circuitSize.values()], (v) => ({ desc: v })).slice(0, 3)),
);
console.info(lastConnection!.a.x * lastConnection!.b.x);
