import { describe, expect, it } from "vitest";
import { CycleError, Graph, topologicalSort } from "../../src/index.js";

function buildGraph(nodes: string[], edges: [string, string][]): Graph {
  const graph = new Graph();
  for (const id of nodes) graph.addNode(id);
  for (const [from, to] of edges) graph.addEdge(from, to);
  return graph;
}

function expectValidOrder(order: string[], edges: [string, string][]): void {
  const position = new Map(order.map((id, index) => [id, index]));
  for (const [from, to] of edges) {
    expect(position.get(from)!).toBeLessThan(position.get(to)!);
  }
}

describe("topologicalSort", () => {
  it("returns an empty order for an empty graph", () => {
    expect(topologicalSort(new Graph())).toEqual([]);
  });

  it("returns the single node of a one-node graph", () => {
    expect(topologicalSort(buildGraph(["a"], []))).toEqual(["a"]);
  });

  it("orders a chain along its edges", () => {
    const edges: [string, string][] = [
      ["a", "b"],
      ["b", "c"],
    ];
    expect(topologicalSort(buildGraph(["c", "b", "a"], edges))).toEqual(["a", "b", "c"]);
  });

  it("places a diamond so every edge points forward", () => {
    const edges: [string, string][] = [
      ["a", "b"],
      ["a", "c"],
      ["b", "d"],
      ["c", "d"],
    ];
    const order = topologicalSort(buildGraph(["a", "b", "c", "d"], edges));

    expectValidOrder(order, edges);
    expect(order).toEqual(["a", "b", "c", "d"]);
  });

  it("keeps isolated nodes in insertion order", () => {
    const order = topologicalSort(buildGraph(["x", "y", "z"], []));
    expect(order).toEqual(["x", "y", "z"]);
  });

  it("includes every node exactly once", () => {
    const nodes = ["a", "b", "c", "d", "e"];
    const edges: [string, string][] = [
      ["e", "a"],
      ["d", "b"],
      ["b", "c"],
    ];
    const order = topologicalSort(buildGraph(nodes, edges));

    expect([...order].sort()).toEqual([...nodes].sort());
    expectValidOrder(order, edges);
  });

  it("detects a cycle and reports its path", () => {
    const graph = buildGraph(
      ["a", "b", "c"],
      [
        ["a", "b"],
        ["b", "c"],
        ["c", "a"],
      ],
    );

    let caught: unknown;
    try {
      topologicalSort(graph);
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(CycleError);
    const cycle = (caught as CycleError).cycle;
    expect(cycle[0]).toBe(cycle[cycle.length - 1]);
    expect(new Set(cycle)).toEqual(new Set(["a", "b", "c"]));
  });

  it("detects a self-loop", () => {
    const graph = buildGraph(["a"], [["a", "a"]]);

    expect(() => topologicalSort(graph)).toThrow(CycleError);
    expect(() => topologicalSort(graph)).toThrow("a -> a");
  });

  it("detects a cycle that is not reachable from the first node", () => {
    const graph = buildGraph(
      ["a", "b", "c"],
      [
        ["b", "c"],
        ["c", "b"],
      ],
    );

    expect(() => topologicalSort(graph)).toThrow(CycleError);
  });

  it("handles long chains without exhausting the call stack", () => {
    const size = 50_000;
    const nodes = Array.from({ length: size }, (_, i) => `n${i}`);
    const edges: [string, string][] = [];
    for (let i = 0; i + 1 < size; i++) edges.push([nodes[i]!, nodes[i + 1]!]);

    const order = topologicalSort(buildGraph(nodes, edges));

    expect(order).toEqual(nodes);
  });
});
