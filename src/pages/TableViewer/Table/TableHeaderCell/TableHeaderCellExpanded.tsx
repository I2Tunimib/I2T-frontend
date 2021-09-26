import { Chip, Link, Typography } from '@material-ui/core';
import { ID } from '@store/interfaces/store';
import { ColumnMetadata, Context } from '@store/slices/table/interfaces/table';
import { FC, useCallback } from 'react';
import ArrowRightAltRoundedIcon from '@material-ui/icons/ArrowRightAltRounded';
import styles from './TableHeaderCellExpanded.module.scss';

interface TableHeaderCellExpandedProps {
  context: Record<ID, Context>;
  metadata: ColumnMetadata[];
  kind: string;
  role: string;
}

const TableHeaderCellExpanded: FC<TableHeaderCellExpandedProps> = ({
  context,
  metadata,
  kind,
  role
}) => {
  const getResourceLink = useCallback((idResource) => {
    const [prefix, id] = idResource.split(':');
    const resourceContext = context[prefix];
    if (resourceContext) {
      return `${resourceContext.uri}${id}`;
    }
    return '';
  }, [context]);

  const RenderProperty = useCallback((property) => (
    <div key={property.id} className={styles.PropertyItem}>
      <Link href={getResourceLink(property.id)} target="_blank">{property.name}</Link>
      <ArrowRightAltRoundedIcon />
      <span>{property.obj}</span>
    </div>
  ), []);

  return metadata[0].property ? (
    <div className={styles.Container}>
      <div className={styles.PropertyContainer}>
        <Typography variant="subtitle2">Property</Typography>
        {metadata[0].property.map((property) => RenderProperty(property))}
      </div>
    </div>
  ) : null;
};

export default TableHeaderCellExpanded;
