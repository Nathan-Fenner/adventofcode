import { profile } from "console";
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

console.info(input);

const [stacksStrings, cmdString] = input.split("\n\n");

const cmds = cmdString.split("\n").map((line) => {
  const words = line.split(" ");
  const cmd = {
    count: toNum(words[1]),
    from: toNum(words[3]) - 1,
    to: toNum(words[5]) - 1,
  };
  return cmd;
});

const stacks: string[][] = [];
for (let i = 0; i < 9; i++) {
  stacks.push([]);
}
const stacksStringsLines = stacksStrings.split("\n");

for (let y = 0; y < 8; y++) {
  for (let x = 0; x < 9; x++) {
    const iy = 7 - y;
    const ix = 1 + 4 * x;

    if (iy >= 0 && ix < stacksStringsLines[iy].length) {
      const box = stacksStringsLines[iy][ix];
      if (box !== " ") {
        stacks[x].push(box);
      }
    }
  }
}
console.info(stacks);

for (const cmd of cmds) {
  stacks[cmd.to].push(
    ...stacks[cmd.from].slice(stacks[cmd.from].length - cmd.count),
  );
  for (let i = 0; i < cmd.count; i++) {
    stacks[cmd.from].pop()!;
  }
}

console.info(stacks.map((s) => s[s.length - 1]).join(""));
