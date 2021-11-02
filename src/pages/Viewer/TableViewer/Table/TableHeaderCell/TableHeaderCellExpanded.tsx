import { Chip, Link, Typography } from '@mui/material';
import { ID } from '@store/interfaces/store';
import { ColumnMetadata, Context } from '@store/slices/table/interfaces/table';
import { FC, useCallback } from 'react';
import ArrowRightAltRoundedIcon from '@mui/icons-material/ArrowRightAltRounded';
import EntityLabel from '@components/core/EntityLabel';
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

  const RenderType = useCallback((type) => (
    <div key={type.id} className={styles.PropertyItem}>
      <EntityLabel type="type">
        <Link href={getResourceLink(type.id)} target="_blank">{type.name}</Link>
      </EntityLabel>
    </div>
  ), []);

  const RenderProperty = useCallback((property) => (
    <div key={property.id} className={styles.PropertyItem}>
      <EntityLabel type="property">
        <Link href={getResourceLink(property.id)} target="_blank">{property.name}</Link>
      </EntityLabel>
      <ArrowRightAltRoundedIcon />
      <span>{property.obj}</span>
    </div>
  ), []);

  // <div className={styles.PropertyContainer}>
  //   <Typography variant="subtitle2">Type</Typography>
  //   {metadata[0].type.map((type) => RenderType(type))}
  // </div>

  return metadata.length > 0 ? (
    <div className={styles.Container}>
      {(metadata[0].type && Array.isArray(metadata[0].type)) && (
        <div className={styles.PropertyContainer}>
          {metadata[0].type.map((type) => RenderType(type))}
        </div>
      )}
      {metadata[0].property && (
        <div className={styles.PropertyContainer}>
          {metadata[0].property.map((property) => RenderProperty(property))}
        </div>
      )}
    </div>
  ) : null;
};

export default TableHeaderCellExpanded;
