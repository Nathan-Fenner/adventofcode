import { assert } from "console";
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
} from "../common";

const [strgrid, info] = input.split("\n\n");

const g = parseGrid(strgrid).grid;

const cubeLen = Math.sqrt([...g.keys()].length / 6);
console.info({ cubeLen });

const faceOf = (p: Pos2): Pos2 => {
  return new Pos2(Math.floor(p.x / cubeLen), Math.floor(p.y / cubeLen));
};

const localToSpace = new Map<
  Pos2,
  {
    space: Pos3; // where it is in space
    normal: Pos3; // normal for this point
    forward: Pos3; // right local becomes this
  }
>();

localToSpace.set(first(g.keys()), {
  space: new Pos3(0, 0, 0),
  normal: new Pos3(0, 1, 0),
  forward: new Pos3(1, 0, 0),
});

function getSpaceDir(p: Pos2, d: Pos2): Pos3 {
  assert(localToSpace.has(p));
  let sd = new Pos2(1, 0);
  const s = localToSpace.get(p)!;
  let sf = s.forward;
  while (sd !== d) {
    sd = sd.rot90Origin();
    sf = sf.cross(s.normal);
  }
  return sf;
}

function getLocalDir(space: Pos3, d: Pos3): Pos2 {
  assert(spaceToLocal.has(space));
  const p = spaceToLocal.get(space)!;
  const s = localToSpace.get(p)!;
  let sd = new Pos2(1, 0);
  let sf = s.forward;
  while (sf !== d) {
    sd = sd.rot90Origin();
    sf = sf.cross(s.normal);
  }
  return sd;
}

while (localToSpace.size < g.size) {
  for (const p1 of localToSpace.keys()) {
    const s1 = localToSpace.get(p1)!;
    for (const d of Pos2.cardinal4()) {
      const p2 = p1.add(d);
      if (!g.has(p2) || localToSpace.has(p2)) {
        continue;
      }
      if (faceOf(p2) === faceOf(p1)) {
        // They are on the same face.
        localToSpace.set(p2, {
          space: s1.space.add(getSpaceDir(p1, d)),
          normal: s1.normal,
          forward: s1.forward,
        });
      } else {
        // It is wrapping onto another face!
        // Step forward and "down" for the wrap-around.
        const newSpace = s1.space.add(getSpaceDir(p1, d)).sub(s1.normal);
        const newNormal = getSpaceDir(p1, d);
        let newD = s1.normal.scale(-1);
        let newLocal = d;
        while (newLocal !== new Pos2(1, 0)) {
          newLocal = newLocal.rot90Origin();
          newD = newD.cross(newNormal);
        }
        localToSpace.set(p2, {
          space: newSpace,
          normal: newNormal,
          forward: newD,
        });
      }
    }
  }
}

const spaceToLocal = new Map<Pos3, Pos2>();
for (const [p, s] of localToSpace) {
  spaceToLocal.set(s.space, p);
}
assert(spaceToLocal.size === g.size);

function step(at: Pos2, dir: Pos2): { at: Pos2; dir: Pos2 } {
  if (faceOf(at) === faceOf(at.add(dir))) {
    // Still on the same face.
    return { at: at.add(dir), dir };
  }
  // Otherwise, it moves and rotates.
  const dirSpace = getSpaceDir(at, dir);
  const s = localToSpace.get(at)!;

  const newSpace = s.space.add(dirSpace).sub(s.normal);

  const newDir = getLocalDir(newSpace, s.normal.scale(-1));

  return {
    at: spaceToLocal.get(newSpace)!,
    dir: newDir,
  };
}

const cmds = info
  .replace(/[LR]/g, (x) => ` ${x} `)
  .trim()
  .split(/\s+/);

let at = first(g.keys());
let dir = new Pos2(1, 0);
for (const cmd of cmds) {
  if (cmd === "R") {
    dir = dir.rot90Origin();
  } else if (cmd === "L") {
    dir = dir.rot90Origin().scale(-1);
  } else {
    const steps = toNum(cmd);
    for (let i = 0; i < steps; i++) {
      const next = step(at, dir);
      if (g.get(next.at) !== "#") {
        at = next.at;
        dir = next.dir;
      }
    }
  }
}

console.info(at, dir);

const facingOf = new Map([
  [new Pos2(1, 0), 0],
  [new Pos2(0, 1), 1],
  [new Pos2(-1, 0), 2],
  [new Pos2(0, -1), 3],
]);

// 1000 times the row, 4 times the column, and the facing

console.info(1000 * (at.y + 1) + 4 * (at.x + 1) + facingOf.get(dir)!);
