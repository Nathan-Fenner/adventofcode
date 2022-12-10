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

const cmds = input.split("\n").map((line) => {
  if (line.startsWith("$")) {
    return { type: "in" as const, cmd: line.slice(1).trim().split(/\s+/) };
  }
  return { type: "out" as const, out: line.trim().split(/\s+/) };
});

console.info(cmds);

type Tree = {
  parent: Tree;
  files: Map<string, number>;
  dirs: Map<string, Tree>;
};

let root: Tree = {
  parent: null as any,
  files: new Map(),
  dirs: new Map(),
};
let current = root;

for (const cmd of cmds) {
  if (cmd.type === "in") {
    if (cmd.cmd[0] === "cd") {
      if (cmd.cmd[1] === "/") {
        current = root;
      } else if (cmd.cmd[1] === "..") {
        current = current.parent;
      } else {
        if (!current.dirs.has(cmd.cmd[1])) {
          throw new Error(`unknown dir ${cmd.cmd[1]}`);
        }
        current = current.dirs.get(cmd.cmd[1])!;
      }
    } else if (cmd.cmd[0] === "ls") {
      // nothing
    }
  } else {
    const [a, b] = cmd.out!;
    if (a === "dir") {
      if (!current.dirs.has(b)) {
        current.dirs.set(b, {
          parent: current,
          dirs: new Map(),
          files: new Map(),
        });
      }
    } else {
      current.files.set(b, parseInt(a));
    }
  }
}

function visit(t: Tree, f: (tree: Tree) => void): void {
  f(t);
  for (const dir of t.dirs.values()) {
    visit(dir, f);
  }
}

function sizeOf(tree: Tree): number {
  let tot = 0;
  visit(tree, (node) => {
    for (const f of node.files.values()) {
      tot += f;
    }
  });
  return tot;
}

let alltis = 0;
visit(root, (node) => {
  const dirSize = sizeOf(node);
  if (dirSize <= 100000) {
    alltis += dirSize;
  }
});

console.info(alltis);

const TOTAL = 70_000_000;
const NEED_UNUSED = 30_000_000;

let haveUnused = TOTAL - sizeOf(root);

let smallestWorking = 1 / 0;
visit(root, (tree) => {
  const s = sizeOf(tree);
  if (haveUnused + s >= NEED_UNUSED) {
    if (s < smallestWorking) {
      smallestWorking = s;
    }
  }
});

console.info(smallestWorking);
