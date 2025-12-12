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

const stanzas = input.split("\n\n");

const shapes = stanzas.slice(0, -1).map((line) => {
  const g = parseGrid(line.split("\n").slice(1).join("\n"));
  return [...g.grid].filter((v) => v[1] === "#").map((v) => v[0]);
});

const targets = stanzas
  .at(-1)!
  .split("\n")
  .map((targetLine) => {
    const [size, counts] = targetLine.split(": ");
    const [width, height] = size.split("x");
    return {
      width: toNum(width),
      height: toNum(height),
      counts: counts.split(" ").map(toNum),
    };
  });

function rotations(shape: readonly Pos2[]): Pos2[][] {
  const flips = [shape, shape.map((p) => new Pos2(p.y, p.x))];
  for (let i = 0; i < 3; i++) {
    flips.push(flips.at(-2)!.map((p) => p.rot90Origin()));
    flips.push(flips.at(-2)!.map((p) => p.rot90Origin()));
  }

  const norms = flips.map((f) => {
    const minX = Math.min(...f.map((p) => p.x));
    const minY = Math.min(...f.map((p) => p.y));
    return f.map((p) => p.shift(-minX, -minY));
  });

  const keyOf = (f: readonly Pos2[]): string => {
    return f
      .map((p) => p.toString())
      .sort()
      .join("_");
  };

  const byKey = new Map(norms.map((shape) => [keyOf(shape), shape]));

  return [...byKey.values()];
}

const rotatedShapes = shapes.map(rotations);

for (const s of rotatedShapes) {
  console.info("======");
  for (const s2 of s) {
    printGrid(new Map(s2.map((q) => [q, "#"])));
  }
}

function solveTarget({
  width,
  height,
  counts: targetCounts,
}: {
  width: number;
  height: number;
  counts: readonly number[];
}): boolean {
  if (Math.floor(width / 3) * Math.floor(height / 3) >= sum(targetCounts)) {
    return true;
  }

  {
    let mustFit = 0;
    for (let i = 0; i < targetCounts.length; i++) {
      mustFit += targetCounts[i] * shapes[i].length;
    }
    if (mustFit > width * height) {
      return false;
    }

    // console.info("left", width * height - mustFit);
  }

  // console.info({ width, height }, targetCounts);

  const placedShapes: Pos2[][][] = rotatedShapes.map((rotations) => {
    const placed: Pos2[][] = [];
    for (let x = 0; x < width - 2; x++) {
      for (let y = 0; y < height - 2; y++) {
        for (const shape of rotations) {
          placed.push(shape.map((q) => q.shift(x, y)));
        }
      }
    }
    return placed;
  });

  const countLeft: number[] = [...targetCounts];
  const filled = new Set<Pos2>();
  const fitAll = (): boolean => {
    if (countLeft.every((c) => c === 0)) {
      return true;
    }

    const canPlaces: Array<Set<Pos2>> = [];
    for (let piece = 0; piece < targetCounts.length; piece++) {
      const canPlace = new Set<Pos2>();
      if (countLeft[piece] === 0) {
        canPlaces.push(canPlace);
        continue; // skip work for small speed boost
      }
      for (const placement of placedShapes[piece]) {
        if (placement.every((q) => !filled.has(q))) {
          for (const q of placement) {
            canPlace.add(q);
          }
        }
      }
      if (canPlace.size < countLeft[piece] * shapes[piece].length) {
        // Not enough spots left to place this piece.
        return false;
      }
      canPlaces.push(canPlace);
    }

    // Check all combinations of pieces.
    {
      let bitset = 0;
      while (bitset < 1 << shapes.length) {
        const combined = new Set<Pos2>();
        let mustHaveSpots = 0;
        for (let i = 0; i < shapes.length; i++) {
          if (bitset & (1 << i)) {
            mustHaveSpots += countLeft[i] * shapes[i].length;
            for (const p of canPlaces[i]) {
              combined.add(p);
            }
          }
        }

        if (mustHaveSpots > combined.size) {
          return false;
        }

        bitset += 1;
      }
    }

    const piece = countLeft.findIndex((c) => c !== 0);
    countLeft[piece] -= 1;
    try {
      /// Put it somewhere in the grid!
      for (const shapePlaced of placedShapes[piece]) {
        if (shapePlaced.every((q) => !filled.has(q))) {
          // Try placing it here!
          shapePlaced.forEach((q) => filled.add(q));
          try {
            if (fitAll()) {
              return true;
            }
          } finally {
            // Delete
            shapePlaced.forEach((q) => filled.delete(q));
          }
        }
      }
    } finally {
      countLeft[piece] += 1;
    }
    return false;
  };

  if (fitAll()) {
    return true;
  }

  return false;
}

const nowBegin = Date.now();

let iter = 0;
let count = 0;
for (const target of targets) {
  const now = Date.now();
  const v = solveTarget(target);
  if (v) {
    count += 1;
  }
  const elapsed = Date.now() - now;
  if (elapsed > 500) {
    console.info("=====================");
    console.info("iter", iter);
    console.info(target);
    console.info("--> ", v);
    console.info("elapsed", elapsed, "ms");
    console.info("=====================");
  }
  iter += 1;
}

console.info({ count });

console.info("total elapsed", Date.now() - nowBegin);
