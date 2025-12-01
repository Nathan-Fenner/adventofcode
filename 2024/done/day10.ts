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
  sum,
  div,
} from "../common";

const strengths: number[] = [];

let c = 1;
let cycles = 1;

const display = new Map<Pos2, boolean>();

function advanceCycle() {
  console.info("end", cycles, "is", c);
  if (cycles % 40 === 20) {
    strengths.push(cycles * c);
  }
  let cx = ((cycles - 1) % 240) % 40;
  let cy = div((cycles - 1) % 240, 40);
  display.set(new Pos2(cx, cy), Math.abs(c - cx) <= 1);

  cycles++;
}

for (const line of input.split("\n")) {
  const words = line.split(" ");
  console.info("exec", line);
  if (words[0] === "noop") {
    advanceCycle();
  } else if (words[0] === "addx") {
    advanceCycle();
    advanceCycle();
    c += toNum(words[1]);
  }
}

console.info(strengths);

console.info(sum(strengths));

printGrid(new Set([...display].filter((p) => p[1]).map((p) => p[0])));
