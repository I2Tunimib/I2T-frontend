import { FC, useMemo } from "react";
import {
  Box,
  Chip,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
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
};
const DEFAULT_COLOR = "#14b8a6";

const typeColor = (type: string) =>
  NER_COLORS[type.toUpperCase()] ?? DEFAULT_COLOR;

const NerAnnotationsTab: FC<Props> = ({ label, annotations }) => {
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

          return (
            <Tooltip
              key={i}
              arrow
              title={
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color }}
                  >
                    {seg.annotation.type}
                  </Typography>
                  {entityName && (
                    <Typography variant="caption" sx={{ color: "#fff" }}>{entityName}</Typography>
                  )}
                  {entity?.id && (
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                      {entity.id}
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                    chars {seg.annotation.target.selector.start}–
                    {seg.annotation.target.selector.end}
                  </Typography>
                </Box>
              }
            >
              <Box
                component="mark"
                sx={{
                  backgroundColor: `${color}28`,
                  borderBottom: `2px solid ${color}`,
                  borderRadius: "2px",
                  padding: "1px 3px",
                  cursor: "default",
                  color: "inherit",
                  "&:hover": {
                    backgroundColor: `${color}45`,
                  },
                }}
              >
                {seg.content}
              </Box>
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
