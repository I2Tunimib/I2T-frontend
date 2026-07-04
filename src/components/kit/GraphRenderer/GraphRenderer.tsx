import ForceGraph2D from 'react-force-graph-2d';
import { forwardRef } from 'react';

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const tokens = text.match(/[^_\-\s]+[-_]?/g) ?? [];
  const lines: string[] = [];

  let currentLine = tokens[0] || '';

  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i];
    const testLine = currentLine + token;

    if (ctx.measureText(testLine).width <= maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = token;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

export const GraphRenderer = forwardRef<any, any>(({
  graphData,
  multiPropsMap = {},
  showLinkLabels,
  showCompliance,
  onNodeClick,
  onLinkClick,
  isPreview = false,
  scale = 1,
  ...props
}, ref) => {
  const getNodeColor = (node: any) => {
    if (showCompliance) {
      switch (node.compliance_classification) {
        case "personalData": return "crimson";
        case "quasiIdentifiers": return "orange";
        case "nonPersonalData": return "teal";
        case "anonymousData": return "green";
        default: return "#999";
      }
    }
    if (node.role === 'subject') return '#2ecc71';
    if (node.kind === 'literal') return '#e67e22';
    return '#3498db';
  };

  return (
    <ForceGraph2D
      graphData={graphData}
      ref={ref}
      nodeId="label"
      preserveDrawingBuffer={true}
      cooldownTicks={isPreview ? 20 : 200}
      nodeLabel={(node: any) => {
        const typeHighestScore = node.types?.reduce((prev: any, curr: any) => {
          return (curr.score > (prev?.score ?? -Infinity)) ? curr : prev;
        }, null);
        const typeHighestScoreName = typeHighestScore?.name ?? '';
        return `${node.metadata || ''} ${typeHighestScoreName}`.trim();
      }}
      nodeColor={getNodeColor}
      nodeCanvasObjectMode={() => 'replace'}
      nodeCanvasObject={(node: any, ctx) => {
        const RADIUS = isPreview ? 6 * scale : 12;
        ctx.fillStyle = getNodeColor(node);
        ctx.beginPath();
        ctx.arc(node.x, node.y, RADIUS, 0, 2 * Math.PI);
        ctx.fill();
        if (!isPreview) {
          const baseFontSize = 4;
          const fontSize = Math.min(baseFontSize, RADIUS * 0.75);
          ctx.font = `${fontSize}px Roboto`;
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const maxTextWidth = (RADIUS - 4) * 1.8;
          const lines = wrapText(ctx, node.label, maxTextWidth);
          const lineHeight = fontSize * 1.1;
          const totalHeight = lineHeight * lines.length;
          const startY = node.y - totalHeight / 2 + lineHeight / 2;

          lines.forEach((line, i) => {
            ctx.fillText(line, node.x, node.y + (i - (lines.length - 1) / 2) * (fontSize * 1.1));
          });
        }
      }}
      nodePointerAreaPaint={(node, color, ctx) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 12, 0, 2 * Math.PI);
        ctx.fill();
      }}
      onNodeClick={onNodeClick}
      linkLabel={(link: any) => {
        const sId = typeof link.source === 'object' ? link.source.label : link.source;
        const tId = typeof link.target === 'object' ? link.target.label : link.target;
        const allPropsList = multiPropsMap[`${sId}->${tId}`] || [];

        if (allPropsList.length > 1) {
          return allPropsList
            .map((p) => `${p.propID} ${p.label}`)
            .join('<br/>');
        }
        return (showLinkLabels ? `${link.propID}` : `${link.propID} ${link.label}`);
      }}
      linkCurvature={(link) => {
        return link.curvature > 0.1 ? 0.25 : 0;
      }}
      linkDirectionalArrowLength={8}
      linkDirectionalArrowRelPos={0.9}
      linkWidth={1}
      linkColor={() => 'rgba(150,150,150,0.7)'}
      linkCanvasObjectMode={() => 'after'}
      linkCanvasObject={(link: any, ctx) => {
        if (isPreview || !showLinkLabels) return;

        const source = typeof link.source === 'object' ? link.source : null;
        const target = typeof link.target === 'object' ? link.target : null;
        if (!source?.label || !target?.label) return;

        const sId = source.label;
        const tId = target.label;

        const allPropsList = multiPropsMap[`${sId}->${tId}`] || [];
        if (allPropsList.length > 1 && allPropsList[0].propID !== link.propID) {
          return;
        }

        const sx = source.x;
        const sy = source.y;
        const tx = target.x;
        const ty = target.y;

        const mx = (sx + tx) / 2 + link.curvature * (ty - sy);
        const my = (sy + ty) / 2 - link.curvature * (tx - sx);

        ctx.save();
        ctx.font = '5px Roboto';
        ctx.fillStyle = '#555';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const badgeCount = allPropsList.length > 1 ? ` (+${allPropsList.length - 1})` : '';
        const displayText = `${allPropsList[0]?.label || link.label}${badgeCount}`;

        ctx.fillText(displayText, mx, my);
        ctx.restore();
      }}
      onLinkClick={onLinkClick}
      {...props}
    />
  );
});

export default GraphRenderer;
