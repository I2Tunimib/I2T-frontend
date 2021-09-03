import { FormControl, MenuItem, Select } from '@material-ui/core';
import { ChangeEvent, useState, useEffect } from 'react';
import { useAppDispatch } from '@hooks/store';
import { getTableNames } from '@store/slices/table/table.thunk';
import Paper from '@material-ui/core/Paper';
import SelectTable from '../SelectTable';
import UploadTable from '../UploadTable';
import styles from './LoadData.module.scss';

const LoadData = () => {
  const dispatch = useAppDispatch();
  // current data source selected
  const [dataSource, setDataSource] = useState('tables');
  // current table name
  const [tables, setTables] = useState<string[]>([]);
  // current table selected
  const [selectedTable, setSelectedTable] = useState<string>();

  useEffect(() => {
    let mounted = true;
    if (dataSource !== 'fs') {
      dispatch(getTableNames(dataSource))
        .unwrap()
        .then((result) => {
          if (mounted) {
            // handle result here
            setTables(result.data);
            setSelectedTable(result.data[0]);
          }
        })
        .catch((rejectedValueOrSerializedError) => {
          // handle error here
        });
    }
    return () => {
      mounted = false;
    };
  }, [dataSource]);

  const handleChangeDataSource = (event: ChangeEvent<{ value: unknown }>) => {
    setDataSource(event.target.value as string);
  };

  const handleChangeTable = (event: ChangeEvent<{ value: unknown }>) => {
    setSelectedTable(event.target.value as string);
  };

  return (
    <div className={styles.Container}>
      <Paper className={styles.Card} variant="outlined">
        <p>Where do you want to upload the data from?</p>
        <FormControl className="field">
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={dataSource}
            onChange={handleChangeDataSource}
            variant="outlined"
          >
            <MenuItem value="tables">Table server (raw tables)</MenuItem>
            <MenuItem value="saved">Table server (annotated tables)</MenuItem>
            <MenuItem value="fs">File system (csv or json)</MenuItem>
          </Select>
        </FormControl>
      </Paper>
      <Paper className={styles.Card} variant="outlined">
        {dataSource !== 'fs' && <p>Choose from available tables</p>}
        {dataSource !== 'fs' && selectedTable
          ? (
            <SelectTable
              value={selectedTable}
              options={tables}
              onChange={(e) => handleChangeTable(e)}
            />
          ) : <UploadTable />}
      </Paper>
    </div>
  );
};

export default LoadData;
