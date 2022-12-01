import {
  debug,
  disableDebug,
  exploreBranches,
  input,
  iota,
  memoize,
  Pos2,
  sorted,
  totalBranchCount,
  totalCatchupTime,
} from "./common";

const stanzas = input
  .replace(/[A-Z]/g, (x) => " " + x)
  .trim()
  .split("\n\n");

const rules = new Map<string, string[][]>();

for (const line of stanzas[0].trim().split("\n")) {
  const words = line.trim().split(/\s+/);
  if (words[1] !== "=>") {
    throw new Error("bad");
  }
  if (!rules.has(words[0])) {
    rules.set(words[0], []);
  }
  rules.get(words[0]!)?.push(words.slice(2));
}

let goal = stanzas[1].trim().split(/\s+/);
console.info("goal length:", goal.length);

const orderedPartition = (n: number, parts: number): number[][] => {
  if (n === 0 && parts === 0) {
    return [[]];
  }
  if (n === 0 || parts === 0) {
    return []; // impossible
  }
  if (parts < 0 || n < 0) {
    throw new Error("invalid");
  }
  // choose the size of the first part.
  const all: number[][] = [];
  for (let firstPart = 1; firstPart <= n; firstPart++) {
    const rest = orderedPartition(n - firstPart, parts - 1);
    for (const partition of rest) {
      all.push([firstPart, ...partition]);
    }
  }
  return all;
};

function findEarlier(goalBegin: number, goalEnd: number): number | null {
  for (let i = 0; i < goalBegin; i++) {
    if (
      iota(goalEnd - goalBegin).every(
        (j) => goal[i + j] === goal[goalBegin + j],
      )
    ) {
      return i;
    }
  }
  return null;
}

const indirectMaking = new Map<string, Set<string>>();
while (true) {
  let change = false;
  for (const [from, tos] of rules) {
    // add all initial
    if (!indirectMaking.has(from)) {
      change = true;
      indirectMaking.set(from, new Set());
    }
    for (const to of tos) {
      for (const atom of to) {
        if (!indirectMaking.get(from)!.has(atom)) {
          change = true;
          indirectMaking.get(from)!.add(atom);
        }
      }
    }
  }
  // add indirect
  for (const [atom0, atom0Makes] of indirectMaking) {
    for (const makes of atom0Makes) {
      for (const atom1 of indirectMaking.get(makes) ?? []) {
        if (!indirectMaking.get(atom0)!.has(atom1)) {
          indirectMaking.get(atom0)!.add(atom1);
          change = true;
        }
      }
    }
  }
  if (!change) {
    break;
  }
}

const indirectStarting = new Map<string, Set<string>>();
while (true) {
  let change = false;
  for (const [from, tos] of rules) {
    if (!indirectStarting.has(from)) {
      indirectStarting.set(from, new Set());
      change = true;
    }
    for (const to of tos) {
      if (!indirectStarting.get(from)!.has(to[0])) {
        indirectStarting.get(from)!.add(to[0]);
        change = true;
      }
    }
  }
  for (const [from, starts] of indirectStarting) {
    for (const otherStart of starts) {
      for (const indirectStart of indirectStarting.get(otherStart) ?? []) {
        if (!indirectStarting.get(from)!.has(indirectStart)) {
          indirectStarting.get(from)!.add(indirectStart);
          change = true;
        }
      }
    }
  }
  if (!change) {
    break;
  }
}

const indirectEnding = new Map<string, Set<string>>();
while (true) {
  let change = false;
  for (const [from, tos] of rules) {
    if (!indirectEnding.has(from)) {
      indirectEnding.set(from, new Set());
      change = true;
    }
    for (const to of tos) {
      if (!indirectEnding.get(from)!.has(to[to.length - 1])) {
        indirectEnding.get(from)!.add(to[to.length - 1]);
        change = true;
      }
    }
  }
  for (const [from, starts] of indirectEnding) {
    for (const otherStart of starts) {
      for (const indirectStart of indirectEnding.get(otherStart) ?? []) {
        if (!indirectEnding.get(from)!.has(indirectStart)) {
          indirectEnding.get(from)!.add(indirectStart);
          change = true;
        }
      }
    }
  }
  if (!change) {
    break;
  }
}

console.info("starts:", indirectStarting);
console.info("ends:", indirectEnding);

disableDebug();

