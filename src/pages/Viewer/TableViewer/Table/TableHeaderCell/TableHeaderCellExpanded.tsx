import { Chip, Link, Typography } from "@mui/material";
import { ID } from "@store/interfaces/store";
import { ColumnMetadata, Context } from "@store/slices/table/interfaces/table";
import { FC, useCallback } from "react";
import ArrowRightAltRoundedIcon from "@mui/icons-material/ArrowRightAltRounded";
import EntityLabel from "@components/core/EntityLabel";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import {
  ExpandableList,
  ExpandableListBody,
  ExpandableListHeader,
  ExpandableListItem,
} from "@components/kit";
import styles from "./TableHeaderCellExpanded.module.scss";

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
  role,
}) => {
  const getResourceLink = useCallback(
    (idResource) => {
      const [prefix, id] = idResource.split(":");
      const regexForWikidata = /^Q\d+$/;
      const resourceContext = context[prefix];
      if (resourceContext) {
        return `${resourceContext.uri}${id}`;
      } else if (regexForWikidata.test(idResource)) {
        return `https://www.wikidata.org/wiki/${idResource}`;
      }
      return "";
    },
    [context]
  );

  const RenderType = useCallback(
    (type) => (
      <div key={type.id} className={styles.PropertyItem}>
        <EntityLabel type="type">
          <Link href={getResourceLink(type.id)} target="_blank">
            {type.name}
          </Link>
        </EntityLabel>
      </div>
    ),
    []
  );

  const RenderProperty = useCallback(
    (property) => (
      <div key={property.id} className={styles.PropertyItem}>
        <EntityLabel type="property">
          <Link href={getResourceLink(property.id)} target="_blank">
            {property.name}
          </Link>
        </EntityLabel>
        <ArrowRightAltRoundedIcon />
        <span>{property.obj}</span>
      </div>
    ),
    []
  );

  const getItems = useCallback(
    (start: number, finish: number): any[] => {
      if (!metadata[0]) {
        return [];
      }
      if (!metadata[0].entity) {
        return [];
      }
      let end = finish;
      if (finish > metadata[0].entity.length) {
        end = metadata[0].entity.length;
      }
      return metadata[0].entity.slice(start, end);
    },
    [metadata]
  );

  const nEntities = metadata[0]
    ? metadata[0].entity
      ? metadata[0].entity.length
      : 0
    : 0;

  // <div className={styles.PropertyContainer}>
  //   <Typography variant="subtitle2">Type</Typography>
  //   {metadata[0].type.map((type) => RenderType(type))}
  // </div>

  return metadata.length > 0 ? (
    <div className={styles.Container}>
      {metadata[0].type && Array.isArray(metadata[0].type) && (
        <div className={styles.PropertyContainer}>
          {metadata[0].type.map((type) => RenderType(type))}
        </div>
      )}
      {metadata[0].property && (
        <div className={styles.PropertyContainer}>
          {metadata[0].property.map((property) => RenderProperty(property))}
        </div>
      )}
      <ExpandableList
        messageIfNoContent="Cell doesn't have any entity metadata"
        className={styles.ExpandableList}
      >
        <ExpandableListHeader>
          {getItems(0, 3).map((item, index) => (
            <ExpandableListItem key={`${item.id}`}>
              <div className={styles.Item}>
                {item.match ? (
                  <CheckRoundedIcon className={styles.Icon} />
                ) : null}
                <EntityLabel className={styles.MetaLink} type="entity">
                  <Link
                    sx={{
                      marginLeft: "20px",
                    }}
                    title={`${item.id} (${item.name.value})`}
                    href={item.url}
                    target="_blank"
                  >
                    {`${item.id} (${item.name.value})`}
                  </Link>
                </EntityLabel>
              </div>
            </ExpandableListItem>
          ))}
        </ExpandableListHeader>
        <ExpandableListBody>
          {getItems(3, nEntities).map((item, index) => (
            <ExpandableListItem key={`${item.id}`}>
              <div className={styles.Item}>
                {item.match ? (
                  <CheckRoundedIcon className={styles.Icon} />
                ) : null}
                <EntityLabel className={styles.MetaLink} type="entity">
                  <Link
                    sx={{
                      marginLeft: "20px",
                    }}
                    href={item.url}
                    title={`${item.id} (${item.name.value})`}
                    target="_blank"
                    className={styles.MetaLink}
                  >
                    {`${item.id} (${item.name.value})`}
                  </Link>
                </EntityLabel>
              </div>
            </ExpandableListItem>
          ))}
        </ExpandableListBody>
      </ExpandableList>
    </div>
  ) : null;
};

export default TableHeaderCellExpanded;
