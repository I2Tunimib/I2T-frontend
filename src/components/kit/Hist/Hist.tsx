import styled from '@emotion/styled';
import { Box, darken, Stack, Tooltip, Typography } from '@mui/material';
import { FC, useMemo } from 'react';

export type HistProps = {
  groups: HistGroup[];
}

export type HistGroup = {
  name: string;
  subgroups: HistSubgroup[];
}

export type HistSubgroup = {
  name: string;
  value: number;
  color?: string;
}

type HistGroupInternal = {
  name: string;
  subgroups: HistSubgroupInternal[];
}

type HistSubgroupInternal = {
  name: string;
  value: {
    percentage: number,
    n: number
  };
  color?: string;
}

const Bar = styled.div<Omit<HistSubgroupInternal, 'name'>>(({ value, color = '#F0F1F3' }) => ({
  width: '50px',
  height: `${value.percentage}px`,
  backgroundColor: color,
  marginTop: 'auto',
  transition: 'all 250ms ease-out',
  boxSizing: 'border-box',
  ...(value.percentage > 0 && {
    border: '2px solid transparent',
    '&:hover': {
      backgroundColor: darken(color, 0.2),
      borderColor: darken(color, 0.5)
    }
  })
}));

const HistBar: FC<HistGroupInternal> = ({
  name,
  subgroups
}) => {
  return (
    <Stack
      position="relative"
      marginTop="auto">
      <Stack
        sx={{
          overflow: 'hidden'
        }}>
        {subgroups.map(({ name: subgroupName, ...rest }) => (
          <Tooltip
            key={subgroupName}
            title={(
              <Stack>
                <Typography variant="caption">{subgroupName}</Typography>
                {`${rest.value.percentage.toFixed(2)}% (${rest.value.n})`}
              </Stack>
            )}
            placement="left"
            arrow>
            <Bar key={subgroupName} {...rest} />
          </Tooltip>
        ))}
      </Stack>
      <Typography
        sx={{
          position: 'absolute',
          bottom: '-25px',
          whiteSpace: 'nowrap',
          alignSelf: 'center'
        }}
        variant="caption">
        {name}
      </Typography>
      <Typography
        sx={{
          position: 'absolute',
          top: '-25px',
          whiteSpace: 'nowrap',
          alignSelf: 'center'
        }}
        variant="caption">
        {`${subgroups.reduce((acc, subgroup) => acc + subgroup.value.percentage, 0).toFixed(2)}%`}
      </Typography>
    </Stack>
  );
};

const Hist: FC<HistProps> = ({ groups: groupsProps }) => {
  const { total, groups } = useMemo(() => {
    const tot = groupsProps.reduce((acc, { subgroups }) => {
      return acc + subgroups.reduce((accInner, subgroup) => accInner + subgroup.value, 0);
    }, 0);
    const processedGroups = groupsProps.map((group) => ({
      ...group,
      subgroups: group.subgroups
        .map((subgroup) => ({
          ...subgroup,
          value: {
            percentage: (subgroup.value / tot) * 100,
            n: subgroup.value
          }
        }))
    }));

    return {
      total: tot,
      groups: processedGroups
    };
  }, [groupsProps]);

  return (
    <Stack height="150px" padding="24px">
      <Stack height="100%" direction="row" gap="40px" alignSelf="center">
        {groups.map((group) => (
          <HistBar key={group.name} {...group} />
        ))}
      </Stack>
      <Box sx={{ height: '1px', width: '80%', backgroundColor: '#F0F1F3', alignSelf: 'center' }} />
    </Stack>
  );
};

export default Hist;
