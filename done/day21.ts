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

const ops: Record<string, (a: number, b: number) => number> = {
  "+": (a, b) => a + b,
  "*": (a, b) => a * b,
  "/": (a, b) => a / b,
  "-": (a, b) => a - b,
  "=": (a, b) => (a === b ? 1 : 0),
};

const monkeys = new Map<string, string>();
for (const line of input.split("\n")) {
  const name = line.split(": ")[0];
  const expr = line.split(": ")[1].trim();
  monkeys.set(name, expr);
}

type Poly = { coef: number[] };
function humanPoly(): Poly {
  return { coef: [0, 1] };
}
function addPoly(a: Poly, b: Poly): Poly {
  const coef: number[] = [];
  for (let i = 0; i < a.coef.length || i < b.coef.length; i++) {
    coef.push((a.coef[i] ?? 0) + (b.coef[i] ?? 0));
  }
  return { coef };
}
function mulPoly(a: Poly, b: Poly): Poly {
  const coef: number[] = [];
  for (let i = 0; i < a.coef.length || i < b.coef.length; i++) {
    coef.push((a.coef[i] ?? 0) + (b.coef[i] ?? 0));
  }
  return { coef };
}

type Lin = { m: number; b: number };
function addLin(p: Lin, q: Lin): Lin {
  return { m: p.m + q.m, b: p.b + q.b };
}
function subLin(p: Lin, q: Lin): Lin {
  return { m: p.m - q.m, b: p.b - q.b };
}
function mulLin(p: Lin, q: Lin): Lin {
  if (p.m !== 0 && q.m !== 0) {
    throw new Error("nonlinear");
  }
  return { m: p.m * q.b + q.m * p.b, b: p.b * q.b };
}
function divLin(p: Lin, q: Lin): Lin {
  if (q.m !== 0) {
    throw new Error("nonlinear");
  }
  return { m: p.m / q.b, b: p.b / q.b };
}

function eqLin(p: Lin, q: Lin): Lin {
  console.info(p, q);
  if (q.m === 0) {
    console.info({ answer: (q.b - p.b) / p.m });
  }
  throw new Error("done");
}

const linOps = record({
  "+": addLin,
  "-": subLin,
  "/": divLin,
  "*": mulLin,
  "=": eqLin,
});

for (let h = 0; true; h++) {
  const value = memoize((monkey: string): Lin => {
    if (monkey === "humn") {
      return { m: 1, b: 0 };
    }
    const expr = monkeys.get(monkey)!;
    if (expr.match(/^\d+$/)) {
      return { m: 0, b: toNum(expr) };
    }
    const [left, op, right] = expr.split(" ");
    return linOps[monkey === "root" ? "=" : op](value(left), value(right));
  });

  if (value("root")) {
    console.info(h);
    break;
  }
}
