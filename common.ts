import { readFileSync } from "fs";
import { runInThisContext } from "vm";

export const processArgs = process.argv.filter(
  (path) => !path.startsWith("C:"),
);

export const input = readFileSync(processArgs[0] || "in.txt", {
  encoding: "ascii",
})
  .replaceAll("\r\n", "\n")
  .trim();

export let debugOn = true;

export function debug<T>(item: T, ...args: readonly any[]) {
  if (debugOn) {
    console.info(item, ...args);
  }
  return item;
}

export function disableDebug(): void {
  debugOn = false;
}

export function enableDebug(): void {
  debugOn = true;
}

export function mod(a: number, m: number): number {
  return ((a % m) + m) % m;
}
export function div(a: number, m: number): number {
  return Math.floor(a / m);
}

export function gcd(a: number, b: number): number {
  while (b !== 0) {
    const t = b;
    b = mod(a, b);
    a = t;
  }
  return a;
}

export function egcd(a: number, b: number): { af: number; bf: number } {
  let [old_r, r] = [a, b];
  let [old_s, s] = [1, 0];
  let [old_t, t] = [0, 1];

  while (r !== 0) {
    let quotient = div(old_r, r);
    [old_r, r] = [r, old_r - quotient * r];
    [old_s, s] = [s, old_s - quotient * s];
    [old_t, t] = [t, old_t - quotient * t];
  }

  const g = gcd(a, b);
  const got = a * old_s + b * old_t;

  return {
    af: old_s * (got / g),
    bf: old_t * (got / g),
  };
}

export function modifyVal<K, V>(
  m: Map<K, V>,
  k: K,
  f: (old: V) => V,
  defaultValue: V,
): void {
  m.set(k, f(m.has(k) ? m.get(k)! : defaultValue));
}

export function sum(xs: Iterable<number>): number {
  let s = 0;
  for (const x of xs) {
    s += x;
  }
  return s;
}
export function product(xs: Iterable<number>): number {
  let s = 1;
  for (const x of xs) {
    s *= x;
  }
  return s;
}

export class AnyMap<V> {
  private internalMap = new Map<any, any>();
  constructor() {}

  public get(key: readonly unknown[]): V | undefined {
    let m = this.internalMap;
    for (const k of key) {
      if (!m.has(k)) {
        return undefined;
      }
      m = m.get(k)!;
    }
    return m.get(AnyMap);
  }
  public set(key: readonly unknown[], v: V): void {
    let m = this.internalMap;
    for (const k of key) {
      if (!m.has(k)) {
        m.set(k, new Map());
      }
      m = m.get(k)!;
    }
    m.set(AnyMap, v);
  }
  public has(key: readonly unknown[]): boolean {
    let m = this.internalMap;
    for (const k of key) {
      if (!m.has(k)) {
        return false;
      }
      m = m.get(k)!;
    }
    return m.has(AnyMap);
  }
  public clear(): void {
    this.internalMap.clear();
  }
}

const LOOP = Symbol("LOOP");
export function memoize<F extends Function>(
  f: F,
  mode: "json" | "anymap" = "json",
): F {
  if (mode === "anymap") {
    const cache = new AnyMap<any>();
    return ((...args: any[]) => {
      if (cache.has(args)) {
        const stored = cache.get(args)!;
        if (stored === LOOP) {
          throw new Error("cycle detected in memoized function");
        }
        return cache.get(args)! as any;
      }
      cache.set(args, LOOP);
      const answer = f(...args);
      cache.set(args, answer);
      return answer;
    }) as any;
  }

  const cache = new Map<string, any>();
  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      const stored = cache.get(key)!;
      if (stored === LOOP) {
        throw new Error("cycle detected in memoized function");
      }
      return stored;
    }
    cache.set(key, LOOP);

    /*
    const oldInfo = console.info;
    console.info = (...args) => {
      oldInfo("    ", ...args);
    };
*/
    const answer = f(...args);
    /*
    console.info = oldInfo;
    */

    cache.set(key, answer);
    // debug("-->", answer);
    return answer;
  }) as any;
}

