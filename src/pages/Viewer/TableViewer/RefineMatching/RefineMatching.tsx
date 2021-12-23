import { CheckboxGroup, CheckboxGroupCompact, MenuBase } from '@components/core';
import MultipleSelectChips from '@components/core/MultipleSelectChip';
import { Hist } from '@components/kit';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { Button, PopperPlacementType, Stack, Typography } from '@mui/material';
import partition from '@services/utils/partition';
import { BaseMetadata, Cell } from '@store/slices/table/interfaces/table';
import { selectCellRefinement, selectSelectedCells, selectSelectedCellsTypes } from '@store/slices/table/table.selectors';
import { refineMatching } from '@store/slices/table/table.slice';
import { FC, useState, useEffect, useCallback, useMemo } from 'react';

export type RefineMatchingProps = {
  open: boolean;
  anchorElement: any;
  handleClose: () => void;
  id?: string;
  placement?: PopperPlacementType | undefined;
}

export type ItemsToMatch = {
  cellId: string;
  metaItemId?: string;
}

const ITEMS = [
  { label: 'Matching-manual', value: 'matchingManual', checked: false },
  { label: 'Matching-refinement', value: 'matchingRefinement', checked: false },
  { label: 'Matching-reconciliator', value: 'matchingReconciliator', checked: false },
  { label: 'Not matching', value: 'notMatching', checked: true }
];

const HIST_GROUPS_MATCHING = [
  { id: 'matchingRefinement', name: 'Matching refinement', color: '#3584e4' },
  { id: 'matchingManual', name: 'Matching manual', color: '#1B74E4' },
  { id: 'matchingReconciliator', name: 'Matching reconciliator', color: '#056be7' }
];

const HIST_GROUPS_NOT_MATCHING = [
  { id: 'notMatching', name: '' }
];

const findMatchingMetadata = (metadata: BaseMetadata[], types: string[]) => {
  return metadata.find((metaItem) => {
    if (!metaItem.type || metaItem.type.length === 0) {
      return false;
    }
    return metaItem.type
      .some((typeItem) => types.includes((typeItem.name as unknown as string).toLowerCase()));
  });
};

type CurrentGroupsState = {
  groups: ReturnType<typeof selectCellRefinement>,
  changes: ItemsToMatch[]
}

const RefineMatching: FC<RefineMatchingProps> = ({
  open,
  anchorElement,
  handleClose
}) => {
  const [currentGroups, setCurrentGroup] = useState<CurrentGroupsState | null>(null);
  const [filters, setFilters] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const selectedCellsGroups = useAppSelector(selectCellRefinement);
  const selectedTypes = useAppSelector(selectSelectedCellsTypes);
  const dispatch = useAppDispatch();

  const makeData = useCallback(() => {
    if (filters.length === 0 || types.length === 0) {
      return {
        groups: selectedCellsGroups,
        changes: []
      };
    }

    const newCellsGroups = {
      matchingManual: [...selectedCellsGroups.matchingManual],
      matchingReconciliator: [...selectedCellsGroups.matchingReconciliator],
      matchingRefinement: [...selectedCellsGroups.matchingRefinement],
      notMatching: [...selectedCellsGroups.notMatching]
    };
    const changes = [] as ItemsToMatch[];

    filters.forEach((filter) => {
      const group = selectedCellsGroups[filter as keyof typeof selectedCellsGroups];
      newCellsGroups[filter as keyof typeof selectedCellsGroups] = [];
      group.forEach((cell) => {
        if (cell.annotationMeta && cell.annotationMeta.annotated) {
          const sortedMeta = [...cell.metadata].sort((a, b) => {
            if (!a || !b) {
              return -1;
            }
            return b.score - a.score;
          });

          const matchedMetadata = findMatchingMetadata(sortedMeta, types);

          if (matchedMetadata) {
            newCellsGroups.matchingRefinement.push(cell);
            changes.push({
              cellId: cell.id,
              metaItemId: matchedMetadata.id
            });
          } else {
            newCellsGroups.notMatching.push(cell);
            if (cell.annotationMeta.match.value) {
              changes.push({
                cellId: cell.id
              });
            }
          }
        }
      });
    });

    return {
      groups: newCellsGroups,
      changes
    };
  }, [selectedCellsGroups, filters, types]);

  const handleTypeChange = useCallback((currentTypes: string[]) => {
    setTypes(currentTypes);
  }, []);

  useEffect(() => {
    setCurrentGroup(makeData());
  }, [selectedCellsGroups, filters, types]);

  const handleCellTypeChange = useCallback((items: string[]) => {
    setFilters(items);
  }, []);

  const handleConfirm = () => {
    if (currentGroups) {
      dispatch(refineMatching({ changes: currentGroups.changes }));
    }
  };

  const groups = useMemo(() => {
    if (currentGroups) {
      return [
        {
          name: 'Matching',
          subgroups: HIST_GROUPS_MATCHING.map(({ id, ...subgroup }) => ({
            ...subgroup,
            value: currentGroups.groups[id as keyof CurrentGroupsState['groups']].length
          }))
        },
        {
          name: 'Not matching',
          subgroups: HIST_GROUPS_NOT_MATCHING.map(({ id, ...subgroup }) => ({
            ...subgroup,
            value: currentGroups.groups[id as keyof CurrentGroupsState['groups']].length
          }))
        }
      ];
    }
  }, [currentGroups]);

  return (
    <MenuBase
      open={open}
      anchorElement={anchorElement}
      handleClose={handleClose}>
      <Stack padding="10px" maxWidth="400px">
        <Typography variant="h6" gutterBottom>
          Refine matching
        </Typography>
        <Typography color="textSecondary" gutterBottom>Select which kind of cells to refine:</Typography>
        <CheckboxGroupCompact items={ITEMS} onChange={handleCellTypeChange} />
        {groups && <Hist groups={groups} />}
        <MultipleSelectChips items={selectedTypes} onChange={handleTypeChange} />
      </Stack>
      <Stack direction="row" gap="10px" padding="10px" justifyContent="flex-end">
        <Button color="primary">Cancel</Button>
        <Button color="primary" onClick={handleConfirm}>Confirm</Button>
      </Stack>
    </MenuBase>
  );
};

export default RefineMatching;
