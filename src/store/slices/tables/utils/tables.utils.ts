import { Draft } from '@reduxjs/toolkit';
import { TablesState } from '../interfaces/tables';

export const orderTablesByDate = (state: Draft<TablesState>, tables: 'raw' | 'annotated') => {
  return [...state.entities[tables].allIds.sort((a, b) => {
    const dateA = new Date(state.entities[tables].byId[a].lastModifiedDate);
    const dateB = new Date(state.entities[tables].byId[b].lastModifiedDate);
    return +dateA - +dateB;
  })];
};

export const orderTablesArray = (
  state: Draft<TablesState>, tables: 'raw' | 'annotated',
  property: string, order: 'asc' | 'desc'
) => {
  if (property === 'name') {
    if (order === 'asc') {
      state.entities[tables].allIds.sort();
    } else {
      state.entities[tables].allIds.sort().reverse();
    }
  } else {
    if (order === 'asc') {
      state.entities[tables].allIds = orderTablesByDate(state, tables).reverse();
    } else {
      state.entities[tables].allIds = orderTablesByDate(state, tables);
    }
  }
};
