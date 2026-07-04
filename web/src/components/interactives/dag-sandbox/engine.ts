/**
 * DAG engine — d-separation, path classification, and backdoor adjustment
 * sets. Pure TS, no React, no randomness. Graphs in this course are tiny
 * (≤ 8 nodes), so path enumeration and subset search are exact, not
 * heuristic.
 *
 * Validated in engine.test.ts against known results for the course DAGs:
 * waffles, milk, fungus, grandparents, and the three elemental confounds.
 */

export interface Dag {
  nodes: readonly string[]
  /** directed edges, from → to */
  edges: readonly (readonly [string, string])[]
  /** nodes that cannot be conditioned on (drawn as open circles) */
  unobserved?: readonly string[]
}

export function parents(dag: Dag, v: string): string[] {
  return dag.edges.filter(([, to]) => to === v).map(([from]) => from)
}

export function children(dag: Dag, v: string): string[] {
  return dag.edges.filter(([from]) => from === v).map(([, to]) => to)
}

export function descendants(dag: Dag, v: string): Set<string> {
  const out = new Set<string>()
  const stack = [...children(dag, v)]
  while (stack.length > 0) {
    const n = stack.pop()!
    if (out.has(n)) continue
    out.add(n)
    stack.push(...children(dag, n))
  }
  return out
}

export function isAcyclic(dag: Dag): boolean {
  const marks = new Map<string, 'visiting' | 'done'>()
  const visit = (v: string): boolean => {
    const mark = marks.get(v)
    if (mark === 'visiting') return false
    if (mark === 'done') return true
    marks.set(v, 'visiting')
    for (const c of children(dag, v)) if (!visit(c)) return false
    marks.set(v, 'done')
    return true
  }
  return dag.nodes.every((n) => visit(n))
}

/** One step along an undirected walk of the DAG. */
export interface PathStep {
  node: string
  /** direction of the edge that ARRIVES at this node from the previous one */
  arrivedVia: 'forward' | 'backward'
}

export interface DagPath {
  /** nodes in order, starting at x and ending at y */
  nodes: string[]
  /** for nodes[i] (i ≥ 1), whether the edge points toward nodes[i] */
  intoNode: boolean[]
  /** does the path leave x through an incoming edge (a backdoor)? */
  backdoor: boolean
}

/** All simple undirected paths between x and y. */
export function allPaths(dag: Dag, x: string, y: string): DagPath[] {
  const out: DagPath[] = []
  const walk = (node: string, visited: string[], into: boolean[]) => {
    if (node === y) {
      out.push({
        nodes: [...visited],
        intoNode: [...into],
        backdoor: into.length > 0 && !into[0]!,
      })
      return
    }
    for (const [from, to] of dag.edges) {
      const next = from === node ? to : to === node ? from : null
      if (next === null || visited.includes(next)) continue
      walk(next, [...visited, next], [...into, from === node])
    }
  }
  walk(x, [x], [])
  return out
}

/**
 * Is a single path blocked by the conditioning set Z?
 * An intermediate node v blocks the path when:
 *  - v is a non-collider and v ∈ Z, or
 *  - v is a collider and neither v nor any descendant of v is in Z.
 */
export function pathBlocked(dag: Dag, path: DagPath, z: ReadonlySet<string>): boolean {
  for (let i = 1; i < path.nodes.length - 1; i++) {
    const v = path.nodes[i]!
    const collider = isCollider(path, i)
    if (collider) {
      const opened = z.has(v) || [...descendants(dag, v)].some((d) => z.has(d))
      if (!opened) return true
    } else if (z.has(v)) {
      return true
    }
  }
  return false
}

/**
 * v = nodes[i] (0 < i < last) is a collider iff both adjacent edges point
 * into it: the arriving edge points toward v (intoNode[i-1]) and the
 * departing edge points backward from nodes[i+1] into v (!intoNode[i]).
 */
export function isCollider(path: DagPath, i: number): boolean {
  return path.intoNode[i - 1]! && !path.intoNode[i]!
}

export function dSeparated(
  dag: Dag,
  x: string,
  y: string,
  z: ReadonlySet<string> = new Set(),
): boolean {
  return allPaths(dag, x, y).every((p) => pathBlocked(dag, p, z))
}

/** Paths into x — the ones the backdoor criterion cares about. */
export function backdoorPaths(dag: Dag, x: string, y: string): DagPath[] {
  return allPaths(dag, x, y).filter((p) => p.backdoor)
}

/**
 * All minimal backdoor adjustment sets for the total causal effect x → y.
 * Candidates exclude x, y, descendants of x, and unobserved nodes.
 * Returns sets sorted by size then name; [] means "no valid set exists";
 * [∅] (a single empty set) means "no adjustment needed".
 */
export function adjustmentSets(dag: Dag, x: string, y: string): string[][] {
  const unobserved = new Set(dag.unobserved ?? [])
  const banned = descendants(dag, x)
  const candidates = dag.nodes.filter(
    (n) => n !== x && n !== y && !banned.has(n) && !unobserved.has(n),
  )
  const backdoors = backdoorPaths(dag, x, y)
  const valid: string[][] = []
  const total = 1 << candidates.length
  for (let mask = 0; mask < total; mask++) {
    const z = new Set<string>()
    for (let i = 0; i < candidates.length; i++) {
      if (mask & (1 << i)) z.add(candidates[i]!)
    }
    if (backdoors.every((p) => pathBlocked(dag, p, z))) {
      valid.push([...z].sort())
    }
  }
  // keep only minimal sets
  const minimal = valid.filter(
    (s) =>
      !valid.some(
        (t) => t.length < s.length && t.every((n) => s.includes(n)),
      ),
  )
  return minimal.sort(
    (a, b) => a.length - b.length || a.join().localeCompare(b.join()),
  )
}
