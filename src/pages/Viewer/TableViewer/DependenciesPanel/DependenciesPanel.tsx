import {
  Drawer,
  IconButton,
  Typography,
  Divider,
  Box,
  Stack,
  Chip,
  Tooltip,
  Tab,
  Tabs,
  Collapse,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import ListAltRoundedIcon from "@mui/icons-material/ListAltRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { useAppSelector, useAppDispatch } from "@hooks/store";
import { selectDependencies } from "@store/slices/table/table.selectors";
import {
  DependencyGraph,
  DependencyNode,
  DependencyOperation,
} from "@store/slices/table/interfaces/table";
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  MouseEvent as ReactMouseEvent,
} from "react";
import ForceGraph2D, { ForceGraphMethods } from "react-force-graph-2d";
import { hierarchy, tree as d3tree } from "d3-hierarchy";
import { deleteOperationAndRedo } from "@store/slices/table/table.thunk";
import tableAPI from "@services/api/table";
import styles from "./DependenciesPanel.module.scss";

interface DependenciesPanelProps {
  open: boolean;
  onClose: () => void;
  readonly?: boolean;
}

const DRAWER_DEFAULT_WIDTH_VW = 50;
const DRAWER_DEFAULT_WIDTH_LIST_VW = 35;
const DRAWER_MIN_WIDTH = 280;
const DRAWER_MAX_WIDTH_VW = 90;
const NODE_R = 16;
const LINK_COLOR = "rgba(100,160,240,0.9)";
const SUPPORT_LINK_COLOR = "rgba(180,120,240,0.85)";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function buildOpMap(
  operations: DependencyOperation[],
): Record<string, DependencyOperation> {
  const map: Record<string, DependencyOperation> = {};
  for (const op of operations ?? []) {
    if (op?.id && op.id !== "undefined") map[op.id] = op;
  }
  return map;
}

const OP_COLORS: Record<string, string> = {
  RECONCILIATION: "#2ecc71",
  EXTENSION: "#3498db",
  MODIFICATION: "#e67e22",
  PROPAGATE_TYPE: "#1abc9c",
};

const OP_ABBREV: Record<string, string> = {
  RECONCILIATION: "REC",
  EXTENSION: "EXT",
  MODIFICATION: "MOD",
  PROPAGATE_TYPE: "PRT",
};

