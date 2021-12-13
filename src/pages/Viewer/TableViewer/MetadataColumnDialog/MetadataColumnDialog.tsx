import { Box, Dialog, DialogProps, Stack, Tab, Tabs, Typography } from '@mui/material';
import { FC, ReactNode, SyntheticEvent, useState } from 'react';
import EntityTab from './EntityTab';
import TypeTab from './TypeTab';

type TabPanelProps = {
  children?: ReactNode;
  index: number;
  value: number;
}

const TabPanel: FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return value === index ? (
    <Stack
      flexGrow={1}
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      <Stack flexGrow={1}>
        {children}
      </Stack>
    </Stack>
  ) : null;
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
    <Stack>
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
      <Stack minHeight="600px">
        <TabPanel value={value} index={0}>
          <TypeTab />
        </TabPanel>
        <TabPanel value={value} index={1}>
          Item Two
        </TabPanel>
        <TabPanel value={value} index={2}>
          <EntityTab />
        </TabPanel>
      </Stack>
    </Stack>
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
