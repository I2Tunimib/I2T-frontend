import apiClient from "./config/config";
import { apiEndpoint } from "../../configHelpers";

const getAuthHeader = (): Record<string, string> => {
  const kcToken =
    typeof localStorage !== "undefined" && localStorage.getItem("kc_token");
  const legacyToken =
    typeof localStorage !== "undefined" && localStorage.getItem("token");
  const token = kcToken || legacyToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const usersAPI = {
  search: (query: string, role?: string) => {
    const base = apiEndpoint({
      endpoint: "SEARCH_USERS",
      paramsValue: { query },
    });
    const url = role ? `${base}&role=${encodeURIComponent(role)}` : base;
    return apiClient.get(url, { headers: { ...getAuthHeader() } });
  },
};

export default usersAPI;
