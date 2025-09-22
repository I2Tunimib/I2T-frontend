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
    console.log("Backend config response:", {
      status: response.status,
      data: response.data,
      dataKeys: response.data ? Object.keys(response.data) : "no data",
    });
    return response.data;
  }
);