export const valueTypeCache = new AnyMap<any>();
export class ValueType {
  constructor(key: readonly any[]) {
    if (valueTypeCache.has([this.constructor, ...key])) {
      return valueTypeCache.get([this.constructor, ...key]);
    }
    valueTypeCache.set([this.constructor, ...key], this);
  }
}

export class Pos3 extends ValueType {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number,
  ) {
    if (x === 0) {
      x = 0;
    }
    if (y === 0) {
      y = 0;
    }
    if (z === 0) {
      z = 0;
    }
    super([x, y, z]);
    this.x = x;
    this.y = y;
    this.z = z;
  }
  public shift(dx: number, dy: number, dz: number): Pos3 {
    return new Pos3(this.x + dx, this.y + dy, this.z + dz);
  }
  public add(other: Pos3): Pos3 {
    return this.shift(other.x, other.y, other.z);
  }
  public sub(other: Pos3): Pos3 {
    return this.shift(-other.x, -other.y, -other.z);
  }
  public scale(k: number): Pos3 {
    return new Pos3(this.x * k, this.y * k, this.z * k);
  }
  public dot(other: Pos3): number {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }
  public cross(other: Pos3): Pos3 {
    return new Pos3(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x,
    );
  }
  public neighborsOrtho(): Pos3[] {
    return [
      this.shift(1, 0, 0),
      this.shift(0, 1, 0),
      this.shift(-1, 0, 0),
      this.shift(0, -1, 0),
      this.shift(0, 0, 1),
      this.shift(0, 0, -1),
    ];
  }
  public distMax(other: Pos3): number {
    return Math.max(
      Math.abs(other.x - this.x),
      Math.abs(other.y - this.y),
      Math.abs(other.z - this.z),
    );
  }
  public distAdd(other: Pos3): number {
    return (
      Math.abs(other.x - this.x) +
      Math.abs(other.y - this.y) +
      Math.abs(other.z - this.z)
    );
  }
  public toString(): string {
    return `${this.x};${this.y};${this.z}`;
  }
}

export class Pos2 extends ValueType {
  constructor(public readonly x: number, public readonly y: number) {
    if (x === 0) {
      x = 0; // normalize neg 0
    }
    if (y === 0) {
      y = 0; // normalize neg 0
    }
    super([x, y]);
    this.x = x;
    this.y = y;
  }
  public toString(): string {
    return `${this.x};${this.y}`;
  }
  public shift(dx: number, dy: number): Pos2 {
    return new Pos2(this.x + dx, this.y + dy);
  }
  public add(other: Pos2): Pos2 {
    return this.shift(other.x, other.y);
  }
  public sub(other: Pos2): Pos2 {
    return this.shift(-other.x, -other.y);
  }
  public scale(k: number): Pos2 {
    return new Pos2(this.x * k, this.y * k);
  }
  public rot90Origin(): Pos2 {
    return new Pos2(-this.y, this.x);
  }
  public neighborsOrtho(): Pos2[] {
    return [
      this.shift(1, 0),
      this.shift(0, 1),
      this.shift(-1, 0),
      this.shift(0, -1),
    ];
  }
  public static cardinal4(): Pos2[] {
    return [new Pos2(1, 0), new Pos2(0, 1), new Pos2(-1, 0), new Pos2(0, -1)];
  }
  public neighborsDiag(): Pos2[] {
    return rangeInclusive(-1, 1)
      .flatMap((x) => rangeInclusive(-1, 1).map((y) => this.shift(x, y)))
      .filter((q) => q !== this);
  }
  public distMax(other: Pos2): number {
    return Math.max(Math.abs(other.x - this.x), Math.abs(other.y - this.y));
  }
  public distAdd(other: Pos2): number {
    return Math.abs(other.x - this.x) + Math.abs(other.y - this.y);
  }
}

