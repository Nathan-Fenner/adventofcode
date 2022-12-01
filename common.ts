import { readFileSync } from "fs";

export const processArgs = process.argv.filter(
  (path) => !path.startsWith("C:"),
);

export const input = readFileSync(processArgs[0] || `in.txt`, {
  encoding: "ascii",
})
  .replaceAll("\r\n", "\n")
  .trim();

export let debugOn = true;

export function debug(...args: readonly any[]) {
  if (debugOn) {
    console.info(...args);
  }
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

    const oldInfo = console.info;
    console.info = (...args) => {
      oldInfo("    ", ...args);
    };

    const answer = f(...args);

    console.info = oldInfo;

    cache.set(key, answer);
    debug("-->", answer);
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

export class Pos2 extends ValueType {
  constructor(public readonly x: number, public readonly y: number) {
    super([x, y]);
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
}

export function iota(n: number): number[] {
  const r: number[] = [];
  for (let i = 0; i < n; i++) {
    r.push(i);
  }
  return r;
}

export function* rangeInclusive(
  lo: number,
  hi: number,
): Generator<number, void, unknown> {
  for (let i = lo; i <= hi; i++) {
    yield i;
  }
}
export function* rangeExclusive(
  lo: number,
  hi: number,
): Generator<number, void, unknown> {
  for (let i = lo; i < hi; i++) {
    yield i;
  }
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
