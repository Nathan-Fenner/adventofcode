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

console.info(input);

const stanzas = input.split("\n\n");

const monkeyState = new Map<
  number,
  {
    items: number[];
    operation: (old: number) => number;
    test: (newVal: number) => boolean;
    then: [number, number];
  }
>();

let overall = 1;

for (const stanza of stanzas) {
  const [label, startingLine, operationLine, testLine, trueLine, falseLine] =
    stanza.split("\n");

  const operation = (old: number) => {
    const [oldS, opS, litS] = operationLine
      .trim()
      .slice("Operation: new = ".length)
      .split(" ");
    if (oldS !== "old") {
      throw new Error("bug");
    }
    const lit = litS === "old" ? old : toNum(litS);
    switch (opS) {
      case "+":
        return old + lit;
      case "*":
        return old * lit;
      case "-":
        return old - lit;
    }
    throw new Error(`unsupported op ${opS}`);
  };

  const startingItems = startingLine
    .trim()
    .split(":")[1]
    .trim()
    .split(", ")
    .map(toNum);

  console.info({ startingLine, startingItems });

  const testWords = testLine.trim().split(" ");
  const testMod = toNum(testWords[3]);
  overall *= testMod;
  const test = (old: number): boolean => {
    return old % testMod === 0;
  };

  monkeyState.set(toNum(label.trim().split(" ")[1]), {
    operation,
    items: startingItems,
    test,
    then: [
      toNum(falseLine.split(" ").pop()!),
      toNum(trueLine.split(" ").pop()!),
    ],
  });
}

console.info(
  "BEGIN",
  [...monkeyState].map(([k, v]) => [k, v.items]),
);

const totalActivity = new Map([...monkeyState.keys()].map((k) => [k, 0]));

for (let round = 1; round <= 10000; round++) {
  for (const monkey of monkeyState.keys()) {
    const me = monkeyState.get(monkey)!;
    const wasHolding = me.items;
    while (wasHolding.length > 0) {
      totalActivity.set(monkey, totalActivity.get(monkey)! + 1);
      const first = wasHolding.shift()!;
      const newVal = mod(me.operation(first), overall);
      const test = me.test(newVal);
      const newmonk = me.then[Number(test)];
      monkeyState.get(newmonk)!.items.push(newVal);
    }
  }
}

console.info(
  "END",
  [...monkeyState].map(([k, v]) => [k, v.items]),
);

console.info(totalActivity);

console.info(
  product(
    sorted([...totalActivity.values()], (v) => ({ desc: v })).slice(0, 2),
  ),
);
