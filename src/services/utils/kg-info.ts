import axios from "axios";

type KGInfoEntry = {
  uri: string;
  groupName?: string;
};

export const KG_INFO: Record<string, KGInfoEntry> = {
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
    uri: "https://www.openstreetmap.org/{osmType}/{osmId}",
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

export async function fetchTypeAndDescription(
  prefix: string,
  id: string,
  label?: string,
) {
  const base = import.meta.env.VITE_BACKEND_API_URL;
  let res;
  try {
    if (prefix === "wd" || prefix === "wdA") {
      res = await fetch(`${base}/metadata/wikidata?id=${id}`);
      return await res.json();
    }
    if (prefix === "wdL") {
      res = await fetch(
        `${base}/metadata/lionlinker?id=${id}&label=${encodeURIComponent(label || "")}`,
      );
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
    return { name: "", description: "", type: [] };
  } catch (err) {
    console.error("fetchTypeAndDescription frontend error:", err);
    return { name: "", description: "", type: [] };
  }
}

export async function searchQudtUnits(searchTerm, limit = 20) {
  if (!searchTerm) return [];
  const qudtEndpoint = import.meta.env.VITE_QUDT_SPARQL_ENDPOINT;

  const query = `
    PREFIX qudt: <http://qudt.org/schema/qudt/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    
    SELECT DISTINCT ?unit ?label WHERE {
      ?unit a qudt:Unit .
      ?unit rdfs:label ?label .
      FILTER(lang(?label) = "en")
      FILTER(CONTAINS(LCASE(STR(?label)), LCASE("${searchTerm}")))
    }
    ORDER BY ASC(STRLEN(STR(?label)))
    LIMIT ${limit}
  `;

  try {
    const response = await axios.get(qudtEndpoint, {
      params: { query, format: "json" },
      timeout: 10000
    });

    return response.data.results.bindings.map((b) => {
      const fullUri = b.unit.value;
      const parts = fullUri.split('/');
      const id = parts.pop();
      const prefix = parts.pop();

      return {
        id: `${prefix}:${id}`,
        label: b.label.value,
        uri: fullUri
      };
    });
  } catch (error) {
    console.error("QUDT Unit Search error:", error);
    return [];
  }
}
