/**
 * A directed graph with string node ids.
 *
 * The graph is allowed to contain cycles. Acyclicity is checked where it matters
 * (topological sort, layout) instead of on every insert, which keeps building a
 * graph cheap and lets callers get a precise error describing the cycle.
 */
export class Graph {
  private readonly successorsById = new Map<string, Set<string>>();
  private readonly predecessorsById = new Map<string, Set<string>>();

  get nodeCount(): number {
    return this.successorsById.size;
  }

  nodeIds(): string[] {
    return [...this.successorsById.keys()];
  }

  hasNode(id: string): boolean {
    return this.successorsById.has(id);
  }

  addNode(id: string): void {
    if (this.successorsById.has(id)) {
      throw new Error(`Node already exists: ${id}`);
    }
    this.successorsById.set(id, new Set());
    this.predecessorsById.set(id, new Set());
  }

  /** Adding an edge that already exists is a no-op. */
  addEdge(from: string, to: string): void {
    // Resolve both endpoints before mutating, so a failed call leaves the graph unchanged.
    const successors = this.successorsOf(from);
    const predecessors = this.predecessorsOf(to);
    successors.add(to);
    predecessors.add(from);
  }

  successors(id: string): string[] {
    return [...this.successorsOf(id)];
  }

  predecessors(id: string): string[] {
    return [...this.predecessorsOf(id)];
  }

  private successorsOf(id: string): Set<string> {
    return this.requireSet(this.successorsById, id);
  }

  private predecessorsOf(id: string): Set<string> {
    return this.requireSet(this.predecessorsById, id);
  }

  private requireSet(map: Map<string, Set<string>>, id: string): Set<string> {
    const set = map.get(id);
    if (set === undefined) {
      throw new Error(`Unknown node: ${id}`);
    }
    return set;
  }
}
