import { input, Pos2, sorted } from "./common";

let seen = new Set<Pos2>();
const dirs = {
  ">": new Pos2(1, 0),
  "^": new Pos2(0, -1),
  "<": new Pos2(-1, 0),
  v: new Pos2(0, 1),
};

let at = new Pos2(0, 0);
let robot = new Pos2(0, 0);
let which = false;

seen.add(at);
for (const c of input) {
  if (which) {
    at = at.add(dirs[c as keyof typeof dirs]);
  } else {
    robot = robot.add(dirs[c as keyof typeof dirs]);
  }
  which = !which;
  seen.add(at);
  seen.add(robot);
}

console.info(seen.size);
