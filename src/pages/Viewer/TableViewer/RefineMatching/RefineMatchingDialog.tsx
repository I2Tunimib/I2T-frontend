import { MenuBase } from '@components/core';
import { Box, PopperPlacementType, Stack, Tab, Tabs, Typography } from '@mui/material';
import { FC, ReactNode, SyntheticEvent, useState } from 'react';
import ScoreRefineMatching from './ScoreRefineMatching';
import TypeRefineMatching from './TypeRefineMatching';

export type RefineMatchingProps = {
  open: boolean;
  anchorElement: any;
  handleClose: () => void;
  id?: string;
  placement?: PopperPlacementType | undefined;
}

type TabPanelProps = {
  children?: ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
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
        <>
          {children}
        </>
      )}
    </div>
  );
};

const RefineMatchingDialog: FC<RefineMatchingProps> = ({
  open,
  anchorElement,
  handleClose
}) => {
  const [value, setValue] = useState(0);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <MenuBase
      open={open}
      anchorElement={anchorElement}
      handleClose={handleClose}>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="Type Refine Matching" />
            <Tab label="Score Refine Matching" />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <TypeRefineMatching handleClose={handleClose} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <ScoreRefineMatching handleClose={handleClose} />
        </TabPanel>
      </Box>
    </MenuBase>
  );
};

export default RefineMatchingDialog;
