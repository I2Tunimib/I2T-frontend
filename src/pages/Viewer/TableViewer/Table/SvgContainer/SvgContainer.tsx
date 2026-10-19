import { SvgPathCoordinator } from "@components/kit";
import { useAppSelector } from "@hooks/store";
import { CoordinatorPath } from "@hooks/svg/useSvgCoordinator";
import { isEmptyObject } from "@services/utils/objects-utils";
import { ID } from "@store/interfaces/store";
import { selectExpandRevision } from "@store/slices/table/table.selectors";
import { Context } from "@store/slices/table/interfaces/table";
import {
  useMemo,
  FC,
  HTMLAttributes,
  MutableRefObject,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

interface SvgContainerProps extends HTMLAttributes<SVGSVGElement> {
  columns: any[];
  columnRefs: MutableRefObject<Record<string, HTMLElement>>;
  headerExpanded: boolean;
  onPathMouseEnter?: (path: any) => void;
  onPathMouseLeave?: () => void;
  showRelationTooltips?: boolean;
}

interface SvgContainerState {
  showContent: boolean;
  paths: Record<string, CoordinatorPath[]>;
}

const DEFAULT_STATE = {
  showContent: false,
  paths: {},
};

const getLink = (context: Record<ID, Context>, id: string) => {
  const [prefix, resourceId] = id.split(":");
  if (context[prefix] !== undefined) {
    return `${context[prefix].uri}${resourceId}`;
  }
  return "";
};

/**
 * Relations drawn above the expanded header.
 *
 * The svg is sticky on the vertical axis (so the arrows stay with the sticky
 * header) and as wide as the table, so it scrolls horizontally together with
 * the columns. Arrow coordinates are computed relative to the svg itself, so
 * scrolling never requires a redraw.
 */
const SvgContainer: FC<SvgContainerProps> = ({
  columns,
  columnRefs,
  headerExpanded,
  onPathMouseEnter,
  onPathMouseLeave,
  showRelationTooltips = true,
  ...props
}) => {
  const [state, setState] = useState<SvgContainerState>(DEFAULT_STATE);
  const expandRevision = useAppSelector(selectExpandRevision);
  const containerRef = useRef<SVGSVGElement>(null);
  const [contentWidth, setContentWidth] = useState<number | null>(null);

  // Keep the svg as wide as the table (also redraws when columns are resized)
  useEffect(() => {
    const tableEl = containerRef.current?.parentElement?.querySelector("table");
    if (!tableEl) return undefined;

    const update = () => setContentWidth(tableEl.offsetWidth);
    update();

    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(update);
    observer.observe(tableEl);
    return () => observer.disconnect();
  }, [state.showContent]);

  useEffect(() => {
    if (columns && columnRefs && columnRefs.current) {
      const paths = columns.reduce((acc, column) => {
        const id = column.header;
        const { metadata, context } = column.data;
        const { property } = metadata[0] || [];

        if (property && property.length > 0) {
          const groupPaths = property
            .map((prop: any) => {
              // Only create paths if both start and end elements exist
              if (columnRefs.current[id] && columnRefs.current[prop.obj]) {
                return {
                  id: prop.id,
                  startElementLabel: id,
                  endElementLabel: prop.obj,
                  startElement: columnRefs.current[id],
                  endElement: columnRefs.current[prop.obj],
                  label: prop.name,
                  link: getLink(context, prop.id),
                };
              }
              return null;
            })
            .filter(Boolean); // Remove null entries

          if (groupPaths.length > 0) {
            acc[id] = groupPaths;
          }
        }
        return acc;
      }, {});
      setState((old) => ({ ...old, paths }));
    }
  }, [columns, columnRefs]);

  useEffect(() => {
    if (columnRefs && !isEmptyObject(columnRefs.current)) {
      if (headerExpanded) {
        // wait for the header expand transition before drawing
        const timeoutId = setTimeout(() => {
          setState((old) => ({ ...old, showContent: true }));
        }, 300);
        return () => clearTimeout(timeoutId);
      }
      setState((old) => ({ ...old, showContent: false }));
    }
    return undefined;
  }, [columnRefs, headerExpanded]);

  // Redraw when the header is re-expanded or the table width changes
  const shouldRedraw = useCallback(() => true, [expandRevision, contentWidth]);

  const paths = useMemo(() => state.paths, [state.paths]);

  const handlePathMouseEnter = useCallback(
    (pathData: any) => {
      if (onPathMouseEnter) {
        onPathMouseEnter({
          ...pathData,
          relationName: pathData.label,
          fromColumn: pathData.startElementLabel,
          toColumn: pathData.endElementLabel,
        });
      }
    },
    [onPathMouseEnter],
  );

  const handlePathMouseLeave = useCallback(() => {
    if (onPathMouseLeave) {
      onPathMouseLeave();
    }
  }, [onPathMouseLeave]);

  return (
    <>
      {state.showContent && (
        <SvgPathCoordinator
          ref={containerRef}
          paths={paths}
          shouldRedraw={shouldRedraw}
          onPathMouseEnter={handlePathMouseEnter}
          onPathMouseLeave={handlePathMouseLeave}
          showRelationTooltips={showRelationTooltips}
          style={contentWidth ? { width: contentWidth } : undefined}
          {...props}
        />
      )}
    </>
  );
};

export default SvgContainer;
