import apiClient from "./config/config";
import { apiEndpoint } from "../../configHelpers";

const usersAPI = {
  search: (query: string, role?: string) => {
    const base = apiEndpoint({
      endpoint: "SEARCH_USERS",
      paramsValue: { query },
    });
    const url = role ? `${base}&role=${encodeURIComponent(role)}` : base;
    return apiClient.get(url);
  },
};

export default usersAPI;
