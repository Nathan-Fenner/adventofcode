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
} from "../common";

const rounds = input.split("\n").map((line) => line.split(" "));

function beats(a: string, b: string) {
  if (a === b) {
    return 0;
  }
  const list = ["A", "B", "C"];
  const ai = list.indexOf(a);
  const bi = list.indexOf(b);
  if (mod(ai + 1, 3) === bi) {
    return 1;
  }
  return -1;
}

function mapping(x: string, goal: string): string {
  const score: any = {
    X: -1,
    Y: 0,
    Z: 1,
  };
  for (const choice of ["A", "B", "C"]) {
    if (beats(x, choice) === score[goal]) {
      return choice;
    }
  }

  throw new Error("bug");
}
function score(them: string, me: string): number {
  let tot = 0;
  const meR = mapping(them, me);
  const b = beats(them, meR);
  if (b === 0) {
    tot += 3;
  } else if (b === 1) {
    tot += 6;
  }
  if (meR === "A") {
    tot += 1;
  } else if (meR === "B") {
    tot += 2;
  } else if (meR === "C") {
    tot += 3;
  }
  return tot;
}

let t = 0;
for (const [a, b] of rounds) {
  t += score(a, b);
}
console.info(t);
