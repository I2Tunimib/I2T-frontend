import { ArrowHead } from '@components/kit/SvgComponents';
import SvgPath from '@components/kit/SvgPath/SvgPath';
import useWindowDimension from '@hooks/resize/useWindowResize';
import usePath from '@hooks/SvgPath/usePath';
import { isEmptyObject } from '@services/utils/objects-utils';
import { ID } from '@store/interfaces/store';
import { Context, PropertyMetadata } from '@store/slices/table/interfaces/table';
import {
  useRef,
  FC, HTMLAttributes,
  MutableRefObject, useEffect,
  useState, useCallback
} from 'react';

interface SvgContainerProps extends HTMLAttributes<SVGElement> {
  columns: any[];
  columnRefs: MutableRefObject<Record<string, HTMLElement>>;
  headerExpanded: boolean;
}

interface SvgContainerState {
  showContent: boolean;
  cols: Record<ID, {
    context: Record<ID, Context>;
    property: PropertyMetadata[]
  }>
}

const DEFAULT_STATE = {
  showContent: false,
  cols: {}
};

const COLORS = [
  '#bd65a4',
  '#2fad96'
];

const SvgContainer: FC<SvgContainerProps> = ({
  columns,
  columnRefs,
  headerExpanded,
  ...props
}) => {
  const [state, setState] = useState<SvgContainerState>(DEFAULT_STATE);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const cols = columns.reduce((acc, column) => {
      const id = column.Header;
      const { metadata, context } = column.data;
      const { property } = metadata[0] || [];
      if (property && property.length > 0) {
        acc[id] = {
          property,
          context
        };
      }
      return acc;
    }, {});
    setState((old) => ({ ...old, cols }));
  }, [columns]);

  useEffect(() => {
    console.log(state);
  }, [state]);

  useEffect(() => {
    if (columnRefs && !isEmptyObject(columnRefs.current)) {
      if (headerExpanded) {
        setTimeout(() => {
          setState((old) => ({ ...old, showContent: true }));
        }, 300);
      }
    }
  }, [columnRefs, headerExpanded]);

  const getLink = useCallback((context: Record<ID, Context>, id: string) => {
    const [prefix, resourceId] = id.split(':');
    return `${context[prefix].uri}${resourceId}`;
  }, []);

  return (
    <svg ref={svgRef} {...props}>
      {state.showContent && columnRefs && !isEmptyObject(columnRefs.current) && (
        <>
          {Object.keys(state.cols).map((col, index) => {
            return state.cols[col].property.map((property) => (
              <>
                {property.obj && (
                  <SvgPath
                    key={`${col}-${property.obj}`}
                    id={`${col}-${property.obj}`}
                    label={property.name}
                    color={COLORS[index]}
                    link={getLink(state.cols[col].context, property.id)}
                    svgElement={svgRef.current}
                    startElement={columnRefs.current[col]}
                    endElement={columnRefs.current[property.obj]} />
                )}
              </>
            ));
          })}
          {/* <SvgPath
            id="col0-col1"
            label="property"
            arrowElementId="arrow"
            svgElement={svgRef.current}
            startElement={columnRefs.current['Point of interest']}
            endElement={columnRefs.current.Place} />
          <SvgPath
            id="col0-col2"
            label="property"
            arrowElementId="arrow"
            svgElement={svgRef.current}
            startElement={columnRefs.current['Point of interest']}
            endElement={columnRefs.current.Country} /> */}
        </>
      )}
    </svg>
  );
};

export default SvgContainer;
