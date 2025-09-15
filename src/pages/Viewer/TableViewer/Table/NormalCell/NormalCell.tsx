import { FC, useCallback } from "react";
import clsx from "clsx";
import StatusBadge from "@components/core/StatusBadge";
import ExpandableList from "@components/kit/ExpandableList/ExpandableList";
import ExpandableListHeader from "@components/kit/ExpandableListHeader";
import ExpandableListItem from "@components/kit/ExpandableListItem";
import ExpandableListBody from "@components/kit/ExpandableListBody";
import { IconButton, Link, Typography } from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import SettingsEthernetRoundedIcon from "@mui/icons-material/SettingsEthernetRounded";
import { selectReconciliatorCell } from "@store/slices/table/table.selectors";
import { RootState } from "@store";
import { connect } from "react-redux";
import { BaseMetadata, Cell } from "@store/slices/table/interfaces/table";
import { useAppDispatch } from "@hooks/store";
import { updateUI } from "@store/slices/table/table.slice";
import EntityLabel from "@components/core/EntityLabel";
import styles from "./NormalCell.module.scss";

interface NormalCellProps {
  label: string;
  value: any;
  dense: boolean;
  expanded: boolean;
  reconciliator: string;
  settings: any;
}

const NormalCell: FC<NormalCellProps> = ({
  label,
  value,
  settings,
  reconciliator,
  dense,
  expanded,
}) => {
  const dispatch = useAppDispatch();

  const {
    lowerBound: { isScoreLowerBoundEnabled, scoreLowerBound },
  } = settings;

  const getBadgeStatus = (cell: Cell) => {
    const {
      annotationMeta: { annotated, match, highestScore },
    } = cell;

    if (match.value) {
      switch (match.reason) {
        case "manual":
          return "match-manual";
        case "reconciliator":
          return "match-reconciliator";
        case "refinement":
          return "match-refinement";
        default:
          return "match-reconciliator";
      }
    }

    if (annotated && cell.metadata.length === 0) {
      return "miss";
    }

    if (isScoreLowerBoundEnabled) {
      if (scoreLowerBound && highestScore < scoreLowerBound) {
        return "miss";
      }
    }
    return "warn";
  };

  const limitLabel = (labelToLimit: any) => {
    if (labelToLimit.length > 50) {
      return labelToLimit.slice(0, 50).concat(" ...");
    }
    return labelToLimit;
  };

  const getLabel = useCallback(() => {
    // Check if value and metadata exist before accessing
    if (!value || !value.metadata) {
      return limitLabel(label);
    }

    const match = value.metadata.find((meta: BaseMetadata) => meta.match);
    if (match) {
      return (
        <Link href={match.url} target="_blank">
          {limitLabel(label)}
        </Link>
      );
    }
    if (label === "null") {
      return (
        <Typography component="span" color="textSecondary" lineHeight="0">
          {limitLabel(label)}
        </Typography>
      );
    }
    return limitLabel(label);
  }, [value, label]);

  const getItems = useCallback(
    (start: number, finish: number): any[] => {
      // Check if value and metadata exist before accessing
      if (!value || !value.metadata) {
        return [];
      }

      let end = finish;
      if (finish > value.metadata.length) {
        end = value.metadata.length;
      }
      return value.metadata.slice(start, end);
    },
    [value]
  );

  return (
    <div className={styles.Container}>
      <div
        className={clsx(styles.CellLabel, {
          [styles.Dense]: dense,
        })}
      >
        {value && value.annotationMeta && value.annotationMeta.annotated && (
          <StatusBadge status={getBadgeStatus(value)} />
        )}
        <div className={styles.TextLabel}>{getLabel()}</div>
        <IconButton
          onClick={() =>
            dispatch(
              updateUI({
                openMetadataDialog: true,
              })
            )
          }
          size="small"
          className={styles.ActionButton}
        >
          <SettingsEthernetRoundedIcon fontSize="small" />
        </IconButton>
      </div>
      {expanded && value && value.metadata && (
        <ExpandableList
          messageIfNoContent="Cell doesn't have any metadata"
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
            {getItems(3, value.metadata.length).map((item, index) => (
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
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState, props: any) => {
  return {
    reconciliator: selectReconciliatorCell(state, props),
  };
};

export default connect(mapStateToProps)(NormalCell);
