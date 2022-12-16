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
  div,
  assert,
} from "../common";

console.info(input);

const path = new Set<Pos2>();

function drawLine(a: Pos2, b: Pos2) {
  path.add(a);
  path.add(b);
  while (a !== b) {
    path.add(a);
    a = a.add(new Pos2(Math.sign(b.x - a.x), Math.sign(b.y - a.y)));
    path.add(a);
  }
}

const lines = input.split("\n");
for (const line of lines) {
  const words = line.split(" -> ");

  const ps = words.map((p) => {
    const [x, y] = p.split(",");
    return new Pos2(toNum(x), toNum(y));
  });
  for (let i = 0; i < ps.length - 1; i++) {
    drawLine(ps[i], ps[i + 1]);
  }
}

printGrid(path);

const sand = new Set<Pos2>();

function open(p: Pos2) {
  return !sand.has(p) && !path.has(p);
}

function dropSand(p: Pos2): boolean {
  while (true) {
    if (p.y > 1000) {
      assert(false);
      return false;
    }
    const next = [p.shift(0, 1), p.shift(-1, 1), p.shift(1, 1)];
    const goTo = next.find((q) => open(q));
    if (goTo) {
      p = goTo;
    } else {
      sand.add(p);
      return true;
    }
  }
}

const maxY = Math.max(...[...path.keys()].map((p) => p.y));

drawLine(new Pos2(-10000, maxY + 2), new Pos2(10000, maxY + 2));

while (open(new Pos2(500, 0))) {
  dropSand(new Pos2(500, 0));
}

console.info(sand.size);
