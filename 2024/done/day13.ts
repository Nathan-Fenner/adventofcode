import { statSync } from "fs";
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
} from "../common";

console.info(input);

type Packet = number | Packet[];
function parsePacket(input: string): Packet {
  let at = 0;
  function parse(): Packet {
    if (input[at] === "[") {
      at++;
      const items: Packet[] = [];
      while (input[at] !== "]") {
        const item = parse();
        items.push(item);
        if (input[at] === ",") {
          at++;
        }
      }
      at++;

      return items;
    }

    let s = "";
    while (input[at].match(/\d/)) {
      s += input[at];
      at++;
    }

    return toNum(s);
  }
  return parse();
}

function order(a: Packet, b: Packet): number {
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    for (let i = 0; i < a.length && i < b.length; i++) {
      const x = order(a[i], b[i]);
      if (x !== 0) {
        return x;
      }
    }
    return a.length - b.length;
  }
  if (typeof a === "number") {
    return order([a], b);
  }
  if (typeof b === "number") {
    return order(a, [b]);
  }
  console.info({ a, b });
  throw new Error("bug?");
}

let right = 0;
let sum = 0;
const stanzas = input.split("\n\n");
for (let i = 0; i < stanzas.length; i++) {
  const stanza = stanzas[i];
  const packets = stanza.split("\n").map(parsePacket);

  if (order(packets[0], packets[1]) < 0) {
    console.info(i + 1);
    sum += i + 1;
  }
}

console.info({ right, sum });

console.info(order([1, 2], [1, 2, 3]));

const A = [[6]];
const B = [[2]];

const res = [
  ...input
    .split("\n")
    .filter((line) => line)
    .map(parsePacket),
  A,
  B,
].sort(order);

console.info((res.indexOf(A) + 1) * (res.indexOf(B) + 1));
