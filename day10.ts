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
const machines = input.split("\n").map((line) => {
  const words = line.split(" ");

  const targetLights = words[0].slice(1, -1);
  const buttons = words.slice(1, -1).map((button) => {
    return button.slice(1, -1).split(",").map(toNum);
  });
  const joltage = words.at(-1)!.slice(1, -1).split(",").map(toNum);

  return {
    targetLights,
    buttons,
    joltage,
  };
});

const solveMachine1 = (target: string, buttons: number[][]) => {
  const reachable = new Map<string, number>();
  const initial = ".".repeat(target.length);
  reachable.set(initial, 0);
  const queue = [initial];
  for (const x of queue) {
    if (x === target) {
      return reachable.get(x)!;
    }
    for (const button of buttons) {
      let toggled = x
        .split("")
        .map((y, i) => {
          if (button.includes(i)) {
            return y === "#" ? "." : "#";
          } else {
            return y;
          }
        })
        .join("");
      if (!reachable.has(toggled)) {
        reachable.set(toggled, reachable.get(x)! + 1);
        queue.push(toggled);
      }
    }
  }
  throw new Error("impossible");
};

const solveMachine2 = (
  { line }: { line: number },
  overallTarget: readonly number[],
  originalButtons: number[][],
) => {
  let best = 1 / 0;

  const solveFrom = (
    state: readonly number[],
    { sofar, buttons }: { sofar: number; buttons: number[][] },
  ): void => {
    let stepsLeft = 0;
    for (let i = 0; i < state.length; i++) {
      if (state[i] < 0) {
        return;
      }
      stepsLeft = Math.max(stepsLeft, state[i]);
    }

    if (stepsLeft === 0) {
      best = Math.min(best, sofar);
      return;
    }

    if (sofar + stepsLeft >= best) {
      return;
    }

    const pushedButton = (button: readonly number[]): number[] => {
      const toggle = [...state];
      for (const v of button) {
        toggle[v] -= 1;
      }
      return toggle;
    };

    // Is there a button we can't press?
    const pressable = buttons.filter((b) => b.every((v) => state[v] > 0));
    if (pressable.length < buttons.length) {
      return solveFrom(state, { sofar, buttons: pressable });
    }

    // Is there a button we HAVE to press?
    for (let i = 0; i < state.length; i++) {
      if (state[i] > 0) {
        const usefulButtons = buttons.filter((b) => b.includes(i));
        if (usefulButtons.length === 0) {
          // We can't reach this counter
          return;
        }
      }
    }

    for (let i = 0; i < state.length; i++) {
      for (let j = 0; j < state.length; j++) {
        if (state[i] > state[j]) {
          // Is this "special".
          const usefulButtons = buttons.filter(
            (b) => b.includes(i) && !b.includes(j),
          );
          if (usefulButtons.length === 0) {
            // console.info("impossible imbalance");
            return;
          }
        }
      }
    }

    for (let i = 0; i < state.length; i++) {
      for (let j = 0; j < state.length; j++) {
        if (state[i] > state[j]) {
          // Is this "special".
          const usefulButtons = buttons.filter(
            (b) => b.includes(i) && !b.includes(j),
          );
          if (usefulButtons.length === 1) {
            // We must press it!
            solveFrom(pushedButton(usefulButtons[0]), {
              sofar: sofar + 1,
              buttons,
            });
            return;
          }
        }
      }
    }

    // Is there a button we HAVE to press?
    for (let i = 0; i < state.length; i++) {
      if (state[i] > 0) {
        const usefulButtons = buttons.filter((b) => b.includes(i));

        if (usefulButtons.length === 1) {
          // We must press this button immediately.
          solveFrom(pushedButton(usefulButtons[0]), {
            sofar: sofar + 1,
            buttons,
          });
          return;
        }
      }
    }

    for (let i = 0; i < state.length; i++) {
      for (let j = 0; j < state.length; j++) {
        if (i === j) {
          continue;
        }
        if (state[i] >= state[j]) {
          // If all of the buttons containing 'i' also contain 'j',
          // then we cannot press any button that has 'j' on its own.
          if (buttons.every((b) => !b.includes(i) || b.includes(j))) {
            // All of the buttons containing i also have j.
            const goodButtons = buttons.filter(
              (b) => b.includes(i) || !b.includes(j),
            );
            if (goodButtons.length < buttons.length) {
              // Remove them!
              return solveFrom(state, { sofar, buttons: goodButtons });
            }
          }
        }
      }
    }

    for (let buttonIndex = 0; buttonIndex < buttons.length; buttonIndex++) {
      const button = buttons[buttonIndex];
      const toggled = [...state];
      for (const v of button) {
        toggled[v] -= 1;
      }
      solveFrom(toggled, {
        sofar: sofar + 1,
        buttons: buttons.slice(buttonIndex),
      });
    }
  };

  solveFrom(overallTarget, { sofar: 0, buttons: originalButtons });

  return best;
};

let total = 0;
let line = 1;
for (const machine of machines) {
  // console.info("trying line", line);
  const now = Date.now();
  const solved = solveMachine2({ line }, machine.joltage, machine.buttons);
  console.info({ solved, line, elapsed: Date.now() - now });
  total += solved;
  line += 1;
}

console.info({ total });
