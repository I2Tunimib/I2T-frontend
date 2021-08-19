import { AsyncThunk } from '@reduxjs/toolkit';

export interface IRequest {
  status: string;
  error: any;
}

export interface IRequestState {
  requests: {
    byId: {
      [key: string]: IRequest;
    }
    allIds: string[];
  }
}

type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>
export type PendingAction = ReturnType<GenericAsyncThunk['pending']>
export type RejectedAction = ReturnType<GenericAsyncThunk['rejected']>
export type FulfilledAction = ReturnType<GenericAsyncThunk['fulfilled']>
