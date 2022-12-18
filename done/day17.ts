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
  rangeInclusive,
} from "../common";

const rocks = `
####

.#.
###
.#.

###
..#
..#

#
#
#
#

##
##`
  .trim()
  .split("\n\n")
  .map((g) => parseGrid(g))
  .map((g) => {
    const s = new Set(
      [...g.grid.entries()].filter((v) => v[1] === "#").map((v) => v[0]),
    );
    return s;
  });

console.info({ rocks });

const block = new Set<Pos2>();

function open(p: Pos2): boolean {
  return p.x >= 0 && p.x <= 6 && p.y >= 0 && !block.has(p);
}

function openShape(s: Set<Pos2>): boolean {
  return [...s].every(open);
}

function translate(shape: Set<Pos2>, by: Pos2): Set<Pos2> {
  return new Set([...shape].map((p) => p.add(by)));
}

let curRockIndex = 0;
function summonRock(): Set<Pos2> {
  return translate(
    rocks[curRockIndex++ % rocks.length],
    new Pos2(2, highest + 4),
  );
}

let curRock: Set<Pos2> | null = null;

let highest = -1;
const heights: number[] = [];
let placed = 0;

for (let i = 0; true; i++) {
  if (!curRock) {
    curRock = summonRock();
    /*
    printGrid(
      new Map<Pos2, string>([
        ...rangeInclusive(0, 6).map<[Pos2, string]>((i) => [
          new Pos2(i, -1),
          "-" as string,
        ]),
        ...[...block, ...curRock].map((p) => [p, "#" as string] as const),
      ]),
    );
    console.info("///");
    */
  }

  const c = input[i % input.length];

  const pushed = translate(
    curRock,
    c === ">" ? new Pos2(1, 0) : new Pos2(-1, 0),
  );
  if (openShape(pushed)) {
    curRock = pushed;
  }

  const down = translate(curRock, new Pos2(0, -1));
  if (openShape(down)) {
    curRock = down;
  } else {
    for (const p of curRock) {
      block.add(p);
      highest = Math.max(highest, p.y);
    }
    curRock = null;

    heights.push(highest);

    placed++;
    if (placed > 1_000_000) {
      break;
    }
  }
}

console.info(heights);
// Now, attempt to find a natural cycle.

let cycle = 0;
for (let cycleLen = input.length; true; cycleLen++) {
  console.info({ cycleLen });
  // The last cycleLen should each be a constant more than the previous cycle.
  let c = heights[heights.length - 1] - heights[heights.length - 1 - cycleLen];
  let ok = true;
  for (let j = 0; j < cycleLen; j++) {
    const c2 =
      heights[heights.length - 1 - j] -
      heights[heights.length - 1 - cycleLen - j];
    if (c2 !== c) {
      ok = false;
      break;
    }
  }
  if (ok) {
    cycle = cycleLen;
    console.info(cycleLen);
    break;
  }
}

const M = 1000000000000 - 1;

const base = heights.length - cycle - cycle - cycle;

// block numbers are 0-indexed
console.info("cycle 0 happens after placing block #", base);
console.info("after this block, it had height", heights[base]);
console.info("the cycle has length", cycle);

const fullCycles = div(M - base, cycle);
console.info("a complete", fullCycles, "cycles happen after this...");
console.info("adding ", heights[base + cycle] - heights[base], "each cycle");
console.info(
  "for example, heights[",
  base + cycle * 2,
  "] = ",
  heights[base + cycle * 2],
  "==",
  heights[base] + (heights[base + cycle] - heights[base]) * 2,
);

const mGrow =
  heights[base] +
  (heights[base + cycle] - heights[base]) * div(M - base, cycle);

console.info("for M-1 == ", M, "this means", mGrow);
console.info(
  "but then an additional",
  mod(M - base, cycle),
  "steps must be performed",
);
const extra = heights[base + mod(M - base, cycle)] - heights[base];
console.info("these add", extra, "extra height");

console.info("so the total is ", mGrow + extra + 1);
