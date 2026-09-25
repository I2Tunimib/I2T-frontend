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

    // Find and log CH Matching extender specifically
    const chMatching = response.data.extenders?.find(
      (e: any) => e.name === "CH Matching",
    );

    return response.data;
  },
);
