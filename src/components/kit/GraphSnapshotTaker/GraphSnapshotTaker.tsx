import { FC, useRef, useMemo } from 'react';
import { GraphRenderer } from "@components/kit/GraphRenderer/GraphRenderer";

interface GraphSnapshotTakerProps {
  table: {
    id: string | number;
    graph?: { nodes: any[]; links: any[] };
  };
  onSnapshotReady: (imgUrl: string) => void;
}

const GraphSnapshotTaker: FC<GraphSnapshotTakerProps> = ({ table, onSnapshotReady }) => {
  const graphRef = useRef<any>(null);
  const tableId = table.id;

  const graphGenerated = useMemo(() => {
    if (!table?.graph || !table.graph.nodes || table.graph.nodes.length === 0) {
      return null;
    }
    const nodes = table.graph.nodes.map((node) => ({ ...node }));
    const links = table.graph.links.map((link) => ({ ...link }));

    if (table.graph.links.length > 0) {
      nodes.forEach((node: any, i: number) => {
        const angle = (i / nodes.length) * Math.PI;
        node.x = Math.cos(angle) * 100;
        node.y = Math.sin(angle) * 100;
      });
    }

    return { nodes, links };
  }, [table?.graph]);

  if (!graphGenerated) return null;

  return (
    <div
      id={`snapshot-canvas-${tableId}`}
      style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '300px', height: '300px' }}
    >
      <GraphRenderer
        ref={graphRef}
        graphData={graphGenerated}
        isPreview={true}
        width={500}
        height={500}
        scale={1}
        showLinkLabels={false}
        showCompliance={false}
        onEngineStop={() => {
          setTimeout(() => {
            const canvas = document.querySelector(`#snapshot-canvas-${tableId} canvas`) as HTMLCanvasElement | null;
            if (canvas) {
              onSnapshotReady(canvas.toDataURL('image/png'));
            }
          }, 50);
        }}
      />
    </div>
  );
};

export default GraphSnapshotTaker;
