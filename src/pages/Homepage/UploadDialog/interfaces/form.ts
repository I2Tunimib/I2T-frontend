import { CsvSeparator } from '@services/converters/csv-converter';
import { FileFormat } from '@store/slices/table/interfaces/table';

/**
 * Form state.
 */
export interface FormState {
  challengeTable: boolean;
  action: ActionType;
  files: FormFile[];
}

/**
 * Form file field.
 */
export interface FormFile {
  fileName: string;
  fileExtension: FileFormat;
  separator: CsvSeparator;
  original: File;
  type: NormalTableType | ChallengeTableType;
}

/**
 * Form select option.
 */
export interface SelectOption<T> {
  label: string;
  value: T;
  secondaryText?: string;
}

/**
 * Options for action type.
 */
export enum ActionType {
  UPLOAD = 'upload',
  LOAD = 'load'
}

/**
 * Options for types of a normal table.
 */
export enum NormalTableType {
  RAW = 'raw',
  ANNOTATED = 'annotated'
}

/**
 * Options for types of a challenge table.
 */
export enum ChallengeTableType {
  DATA = 'data',
  CEA = 'cea',
  CPA = 'cpa',
  CTA = 'cta'
}
