import { useEffect } from "react";

export const useGraphPhysics = (graphRef: any, graphData: any, isNodeIsolated: any) => {
  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;
    graphData.nodes.forEach((node: any, i: number) => {
      if (!node.x && !node.y && graphData.links.length > 0) {
        const angle = (i / graphData.nodes.length) * Math.PI;
        node.x = Math.cos(angle) * 100;
        node.y = Math.sin(angle) * 100;
      }
    });
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
  }, [graphData]);
};
