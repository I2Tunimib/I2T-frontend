import { ComponentType } from 'react';

export interface IRoute {
  path: string;
  exact: boolean;
  Component: ComponentType;
}
