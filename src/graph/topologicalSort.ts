import { CycleError } from "./errors.js";
import { findCycle } from "./cycle.js";
import type { Graph } from "./Graph.js";

/**
 * Kahn's algorithm, O(V + E).
 *
 * Nodes with no remaining predecessors are taken in insertion order, so the
 * result is deterministic for a given graph. Throws CycleError if the graph
 * has a cycle.
 */
export function topologicalSort(graph: Graph): string[] {
  const remainingPredecessors = new Map<string, number>();
  for (const id of graph.nodeIds()) {
    remainingPredecessors.set(id, graph.predecessors(id).length);
  }

  const ready = graph.nodeIds().filter((id) => remainingPredecessors.get(id) === 0);
  const order: string[] = [];

  // Iterating an array while pushing to it visits the appended items too,
  // which is exactly the queue behaviour Kahn's algorithm needs.
  for (const id of ready) {
    order.push(id);
    for (const next of graph.successors(id)) {
      const remaining = (remainingPredecessors.get(next) ?? 0) - 1;
      remainingPredecessors.set(next, remaining);
      if (remaining === 0) {
        ready.push(next);
      }
    }
  }

  if (order.length !== graph.nodeCount) {
    const cycle = findCycle(graph);
    if (cycle === null) {
      throw new Error("Internal error: unsorted nodes remain but no cycle was found");
    }
    throw new CycleError(cycle);
  }

  return order;
}
