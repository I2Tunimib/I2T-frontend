import { SvgPathCoordinator } from '@components/kit';
import { useAppSelector } from '@hooks/store';
import { CoordinatorPath } from '@hooks/svg/useSvgCoordinator';
import { isEmptyObject } from '@services/utils/objects-utils';
import { ID } from '@store/interfaces/store';
import { selectOnExpandAction } from '@store/slices/action/action.selectors';
import { Context } from '@store/slices/table/interfaces/table';
import {
  useMemo,
  FC, HTMLAttributes,
  MutableRefObject, useEffect,
  useState, useCallback, useRef
} from 'react';

interface SvgContainerProps extends HTMLAttributes<SVGSVGElement> {
  columns: any[];
  columnRefs: MutableRefObject<Record<string, HTMLElement>>;
  headerExpanded: boolean;
  onPathMouseEnter?: (path: any) => void;
  onPathMouseLeave?: () => void;
}

interface SvgContainerState {
  showContent: boolean;
  paths: Record<string, CoordinatorPath[]>;
}

const DEFAULT_STATE = {
  showContent: false,
  paths: {}
};

const getLink = (context: Record<ID, Context>, id: string) => {
  const [prefix, resourceId] = id.split(':');
  if (context[prefix] !== undefined) {
    return `${context[prefix].uri}${resourceId}`;
  }
  return '';
};

const SvgContainer: FC<SvgContainerProps> = ({
  columns,
  columnRefs,
  headerExpanded,
  onPathMouseEnter,
  onPathMouseLeave,
  ...props
}) => {
  const [state, setState] = useState<SvgContainerState>(DEFAULT_STATE);
  const action = useAppSelector(selectOnExpandAction);
  const containerRef = useRef<SVGSVGElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const lastScrollPositionRef = useRef(0);

  // Listen for scroll events on parent container
  useEffect(() => {
    const handleScroll = () => {
      // Find closest scrollable parent
      if (containerRef.current) {
        const tableContainer = containerRef.current.closest('.TableContainer');
        if (tableContainer) {
          const newScrollLeft = tableContainer.scrollLeft;
          setScrollLeft(newScrollLeft);
          lastScrollPositionRef.current = newScrollLeft;
        }
      }
    };

    // Find scrollable container and attach event
    if (containerRef.current && headerExpanded) {
      const tableContainer = containerRef.current.closest('.TableContainer');
      if (tableContainer) {
        // Set initial scroll position
        setScrollLeft(lastScrollPositionRef.current);
        
        tableContainer.addEventListener('scroll', handleScroll);
        return () => {
          tableContainer.removeEventListener('scroll', handleScroll);
        };
      }
    }
  }, [headerExpanded, containerRef.current]);

  useEffect(() => {
    if (columns && columnRefs && columnRefs.current) {
      const paths = columns.reduce((acc, column) => {
        const id = column.Header;
        const { metadata, context } = column.data;
        const { property } = metadata[0] || [];

        if (property && property.length > 0) {
          const groupPaths = property.map((prop: any) => {
            // Only create paths if both start and end elements exist
            if (columnRefs.current[id] && columnRefs.current[prop.obj]) {
              return {
                id: prop.id,
                startElementLabel: id,
                endElementLabel: prop.obj,
                startElement: columnRefs.current[id],
                endElement: columnRefs.current[prop.obj],
                label: prop.name,
                link: getLink(context, prop.id)
              };
            }
            return null;
          }).filter(Boolean); // Remove null entries
          
          if (groupPaths.length > 0) {
            acc[id] = groupPaths;
          }
        }
        return acc;
      }, {});
      setState((old) => ({ ...old, paths }));
    }
  }, [columns, columnRefs, scrollLeft]); // Re-run when scroll position changes

  useEffect(() => {
    if (columnRefs && !isEmptyObject(columnRefs.current)) {
      if (headerExpanded) {
        // When reopening, restore the previous scroll position
        const restoreScrollPosition = lastScrollPositionRef.current;
        
        setTimeout(() => {
          setState((old) => ({ ...old, showContent: true }));
          
          // After the component is shown, restore scroll position on the container
          if (restoreScrollPosition > 0) {
            const tableContainer = containerRef.current?.closest('.TableContainer');
            if (tableContainer) {
              // We don't set this through state to avoid re-renders
              // Just update the actual scroll position
              tableContainer.scrollLeft = restoreScrollPosition;
              setScrollLeft(restoreScrollPosition);
            }
          }
        }, 300);
      } else {
        setState((old) => ({ ...old, showContent: false }));
        // Don't reset the scroll position value in the ref when closing
        // Just reset the state to avoid re-renders
        setScrollLeft(0);
      }
    }
  }, [columnRefs, headerExpanded]);

  const shouldRedraw = useCallback(() => {
    if (action.startsWith('table/updateSelectedCellExpanded') || scrollLeft > 0) {
      return true;
    }
    return false;
  }, [action, scrollLeft]);

  const paths = useMemo(() => state.paths, [state.paths]);

  return (
    <>
      {state.showContent && (
        <SvgPathCoordinator
          ref={containerRef}
          paths={paths}
          shouldRedraw={shouldRedraw}
          onPathMouseEnter={onPathMouseEnter}
          onPathMouseLeave={onPathMouseLeave}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            left: 0,
            top: 0,
            zIndex: 5,
            overflow: 'visible'
          }}
          {...props} />
      )}
    </>
  );
};

export default SvgContainer;
