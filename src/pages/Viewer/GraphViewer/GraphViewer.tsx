import React, { FC, useEffect, useState, useMemo, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { useGraphData } from "@hooks/graphData/useGraphData";
import { useGraphPhysics } from "@hooks/graphData/useGraphPhysics";
import { selectGraphTutorialDialogStatus } from "@store/slices/table/table.selectors";
import { updateUI } from "@store/slices/table/table.slice";
import { ForceGraphMethods } from 'react-force-graph-2d';
import { Divider, Typography, Tooltip, Button, IconButton, CircularProgress, Box } from '@mui/material';
import { IconButtonTooltip } from "@components/core";
import { GraphRenderer } from "@components/kit/GraphRenderer/GraphRenderer";
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RemoveOutlinedIcon from '@mui/icons-material/RemoveOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
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

interface GraphViewerProps {
  datasetId?: string;
  tableId?: string;
  isDialog?: boolean;
}

const GraphViewer: FC<GraphViewerProps> = ({ datasetId, tableId, isDialog }) => {
  const dispatch = useAppDispatch();
  const {
    graphData,
    nodesLength,
    linksLength,
    multiPropsMap,
    metrics,
    loading,
    w3cData,
    isNodeIsolated,
    getOutgoingLinks,
    getIncomingLinks
  } = useGraphData(datasetId, tableId);
  const complianceInfo = w3cData[0].compliance;
  const [showNodes, setShowNodes] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [showSourceTypes, setShowSourceTypes] = useState(false);
  const [showTargetTypes, setShowTargetTypes] = useState(false);
  const [showCompliance, setShowCompliance] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [selectedLink, setSelectedLink] = useState<any | null>(null);
  const nodeSectionRef = useRef<HTMLDivElement | null>(null);
  const linkSectionRef = useRef<HTMLDivElement | null>(null);
  const graphRef = useRef<ForceGraphMethods | null>(null);
  const openGraphTutorialDialog = useAppSelector(selectGraphTutorialDialogStatus);
  const isExportOpen = useAppSelector((state) => state.table.ui.openExportDialog);
  const showLinkLabels = useAppSelector((state) => state.table.ui.showLinkLabels);

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

  const nodeOutgoingLinks = useMemo(() => {
    return selectedNode ? getOutgoingLinks(selectedNode.label) : [];
  }, [selectedNode, getOutgoingLinks]);

  const nodeIncomingLinks = useMemo(() => {
    return selectedNode ? getIncomingLinks(selectedNode.label) : [];
  }, [selectedNode, getIncomingLinks]);

  useEffect(() => {
    if (isExportOpen) {
      const timer = setTimeout(() => {
        let graphSnapshot = '';
        const canvas = document.querySelector(`.${styles.GraphWrapper} canvas`) as HTMLCanvasElement | null;
        if (canvas) {
          graphSnapshot = canvas.toDataURL('image/png');
        }

        const cleanGraphData = {
          nodes: graphData.nodes.map((n) => ({
            label: n.label,
            kind: n.kind,
            datatype: n.datatype,
            role: n.role,
            types: n.types,
          })),
          links: graphData.links.map((l) => ({
            id: l.id,
            source: typeof l.source === 'object' ? (l.source as any).label : l.source,
            target: typeof l.target === 'object' ? (l.target as any).label : l.target,
            label: l.label,
            propID: l.propID,
          })),
        };

        dispatch(
          updateUI({
            currentGraphSnapshot: graphSnapshot,
            currentGraphData: cleanGraphData,
            currentMetrics: metrics,
          })
        );
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isExportOpen, showLinkLabels, graphData, metrics, dispatch]);

  const handleShowLinkLabel = () => {
    dispatch(updateUI({ showLinkLabels: !showLinkLabels }));
  };

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

  const hasTypes = (node: any) => {
    return node && Array.isArray(node.types) && node.types.length > 0;
  };

  useGraphPhysics(graphRef, graphData, isNodeIsolated);

  if (loading) return <CircularProgress size={40} />;
  if (graphData.nodes.length === 0) {
    return <div className={styles.Empty}>No semantic schema available</div>;
  }

  return (
    <div className={`${styles.Container} ${isDialog ? styles.DialogContainer : ''}`}>
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
            <h4>{showCompliance ? "Compliance Legend" : "Legend"}</h4>
            {showCompliance ? (
              <>
                <div>
                  <Typography className={styles.PersonalData} />
                  Personal Data
                </div>
                <div>
                  <Typography className={styles.QuasiIdentifier} />
                  Quasi Identifier
                </div>
                <div>
                  <Typography className={styles.NonPersonalData} />
                  Non-Personal Data
                </div>
                <div>
                  <Typography className={styles.AnonymousData} />
                  Anonymous Data
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
          <div className={styles.LinkLabel}>
            <IconButtonTooltip
              aria-label="open-graph-tutorial"
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
              {showLinkLabels ? "Hide link labels" : "Show link labels"}
            </Button>
            <Button
              onClick={() => setShowCompliance(!showCompliance)}
              variant="outlined"
              color="primary"
              startIcon={<AssignmentTurnedInOutlinedIcon />}
              sx={{
                marginLeft: 1,
                textTransform: 'none',
                backgroundColor: '#fff',
                '&:hover': {
                  backgroundColor: '#fff'
                }
              }}
            >
              {showCompliance ? "Hide Compliance" : "Show Compliance"}
            </Button>
          </div>
        </div>
        <GraphRenderer
          graphData={graphData}
          multiPropsMap={multiPropsMap}
          showLinkLabels={showLinkLabels}
          showCompliance={showCompliance}
          ref={graphRef}
          onNodeClick={(node: any) => {
            setSelectedNode(node);
            setSelectedLink(null);
          }}
          onLinkClick={(link: any) => {
            setSelectedLink(link);
            setSelectedNode(null);
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
                onClick={() => nodesLength > 0 && setShowNodes(!showNodes)}
              >
                {nodesLength > 0
                  ? showNodes
                    ? <Typography component="span" variant="body2" color="text.secondary">Hide list</Typography>
                    : <Typography component="span" variant="body2" color="text.secondary">Show list</Typography>
                  : <Typography component="span" variant="body2" color="text.secondary">Empty</Typography>
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
                onClick={() => linksLength > 0 && setShowLinks(!showLinks)}
              >
                {linksLength > 0
                  ? showLinks
                    ? <Typography component="span" variant="body2" color="text.secondary">Hide list</Typography>
                    : <Typography component="span" variant="body2" color="text.secondary">Show list</Typography>
                  : <Typography component="span" variant="body2" color="text.secondary">Empty</Typography>
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
                      {sourceId} → {targetId}
                      <div style={{ paddingLeft: '16px', marginTop: '6px', marginBottom: '6px' }}>
                        {(multiPropsMap[`${sourceId}->${targetId}`] || [{
                          propID: l.propID,
                          label: l.label
                        }]).map((p: any, pIdx: number) => (
                          <li key={pIdx}>
                            <strong>{p.propID}</strong> - {p.label}
                          </li>
                        ))}
                      </div>
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
              <div className={styles.MetricsContainer}>
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
          {showCompliance && (
            <>
              <div className={styles.Section}>
                <h3>Compliance Summary</h3>
                <Typography>
                  <strong>Result: </strong> {complianceInfo?.status === "yesGDPR" ? "GDPR compliant" : "GDPR Non-compliant"}
                </Typography>
                <Typography>
                  <strong>Confidence score: </strong> {Math.round((complianceInfo?.score ?? 0) * 100)}%
                </Typography>
                <Typography>
                  <strong>Reasoning: </strong> {complianceInfo?.reasoning}
                </Typography>
                <br />
                <Typography variant="body2">
                  <i>
                    Check directly in the{" "}
                    <Box
                      component="span"
                      onClick={() => {
                        dispatch(updateUI({ openMetadataColumnDialog: false }));
                        dispatch(updateUI({ initialComplianceType: "GDPR" }));
                        dispatch(updateUI({ openComplianceStatusDialog: true }));
                      }}
                      sx={{
                        fontStyle: "italic",
                        textDecoration: "underline",
                        cursor: "pointer",
                        "&:hover": {
                          opacity: 0.8,
                        },
                      }}
                    >
                      GDPR Compliance Report
                    </Box>
                    .
                  </i>
                </Typography>
              </div>
              <Divider />
            </>
          )}
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
                {showCompliance && (
                  <div className={styles.Section}>
                    <Typography variant="body2" style={{ marginBottom: "8px" }}>
                      <i>
                        The column contains {selectedNode.compliance_classification} and
                        is {selectedNode.compliance_action === "noChange" ? "GDPR compliant" : "GDPR NON-complaint"} with
                        a confidence score of {Math.round((selectedNode.compliance_score ?? 0) * 100)}%.
                      </i>
                    </Typography>
                  </div>
                )}
                <Typography>
                  <strong>Kind: </strong>
                  {selectedNode.kind || '-'}
                </Typography>
                <Typography>
                  <strong>{selectedNode.kind === "literal" ? "Datatype: " : "Semantic Class: "}</strong>
                  {selectedNode.datatype || '-'}
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
          {selectedLink && (() => {
            const sId = typeof selectedLink.source === 'object' ? selectedLink.source.label : selectedLink.source;
            const tId = typeof selectedLink.target === 'object' ? selectedLink.target.label : selectedLink.target;

            const allProps = multiPropsMap[`${sId}->${tId}`] || [
              {
                propID: selectedLink.propID,
                label: selectedLink.label
              }
            ];

            return (
              <div ref={linkSectionRef} className={`${styles.Section} ${styles.ScrollTarget}`}>
                <div className={styles.ToggleRow}>
                  <h3>
                    {allProps.length === 1 ? `Link: ${selectedLink.label}` : `Group of Links (${allProps.length})`}
                  </h3>
                  <Typography
                    className={styles.ToggleIcon}
                    onClick={() => setSelectedLink(null)}
                  >
                    −
                  </Typography>
                </div>
                <div className={styles.ToggleRow}>
                  <Typography>
                    <strong>Source: </strong>
                    {selectedLink.source.label || selectedLink.source}
                  </Typography>
                  {hasTypes(selectedLink.source) && (
                    <Typography
                      className={styles.ToggleIcon}
                      onClick={() => setShowSourceTypes(!showSourceTypes)}
                    >
                      {showSourceTypes
                        ? <Typography component="span" variant="body2" color="text.secondary">Hide types</Typography>
                        : <Typography component="span" variant="body2" color="text.secondary">Show types</Typography>
                      }
                    </Typography>
                  )}
                </div>
                {showSourceTypes && hasTypes(selectedLink.source) && (
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
                  {hasTypes(selectedLink.target) && (
                    <Typography
                      className={styles.ToggleIcon}
                      onClick={() => setShowTargetTypes(!showTargetTypes)}
                    >
                      {showTargetTypes
                        ? <Typography component="span" variant="body2" color="text.secondary">Hide types</Typography>
                        : <Typography component="span" variant="body2" color="text.secondary">Show types</Typography>
                      }
                    </Typography>
                  )}
                </div>
                {showTargetTypes && hasTypes(selectedLink.target) && (
                  <ul className={styles.List}>
                    {selectedLink.target.types.map((t: any) => (
                      <li key={t.id}>
                        {t.name} ({t.id})
                      </li>
                    ))}
                  </ul>
                )}
                {allProps.length === 1 ? (
                  <div>
                    <Typography>
                      <strong>Metadata ID: </strong>{allProps[0].propID}
                    </Typography>
                  </div>
                ) : (
                  <div>
                    <Typography>
                      <strong>Metadata:</strong>
                    </Typography>
                    <ul className={styles.List}>
                      {allProps.map((p: any, idx: number) => (
                        <li key={idx}>
                          <Typography>
                            <strong>{p.propID}</strong> - {p.label}
                          </Typography>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
      <GraphTutorialDialog open={openGraphTutorialDialog} onClose={handleCloseGraphTutorial} />
    </div>
  );
};

export default GraphViewer;