export function parseGrid(src: string, cellSize = 1) {
  const grid = new Map<Pos2, string>();
  const lines = src.split("\n");
  let height = lines.length;
  let width = 0;
  for (let y = 0; y < lines.length; y++) {
    for (let i = 0; i < lines[y].length; i += cellSize) {
      const x = i / cellSize;
      const cellStr = lines[y].slice(i, i + cellSize);
      if (cellStr.trim()) {
        grid.set(new Pos2(x, y), cellStr);
      }
    }
    width = Math.max(width, Math.ceil(lines[y].length / cellSize));
  }
  return {
    grid,
    width,
    height,
  };
}

export function printGrid<V extends string | number | null>(
  grid2: ReadonlyMap<Pos2, V> | ReadonlySet<Pos2>,
): string {
  if (grid2 instanceof Set) {
    return printGrid(new Map([...grid2].map((p) => [p, "#"])));
  }
  const grid = grid2 as ReadonlyMap<Pos2, V>;
  let showWidth = 1;
  for (const v of grid.values()) {
    if (v === null) {
      continue;
    }
    const sv = v.toString();
    showWidth = Math.max(showWidth, sv.length);
  }
  let min: Pos2 | null = null;
  let max: Pos2 | null = null;
  for (const p of grid.keys()) {
    if (min === null || max === null) {
      min = p;
      max = p;
    } else {
      min = new Pos2(Math.min(min.x, p.x), Math.min(min.y, p.y));
      max = new Pos2(Math.max(max.x, p.x), Math.max(max.y, p.y));
    }
  }
  if (!min || !max) {
    console.info("(empty)");
    return "(empty)";
  }
  let sTotal = "";
  for (let y = 0; y <= max.y; y++) {
    for (let x = min.x; x <= max.x; x++) {
      const p = new Pos2(x, y);
      const s = grid.has(p) ? grid.get(p)!.toString() : "";
      sTotal += s.padStart(showWidth, ".");
    }
    sTotal += "\n";
  }
  console.info(sTotal);
  return sTotal;
}

export function iota(n: number): number[] {
  const r: number[] = [];
  for (let i = 0; i < n; i++) {
    r.push(i);
  }
  return r;
}

export function rangeInclusive(lo: number, hi: number): number[] {
  const r: number[] = [];
  for (let i = lo; i <= hi; i++) {
    r.push(i);
  }
  return r;
}
export function rangeExclusive(lo: number, hi: number): number[] {
  const r: number[] = [];
  for (let i = lo; i < hi; i++) {
    r.push(i);
  }
  return r;
}

export type CompKey =
  | number
  | string
  | readonly CompKey[]
  | { readonly desc: CompKey };

export function comp(a: CompKey, b: CompKey): number {
  if (a === b) {
    return 0;
  }
  if (
    typeof a === "object" &&
    typeof b === "object" &&
    "desc" in a &&
    "desc" in b
  ) {
    return -comp(a.desc, b.desc);
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    for (let i = 0; i < a.length && i < b.length; i++) {
      const c = comp(a[i], b[i]);
      if (c !== 0) {
        return c;
      }
    }
    return a.length - b.length;
  }
  return a < b ? -1 : 1;
}

export function sorted<T>(items: Iterable<T>, by: (key: T) => CompKey): T[] {
  return [...items].sort((a, b) => comp(by(a), by(b)));
}

