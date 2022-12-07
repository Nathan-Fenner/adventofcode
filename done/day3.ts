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

const lines = input.split("\n").map((line) => {
  const l = line.split("");
  return [l.slice(0, l.length / 2), l.slice(l.length / 2)];
});

function prio(x: string) {
  if (x >= "a" && x <= "z") {
    return x.charCodeAt(0) - "a".charCodeAt(0) + 1;
  }
  if (x >= "A" && x <= "Z") {
    return x.charCodeAt(0) - "A".charCodeAt(0) + 27;
  }
  return 0;
}

let t = 0;
for (let i = 0; i < lines.length; i += 3) {
  const a = lines[i].flat();
  const b = lines[i + 1].flat();
  const c = lines[i + 2].flat();
  const [com] = a.filter((x) => b.includes(x) && c.includes(x));
  t += prio(com);
}
console.info(t);
