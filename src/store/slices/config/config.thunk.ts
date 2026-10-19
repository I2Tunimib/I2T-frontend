import { createAsyncThunk } from "@reduxjs/toolkit";
import configAPI from "@services/api/config";

const ACTION_PREFIX = "config";

export const getConfig = createAsyncThunk(
  `${ACTION_PREFIX}/getConfig`,
  () => configAPI.getConfig(),
);
