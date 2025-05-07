/* eslint-disable react/destructuring-assignment */
import { Box, IconButton, Stack } from "@mui/material";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import clsx from "clsx";
import { ButtonShortcut } from "@components/kit";
import { ColumnStatus } from "@store/slices/table/interfaces/table";
import { RootState } from "@store";
import { connect } from "react-redux";
import { selectColumnReconciliators } from "@store/slices/table/table.selectors";
import { forwardRef, MouseEvent, useCallback, useState } from "react";
import { capitalize } from "@services/utils/text-utils";
import { IconButtonTooltip, StatusBadge } from "@components/core";
import styled from "@emotion/styled";
import styles from "./TableHeaderCell.module.scss";
import TableHeaderCellExpanded from "./TableHeaderCellExpanded";

const SortButton = styled(IconButton)({});

const getKind = (kind: string) => {
  if (kind === "entity") {
    return (
      <ButtonShortcut
        text="E"
        tooltipText="Named Entity"
        size="xs"
        variant="flat"
        color="blue"
      />
    );
  }
  if (kind === "literal") {
    return (
      <ButtonShortcut
        text="L"
        tooltipText="Literal"
        size="xs"
        variant="flat"
        color="green"
      />
    );
  }
  return null;
};

/**
 * Table head cell.
 */
// eslint-disable-next-line no-undef
const TableHeaderCell = forwardRef<HTMLTableHeaderCellElement>(
  (
    {
      id,
      selected,
      expanded,
      children,
      handleCellRightClick,
      handleSelectedColumnChange,
      handleSelectedColumnCellChange,
      reconciliators,
      highlightState,
      sortType,
      setSortType,
      sortByProps,
      data,
      settings,
      isSorted,
      isSortedDesc,
      style,
    }: any,
    ref
  ) => {
    const [hover, setHover] = useState<boolean>(false);
    const { onClick: sortBy, ...restSortByProps } = sortByProps;

    const { lowerBound } = settings;

    const handleSortByClick = (event: any, type: string) => {
      setSortType(type);
      sortBy(event);
    };

    const handleSelectColumn = (event: MouseEvent) => {
      event.stopPropagation();
      handleSelectedColumnChange(event, id);
    };

    const getBadgeStatus = useCallback(
      (column: any) => {
        const {
          annotationMeta: { annotated, match, highestScore },
        } = column;

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

        if (
          annotated &&
          column.metadata.length > 0 &&
          column.metadata[0].entity &&
          column.metadata[0].entity.length === 0
        ) {
          return "miss";
        }

        const { isScoreLowerBoundEnabled, scoreLowerBound } = lowerBound;

        if (isScoreLowerBoundEnabled) {
          if (scoreLowerBound && highestScore < scoreLowerBound) {
            return "miss";
          }
        }
        return "warn";
      },
      [lowerBound]
    );

    return (
      <th
        ref={ref}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={(e) => handleSelectedColumnCellChange(e, id)}
        onContextMenu={(e) => handleCellRightClick(e, "column", id)}
        style={{
          borderTop:
            highlightState && highlightState.columns.includes(id)
              ? `2px solid ${highlightState.color}`
              : "",
          backgroundColor:
            highlightState && highlightState.columns.includes(id)
              ? `${highlightState.color}10`
              : "",
          ...(id !== "index" && style),
        }}
        className={clsx([
          styles.TableHeaderCell,
          {
            [styles.Selected]: selected,
            [styles.TableHeaderIndex]: id === "index",
          },
        ])}
      >
        <div className={styles.TableHeaderContent}>
          {id !== "index" ? (
            <>
              <IconButton
                onClick={handleSelectColumn}
                size="small"
                className={styles.ColumnSelectionButton}
                sx={{ marginBottom: 15 }}
              >
                <CheckCircleOutlineRoundedIcon fontSize="medium" />
              </IconButton>
              <div style={{ marginTop: 20 }} className={styles.Row}>
                <div className={styles.Column}>
                  <div className={styles.Row}>
                    {data.annotationMeta && data.annotationMeta.annotated && (
                      <StatusBadge
                        status={getBadgeStatus(data)}
                        size="small"
                        marginRight="5px"
                      />
                    )}
                    <Stack
                      sx={{
                        flex: "1 1 auto",
                        marginRight: "10px",
                      }}
                      alignItems="center"
                      direction="row"
                    >
                      <Box
                        sx={{
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {children}
                      </Box>
                      <SortButton
                        onClick={(e) => handleSortByClick(e, "sortByText")}
                        sx={{
                          visibility:
                            hover || (isSorted && sortType === "sortByText")
                              ? "visible"
                              : "hidden",
                          ...((!isSorted || sortType !== "sortByText") && {
                            color: "rgba(0, 0, 0, 0.377)",
                          }),
                        }}
                        size="small"
                        {...restSortByProps}
                        title=""
                      >
                        <SortByAlphaIcon fontSize="small" />
                      </SortButton>
                      <SortButton
                        onClick={(e) => handleSortByClick(e, "sortByMetadata")}
                        sx={{
                          visibility:
                            hover || (isSorted && sortType === "sortByMetadata")
                              ? "visible"
                              : "hidden",
                          ...((!isSorted || sortType !== "sortByMetadata") && {
                            color: "rgba(0, 0, 0, 0.377)",
                          }),
                        }}
                        size="small"
                        {...restSortByProps}
                        title=""
                      >
                        {sortType === "sortByMetadata" && isSortedDesc ? (
                          <ArrowDownwardRoundedIcon fontSize="small" />
                        ) : (
                          <ArrowUpwardRoundedIcon fontSize="small" />
                        )}
                      </SortButton>
                    </Stack>
                    {data.kind && getKind(data.kind)}
                    {data.role && (
                      <ButtonShortcut
                        className={styles.SubjectLabel}
                        tooltipText={capitalize(data.role)}
                        text={data.role[0].toUpperCase()}
                        variant="flat"
                        color="darkblue"
                        size="xs"
                      />
                    )}
                  </div>
                  {data.status === ColumnStatus.RECONCILIATED ? (
                    <Stack
                      sx={{
                        fontSize: "12px",
                      }}
                      direction="row"
                      gap="5px"
                      alignItems="center"
                    >
                      <LinkRoundedIcon />
                      {reconciliators
                        ? reconciliators.join(" | ")
                        : data.reconciliator}
                    </Stack>
                  ) : data.status === ColumnStatus.PENDING ? (
                    <Stack
                      sx={{
                        fontSize: "12px",
                      }}
                      direction="row"
                      gap="5px"
                      alignItems="center"
                    >
                      <LinkRoundedIcon />
                      Partial annotation
                    </Stack>
                  ) : null}
                </div>
                {expanded && <TableHeaderCellExpanded {...data} />}
              </div>
            </>
          ) : (
            <>{children}</>
          )}
        </div>
      </th>
    );
  }
);

const mapStateToProps = (state: RootState, props: any) => {
  return {
    reconciliators: selectColumnReconciliators(state, props),
  };
};

export default connect(mapStateToProps, null, null, { forwardRef: true })(
  TableHeaderCell
);
