import { moveSyntheticComments } from "typescript";
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
} from "../common";

console.info(input);

let head = new Pos2(0, 0);
let tail = new Pos2(0, 0);

const dirs = record({
  R: new Pos2(1, 0),
  L: new Pos2(-1, 0),
  U: new Pos2(0, 1),
  D: new Pos2(0, -1),
});

const visited = new Set<Pos2>([tail]);

function pullTo({ head, tail }: { head: Pos2; tail: Pos2 }): Pos2 {
  if (tail.distMax(head) === 2) {
    tail = tail.add(
      new Pos2(Math.sign(head.x - tail.x), Math.sign(head.y - tail.y)),
    );
  }

  return tail;
}

const chain: Pos2[] = new Array(10).fill(new Pos2(0, 0));

function moveAll(dir: Pos2) {
  chain[chain.length - 1] = chain[chain.length - 1].add(dir);
  for (let i = chain.length - 2; i >= 0; i--) {
    chain[i] = pullTo({ head: chain[i + 1], tail: chain[i] });
  }

  visited.add(chain[0]);
}

const g = new Map<Pos2, string>();
for (let x = 0; x < 5; x++) {
  for (let y = 0; y < 5; y++) {
    g.set(new Pos2(x, y), ".");
  }
}
g.set(new Pos2(0, 0), "s");

for (const line of input.split("\n")) {
  console.info(line);
  const [dir, amtS] = line.split(" ");
  const amt = toNum(amtS);
  for (let i = 0; i < amt; i++) {
    moveAll(dirs[dir]);
  }
}

console.info(visited.size);
