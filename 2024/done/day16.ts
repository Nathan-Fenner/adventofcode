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

const flows: { from: string; amt: number; to: string[] }[] = [];

for (const line of input.split("\n")) {
  const words = line
    .replace(/[^A-Z0-9]/g, " ")
    .trim()
    .split(/\s+/);
  console.info(words);

  const from = words[1];
  const amt = toNum(words[2]);
  const to = words.slice(3);
  flows.push({ from, amt, to });
}

const LIM = 30;
const START = "AA";

const valves = flows.map((v) => v.from);
const distance = new Map<string, Map<string, number>>();
for (const v1 of valves) {
  distance.set(v1, new Map());
  for (const v2 of valves) {
    distance.get(v1)!.set(v2, v2 === v1 ? 0 : 1 / 0);
  }
}

while (true) {
  let change = false;
  for (const flow of flows) {
    const from = flow.from;
    for (const to of flow.to) {
      for (const v of valves) {
        if (distance.get(v)!.get(to)! > distance.get(v)!.get(from)! + 1) {
          distance.get(v)!.set(to, distance.get(v)!.get(from)! + 1);
          change = true;
        }
      }
    }
  }

  if (!change) {
    break;
  }
}

console.info(distance);

function permutations<T>(items: T[]): T[][] {
  if (items.length === 0) {
    return [[]];
  }
  const total: T[][] = [];
  for (let i = 0; i < items.length; i++) {
    const r = [...items];
    const x = r[i];
    r.splice(i, 1);
    for (const rest of permutations(r)) {
      total.push([x, ...rest]);
    }
  }
  return total;
}

function subsets<T>(items: T[]): T[][] {
  if (items.length === 0) {
    return [[]];
  }

  return [
    ...subsets(items.slice(1)),
    ...subsets(items.slice(1)).map((p) => [items[0], ...p]),
  ];
}

function better<T>(
  a: { explain: T; score: number },
  b: { explain: T; score: number },
): { explain: T; score: number } {
  if (a.score > b.score) {
    return a;
  }
  return b;
}

function bestPossibleFlow(
  timeLeft: number,
  at: string,
  candidates: string[],
): { explain: string[]; score: number } {
  let best = { score: 0, explain: [] as string[] };

  // Which one to go to first?
  for (const { from: dest, amt } of flows) {
    if (!candidates.includes(dest)) {
      continue;
    }
    const timeWalk = distance.get(at)!.get(dest)!;
    const afterTime = timeLeft - timeWalk - 1;
    if (afterTime > 0) {
      const flowOut = afterTime * amt;
      const thenThere = bestPossibleFlow(
        afterTime,
        dest,
        candidates.filter((q) => q !== dest),
      );
      best = better(best, {
        score: thenThere.score + flowOut,
        explain: [
          `open ${dest} left ${
            30 - timeLeft + 1 + timeWalk
          } eventual ${flowOut}`,
          ...thenThere.explain,
        ],
      });
    }
  }

  return best;
}

const flowOf = new Map(flows.map((f) => [f.from, f]));

function bestPossibleFlowFast(
  timeLeft: number,
  at: string,
  candidates: string[],
): number {
  let bestFound = 0;
  function search({
    timeLeft,
    at,
    candidates,
    sofar,
  }: {
    timeLeft: number;
    at: string;
    candidates: Set<string>;
    sofar: number;
  }): void {
    if (sofar > bestFound) {
      bestFound = sofar;
    }

    // CULL!!!
    let optimism = sofar;
    for (const cand of candidates) {
      const left = flowOf.get(cand)!;
      optimism +=
        left.amt *
        Math.max(0, timeLeft - 1 - distance.get(at)!.get(left.from)!);
    }

    if (optimism <= bestFound) {
      return;
    }

    // Which one to go to first?
    for (const dest of candidates) {
      const { amt } = flowOf.get(dest)!;
      const timeWalk = distance.get(at)!.get(dest)!;
      const afterTime = timeLeft - timeWalk - 1;
      if (afterTime > 0) {
        const flowOut = afterTime * amt;
        search({
          timeLeft: afterTime,
          at: dest,
          candidates: new Set([...candidates].filter((q) => q !== dest)),
          sofar: sofar + flowOut,
        });
      }
    }
  }

  search({ timeLeft, at, candidates: new Set(candidates), sofar: 0 });

  return bestFound;
}

let bestT = 0;

for (const a of subsets(flows.filter((f) => f.amt !== 0).map((f) => f.from))) {
  const b = flows
    .filter((f) => f.amt !== 0)
    .map((f) => f.from)
    .filter((f) => !a.includes(f));
  if (a.join(" ") < b.join(" ")) {
    continue;
  }
  const as = bestPossibleFlowFast(26, "AA", a);
  const bs = bestPossibleFlowFast(26, "AA", b);

  const t = as + bs;
  bestT = Math.max(bestT, t);
  // console.info(bestT, a.join(" "));
}

console.info(bestT);
