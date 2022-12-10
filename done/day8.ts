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
  record,
  egcd,
  Pos2,
  product,
} from "../common";

console.info(input);

const grid = new Map<Pos2, number>();

{
  let x = 0;
  let y = 0;
  for (const c of input) {
    if (c === "\n") {
      y += 1;
      x = 0;
    } else {
      grid.set(new Pos2(x, y), toNum(c));
      x += 1;
    }
  }
}

function distanceVis(p: Pos2, d: Pos2): number {
  for (let i = 1; true; i++) {
    const q = p.add(d.scale(i));
    if (!grid.has(q)) {
      return i - 1;
    }
    if (grid.get(q)! >= grid.get(p)!) {
      return i;
    }
  }
}
function score(p: Pos2): number {
  return product(Pos2.cardinal4().map((q) => distanceVis(p, q)));
}

console.info(Math.max(...[...grid.keys()].map((p) => score(p))));
