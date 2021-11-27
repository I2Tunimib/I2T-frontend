import { Box, Dialog, DialogProps, Tab, Tabs, Typography } from '@mui/material';
import { FC, ReactNode, SyntheticEvent, useState } from 'react';
import TypeTab from './TypeTab';

type TabPanelProps = {
  children?: ReactNode;
  index: number;
  value: number;
}

const TabPanel: FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box padding="10px">
          {children}
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  };
};

const Content = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <>
      <Tabs
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: '#FFF'
        }}
        value={value}
        onChange={handleChange}>
        <Tab label="Types" {...a11yProps(0)} />
        <Tab label="Properties" {...a11yProps(1)} />
        <Tab label="Entities" {...a11yProps(2)} />
      </Tabs>
      <TabPanel value={value} index={0}>
        <TypeTab />
      </TabPanel>
      <TabPanel value={value} index={1}>
        Item Two
      </TabPanel>
      <TabPanel value={value} index={2}>
        Item Three
      </TabPanel>
    </>
  );
};

const MetadataColumnDialog: FC<DialogProps> = ({
  maxWidth = 'lg',
  ...props
}) => {
  return (
    <Dialog
      maxWidth={maxWidth}
      {...props}>
      <Content />
    </Dialog>
  );
};

export default MetadataColumnDialog;
