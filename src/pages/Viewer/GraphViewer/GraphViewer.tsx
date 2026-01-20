import React, { FC, useEffect, useState, useMemo, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { selectGraphTutorialDialogStatus } from "@store/slices/table/table.selectors";
import { updateUI } from "@store/slices/table/table.slice";
import { exportTable } from '@store/slices/table/table.thunk';
import { useParams } from 'react-router-dom';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { Divider, Typography, Tooltip, Button, IconButton } from '@mui/material';
import { IconButtonTooltip } from "@components/core";
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RemoveOutlinedIcon from '@mui/icons-material/RemoveOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GraphTutorialDialog from "@pages/Viewer/GraphTutorialDialog/GraphTutorialDialog";
import styled from '@emotion/styled';
import styles from './GraphViewer.module.scss';

const InfoIcon = styled(HelpOutlineRoundedIcon)`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  color: grey;
`;

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

const getNodeColor = (node: any) => {
  if (node.role === 'subject') return '#2ecc71';
  if (node.kind === 'literal') return '#e67e22';
  return '#3498db';
};

const GraphViewer: FC = () => {
  const dispatch = useAppDispatch();
  const { datasetId, tableId } = useParams<{ datasetId: string; tableId: string }>();
  const [w3cData, setW3cData] = useState<any>(null);
  const [showNodes, setShowNodes] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [showSourceTypes, setShowSourceTypes] = useState(false);
  const [showTargetTypes, setShowTargetTypes] = useState(false);
  const [showLinkLabels, setShowLinkLabels] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [selectedLink, setSelectedLink] = useState<any | null>(null);
  const nodeSectionRef = useRef<HTMLDivElement | null>(null);
  const linkSectionRef = useRef<HTMLDivElement | null>(null);
  const graphRef = useRef<ForceGraphMethods | null>(null);
  const openGraphTutorialDialog = useAppSelector(selectGraphTutorialDialogStatus);

  useEffect(() => {
    dispatch(
      exportTable({ format: 'JSON (W3C Compliant)', params: { datasetId, tableId } })
    )
      .unwrap()
      .then(setW3cData);
  }, [datasetId, tableId]);

  useEffect(() => {
    if (selectedNode && nodeSectionRef.current) {
      nodeSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }

    if (selectedLink && linkSectionRef.current) {
      linkSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [selectedNode, selectedLink]);

  const graphData = useMemo(() => {
    if (!w3cData) return { nodes: [], links: [] };

    const schema = w3cData[0];
    const rows = w3cData.slice(1);

    const clean = (str: string) => str?.trim().replace(/^\uFEFF/, '');

    const nodes = Object.values(schema).map((th: any) => {
      const types = th.metadata?.flatMap((m: any) => m.type ?? []) ?? [];
      const typeHighestScore = types.length > 0
        ? types.reduce((highest: any, curr: any) => (curr.score > highest.score ? curr : highest))
        : undefined;
      const values = rows.map((row: any) => {
        const key = th.label;
        const cell = row[key];
        return cell?.label ?? 'N/A';
      });

      return {
        label: clean(th.label),
        kind: th.kind,
        role: th.role,
        metadata: typeHighestScore?.id ?? th.metadata?.[0]?.id ?? undefined,
        types,
        properties: th.metadata?.flatMap((m: any) => m.property ?? []),
        values
      };
    });

    const nodeLabels = new Set(nodes.map((n) => n.label));

    let links = Object.values(schema).flatMap((th: any) => {
      return (th.metadata ?? []).flatMap((m: any) => {
        return (m.property ?? []).map((p: any) => {
          const sourceLabel = clean(th.label);
          const targetLabel = clean(p.obj);

          if (nodeLabels.has(sourceLabel) && nodeLabels.has(targetLabel)) {
            return {
              id: `${sourceLabel}-${targetLabel}`,
              source: sourceLabel,
              target: targetLabel,
              label: p.name,
              propID: p.id,
              curvature: 0
            };
          }
          return null;
        });
      });
    }).filter((l): l is any => l !== null);

    links = links.map((link) => {
      const duplicates = links.filter((l) =>
        (l.source === link.source && l.target === link.target) ||
        (l.source === link.target && l.target === link.source));
      return {
        ...link,
        curvature: duplicates.length > 1 ? 0.2 : 0.1
      };
    });

    const finalLinks = links;

    console.log('nodes', nodes);
    console.log('finalLinks', finalLinks);

    return { nodes, links: finalLinks };
  }, [w3cData]);

  const handleShowLinkLabel = () => {
    setShowLinkLabels((prev) => !prev);
  };

  const nodesLength = graphData.nodes.length;
  const linksLength = graphData.links.length;

  const nodeOutgoingLinks = selectedNode
    ? graphData.links.filter((l: any) => {
      const sourceId =
        typeof l.source === 'object' ? l.source.label : l.source;
      return sourceId === selectedNode.label;
    })
    : [];

  const nodeIncomingLinks = selectedNode
    ? graphData.links.filter((l: any) => {
      const targetId =
        typeof l.target === 'object' ? l.target.label : l.target;
      return targetId === selectedNode.label;
    })
    : [];

  const isNodeIsolated = (node: any) => {
    return !graphData.links.some((l) =>
      (typeof l.source === 'object' ? l.source.label : l.source) === node.label ||
      (typeof l.target === 'object' ? l.target.label : l.target) === node.label);
  };

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
  }, [graphData]);

  const density = nodesLength > 1 ? linksLength / (nodesLength * (nodesLength - 1)) : 0;
  const nodeDegrees = useMemo(() => {
    return graphData.nodes.map((n) => {
      const degree = graphData.links.filter(
        (l) => l.source === n.label || l.target === n.label
      ).length;

      return {
        label: n.label,
        degree
      };
    });
  }, [graphData]);

  const minDegree = useMemo(() => {
    if (!nodeDegrees.length) {
      return { value: 0, nodes: [] };
    }
    const value = Math.min(...nodeDegrees.map((n) => n.degree));
    const nodes = nodeDegrees.filter((n) => n.degree === value);

    return { value, nodes };
  }, [nodeDegrees]);

  const maxDegree = useMemo(() => {
    if (!nodeDegrees.length) {
      return { value: 0, nodes: [] };
    }
    const value = Math.max(...nodeDegrees.map((n) => n.degree));
    const nodes = nodeDegrees.filter((n) => n.degree === value);

    return { value, nodes };
  }, [nodeDegrees]);

  const rolesDistribution = useMemo(() => {
    const counter: Record<string, number> = {};
    const unknownNodes: string[] = [];

    graphData.nodes.forEach((n) => {
      const key = n.role || n.kind || 'unknown';
      counter[key] = (counter[key] || 0) + 1;

      if (key === 'unknown') unknownNodes.push(n.label);
    });

    const orderedRoles = ['subject', 'entity', 'literal', 'unknown'];
    return orderedRoles
      .map((r) => ({
        role: r,
        count: counter[r] || 0,
        unknownNodes: r === 'unknown' ? unknownNodes : []
      }));
  }, [graphData.nodes]);

  const metrics = useMemo(() => [
    {
      name: 'Density',
      value: density.toFixed(4),
      description: 'Measures how connected the graph is relative to the maximum possible. Useful to spot missing relations or sparse datasets.'
    },
    {
      name: 'Average Degree',
      value: (nodesLength > 0 ? (((2 * linksLength) / nodesLength).toFixed(2)) : '0'),
      description: 'Average number of relations per node. Nodes with higher degrees are more central or heavily ' +
        'referenced in the dataset. Helps identify key columns.'
    },
    {
      name: 'Max Degree',
      value: `${maxDegree.value} (${maxDegree.nodes.map((n) => n.label).join(', ')})`,
      description: 'Identifies node with the most connections—“hub” column, like a primary key or a frequently referenced entity.'
    },
    {
      name: 'Min Degree',
      value: `${minDegree.value} (${minDegree.nodes.map((n) => n.label).join(', ')})`,
      description: 'Represents isolated node (column) with the fewest or no connections—potentially unused or stand-alone data.'
    },
    {
      name: 'Roles Distribution',
      value: rolesDistribution,
      description: 'Shows the proportion of different types of nodes. Helps understand the semantic composition' +
        'of the dataset.'
    }
  ], [graphData, nodesLength, linksLength, density, rolesDistribution]);

  if (!nodesLength) {
    return <div className={styles.Empty}>No semantic schema available</div>;
  }

  const handleCloseGraphTutorial = () => {
    dispatch(updateUI({ openGraphTutorialDialog: false }));
  };

  const handleZoomIn = () => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom();
      graphRef.current.zoom(currentZoom * 1.2);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom();
      graphRef.current.zoom(currentZoom * 0.8);
    }
  };

  return (
    <div className={styles.Container}>
      <div className={styles.GraphWrapper}>
        <div className={styles.Zooming}>
          <Tooltip title="Zoom in" placement="left" arrow>
            <IconButton onClick={handleZoomIn}>
              <AddOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom out" placement="left" arrow>
            <IconButton onClick={handleZoomOut}>
              <RemoveOutlinedIcon />
            </IconButton>
          </Tooltip>
        </div>
        <div className={styles.Values}>
          <h4>Column values:</h4>
          {(selectedNode && selectedNode.values.length > 0) ? (
            <div className={styles.ValuesContainer}>
              <table className={styles.ValuesTable}>
                <thead>
                  <tr>
                    <th style={{ backgroundColor: getNodeColor(selectedNode) }}>#</th>
                    <th style={{ backgroundColor: getNodeColor(selectedNode) }}>{selectedNode.label}</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedNode.values.map((v: any, idx: number) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{v || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Select a node to view column values in the table
            </Typography>
          )}
        </div>
        <div className={styles.TopOverlay}>
          <div className={styles.Legend}>
            <h4>Legend</h4>
            <div>
              <Typography className={styles.Subject} />
              Subject
            </div>
            <div>
              <Typography className={styles.Entity} />
              Entity
            </div>
            <div>
              <Typography className={styles.Literal} />
              Literal
            </div>
          </div>
          <div className={styles.LinkLabel}>
            <IconButtonTooltip
              tooltipText="Graph visualization tutorial"
              onClick={() => dispatch(updateUI({ openGraphTutorialDialog: true }))}
              Icon={HelpOutlineRoundedIcon}
            />
            <Button
              onClick={handleShowLinkLabel}
              variant="outlined"
              color="primary"
              size="medium"
              startIcon={showLinkLabels ? <VisibilityOffIcon /> : <VisibilityIcon />}
              sx={{
                textTransform: 'none',
                backgroundColor: '#fff',
                '&:hover': {
                  backgroundColor: '#fff'
                }
              }}
            >
              {showLinkLabels ? "Hide link label" : "Show link label"}
            </Button>
          </div>
        </div>
        <ForceGraph2D
          graphData={graphData}
          ref={graphRef}
          nodeId="label"
          nodeLabel={(node: any) => {
            const typeHighestScore = node.types?.reduce((prev: any, curr: any) => {
              return (curr.score > (prev?.score ?? -Infinity)) ? curr : prev;
            }, null);
            const typeHighestScoreName = typeHighestScore?.name ?? '';
            return `${node.metadata || ''} ${typeHighestScoreName}`.trim();
          }}
          nodeCanvasObjectMode={() => 'replace'}
          nodeCanvasObject={(node: any, ctx) => {
            const RADIUS = 12;
            ctx.fillStyle =
              node.role === 'subject'
                ? '#2ecc71'
                : node.kind === 'literal'
                  ? '#e67e22'
                  : '#3498db';
            ctx.beginPath();
            ctx.arc(node.x, node.y, RADIUS, 0, 2 * Math.PI);
            ctx.fill();
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
              ctx.fillText(line, node.x, startY + i * lineHeight);
            });
          }}
          nodePointerAreaPaint={(node, color, ctx) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, 12, 0, 2 * Math.PI);
            ctx.fill();
          }}
          onNodeClick={(node) => {
            setSelectedNode(node);
            setSelectedLink(null);
          }}
          linkLabel={(link: any) => (showLinkLabels ? `${link.propID}` : `${link.propID} ${link.label}`)}
          linkCurvature={(link) => {
            return link.curvature > 0.1 ? 0.25 : 0;
          }}
          linkDirectionalArrowLength={8}
          linkDirectionalArrowRelPos={0.9}
          linkWidth={1}
          linkColor={() => 'rgba(150,150,150,0.7)'}
          linkCanvasObjectMode={() => 'after'}
          linkCanvasObject={(link: any, ctx) => {
            if (!showLinkLabels) return;

            const source = typeof link.source === 'object' ? link.source : null;
            const target = typeof link.target === 'object' ? link.target : null;
            if (!source || !target) return;

            const sx = source.x;
            const sy = source.y;
            const tx = target.x;
            const ty = target.y;

            // centro del link
            const mx = (sx + tx) / 2 + link.curvature * (ty - sy);
            const my = (sy + ty) / 2 - link.curvature * (tx - sx);

            ctx.save();
            ctx.font = '5px Roboto';
            ctx.fillStyle = '#555';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(link.label, mx, my);
            ctx.restore();
          }}
          onLinkClick={(link) => {
            setSelectedLink(link);
            setSelectedNode(null);
          }}
          linkPointerAreaPaint={(link: any, color, ctx) => {
            const source = typeof link.source === 'object' ? link.source : null;
            const target = typeof link.target === 'object' ? link.target : null;
            if (!source || !target) return;

            ctx.strokeStyle = color;
            ctx.lineWidth = 5;
            ctx.moveTo(source.x, source.y);

            const mx = (source.x + target.x) / 2 + link.curvature * (target.y - source.y);
            const my = (source.y + target.y) / 2 - link.curvature * (target.x - source.x);

            ctx.quadraticCurveTo(mx, my, target.x, target.y);
            ctx.stroke();

            if (showLinkLabels) {
              ctx.fillStyle = color;
              const width = 25;
              const height = 8;
              ctx.fillRect(mx - width / 2, my - height / 2, width, height);
            }
          }}
        />
      </div>
      <div className={styles.Sidebar}>
        <div className={styles.SidebarContent}>
          <h2>Graph Info</h2>
          <div className={styles.Section}>

            <div className={styles.ToggleRow}>
              <Typography>
                <strong>Total Nodes: </strong>
                {nodesLength}
              </Typography>
              <Typography
                className={styles.ToggleIcon}
                onClick={() => setShowNodes(!showNodes)}
              >
                {showNodes
                  ? <Typography component="span" variant="body2" color="text.secondary">Hide list</Typography>
                  : <Typography component="span" variant="body2" color="text.secondary">Show list</Typography>
                }
              </Typography>
            </div>

            {showNodes && (
              <ul className={styles.List}>
                {graphData.nodes.map((n: any, idx: number) => (
                  <li key={idx}>
                    {n.label} ({n.kind || '-'})
                  </li>
                ))}
              </ul>
            )}

            <div className={styles.ToggleRow}>
              <Typography>
                <strong>Total Links: </strong>
                {linksLength}
              </Typography>
              <Typography
                className={styles.ToggleIcon}
                onClick={() => setShowLinks(!showLinks)}
              >
                {showLinks
                  ? <Typography component="span" variant="body2" color="text.secondary">Hide list</Typography>
                  : <Typography component="span" variant="body2" color="text.secondary">Show list</Typography>
                }
              </Typography>
            </div>

            {showLinks && (
              <ul className={styles.List}>
                {graphData.links.map((l: any, idx: number) => {
                  const sourceId = typeof l.source === 'object' ? l.source.label : l.source;
                  const targetId = typeof l.target === 'object' ? l.target.label : l.target;
                  return (
                    <li key={idx}>
                      {sourceId} → {targetId} (<strong>{l.propID}</strong> - {l.label})
                    </li>
                  );
                })}
              </ul>
            )}

            <div className={styles.ToggleRow}>
              <Typography><strong>Graph Metrics</strong></Typography>
              <Typography
                className={styles.ToggleIcon}
                onClick={() => setShowMetrics(!showMetrics)}
              >
                {showMetrics ? '−' : '+'}
              </Typography>
            </div>

            {showMetrics && (
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '8', marginTop: '8px' }}>
                {metrics.map((m) => (
                  <div key={m.name} className={styles.Metrics}>
                    {m.name === 'Roles Distribution' ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}>
                          <Typography>
                            <strong>{m.name}: </strong>
                          </Typography>
                          <Tooltip title="Node labels are displayed only for unknown nodes" placement="top" arrow>
                            <InfoIcon />
                          </Tooltip>
                        </div>
                        <ul className={styles.List}>
                          {m.value.map((r: any) => (
                            <li key={r.role}>
                              {r.role}: {r.count}
                              {r.role === 'unknown' && r.unknownNodes.length > 0 && (
                                <>
                                  {" "}({r.unknownNodes.join(', ')})
                                </>
                              )}
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Typography>
                          <strong>{m.name}: </strong>
                          {m.value}
                        </Typography>
                      </div>
                    )}
                    <Typography variant="caption" color="text.secondary">{m.description}</Typography>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Divider />
          {!selectedNode && !selectedLink && (
            <div className={styles.Section}>
              <Typography variant="body2" color="text.secondary">
                Select a node or link in the graph to view detailed information about it
              </Typography>
            </div>
          )}
          {selectedNode && (
            <>
              <div ref={nodeSectionRef} className={`${styles.Section} ${styles.ScrollTarget}`}>
                <div className={styles.ToggleRow}>
                  <h3>Node: {selectedNode.label}</h3>
                  <Typography
                    className={styles.ToggleIcon}
                    onClick={() => setSelectedNode(null)}
                  >
                    −
                  </Typography>
                </div>
                <Typography>
                  <strong>Kind: </strong>
                  {selectedNode.kind || '-'}
                </Typography>
                <Typography>
                  <strong>Role: </strong>
                  {(nodeIncomingLinks.length > 0 && selectedNode.role !== 'subject') ?
                    (
                      <>
                        object of column(s):{' '}
                        {Array.from(
                          new Set(
                            nodeIncomingLinks.map((l) => (typeof l.source === 'object' ? l.source.label : l.source))
                          )
                        ).join(', ')}
                      </>
                    ) : ((nodeOutgoingLinks.length > 0 && selectedNode.role === 'subject') ?
                        (
                          <>
                            {selectedNode.role} of column(s):{' '}
                            {Array.from(
                              new Set(
                                nodeOutgoingLinks.map((l) => (typeof l.target === 'object' ? l.target.label : l.target))
                              )
                            ).join(', ')}
                          </>
                        ) : '-'
                    )
                  }
                </Typography>
                {selectedNode.types.length > 0 ? (
                  <>
                    <Typography><strong>Types:</strong></Typography>
                    <ul className={styles.List}>
                      {selectedNode.types.map((t: any) => (
                        <li key={t.id}>
                          {t.name} ({t.id})
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography>
                      <strong>Types: </strong>
                      -
                    </Typography>
                  </div>
                )}
              </div>
              <Divider />
              <div className={styles.Section}>
                <h3>Properties</h3>
                <Typography>
                  <strong>Outgoing Links ({nodeOutgoingLinks.length})</strong>
                </Typography>
                {nodeOutgoingLinks.length > 0 ? (
                  <ul className={styles.List}>
                    {nodeOutgoingLinks.map((l: any, idx: number) => {
                      const targetId = typeof l.target === 'object' ? l.target.label : l.target;
                      return (
                        <li key={idx}>
                          → {targetId} (<strong>{l.propID}</strong> - {l.label})
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <Typography color="text.secondary">No outgoing links</Typography>
                )}
                <Typography>
                  <strong>Incoming Links ({nodeIncomingLinks.length})</strong>
                </Typography>
                {nodeIncomingLinks.length > 0 ? (
                  <ul className={styles.List}>
                    {nodeIncomingLinks.map((l: any, idx: number) => {
                      const sourceId = typeof l.source === 'object' ? l.source.label : l.source;
                      return (
                        <li key={idx}>
                          → {sourceId} (<strong>{l.propID}</strong> - {l.label})
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <Typography color="text.secondary">No incoming links</Typography>
                )}
              </div>
            </>
          )}
          {selectedLink && (
            <div ref={linkSectionRef} className={`${styles.Section} ${styles.ScrollTarget}`}>
              <div className={styles.ToggleRow}>
                <h3>Link: {selectedLink.label}</h3>
                <Typography
                  className={styles.ToggleIcon}
                  onClick={() => setSelectedLink(null)}
                >
                  −
                </Typography>
              </div>
              <Typography>
                <strong>Metadata: </strong>
                {selectedLink.propID}
              </Typography>
              <div className={styles.ToggleRow}>
                <Typography>
                  <strong>Source: </strong>
                  {selectedLink.source.label || selectedLink.source}
                </Typography>
                <Typography
                  className={styles.ToggleIcon}
                  onClick={() => setShowSourceTypes(!showSourceTypes)}
                >
                  {showSourceTypes
                    ? <Typography component="span" variant="body2" color="text.secondary">Hide types</Typography>
                    : <Typography component="span" variant="body2" color="text.secondary">Show types</Typography>
                  }
                </Typography>
              </div>
              {showSourceTypes && (
                <ul className={styles.List}>
                  {selectedLink.source.types.map((t: any) => (
                    <li key={t.id}>
                      {t.name} ({t.id})
                    </li>
                  ))}
                </ul>
              )}
              <div className={styles.ToggleRow}>
                <Typography>
                  <strong>Target: </strong>
                  {selectedLink.target.label || selectedLink.target}
                </Typography>
                <Typography
                  className={styles.ToggleIcon}
                  onClick={() => setShowTargetTypes(!showTargetTypes)}
                >
                  {showTargetTypes
                    ? <Typography component="span" variant="body2" color="text.secondary">Hide types</Typography>
                    : <Typography component="span" variant="body2" color="text.secondary">Show types</Typography>
                  }
                </Typography>
              </div>
              {showTargetTypes && (
                <ul className={styles.List}>
                  {selectedLink.target.types.map((t: any) => (
                    <li key={t.id}>
                      {t.name} ({t.id})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
      <GraphTutorialDialog open={openGraphTutorialDialog} onClose={handleCloseGraphTutorial} />
    </div>
  );
};

export default GraphViewer;
