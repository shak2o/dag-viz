import type { Graph } from "./Graph.js";

/**
 * Returns one cycle as a closed path, e.g. ["a", "b", "c", "a"], or null if the
 * graph is acyclic.
 *
 * Uses an explicit stack instead of recursion so that long chains (tens of
 * thousands of nodes, which pipelines can produce) do not overflow the call stack.
 */
export function findCycle(graph: Graph): string[] | null {
  interface Frame {
    id: string;
    children: string[];
    next: number;
  }

  // Maps a node on the current DFS path to its depth in the stack.
  const depthOnPath = new Map<string, number>();
  const finished = new Set<string>();

  for (const root of graph.nodeIds()) {
    if (finished.has(root)) {
      continue;
    }

    const stack: Frame[] = [{ id: root, children: graph.successors(root), next: 0 }];
    depthOnPath.set(root, 0);

    for (;;) {
      const frame = stack.at(-1);
      if (frame === undefined) {
        break;
      }

      const child = frame.children[frame.next];
      if (child === undefined) {
        stack.pop();
        depthOnPath.delete(frame.id);
        finished.add(frame.id);
        continue;
      }
      frame.next += 1;

      const cycleStart = depthOnPath.get(child);
      if (cycleStart !== undefined) {
        const path = stack.slice(cycleStart).map((f) => f.id);
        return [...path, child];
      }
      if (finished.has(child)) {
        continue;
      }

      depthOnPath.set(child, stack.length);
      stack.push({ id: child, children: graph.successors(child), next: 0 });
    }
  }

  return null;
}
