export const KG_INFO = {
  geo: {
    uri: "http://www.geonames.org/",
    groupName: "",
  },
  dbp: {
    uri: "https://dbpedia.org/page/",
  },
  wd: {
    uri: "https://www.wikidata.org/wiki/",
  },
  wiki: {
    uri: "https://www.wikidata.org/wiki/",
  },
  geoCoord: {
    uri: "http://20.8.170.217:3002/geocoords",
  },
  georss: {
    uri: "http://149.132.176.67:3002/map?polyline=",
  },
  atoka: {
    uri: "https://atoka.io/public/en/company/-/",
  },
  atokaPeople: {
    uri: "https://atoka.io/public/en/people/-/",
  },
};

export const getPrefixIfAvailable = (uri: string, id: string): string => {
  let prefixSplit = id.split(":");
  let prefix = null;
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