function darkenColor(hex: string, amount = 0.45): string {
  // Expand 3-digit shorthand (#abc -> #aabbcc)
  const expanded = hex.replace(
    /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i,
    (_, r, g, b) => `#${r}${r}${g}${g}${b}${b}`,
  );
  const n = parseInt(expanded.slice(1), 16);
  const r = Math.max(0, Math.round(((n >> 16) & 0xff) * (1 - amount)));
  const g = Math.max(0, Math.round(((n >> 8) & 0xff) * (1 - amount)));
  const b = Math.max(0, Math.round((n & 0xff) * (1 - amount)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function opColor(op: DependencyOperation | undefined): string {
  if (!op) return "#1976d2";
  return OP_COLORS[op.operationType] ?? "#888";
}

function opAbbrev(op: DependencyOperation | undefined): string {
  if (!op) return "ROOT";
  return OP_ABBREV[op.operationType] ?? op.operationType.slice(0, 3);
}

function getServiceName(op: DependencyOperation | undefined): string {
  if (!op) return "";
  return op.reconciler ?? op.extender ?? op.modifier ?? op.service ?? "";
}

function opLabel(op: DependencyOperation | undefined): string {
  if (!op) return "root";
  const svc = getServiceName(op);
  const parts = [
    op.operationType,
    svc ? `Service: ${svc}` : null,
    op.columnName ? `Column: ${op.columnName}` : null,
    op.opNumber != null ? `#${op.opNumber}` : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

// ---------------------------------------------------------------------------
// Tree view
// ---------------------------------------------------------------------------

const TreeView = ({
  deps,
  visible,
  onNodeDeleteRequest,
}: {
  deps: DependencyGraph;
  visible: boolean;
  onNodeDeleteRequest?: (nodeId: string) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<ForceGraphMethods | undefined>(undefined);
  const [dims, setDims] = useState({ w: window.innerWidth * 0.5, h: 480 });

  useEffect(() => {
    if (!visible) return;
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) setDims({ w: r.width, h: r.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [visible]);

  const opMap = useMemo(() => buildOpMap(deps.operations), [deps.operations]);

  const graphData = useMemo(() => {
    const nodeMap = deps.nodes ?? {};
    const allIds = Object.keys(nodeMap);
    const links: { source: string; target: string; support?: boolean }[] = [];

    // Build a children-map for primary (non-support) links only – used for
    // the tree layout so arrows always flow parent → child without crossing.
    const primaryChildren: Record<string, string[]> = {};
    const hasParent = new Set<string>();
    allIds.forEach((id) => {
      primaryChildren[id] = [];
    });
    allIds.forEach((id) => {
      (nodeMap[id].children ?? []).forEach((child) => {
        if (child !== id && nodeMap[child]) {
          primaryChildren[id].push(child);
          hasParent.add(child);
        }
      });
      (nodeMap[id].supportChildren ?? []).forEach((child) => {
        if (child !== id && nodeMap[child]) {
          links.push({ source: id, target: child, support: true });
        }
      });
    });
    allIds.forEach((id) => {
      (nodeMap[id].children ?? []).forEach((child) => {
        if (child !== id && nodeMap[child]) {
          links.push({ source: id, target: child, support: false });
        }
      });
    });

    // ---------------------------------------------------------------
    // Compute a deterministic tree layout using d3-hierarchy so that
    // children always stay on the same side as their parent, preventing
    // arrow crossings caused by the force simulation re-ordering nodes.
    // ---------------------------------------------------------------
    const roots = allIds.filter((id) => !hasParent.has(id));
    const rootId = roots.includes("root") ? "root" : (roots[0] ?? allIds[0]);

    // DAG → tree: each node is visited once (first parent wins for layout).
    const visited = new Set<string>();
    const buildTree = (id: string): { id: string; children: any[] } => {
      if (visited.has(id)) return { id, children: [] };
      visited.add(id);
      return {
        id,
        children: (primaryChildren[id] ?? []).map(buildTree),
      };
    };

    const LEVEL_DIST = 180;
    const NODE_SPACING = NODE_R * 5;
    const treeLayout = d3tree<{ id: string; children: any[] }>().nodeSize([
      NODE_SPACING * 2,
      LEVEL_DIST,
    ]);
    const root = hierarchy(buildTree(rootId), (d) =>
      d.children.length > 0 ? d.children : null,
    );
    treeLayout(root);

    // Build a position map so every node gets fixed (fx/fy) coordinates.
    const posMap: Record<string, { fx: number; fy: number }> = {};
    root.each((n: any) => {
      posMap[n.data.id] = { fx: n.x, fy: n.depth * LEVEL_DIST };
    });
    // Any nodes not reached by the primary tree (isolated or DAG extras)
    // are placed below the tree in a row.
    const unvisited = allIds.filter((id) => !posMap[id]);
    unvisited.forEach((id, i) => {
      posMap[id] = {
        fx: (i - unvisited.length / 2) * NODE_SPACING * 2,
        fy: (root.height + 1) * LEVEL_DIST,
      };
    });

    // Filter out the special "root" node from the displayed graph so it
    // doesn't appear as an interactive node; it is still used for layout
    // purposes above if present in the data.
    const nodes = allIds
      .filter((id) => id !== "root")
      .map((id) => ({ id, ...posMap[id] }));

    const filteredLinks = links.filter((l) => {
      const src = typeof l.source === "object" ? l.source.id : l.source;
      const tgt = typeof l.target === "object" ? l.target.id : l.target;
      return src !== "root" && tgt !== "root";
    });

    return { nodes, links: filteredLinks };
  }, [deps.nodes]);

  // All nodes have fixed positions (fx/fy) so the force simulation only
  // needs to run for the zoom-to-fit callback – no need to reheat.
  useEffect(() => {
    const fg = graphRef.current;
    if (!fg) return;
    // Disable forces that would try to move fixed nodes.
    fg.d3Force("charge", null);
    fg.d3Force("link", null);
    fg.d3Force("center", null);
  }, [graphData]);

  const handleEngineStop = useCallback(() => {
    graphRef.current?.zoomToFit(400, 40);
  }, []);

  // Track which node the user is hovering over so we can show support links
  // only when the hovered node is one of their endpoints.
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Adjacency list (primary + support links, parent → children) for descendant traversal.
  const primaryAdjacency = useMemo(() => {
    const adj: Record<string, string[]> = {};
    graphData.nodes.forEach((n: any) => {
      adj[n.id] = [];
    });
    graphData.links.forEach((l: any) => {
      const src = typeof l.source === "object" ? l.source.id : l.source;
      const tgt = typeof l.target === "object" ? l.target.id : l.target;
      if (adj[src]) adj[src].push(tgt);
    });
    return adj;
  }, [graphData]);

  // When a node is hovered, compute the full set of that node + all descendants
  // so non-members can be dimmed.
  const highlightedNodes = useMemo<Set<string> | null>(() => {
    if (!hoveredNodeId) return null;
    const set = new Set<string>();
    const queue = [hoveredNodeId];
    while (queue.length > 0) {
      const id = queue.shift()!;
      if (!set.has(id)) {
        set.add(id);
        (primaryAdjacency[id] ?? []).forEach((child) => queue.push(child));
      }
    }
    return set;
  }, [hoveredNodeId, primaryAdjacency]);

  const isSupportLinkVisible = useCallback(
    (link: any) => {
      if (!link.support) return true;
      if (!hoveredNodeId) return false;
      const srcId =
        typeof link.source === "object" ? link.source.id : link.source;
      const tgtId =
        typeof link.target === "object" ? link.target.id : link.target;
      return srcId === hoveredNodeId || tgtId === hoveredNodeId;
    },
    [hoveredNodeId],
  );

  // Re-center whenever the canvas dimensions settle (e.g. after the drawer
  // open/close animation finishes and ResizeObserver fires with final size).
  useEffect(() => {
    if (!visible) return;
    const id = setTimeout(() => {
      graphRef.current?.zoomToFit(300, 40);
    }, 50);
    return () => clearTimeout(id);
  }, [dims, visible]);

  const paintNode = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const isRoot = node.id === "root";
      const op = opMap[node.id];
      const fill = isRoot ? "#1976d2" : opColor(op);
      const abbrev = isRoot
        ? "ROOT"
        : op?.opNumber != null
          ? `#${op.opNumber}`
          : "";
      const service = isRoot ? "" : getServiceName(op);
      const col = op?.columnName ?? "";
      const r = NODE_R;

      // Dim nodes that are not part of the highlighted subtree.
      const dimmed =
        highlightedNodes !== null && !highlightedNodes.has(node.id);
      ctx.save();
      ctx.globalAlpha = dimmed ? 0.15 : 1;

      // Circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
      ctx.fillStyle = fill;
      ctx.fill();
      // Extra ring on the hovered node itself
      if (node.id === hoveredNodeId) {
        ctx.strokeStyle = darkenColor(fill);
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = fill;
        ctx.lineWidth = 1.5;
      }
      ctx.stroke();

      // Abbreviation inside
      ctx.font = "bold 5px Roboto";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(abbrev, node.x, node.y);

      // Labels below
      const labelSize = Math.max(3.5, 11 / globalScale);
      ctx.textBaseline = "top";
      let lineY = node.y + r + 3;

      if (service) {
        ctx.fillStyle = fill;
        ctx.font = `bold ${labelSize}px sans-serif`;
        ctx.fillText(service, node.x, lineY);
        lineY += labelSize + 1.5;
      }

      if (col) {
        ctx.fillStyle = "#555";
        ctx.font = `${labelSize}px sans-serif`;
        ctx.fillText(col, node.x, lineY);
      }

      ctx.restore();
    },
    [opMap, highlightedNodes, hoveredNodeId],
  );

  if (!deps.nodes || Object.keys(deps.nodes).length === 0) {
    return (
      <Box p={2}>
        <Typography variant="body2" color="text.secondary">
          No dependency nodes to display.
        </Typography>
      </Box>
    );
  }

  return (
    <Box ref={containerRef} className={styles.TreeContainer}>
      <ForceGraph2D
        ref={graphRef}
        width={dims.w}
        height={dims.h}
        graphData={graphData}
        warmupTicks={0}
        cooldownTicks={0}
        onEngineStop={handleEngineStop}
        nodeId="id"
        nodeLabel={(n: any) => {
          if (n.id === "root") return "root";
          const op = opMap[n.id];
          const label = opLabel(op);
          return label;
        }}
        nodeCanvasObjectMode={() => "replace"}
        nodeCanvasObject={paintNode}
        nodePointerAreaPaint={(node: any, color, ctx) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, NODE_R, 0, 2 * Math.PI);
          ctx.fill();
        }}
        enableNodeDrag={false}
        onNodeClick={(node: any) => {
          if (node.id === "root") return;
          onNodeDeleteRequest?.(node.id);
        }}
        onNodeHover={(node: any) => setHoveredNodeId(node ? node.id : null)}
        linkColor={(link: any) => {
          if (!isSupportLinkVisible(link)) return "transparent";
          // Support links are drawn as dashed lines by linkCanvasObject;
          // keep the default renderer invisible to avoid a solid underline.
          if (link.support) return "transparent";
          if (highlightedNodes !== null) {
            const src =
              typeof link.source === "object" ? link.source.id : link.source;
            const tgt =
              typeof link.target === "object" ? link.target.id : link.target;
            if (!highlightedNodes.has(src) || !highlightedNodes.has(tgt)) {
              return "rgba(180,180,180,0.1)";
            }
          }
          return LINK_COLOR;
        }}
        linkWidth={(link: any) => (link.support ? 1 : 1.5)}
        linkDirectionalArrowLength={(link: any) =>
          isSupportLinkVisible(link) ? 6 : 0
        }
        linkDirectionalArrowRelPos={0.9}
        linkDirectionalArrowColor={(link: any) => {
          if (!isSupportLinkVisible(link)) return "transparent";
          return link.support ? SUPPORT_LINK_COLOR : LINK_COLOR;
        }}
        linkCanvasObjectMode={(link: any) =>
          link.support ? "after" : undefined
        }
        linkCanvasObject={(link: any, ctx: CanvasRenderingContext2D) => {
          if (!isSupportLinkVisible(link)) return;
          const start = link.source;
          const end = link.target;
          if (!start || !end || start.x == null || end.x == null) return;
          ctx.save();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = SUPPORT_LINK_COLOR;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
          ctx.restore();
        }}
        backgroundColor="#fafafa"
        maxZoom={2}
      />
    </Box>
  );
};

// ---------------------------------------------------------------------------
// List view
// ---------------------------------------------------------------------------

const OP_TYPE_LABEL: Record<string, string> = {
  RECONCILIATION: "Reconciliation",
  EXTENSION: "Extension",
  MODIFICATION: "Modification",
  PROPAGATE_TYPE: "Propagate Annotation",
};

// Mirrors OP_COLORS used in the graph canvas exactly
const OP_CHIP_HEX: Record<string, string> = {
  RECONCILIATION: "#2ecc71",
  EXTENSION: "#3498db",
  MODIFICATION: "#e67e22",
  PROPAGATE_TYPE: "#1abc9c",
};

function opChipSx(
  operationType: string | undefined,
  variant: "filled" | "outlined" = "filled",
) {
  const hex = OP_CHIP_HEX[operationType ?? ""];
  if (!hex) return {};
  if (variant === "outlined") {
    return { borderColor: hex, color: hex };
  }
  return { backgroundColor: hex, color: "#fff" };
}

const NodeCard = ({
  node,
  nodeId,
  op,
  opMap,
  onDelete,
  isDeleting,
}: {
  node: DependencyNode;
  nodeId: string;
  op: DependencyOperation | undefined;
  opMap: Record<string, DependencyOperation>;
  onDelete?: () => void;
  isDeleting?: boolean;
}) => {
  const isRoot = nodeId === "root";
  const [expanded, setExpanded] = useState(false);

  const hasDetails =
    (node.children && node.children.length > 0) ||
    (node.parents && node.parents.length > 0);
  const isLeaf =
    (node.children?.length ?? 0) === 0 &&
    (node.supportChildren?.length ?? 0) === 0;
  const isLeafMod = false;

  return (
    <Box className={styles.NodeCard}>
      {/* ── Header row (always visible) ── */}
      <Stack direction="row" alignItems="center" gap={0.75}>
        {/* Left: type chip + service + column – allowed to wrap */}
        <Stack
          direction="row"
          alignItems="center"
          gap={0.75}
          flexWrap="wrap"
          flex={1}
          minWidth={0}
        >
          {isRoot ? (
            <Chip label="ROOT" size="small" color="black" />
          ) : op ? (
            <>
              <Chip
                label={OP_TYPE_LABEL[op.operationType] ?? op.operationType}
                size="small"
                sx={opChipSx(op.operationType)}
              />
              {op.service || op.reconciler || op.extender || op.modifier ? (
                <Typography variant="caption" fontWeight={700}>
                  {getServiceName(op)}
                </Typography>
              ) : null}
              {op.columnName && (
                <Typography variant="caption" color="text.secondary">
                  {"on "}
                  <strong>{op.columnName}</strong>
                </Typography>
              )}
            </>
          ) : (
            <Typography variant="caption" className={styles.NodeId}>
              {nodeId}
            </Typography>
          )}
        </Stack>

        {/* Right: op number + expand toggle */}
        <Stack direction="row" alignItems="center" gap={0.25} flexShrink={0}>
          {!isRoot && op?.opNumber != null && (
            <Typography variant="caption" color="text.secondary">
              {`#${op.opNumber}`}
            </Typography>
          )}
          {hasDetails && (
            <IconButton
              size="small"
              onClick={() => setExpanded((v) => !v)}
              sx={{ p: 0.25 }}
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? (
                <ExpandLessRoundedIcon fontSize="small" />
              ) : (
                <ExpandMoreRoundedIcon fontSize="small" />
              )}
            </IconButton>
          )}
          {!isRoot && onDelete && (
            <Tooltip
              title={
                isLeafMod
                  ? "Modification leaf operations cannot be removed"
                  : "Remove operation"
              }
            >
              <span>
                <IconButton
                  size="small"
                  onClick={isLeafMod || isDeleting ? undefined : onDelete}
                  disabled={isLeafMod || isDeleting}
                  sx={{ p: 0.25, color: "error.main" }}
                  aria-label="Remove operation"
                >
                  {isDeleting ? (
                    <CircularProgress size={13} color="inherit" />
                  ) : (
                    <DeleteRoundedIcon sx={{ fontSize: 15 }} />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Stack>
      </Stack>

      {/* ── Expandable detail section ── */}
      <Collapse in={expanded} unmountOnExit>
        {node.children && node.children.length > 0 && (
          <Box mt={0.75}>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Children
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.5} mt={0.25}>
              {node.children.map((childId: string) => {
                const childOp = opMap[childId];
                const chipLabel = childOp
                  ? `${OP_ABBREV[childOp.operationType] ?? childOp.operationType}${getServiceName(childOp) ? ` · ${getServiceName(childOp)}` : ""}`
                  : childId;
                if (chipLabel !== null) {
                  return (
                    <Tooltip key={childId} title={opLabel(childOp) || childId}>
                      <Chip
                        label={chipLabel}
                        size="small"
                        variant="outlined"
                        sx={opChipSx(childOp?.operationType, "outlined")}
                      />
                    </Tooltip>
                  );
                }
              })}
            </Stack>
          </Box>
        )}

        {node.parents && node.parents.length > 0 && (
          <Box mt={0.75}>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Parents
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.5} mt={0.25}>
              {node.parents.map((parentId: string) => {
                const parentOp = opMap[parentId];
                const chipLabel =
                  parentId === "root"
                    ? "ROOT"
                    : parentOp
                      ? `${OP_ABBREV[parentOp.operationType] ?? parentOp.operationType}${getServiceName(parentOp) ? ` · ${getServiceName(parentOp)}` : ""}`
                      : parentId;
                return (
                  <Tooltip
                    key={parentId}
                    title={parentId === "root" ? "root" : opLabel(parentOp)}
                  >
                    <Chip
                      label={chipLabel}
                      size="small"
                      variant="outlined"
                      color={parentId === "root" ? "primary" : undefined}
                      sx={
                        parentId === "root"
                          ? {}
                          : opChipSx(parentOp?.operationType, "outlined")
                      }
                    />
                  </Tooltip>
                );
              })}
            </Stack>
          </Box>
        )}
      </Collapse>
    </Box>
  );
};

const ListView = ({
  deps,
  onDeleteRequest,
  deletingNodeId,
}: {
  deps: DependencyGraph;
  onDeleteRequest?: (nodeId: string) => void;
  deletingNodeId?: string | null;
}) => {
  const opMap = useMemo(() => buildOpMap(deps.operations), [deps.operations]);

  return (
    <Box>
      <Stack direction="row" gap={1} flexWrap="wrap" mb={2}>
        <Tooltip title="Total operations logged">
          <Chip
            label={`${deps.operationsCount} operation${deps.operationsCount !== 1 ? "s" : ""}`}
            size="small"
            color="black"
            variant="filled"
          />
        </Tooltip>
        <Tooltip title="Number of tracked columns">
          <Chip
            label={`${Object.keys(deps.columns).length} column${Object.keys(deps.columns).length !== 1 ? "s" : ""}`}
            size="small"
            variant="outlined"
          />
        </Tooltip>
      </Stack>

      {Object.keys(deps.columns).length > 0 && (
        <Box mb={2}>
          <Typography
            variant="overline"
            color="text.secondary"
            display="block"
            mb={0.5}
          >
            Columns
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.5}>
            {Object.entries(deps.columns)
              .filter(([col]) => col && col !== "undefined")
              .map(([col, info]: [string, any]) => (
                <Tooltip
                  key={col}
                  title={`type: ${info?.type ?? "—"}  |  last op: ${info?.lastOpId ?? "—"}`}
                >
                  <Chip label={col} size="small" variant="outlined" />
                </Tooltip>
              ))}
          </Stack>
        </Box>
      )}

      {deps.nodes && Object.keys(deps.nodes).length > 0 && (
        <Box>
          <Typography
            variant="overline"
            color="text.secondary"
            display="block"
            mb={0.5}
          >
            Dependency nodes
          </Typography>
          <Stack gap={1}>
            {Object.entries(deps.nodes)
              .filter(([id]) => id && id !== "undefined")
              .map(([id, node]: [string, any]) => (
                <NodeCard
                  key={id}
                  nodeId={id}
                  node={{
                    ...node,
                    children: [
                      ...new Set((node.children ?? []).filter(Boolean)),
                    ],
                    parents: [...new Set((node.parents ?? []).filter(Boolean))],
                  }}
                  op={opMap[id]}
                  opMap={opMap}
                  onDelete={
                    onDeleteRequest ? () => onDeleteRequest(id) : undefined
                  }
                  isDeleting={deletingNodeId === id}
                />
              ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

const DependenciesPanel = ({ open, onClose, readonly = false }: DependenciesPanelProps) => {
  const dependencies = useAppSelector(selectDependencies);
  const dispatch = useAppDispatch();
  const opMap = useMemo(
    () => (dependencies ? buildOpMap(dependencies.operations) : {}),
    [dependencies],
  );
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [downstreamIds, setDownstreamIds] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteDialogLoading, setDeleteDialogLoading] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const handleDeleteRequest = useCallback(
    async (nodeId: string) => {
      if (!dependencies) return;
      const node = dependencies.nodes[nodeId];
      const op = opMap[nodeId];
      const isLeaf =
        (node?.children?.length ?? 0) === 0 &&
        (node?.supportChildren?.length ?? 0) === 0;

      setPendingDeleteId(nodeId);

      if (!isLeaf) {
        setDeleteDialogLoading(true);
        try {
          const result = await tableAPI.getOperationDownstreamDeps({
            datasetId: dependencies.datasetId,
            tableId: dependencies.tableId,
            opId: nodeId,
          });
          setDownstreamIds(result.data.downstreamDeps ?? []);
        } catch {
          setDownstreamIds([]);
        }
        setDeleteDialogLoading(false);
      } else {
        setDownstreamIds([]);
      }

      setDeleteConfirmOpen(true);
    },
    [dependencies, opMap],
  );

  const handleCancelDelete = useCallback(() => {
    if (deleteInProgress) return;
    setDeleteConfirmOpen(false);
    setPendingDeleteId(null);
    setDownstreamIds([]);
  }, [deleteInProgress]);

  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDeleteId || !dependencies) return;
    const op = opMap[pendingDeleteId];
    setDeleteInProgress(true);
    try {
      await dispatch(
        deleteOperationAndRedo({
          opId: pendingDeleteId,
          columnName: op?.columnName,
        }),
      );
    } finally {
      setDeleteInProgress(false);
      setDeleteConfirmOpen(false);
      setPendingDeleteId(null);
      setDownstreamIds([]);
    }
  }, [pendingDeleteId, dependencies, opMap, dispatch]);

  const [tab, setTab] = useState(0);

  const [drawerWidth, setDrawerWidth] = useState(
    Math.round(
      ((tab === 0 ? DRAWER_DEFAULT_WIDTH_LIST_VW : DRAWER_DEFAULT_WIDTH_VW) /
        100) *
        window.innerWidth,
    ),
  );
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleResizeMouseDown = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      isResizing.current = true;
      startX.current = e.clientX;
      startWidth.current = drawerWidth;
      e.preventDefault();
    },
    [drawerWidth],
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const delta = startX.current - e.clientX;
      const newWidth = Math.min(
        Math.max(startWidth.current + delta, DRAWER_MIN_WIDTH),
        Math.round((DRAWER_MAX_WIDTH_VW / 100) * window.innerWidth),
      );
      setDrawerWidth(newWidth);
    };
    const onMouseUp = () => {
      isResizing.current = false;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  useEffect(() => {
    console.log("[DependenciesPanel] dependencies:", dependencies);
  }, [dependencies]);

  return (
    <Drawer
      variant="persistent"
      anchor="right"
      open={open}
      PaperProps={{
        sx: {
          width: drawerWidth,
          position: "relative",
          height: "100%",
          border: "none",
          borderLeft: "1px solid rgba(0,0,0,0.12)",
          boxShadow: "-2px 0 8px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        transition: isResizing.current ? "none" : "width 0.25s ease",
        "& .MuiDrawer-paper": {
          transition: isResizing.current ? "none" : "width 0.25s ease",
        },
      }}
    >
      {/* Resize handle */}
      <Box
        onMouseDown={handleResizeMouseDown}
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          cursor: "col-resize",
          zIndex: 10,
          transition: "background 0.15s",
          "&:hover": {
            background: "rgba(25, 118, 210, 0.18)",
          },
          "&:active": {
            background: "rgba(25, 118, 210, 0.32)",
          },
        }}
      />
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        px={2}
        py={0.75}
        className={styles.Header}
      >
        <Stack direction="row" alignItems="center" gap={1}>
          <AccountTreeRoundedIcon fontSize="small" color="primary" />
          <Typography variant="subtitle1" fontWeight={600}>
            Dependencies
          </Typography>
          {dependencies && (
            <Chip
              label={`${dependencies.operationsCount}`}
              size="small"
              color="black"
              variant="filled"
            />
          )}
          <Tooltip
            title={
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {Object.entries(OP_TYPE_LABEL).map(([type, label]) => (
                  <Stack
                    key={type}
                    direction="row"
                    alignItems="center"
                    gap={0.75}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: OP_COLORS[type],
                      }}
                    />
                    <Typography variant="caption">{label}</Typography>
                  </Stack>
                ))}
              </Box>
            }
          >
            <IconButton
              size="small"
              sx={{ p: 0.5 }}
              aria-label="Dependency legend"
            >
              <HelpOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
        <IconButton size="small" onClick={onClose} aria-label="Close panel">
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
        className={styles.Tabs}
      >
        <Tab
          icon={<ListAltRoundedIcon fontSize="small" />}
          iconPosition="start"
          label="List"
          sx={{ minHeight: 40, textTransform: "none", fontSize: "0.8rem" }}
        />
        <Tab
          icon={<AccountTreeRoundedIcon fontSize="small" />}
          iconPosition="start"
          label="Tree"
          sx={{ minHeight: 40, textTransform: "none", fontSize: "0.8rem" }}
        />
      </Tabs>

      <Divider />

      {dependencies ? (
        <>
          <Box
            className={styles.Body}
            flex={1}
            overflow="auto"
            p={2}
            display={tab === 0 ? "block" : "none"}
          >
            <ListView
              deps={dependencies}
              onDeleteRequest={readonly ? undefined : handleDeleteRequest}
              deletingNodeId={deleteInProgress ? pendingDeleteId : null}
            />
          </Box>

          <Box
            flex={1}
            display={tab === 1 ? "flex" : "none"}
            flexDirection="column"
            overflow="hidden"
          >
            <TreeView
              deps={dependencies}
              visible={tab === 1}
              onNodeDeleteRequest={readonly ? undefined : handleDeleteRequest}
            />
          </Box>
        </>
      ) : (
        <Box className={styles.Body} flex={1} overflow="auto" p={2}>
          <Typography variant="body2" color="text.secondary">
            The dependency graph for this table will appear here after a service
            operation (reconcile, extend, or modify) is performed.
          </Typography>
        </Box>
      )}
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {downstreamIds.length > 0 && (
            <WarningAmberRoundedIcon color="warning" fontSize="small" />
          )}
          Remove operation
        </DialogTitle>
        <DialogContent>
          {deleteDialogLoading ? (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Stack gap={1.5}>
              {pendingDeleteId && (
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    The following operation will be removed:
                  </Typography>
                  <Stack
                    direction="row"
                    alignItems="center"
                    gap={0.75}
                    flexWrap="wrap"
                  >
                    {(() => {
                      const op = opMap[pendingDeleteId];
                      return op ? (
                        <>
                          <Chip
                            label={
                              OP_TYPE_LABEL[op.operationType] ??
                              op.operationType
                            }
                            size="small"
                            sx={opChipSx(op.operationType)}
                          />
                          {getServiceName(op) && (
                            <Typography variant="caption" fontWeight={700}>
                              {getServiceName(op)}
                            </Typography>
                          )}
                          {op.columnName && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {"on "}
                              <strong>{op.columnName}</strong>
                            </Typography>
                          )}
                          {op.opNumber != null && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {`#${op.opNumber}`}
                            </Typography>
                          )}
                        </>
                      ) : (
                        <Typography variant="caption">
                          {pendingDeleteId}
                        </Typography>
                      );
                    })()}
                  </Stack>
                </Box>
              )}
              {downstreamIds.length > 0 && (
                <Box>
                  <Typography
                    variant="body2"
                    color="warning.dark"
                    fontWeight={600}
                    mb={0.5}
                  >
                    ⚠ The following dependent operations will also be removed to
                    maintain consistency:
                  </Typography>
                  <Stack gap={0.75}>
                    {downstreamIds.map((id) => {
                      const op = opMap[id];
                      return (
                        <Stack
                          key={id}
                          direction="row"
                          alignItems="center"
                          gap={0.75}
                          flexWrap="wrap"
                        >
                          {op ? (
                            <>
                              <Chip
                                label={
                                  OP_TYPE_LABEL[op.operationType] ??
                                  op.operationType
                                }
                                size="small"
                                sx={opChipSx(op.operationType)}
                              />
                              {getServiceName(op) && (
                                <Typography variant="caption" fontWeight={700}>
                                  {getServiceName(op)}
                                </Typography>
                              )}
                              {op.columnName && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {"on "}
                                  <strong>{op.columnName}</strong>
                                </Typography>
                              )}
                              {op.opNumber != null && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {`#${op.opNumber}`}
                                </Typography>
                              )}
                            </>
                          ) : (
                            <Typography variant="caption">{id}</Typography>
                          )}
                        </Stack>
                      );
                    })}
                  </Stack>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} disabled={deleteInProgress}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteDialogLoading || deleteInProgress}
            startIcon={
              deleteInProgress ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <DeleteRoundedIcon />
              )
            }
          >
            {deleteInProgress ? "Removing\u2026" : "Remove"}
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
};

export default DependenciesPanel;
