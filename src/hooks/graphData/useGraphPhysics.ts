import { useEffect } from "react";

export const useGraphPhysics = (graphRef: any, graphData: any, isNodeIsolated: any) => {
  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;
    graph.d3Force('link')?.distance(80);
    graph.d3Force('charge')?.strength(-50);
    graph.d3Force('isolate', (alpha) => {
      graphData.nodes.forEach((node) => {
        if (isNodeIsolated(node) && typeof node === 'object' && 'vx' in node) {
          node.vx *= 0.2;
          node.vy *= 0.2;
        }
      });
    });
    graph.d3ReheatSimulation();
  }, [graphData, graphRef, isNodeIsolated]);
};
