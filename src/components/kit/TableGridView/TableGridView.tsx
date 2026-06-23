import { FC, ReactNode } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  Stack,
  Typography,
} from '@mui/material';
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import { CELL_COMPONENTS_TYPES } from '@pages/Dashboard/cellComponentsConfig';
import { Link } from 'react-router-dom';
import styles from './TableGridView.module.scss';

interface TableCardViewProps {
  table: any;
  datasetId: string | number;
  action: ReactNode;
  graphSnapshot: string;
}

const TableGridView: FC<TableCardViewProps> = ({ table, datasetId, action, graphSnapshot }) => {
  const typesPercentage = (valueData: any) => {
    if (!valueData) return null;
    const mockCell = {
      getValue: () => valueData,
      row: { original: table }
    } as any;
    return CELL_COMPONENTS_TYPES.percentage.component(mockCell, {
      value: valueData,
      props: {}
    });
  };

  return (
    <Card variant="outlined" className={styles.card}>
      <CardActionArea
        component={Link}
        to={`/datasets/${datasetId}/tables/${table.id}?view=graph`}
        className={styles.cardAction}
        sx={{ flexDirection: "column", alignItems: "stretch" }}
      >
        <CardContent className={styles.cardContent}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
            <Stack direction="column" gap="8px" className={styles.headerContainer}>
              <Typography
                variant="h6"
                noWrap
                className={styles.tableName}
                title={table.name}
              >
                {table.name}
              </Typography>
              <Stack direction="row" alignItems="center" gap="8px">
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Header Types:
                </Typography>
                {typesPercentage(table.headerTypeMatching)}
              </Stack>
            </Stack>
            {action}
          </Stack>
          <Stack direction="column" gap="8px">
            <Stack direction="row" alignItems="center" gap="8px" color="text.secondary">
              <ViewListRoundedIcon fontSize="inherit" className={styles.columnsIcon} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Columns ({table.nCols || 0})
              </Typography>
            </Stack>
            <Box className={styles.columnsBox}>
              <Typography variant="caption" color="text.secondary" className={styles.columnsText}>
                {table.graph?.nodes?.length > 0
                  ? table.graph.nodes.map((node: any) => node.id).join(", ")
                  : "No explicit columns metadata loaded"}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="column" gap="8px">
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              Graph Preview
            </Typography>
            <Box className={styles.graphContainer}>
              <img
                src={graphSnapshot}
                alt={`Graph snapshot for ${table.name}`}
                className={styles.graphImage}
              />
            </Box>
          </Stack>
        </CardContent>
      </CardActionArea>
      <Box>
        {action}
      </Box>
    </Card>
  );
};

export default TableGridView;
