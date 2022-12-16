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
  printGrid,
  parseGrid,
  gcd,
  sum,
  div,
} from "../common";

console.info(input);

const g = parseGrid(input).grid;

function val(s: string): number {
  if (s === "S") {
    return val("a");
  }
  if (s === "E") {
    return val("z");
  }
  return s.charCodeAt(0);
}

function adj(a: string, b: string) {
  return val(b) <= val(a) + 1;
}

let begin: Pos2 = null as any;
let end: Pos2 = null as any;
for (const [p, v] of g) {
  if (v === "S") {
    begin = p;
  }
  if (v === "E") {
    end = p;
  }
}

const dist = new Map<Pos2, number>();
dist.set(begin, 0);
for (const [p, d] of g) {
  if (d === "a") {
    dist.set(p, 0);
  }
}
for (const [p, d] of dist) {
  for (const n of p.neighborsOrtho()) {
    if (dist.has(n) || !g.has(n)) {
      continue;
    }
    if (adj(g.get(p)!, g.get(n)!)) {
      dist.set(n, d + 1);
    }
  }
}

console.info(dist.get(end)!);