export type BranchEffect<Snapshot> = {
  branch: <T>(options: Iterable<T>) => T;
  branchRange: (lo: number, hiExclude: number) => number;
  snapshot: (snapshot: Snapshot) => void;
  abort: () => never;
};
export let totalCatchupTime = 0;
export let totalBranchCount = 0;
export function exploreBranches<Snapshot>(
  f: (action: BranchEffect<Snapshot>, snapshot?: Snapshot) => void,
): void {
  const branches: {
    branch: any[];
    snapshotFrom: number;
    snapshot?: Snapshot;
  }[] = [{ branch: [], snapshotFrom: 0 }];

  while (branches.length > 0) {
    totalBranchCount += 1;
    const now = Date.now();
    let { branch, snapshotFrom, snapshot: recentSnapshot } = branches.pop()!;
    class AbortError extends Error {}

    let branchIndex = snapshotFrom;
    const actions: BranchEffect<Snapshot> = {
      branch: (options) => {
        const optionsList = [...options];
        if (optionsList.length === 0) {
          throw new AbortError();
        }
        if (branchIndex < branch.length) {
          if (branchIndex + 1 === branch.length) {
            totalCatchupTime += Date.now() - now;
          }
          return branch[branchIndex++];
        }

        // Add the other branches, and resume with the first value.
        for (let i = optionsList.length - 1; i > 0; i--) {
          branches.push({
            branch: [...branch, optionsList[i]],
            snapshotFrom,
            snapshot: recentSnapshot,
          });
        }
        branch.push(optionsList[0]);
        branchIndex++;
        return optionsList[0];
      },
      branchRange: (lo, hi) => {
        return actions.branch(
          (function* () {
            for (let i = lo; i < hi; i++) {
              yield i;
            }
          })(),
        );
      },
      abort: () => {
        throw new AbortError();
      },
      snapshot: (store) => {
        recentSnapshot = store;
        snapshotFrom = branchIndex;
      },
    };

    f(actions, recentSnapshot);
  }
}

export function toNum(s: string): number {
  return parseFloat(s);
}

export function fixedStanzas<
  T extends Record<string, any> | readonly unknown[] | [],
>(s: string, partsParsers: { [k in keyof T]: (stanza: string) => T[k] }): T {
  const parts = s.trim().split("\n\n");

  return Object.fromEntries(
    Object.entries(partsParsers).map(([key, parser], i) => [
      key,
      (parser as any)(parts[i]),
    ]),
  ) as T;
}

export function stanzas(s: string): string[] {
  return s.split("\n\n");
}

export function record<T>(r: Record<string, T>): Record<string, T> {
  return r;
}

export type Hole = { __hole: Hole };

export type ReplaceHole<T, R> = T extends infer Case
  ? ReplaceHoleHelper<Case, R>
  : never;
type ReplaceHoleHelper<T, R> = T extends Hole
  ? R
  : T extends Set<infer Item>
  ? Set<ReplaceHole<Item, R>>
  : T extends Map<infer Key, infer Val>
  ? Map<ReplaceHole<Key, R>, ReplaceHole<Val, R>>
  : { [k in keyof T]: ReplaceHole<T[k], R> };

export function call<T>(f: () => T): T {
  return f();
}

export function assert(b: boolean, ...args: any[]): void {
  if (!b) {
    console.error("assert failed:", ...args);
    throw new Error("assert failed");
  }
}

export type IncRange = { lo: number; hi: number };

export function rangeContains(r: IncRange | null, x: number): boolean {
  if (!r) {
    return false;
  }
  return x >= r.lo && x <= r.hi;
}

export function rangeOverlaps(a: IncRange | null, b: IncRange | null): boolean {
  if (a === null || b === null) {
    return false;
  }
  return (
    rangeContains(a, b.lo) ||
    rangeContains(a, b.hi) ||
    rangeContains(b, a.lo) ||
    rangeContains(b, a.hi)
  );
}

export function rangeUnion(a: IncRange | null, b: IncRange | null) {
  if (!a || !b) {
    return a || b;
  }
  return { lo: Math.min(a.lo, b.lo), hi: Math.max(a.hi, b.hi) };
}

export function rangeIntersect(a: IncRange | null, b: IncRange | null) {
  if (!a || !b) {
    return null;
  }
  const r = { lo: Math.max(a.lo, b.lo), hi: Math.min(a.hi, b.hi) };
  if (r.lo <= r.hi) {
    return r;
  }
  return null;
}

export function last<T>(items: readonly T[]): T {
  assert(items.length > 0);
  return items[items.length - 1];
}
export function first<T>(items: Iterable<T>): T {
  const ts = [...items];
  assert(ts.length > 0);
  return ts[0];
}
