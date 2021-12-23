import styled from '@emotion/styled';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { FC, useEffect, useRef, useState } from 'react';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

export type MultipleSelectChipsProps = {
  items: string[];
  onChange?: (items: string[]) => void;
}

type GroupChipsState = {
  initial: string;
  chips: ChipState[];
}
type ChipState = {
  label: string;
  selected: boolean;
}

const Header = styled(Typography)({
  position: 'sticky',
  top: 0,
  zIndex: 10,
  backgroundColor: '#FFF',
  borderBottom: '1px solid #ededed'
});

const SelectableChip = styled(Chip)<{ selected: boolean }>(({ selected }) => ({
  ...(selected && {
    backgroundColor: 'var(--brand-color-one-base)',
    color: '#FFF',
    '&:hover': {
      backgroundColor: 'var(--brand-color-one-dark)'
    }
  })
}));

const MultipleSelectChips: FC<MultipleSelectChipsProps> = ({
  items,
  onChange
}) => {
  const [state, setState] = useState<GroupChipsState[]>([]);

  const firstUpdate = useRef(true);

  useEffect(() => {
    if (items.length > 0) {
      setState(() => {
        const groups = items.reduce((acc, item, index) => {
          if (index > 0) {
            const prevChar = items[index - 1].charAt(0);
            const currentChar = item.charAt(0);
            if (currentChar !== prevChar) {
              acc[currentChar] = [
                { label: item, selected: false }
              ];
            } else {
              acc[currentChar] = [
                ...acc[currentChar],
                { label: item, selected: false }
              ];
            }
          } else {
            acc[item.charAt(0)] = [
              { label: item, selected: false }
            ];
          }
          return acc;
        }, {} as Record<string, ChipState[]>);

        return Object.keys(groups).map((initial) => ({
          initial,
          chips: groups[initial]
        }));

        // return items.map((item) => ({
        //   label: item,
        //   selected: false
        // }));
      });
    }
  }, [items]);

  const handleClick = (chipGroup: GroupChipsState, chip: ChipState) => {
    setState((oldState) => {
      return oldState.map((group) => {
        if (group.initial === chipGroup.initial) {
          return {
            ...group,
            chips: group.chips.map((item) => {
              if (item.label === chip.label) {
                return { ...item, selected: !item.selected };
              }
              return item;
            })
          };
        }
        return group;
      });
    });
  };

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    if (onChange) {
      const selected = state.reduce((acc, group) => {
        return acc.concat(group.chips.reduce((accChips, item) => {
          if (item.selected) {
            return accChips.concat(item.label);
          }
          return accChips;
        }, [] as string[]));
      }, [] as string[]);
      onChange(selected);
    }
  }, [state, onChange]);

  return state.length > 0 ? (
    <Stack
      sx={{
        maxHeight: '350px',
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          height: '4px',
          width: '4px'
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(0,0,0,.20)'
        }
      }}>
      {state.map((chipGroup) => (
        <Stack key={chipGroup.initial}>
          <Header>{chipGroup.initial.toUpperCase()}</Header>
          <Stack direction="row" flexWrap="wrap" padding="12px 8px" gap="8px">
            {chipGroup.chips.map((chip) => (
              <SelectableChip
                label={chip.label}
                key={chip.label}
                size="small"
                onClick={() => handleClick(chipGroup, chip)}
                selected={chip.selected}
              />
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>
  ) : null;
};

export default MultipleSelectChips;
