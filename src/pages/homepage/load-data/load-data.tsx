import { FormControl, MenuItem, Select } from '@material-ui/core';
import { ChangeEvent, useState, useEffect } from 'react';
import { tableNamesEndpoint, ITableNamesResponse } from '@services/api/endpoints/table';
import { useFetch } from '@hooks/fetch';
import Paper from '@material-ui/core/Paper';
import styles from './load-data.module.scss';
import SelectTable from '../select-table/select-table';
import UploadTable from '../upload-table/upload-table';

const LoadData = () => {
  // current data source selected
  const [dataSource, setDataSource] = useState('tables');
  // set skip fetch
  const [skip, setSkip] = useState(false);
  // table names for current data source
  const {
    response
  } = useFetch<ITableNamesResponse>(
    tableNamesEndpoint(dataSource),
    { manual: skip }
  );
  // current table selected
  const [currentTable, setCurrentTable] = useState<string>();

  useEffect(() => {
    // when data changes set initial value of select
    if (response) {
      setCurrentTable(response.data[0]);
    }
  }, [response]);

  const handleChangeDataSource = (event: ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string;
    if (value === 'fs') {
      // do not fetch tables if selected option is file system
      setSkip(true);
    } else {
      setSkip(false);
    }
    setDataSource(value);
  };

  const handleChangeTable = (event: ChangeEvent<{ value: unknown }>) => {
    setCurrentTable(event.target.value as string);
  };

  return (
    <div className={styles.container}>
      <Paper className={styles.card} variant="outlined">
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
      <Paper className={styles.card} variant="outlined">
        {dataSource !== 'fs' && <p>Choose from available tables</p>}
        {dataSource !== 'fs' && currentTable
          ? (
            <SelectTable
              value={currentTable}
              options={response && response.data}
              onChange={(e) => handleChangeTable(e)}
            />
          ) : <UploadTable />}
      </Paper>
    </div>
  );
};

export default LoadData;
