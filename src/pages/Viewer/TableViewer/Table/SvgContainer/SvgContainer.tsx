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
  useState, useCallback
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
  return `${context[prefix].uri}${resourceId}`;
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

  useEffect(() => {
    if (columns && columnRefs && columnRefs.current) {
      const paths = columns.reduce((acc, column) => {
        const id = column.Header;
        const { metadata, context } = column.data;
        const { property } = metadata[0] || [];

        if (property && property.length > 0) {
          const groupPaths = property.map((prop: any) => {
            return {
              id: prop.id,
              startElementLabel: id,
              endElementLabel: prop.obj,
              startElement: columnRefs.current[id],
              endElement: columnRefs.current[prop.obj],
              label: prop.name,
              link: getLink(context, prop.id)
            };
          });
          acc[id] = groupPaths;
        }
        return acc;
      }, {});
      setState((old) => ({ ...old, paths }));
    }
  }, [columns, columnRefs]);

  useEffect(() => {
    if (columnRefs && !isEmptyObject(columnRefs.current)) {
      if (headerExpanded) {
        setTimeout(() => {
          setState((old) => ({ ...old, showContent: true }));
        }, 300);
      }
    }
  }, [columnRefs, headerExpanded]);

  const shouldRedraw = useCallback(() => {
    if (action.startsWith('table/updateSelectedCellExpanded')) {
      return true;
    }
    return false;
  }, [action]);

  const paths = useMemo(() => state.paths, [state.paths]);

  return (
    <>
      {state.showContent && (
        <SvgPathCoordinator
          paths={paths}
          shouldRedraw={shouldRedraw}
          onPathMouseEnter={onPathMouseEnter}
          onPathMouseLeave={onPathMouseLeave}
          {...props} />
      )}
    </>
  );
};

export default SvgContainer;
