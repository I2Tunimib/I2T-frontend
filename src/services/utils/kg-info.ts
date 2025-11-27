export const KG_INFO = {
  cr: {
    uri: "",
    groupName: "In-Table Linking",
  },
  wd: {
    uri: "https://www.wikidata.org/wiki/",
    groupName: "Wikidata",
  },
  wdL: {
    uri: "https://www.wikidata.org/wiki/",
    groupName: "Wikidata",
  },
  wdA: {
    uri: "https://www.wikidata.org/wiki/",
    groupName: "Wikidata",
  },
  wiki: {
    uri: "https://www.wikidata.org/wiki/",
    groupName: "Wikidata",
  },
  dbp: {
    uri: "https://dbpedia.org/page/",
    groupName: "dbPedia",
  },
  geo: {
    uri: "http://www.geonames.org/",
    groupName: "GeoNames",
  },
  geoCoord: {
    uri: "http://20.8.170.217:3002/geocoords",
    groupName: "geoCoding",
  },
  georss: {
    uri: "http://149.132.176.67:3002/map?polyline=",
    groupName: "geoCoding",
  },
  atoka: {
    uri: "https://atoka.io/public/en/company/-/",
  },
  maps: {
    uri: "http://www.google.com/maps/place/",
    groupName: "Geo Coordinates",
  },
  atokaPeople: {
    uri: "https://atoka.io/public/en/people/-/",
  },
};

export const getGroupFromId = (id: string): string => {
  if (Object.keys(KG_INFO).includes(id)) {
    return KG_INFO[id].groupName;
  } else {
    return "";
  }
};
export const getGroupFromUri = (uri: string): string => {
  const keys = Object.keys(KG_INFO);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (KG_INFO[key].uri.includes(uri)) {
      return KG_INFO[key].groupName;
    }
  }
  return "";
};

export const getPrefixIfAvailable = (uri: string, id: string): string => {
  const prefixSplit = id.split(":");
  let prefix;
  if (prefixSplit.length > 1) {
    prefix = prefixSplit[0];
  } else {
    const mainUrls = Object.keys(KG_INFO)
      .map((item) => {
        //@ts-ignore
        const fullUrl = KG_INFO[item].uri;
        try {
          const url = new URL(fullUrl);
          return url.origin; // Get the main URL (e.g., https://atoka.io)
        } catch (error) {
          console.error(`Invalid URL: ${fullUrl}`, error);
          return null;
        }
      })
      .filter(Boolean);
    const matchingUrl = mainUrls.find((url) => uri?.startsWith(url));
    const keys = Object.keys(KG_INFO);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      console.log("key", key);
      if (KG_INFO[key].uri.includes(matchingUrl)) {
        prefix = key + ":";
        break;
      }
    }
  }
  if (!prefix) {
    return "";
  } else {
    return prefix;
  }
};

export async function fetchTypeAndDescription(prefix: string, id: string, label?: string) {
  const base = import.meta.env.VITE_BACKEND_API_URL;
  let res;
  try {
    if (prefix === "wd" || prefix === "wdA") {
      res = await fetch(`${base}/metadata/wikidata?id=${id}`);
      return await res.json();
    }
    if (prefix === "wdL") {
      res = await fetch(`${base}/metadata/lionlinker?id=${id}&label=${encodeURIComponent(label || "")}`);
      return await res.json();
    }
    if (prefix === "geo") {
      res = await fetch(`${base}/metadata/geonames?id=${id}`);
      return await res.json();
    }
    if (prefix === "geoCoord") {
      res = await fetch(`${base}/metadata/geonamesCoordinates?id=${id}`);
      return await res.json();
    }
    return { description: "", type: [] };
  } catch (err) {
    console.error("fetchTypeAndDescription frontend error:", err);
    return { description: "", type: [] };
  }
}
