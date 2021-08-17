import { ReactNode } from 'react';

export interface ISimpleColumn {
  id: string;
  content: string | ReactNode
}

export interface ISimpleRow extends Record<string, ISimpleCell> { }

export interface ISimpleCell {
  content: string | ReactNode;
}
