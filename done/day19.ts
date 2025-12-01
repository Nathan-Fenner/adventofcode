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

type Robot = { kind: string; cost: { kind: string; amt: number }[] };

function parseCost(s: string): Robot {
  const words = s.split(" ");
  const kind = words[1];
  const costsS = words.slice(4);
  const costs: { kind: string; amt: number }[] = [];
  for (let i = 0; i < costsS.length; i += 3) {
    costs.push({
      kind: costsS[i + 1],
      amt: toNum(costsS[i]),
    });
  }

  return { kind, cost: costs };
}

const blueprints: Robot[][] = input.split("\n").map((part) => {
  const lines = (part.split(": ")[1] + " ")
    .split(". ")
    .filter((line) => line.trim())
    .map(parseCost);
  console.dir(lines, { depth: null });
  return lines;
});

type Config = {
  have: Record<string, number>;
  robot: Record<string, number>;
};
const kinds = ["ore", "clay", "obsidian", "geode"];
function isBetter(a: Config, b: Config): boolean {
  for (const k of kinds) {
    if (a.have[k] < b.have[k]) {
      return false;
    }
    if (a.robot[k] < b.robot[k]) {
      return false;
    }
  }
  return true;
}

type Frontier = Config[];

function addToFrontier(f: Frontier, c: Config): Frontier {
  if (f.some((c2) => isBetter(c2, c))) {
    return f;
  }
  return [...f.filter((c2) => !isBetter(c, c2)), c];
}

function mapVal<R>(
  x: Record<string, R>,
  f: (k: string, v: R) => R,
): Record<string, R> {
  return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, f(k, v)]));
}

function optimizeBlueprint(blueprint: Robot[], totalTime: number) {
  // I can build 1 robot, or none.
  const initialFrontier: Frontier = [
    {
      have: { ore: 0, clay: 0, obsidian: 0, geode: 0 },
      robot: { ore: 1, clay: 0, obsidian: 0, geode: 0 },
    },
  ];

  let current = initialFrontier;
  for (let iter = 0; iter < totalTime; iter++) {
    console.info(
      "iter:",
      iter,
      "frontier size:",
      current.length,
      "best clay",
      Math.max(...current.map((c) => c.have.clay)),
      "best obsidian",
      Math.max(...current.map((c) => c.have.obsidian)),
      "best geodes",
      Math.max(...current.map((c) => c.have.geode)),
    );
    let next: Frontier = [];
    for (let c of current) {
      // Normalize it:
      const timeLeft = totalTime - iter;
      // For each kind (except geode), we don't need to store more than the max needed.
      for (const kind of kinds) {
        if (kind === "geode") {
          continue;
        }
        const maxNeeded = Math.max(
          ...blueprint.map(
            (b) => b.cost.find((cost) => cost.kind === kind)?.amt ?? 0,
          ),
        );

        let speculate = 0;
        let added = 0;
        for (let t = 0; t < timeLeft; t++) {
          // buy a robot
          speculate -= maxNeeded;
          if (speculate < 0) {
            added += -speculate;
            speculate = 0;
          }
          speculate += c.robot[kind];
        }
        const totalNeeded = added; // maxNeeded * timeLeft;
        c = {
          ...c,
          have: {
            ...c.have,
            [kind]: Math.min(totalNeeded, c.have[kind]),
          },
        };
      }

      // ... if we build nothing
      const buildNothing = {
        ...c,
        have: mapVal(c.have, (k, v) => v + c.robot[k]),
      };
      next = addToFrontier(next, buildNothing);

      for (let i = 0; i < blueprint.length; i++) {
        const b = blueprint[i];
        // If we don't need any more of this type of robot...
        if (
          b.kind !== "geode" &&
          blueprint.every(
            (b2) =>
              (b2.cost.find((cost) => cost.kind === b.kind)?.amt ?? 0) <=
              c.robot[b.kind],
          )
        ) {
          // Every cycle, we produce the maximum cost.
          // So we never need another one of these.
          continue;
        }
        if (b.cost.every((cost) => c.have[cost.kind] >= cost.amt)) {
          const buildKind: Config = {
            robot: { ...c.robot, [b.kind]: c.robot[b.kind] + 1 }, // one more robot
            have: mapVal(
              c.have,
              (k, v) =>
                v +
                c.robot[k] -
                (b.cost.find((cost) => cost.kind === k)?.amt ?? 0),
            ),
          };
          next = addToFrontier(next, buildKind);
        }
      }
    }

    current = next;
  }

  return Math.max(...current.map((c) => c.have.geode));
}

let product = 1;

for (let i = 0; i < 3; i++) {
  let s = optimizeBlueprint(blueprints[i], 24);

  product *= s;
}
console.info({ answer: product }, product);
