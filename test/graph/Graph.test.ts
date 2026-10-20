import { describe, expect, it } from "vitest";
import { Graph } from "../../src/graph/Graph.js";

describe("Graph", () => {
  it("keeps nodes in insertion order", () => {
    const graph = new Graph();
    graph.addNode("b");
    graph.addNode("a");

    expect(graph.nodeIds()).toEqual(["b", "a"]);
    expect(graph.nodeCount).toBe(2);
  });

  it("rejects duplicate node ids", () => {
    const graph = new Graph();
    graph.addNode("a");

    expect(() => graph.addNode("a")).toThrow("Node already exists: a");
  });

  it("tracks successors and predecessors", () => {
    const graph = new Graph();
    for (const id of ["a", "b", "c"]) graph.addNode(id);
    graph.addEdge("a", "b");
    graph.addEdge("a", "c");

    expect(graph.successors("a")).toEqual(["b", "c"]);
    expect(graph.predecessors("b")).toEqual(["a"]);
    expect(graph.successors("b")).toEqual([]);
  });

  it("ignores duplicate edges", () => {
    const graph = new Graph();
    graph.addNode("a");
    graph.addNode("b");
    graph.addEdge("a", "b");
    graph.addEdge("a", "b");

    expect(graph.successors("a")).toEqual(["b"]);
    expect(graph.predecessors("b")).toEqual(["a"]);
  });

  it("rejects edges that reference unknown nodes without changing the graph", () => {
    const graph = new Graph();
    graph.addNode("a");

    expect(() => graph.addEdge("a", "missing")).toThrow("Unknown node: missing");
    expect(() => graph.addEdge("missing", "a")).toThrow("Unknown node: missing");
    expect(graph.successors("a")).toEqual([]);
  });

  it("throws when querying neighbours of an unknown node", () => {
    const graph = new Graph();

    expect(() => graph.successors("x")).toThrow("Unknown node: x");
    expect(() => graph.predecessors("x")).toThrow("Unknown node: x");
  });
});
