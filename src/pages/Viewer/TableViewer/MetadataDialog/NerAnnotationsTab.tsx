import { FC, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { useAppSelector } from "@hooks/store";
import { selectAnnotationQuickViewUrl } from "@store/slices/config/config.selectors";
import { TextAnnotation } from "@store/slices/table/interfaces/table";

interface Props {
  label: string;
  annotations: Record<string, TextAnnotation[]>;
}

type Segment =
  | { kind: "text"; content: string }
  | {
      kind: "span";
      content: string;
      annotation: TextAnnotation;
      setName: string;
    };

const NER_COLORS: Record<string, string> = {
  ORG: "#3b82f6",
  ORGANIZATION: "#3b82f6",
  PER: "#22c55e",
  PERSON: "#22c55e",
  GPE: "#f59e0b",
  LOC: "#f59e0b",
  LOCATION: "#f59e0b",
  DATE: "#a855f7",
  TIME: "#a855f7",
  MISC: "#94a3b8",
  CARDINAL: "#06b6d4",
  FAC: "#8b5cf6",
  QUANTITY: "#ec4899",
};
const DEFAULT_COLOR = "#ef4444";

const typeColor = (type: string) =>
  NER_COLORS[type.toUpperCase()] ?? DEFAULT_COLOR;

const NerAnnotationsTab: FC<Props> = ({ label, annotations }) => {
  const [copied, setCopied] = useState(false);
  const quickViewBaseUrl = useAppSelector(selectAnnotationQuickViewUrl);

  const handleOpenQuickView = () => {
    if (!quickViewBaseUrl) return;
    const data = encodeURIComponent(JSON.stringify({ label, annotations }));
    window.open(
      `${quickViewBaseUrl}?data=${data}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleCopyJson = async () => {
    const payload = JSON.stringify({ label, annotations }, null, 2);
    try {
      await navigator.clipboard.writeText(payload);
    } catch {
      // Fallback for non-secure contexts / older browsers
      const ta = document.createElement("textarea");
      ta.value = payload;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const segments = useMemo<Segment[]>(() => {
    const flat = Object.entries(annotations).flatMap(([setName, anns]) =>
      anns.map((ann) => ({ ...ann, setName })),
    );
    flat.sort(
      (a, b) => a.target.selector.start - b.target.selector.start,
    );

    const result: Segment[] = [];
    let cursor = 0;

    for (const ann of flat) {
      const { start, end } = ann.target.selector;
      if (start < cursor) continue; // skip overlapping spans
      if (start > cursor) {
        result.push({ kind: "text", content: label.slice(cursor, start) });
      }
      if (end > start) {
        result.push({
          kind: "span",
          content: label.slice(start, end),
          annotation: ann,
          setName: ann.setName,
        });
      }
      cursor = end;
    }

    if (cursor < label.length) {
      result.push({ kind: "text", content: label.slice(cursor) });
    }

    return result;
  }, [label, annotations]);

  const types = useMemo(() => {
    const seen = new Set<string>();
    Object.values(annotations)
      .flat()
      .forEach((ann) => seen.add(ann.type));
    return Array.from(seen);
  }, [annotations]);

  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 1,
        }}
      >
        {quickViewBaseUrl && (
          <Tooltip title="Open this annotated text in the quickView explorer">
            <Button
              size="small"
              variant="contained"
              disableElevation
              startIcon={<OpenInNewRoundedIcon />}
              onClick={handleOpenQuickView}
              sx={{ textTransform: "none" }}
            >
              Open in quickView
            </Button>
          </Tooltip>
        )}
        {/* Debug: copy the internal annotations JSON */}
        <Tooltip title="Debug · copy the internal annotations JSON to the clipboard">
          <Button
            size="small"
            variant="outlined"
            color={copied ? "success" : "inherit"}
            startIcon={
              copied ? <CheckRoundedIcon /> : <ContentCopyRoundedIcon />
            }
            onClick={handleCopyJson}
            sx={{ textTransform: "none", fontSize: "0.75rem" }}
          >
            {copied ? "Copied" : "Copy JSON"}
          </Button>
        </Tooltip>
      </Box>

      {/* Annotated text */}
      <Box
        sx={{
          fontSize: "1rem",
          lineHeight: 2.4,
          wordBreak: "break-word",
        }}
      >
        {segments.map((seg, i) => {
          if (seg.kind === "text") {
            return <span key={i}>{seg.content}</span>;
          }

          const color = typeColor(seg.annotation.type);
          const entity = seg.annotation.features?.entity;
          const entityName =
            entity?.name &&
            typeof entity.name === "object" &&
            "value" in (entity.name as any)
              ? (entity.name as any).value
              : entity?.name;

          const wikidataUrl = (() => {
            if (!entity?.id) return null;
            const id = String(entity.id);
            if (id.startsWith("wd:")) return `https://www.wikidata.org/wiki/${id.slice(3)}`;
            if (/^Q\d+$/.test(id)) return `https://www.wikidata.org/wiki/${id}`;
            return null;
          })();

          const markEl = (
            <Box
              component={wikidataUrl ? "a" : "mark"}
              {...(wikidataUrl
                ? { href: wikidataUrl, target: "_blank", rel: "noopener noreferrer" }
                : {})}
              sx={{
                backgroundColor: `${color}28`,
                borderBottom: `2px solid ${color}`,
                borderRadius: "2px",
                padding: "1px 3px",
                cursor: wikidataUrl ? "pointer" : "default",
                color: "inherit",
                textDecoration: "none",
                "&:hover": {
                  backgroundColor: `${color}45`,
                  ...(wikidataUrl && { textDecoration: "underline" }),
                },
              }}
            >
              {seg.content}
            </Box>
          );

          return (
            <Tooltip
              key={i}
              followCursor
              componentsProps={{
                tooltip: {
                  sx: {
                    backgroundColor: "#ffffff",
                    color: "#1e293b",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                    borderRadius: "8px",
                    p: "10px 12px",
                    border: "1px solid #f0f0f0",
                  },
                },
              }}
              title={
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color, fontSize: "0.9rem" }}
                  >
                    {seg.annotation.type}
                  </Typography>
                  {entityName && (
                    <Typography variant="caption" sx={{ fontSize: "0.85rem" }}>{entityName}</Typography>
                  )}
                  {entity?.id && (
                    <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                      {entity.id}
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                    chars {seg.annotation.target.selector.start}–
                    {seg.annotation.target.selector.end}
                  </Typography>
                </Box>
              }
            >
              {markEl}
            </Tooltip>
          );
        })}
      </Box>

      {/* Type legend */}
      <Stack direction="row" gap={1} flexWrap="wrap">
        {types.map((type) => (
          <Chip
            key={type}
            label={type}
            size="small"
            sx={{
              backgroundColor: `${typeColor(type)}20`,
              border: `1px solid ${typeColor(type)}`,
              color: typeColor(type),
              fontWeight: 600,
              fontSize: "0.7rem",
            }}
          />
        ))}
      </Stack>

      {/* Annotation set metadata */}
      <Stack gap={0.5}>
        {Object.entries(annotations).map(([setName, anns]) => (
          <Typography key={setName} variant="caption" color="text.secondary">
            Set:{" "}
            <Box component="span" sx={{ fontWeight: 600 }}>
              {setName}
            </Box>{" "}
            · {anns.length} annotation{anns.length !== 1 ? "s" : ""}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
};

export default NerAnnotationsTab;