let callCount = 0;
const timeToMake = memoize(
  (from: string, goalBegin: number, goalEnd: number): number => {
    debug(
      `timeToMake(${from}, [${goalBegin}, ${goalEnd}) aka ${goal
        .slice(goalBegin, goalEnd)
        .join(" ")})`,
    );
    if (goalEnd === goalBegin + 1 && goal[goalBegin] === from) {
      return 0; // done!
    }
    if (!rules.has(from)) {
      return 1 / 0; // impossible
    }

    if (!indirectStarting.get(from)!.has(goal[goalBegin])) {
      return 1 / 0;
    }
    if (!indirectEnding.get(from)!.has(goal[goalEnd - 1])) {
      return 1 / 0;
    }

    for (let i = goalBegin; i < goalEnd; i++) {
      if (!indirectMaking.get(from)!.has(goal[i])) {
        return 1 / 0;
      }
    }

    const earlier = findEarlier(goalBegin, goalEnd);
    if (earlier !== null) {
      return timeToMake(from, earlier, goalEnd - goalBegin + earlier);
    }

    // One of the reactions must work.
    let bestTime = 1 / 0;
    for (const outputs of rules.get(from)!) {
      // Split the input into ranges, solve each, then regroup.

      /*
      exploreBranches(
        (
          { branchRange, snapshot },
          {
            at,
            totalCost,
            out,
          }: { at: number; totalCost: number; out: number } = {
            at: goalBegin,
            totalCost: 0,
            out: 0,
          },
        ) => {
          // let totalCost = 0;
          // let at = goalBegin;
          for (; out < outputs.length; out++) {
            snapshot({ at, totalCost, out });
            if (at + 1 >= goalEnd - outputs.length + 2 + out) {
              return;
            }

            const nextEnd =
              out === outputs.length - 1
                ? goalEnd
                : branchRange(at + 1, goalEnd - outputs.length + 2 + out);
            totalCost += timeToMake(outputs[out], at, nextEnd);
            at = nextEnd;
            if (totalCost >= bestTime) {
              return;
            }
          }

          if (totalCost < bestTime) {
            bestTime = totalCost;
          }
        },
      );
      */

      const incompleteRanges: {
        output: number;
        begin: number;
        cost: number;
      }[] = [{ output: 0, begin: goalBegin, cost: 0 }];
      debug("rule", from, "==>", outputs);
      while (incompleteRanges.length > 0) {
        const incompleteRange = incompleteRanges.pop()!; // branch&bound works better on stack.
        debug(incompleteRange);
        if (incompleteRange.cost >= bestTime) {
          debug(">> too expensive", incompleteRange.cost, ">=", bestTime);
          continue;
        }
        if (incompleteRange.output === outputs.length) {
          if (incompleteRange.begin === goalEnd) {
            debug(">> DONE");
            // Done
            debug(
              "success!!!!",
              from,
              "can make",
              goal.slice(goalBegin, goalEnd).join(""),
              "via",
              outputs,
              "using",
              incompleteRange,
            );
            if (incompleteRange.cost < bestTime) {
              bestTime = incompleteRange.cost;
            }
          } else {
            debug(">> output at end, but wrong begin");
          }
          continue;
        }
        if (incompleteRange.begin >= goalEnd) {
          debug(">> no more space");
          continue; // No more space
        }
        // Find an ending!
        debug(">> add more");
        const endLimit = goalEnd - outputs.length + incompleteRange.output + 1;
        for (let end = incompleteRange.begin + 1; end <= endLimit; end++) {
          const nextRange = {
            output: incompleteRange.output + 1,
            begin: end,
            cost:
              incompleteRange.cost +
              timeToMake(
                outputs[incompleteRange.output],
                incompleteRange.begin,
                end,
              ),
          };
          debug("++", nextRange);
          incompleteRanges.push(nextRange);
        }
      }
    }

    return bestTime + 1;
  },
);

console.info(timeToMake("e", 0, goal.length));

const branchBy: Record<string, string[]> = {
  "": ["A", "B"],
  A: ["A->B", "A->C"],
  B: ["B->D", "B->E"],
  "AA->B": ["B->X", "B->Y"],
  "BB->D": ["D->X", "D->Y"],
  "AA->C": ["C->X", "C->Y"],
  "BB->E": ["E->X", "E->Y"],
};
/*
exploreBranches(({ branch }) => {
  let s = "";

  for (let i = 0; i < 3; i++) {
    s += branch(branchBy[s]);
  }
  console.info("*", s);
});
*/

console.info(
  "catchup ms",
  totalCatchupTime,
  "across",
  totalBranchCount,
  "branches",
);
