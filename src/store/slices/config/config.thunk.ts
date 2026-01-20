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
    console.log("=== Frontend: Received Config from Backend ===");
    console.log("Total extenders:", response.data.extenders?.length || 0);

    // Find and log CH Matching extender specifically
    const chMatching = response.data.extenders?.find(
      (e: any) => e.name === "CH Matching",
    );
    if (chMatching) {
      console.log("CH Matching extender received:", {
        id: chMatching.id,
        name: chMatching.name,
        skipFiltering: chMatching.skipFiltering,
        allValues: chMatching.allValues,
        hasSkipFiltering: "skipFiltering" in chMatching,
        hasAllValues: "allValues" in chMatching,
      });
      console.log("Full CH Matching config:", chMatching);
    } else {
      console.warn("CH Matching extender NOT found in config response!");
    }

    return response.data;
  },
);
