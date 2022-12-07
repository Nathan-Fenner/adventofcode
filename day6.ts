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
} from "./common";

let packets: string[] = [];

for (let i = 14; i < input.length; i++) {
  if (new Set(input.slice(i - 14, i).split("")).size === 14) {
    console.info(i);
    break;
  }
}
