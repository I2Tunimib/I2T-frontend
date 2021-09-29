import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@store';

const selectActionState = (state: RootState) => state.action.action;

export const selectOnExpandAction = createSelector(
  selectActionState,
  (action) => (action.startsWith('table/updateSelectedCellExpanded') ? action : '')
);
