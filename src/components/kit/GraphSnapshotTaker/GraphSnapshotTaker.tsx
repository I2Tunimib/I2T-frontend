import { FC, useRef, useMemo } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';

interface GraphSnapshotTakerProps {
  table: {
    id: string | number;
    graph?: { nodes: any[]; links: any[] };
  };
  onSnapshotReady: (imgUrl: string) => void;
}

const GraphSnapshotTaker: FC<GraphSnapshotTakerProps> = ({ table, onSnapshotReady }) => {
  const graphRef = useRef<ForceGraphMethods | null>(null);
  const tableId = table.id;

  const graphGenerated = useMemo(() => {
    if (!table?.graph || !table.graph.nodes || table.graph.nodes.length === 0) {
      return null;
    }
    const nodes = table.graph.nodes.map((node) => ({ ...node }));
    const links = table.graph.links.map((link) => ({ ...link }));
    return { nodes, links };
  }, [table?.graph]);

  if (!graphGenerated) return null;

  return (
    <div
      id={`snapshot-canvas-${tableId}`}
      style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '300px', height: '300px' }}
    >
      <ForceGraph2D
        ref={graphRef}
        graphData={graphGenerated}
        width={500}
        height={500}
        cooldownTicks={table?.graph?.links.length > 0 ? 40 : 20}
        linkDirectionalArrowLength={8}
        linkDirectionalArrowRelPos={0.95}
        onEngineStop={() => {
          setTimeout(() => {
            const canvas = document.querySelector(`#snapshot-canvas-${tableId} canvas`) as HTMLCanvasElement | null;
            if (canvas) {
              onSnapshotReady(canvas.toDataURL('image/png'));
            }
          }, 50);
        }}
        nodeCanvasObject={(node: any, ctx) => {
          const RADIUS = 6;
          ctx.fillStyle = node.role === 'subject' ? '#2ecc71' : node.kind === 'literal' ? '#e67e22' : '#3498db';
          ctx.beginPath();
          ctx.arc(node.x, node.y, RADIUS, 0, 2 * Math.PI);
          ctx.fill();
        }}
        linkColor={() => 'rgba(150,150,150,0.5)'}
        linkWidth={1.5}
      />
    </div>
  );
};

export default GraphSnapshotTaker;
