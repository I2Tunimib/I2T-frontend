import { SvgPathCoordinator } from '@components/kit';
import SvgPath from '@components/kit/SvgPath/SvgPath';
import { CoordinatorPath, SvgPathCoordinatorProps } from '@components/kit/SvgPathCoordinator/SvgPathCoordinator';
import { useAppSelector } from '@hooks/store';
import { isEmptyObject } from '@services/utils/objects-utils';
import { ID } from '@store/interfaces/store';
import { selectOnExpandAction } from '@store/slices/action/action.selectors';
import { Context, PropertyMetadata } from '@store/slices/table/interfaces/table';
import {
  useRef,
  FC, HTMLAttributes,
  MutableRefObject, useEffect,
  useState, useCallback
} from 'react';

interface SvgContainerProps extends HTMLAttributes<SVGSVGElement> {
  columns: any[];
  columnRefs: MutableRefObject<Record<string, HTMLElement>>;
  headerExpanded: boolean;
}

// interface SvgContainerState {
//   showContent: boolean;
//   cols: Record<ID, {
//     context: Record<ID, Context>;
//     property: PropertyMetadata[]
//   }>
// }
interface SvgContainerState {
  showContent: boolean;
  paths: Record<string, CoordinatorPath[]>;
}

const DEFAULT_STATE = {
  showContent: false,
  paths: {}
};

// const DEFAULT_STATE = {
//   showContent: false,
//   cols: {}
// };

const COLORS = [
  '#bd65a4',
  '#2fad96'
];

const getLink = (context: Record<ID, Context>, id: string) => {
  const [prefix, resourceId] = id.split(':');
  return `${context[prefix].uri}${resourceId}`;
};

const SvgContainer: FC<SvgContainerProps> = ({
  columns,
  columnRefs,
  headerExpanded,
  ...props
}) => {
  const [state, setState] = useState<SvgContainerState>(DEFAULT_STATE);
  const svgRef = useRef<SVGSVGElement>(null);
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
              startElement: columnRefs.current[id],
              endElement: columnRefs.current[prop.obj],
              label: prop.name,
              link: getLink(context, prop.id)
            };
          });
          acc[id] = groupPaths;
          // acc[id] = {
          //   startElement: columnRefs.current[column],
          //   endElement: columnRefs.current[]
          // }
          // label?: string;
          // link?: string;
        }
        // const { property } = metadata[0] || [];
        // if (property && property.length > 0) {
        //   acc[id] = {
        //     property,
        //     context
        //   };
        // }
        return acc;
      }, {});
      setState((old) => ({ ...old, paths }));
    }
    // setState((old) => ({ ...old, cols }));
  }, [columns, columnRefs]);

  // useEffect(() => {
  //   const cols = columns.reduce((acc, column) => {
  //     const id = column.Header;
  //     const { metadata, context } = column.data;
  //     const { property } = metadata[0] || [];
  //     if (property && property.length > 0) {
  //       acc[id] = {
  //         property,
  //         context
  //       };
  //     }
  //     return acc;
  //   }, {});
  //   setState((old) => ({ ...old, cols }));
  // }, [columns]);

  useEffect(() => {
    if (columnRefs && !isEmptyObject(columnRefs.current)) {
      if (headerExpanded) {
        setTimeout(() => {
          setState((old) => ({ ...old, showContent: true }));
        }, 300);
      }
    }
  }, [columnRefs, headerExpanded]);

  // const getLink = useCallback((context: Record<ID, Context>, id: string) => {
  //   const [prefix, resourceId] = id.split(':');
  //   return `${context[prefix].uri}${resourceId}`;
  // }, []);

  const shouldRedraw = useCallback(() => {
    if (action.startsWith('table/updateSelectedCellExpanded')) {
      return true;
    }
    return false;
  }, [action]);

  return (
    <>
      {state.showContent && (
        <SvgPathCoordinator
          paths={state.paths}
          {...props} />
      )}
    </>
    // <svg ref={svgRef} {...props}>
    //   {state.showContent && columnRefs && !isEmptyObject(columnRefs.current) && (
    //     <>
    //       {Object.keys(state.cols).map((col, index) => {
    //         return state.cols[col].property.map((property) => (
    //           <>
    //             {property.obj && (
    //               <SvgPath
    //                 key={`${col}-${property.obj}`}
    //                 shouldRedraw={shouldRedraw}
    //                 id={`${col}-${property.obj}`}
    //                 label={property.name}
    //                 color={COLORS[index]}
    //                 link={getLink(state.cols[col].context, property.id)}
    //                 svgElement={svgRef.current}
    //                 startElement={columnRefs.current[col]}
    //                 endElement={columnRefs.current[property.obj]} />
    //             )}
    //           </>
    //         ));
    //       })}
    //     </>
    //   )}
    // </svg>
  );
};

export default SvgContainer;
