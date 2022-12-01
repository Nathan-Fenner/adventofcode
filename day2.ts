import { input, sorted } from "./common";

const ans = input
  .trim()
  .split("\n")
  .map((line) => {
    const sides = line.split("x").map((part) => parseInt(part, 10));

    /*
    return (
      (sides[0] * sides[1] + sides[0] * sides[2] + sides[1] * sides[2]) * 2 +
      Math.min(sides[0] * sides[1], sides[1] * sides[2], sides[0] * sides[2])
    );
    */
    return (
      Math.min(
        sides[0] * 2 + sides[1] * 2,
        sides[0] * 2 + sides[2] * 2,
        sides[1] * 2 + sides[2] * 2
      ) +
      sides[0] * sides[1] * sides[2]
    );
  })
  .reduce((a, b) => a + b, 0);
