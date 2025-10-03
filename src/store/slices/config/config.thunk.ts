import { createAsyncThunk } from "@reduxjs/toolkit";
import configAPI from "@services/api/config";

const ACTION_PREFIX = "config";

export enum ConfigEndpoints {
  GET_CONFIG = "getConfig",
}

export const getConfig = createAsyncThunk(
  `${ACTION_PREFIX}/getConfig`,
  async () => {
    const response = await configAPI.getConfig();
    return response.data;
  }
);
