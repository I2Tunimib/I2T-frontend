import { isValidWikidataId, stripWikidataPrefix } from "./regexs";

type QueryParams = {
  [key: string]: string | number | undefined;
};

// Function to build a URI
export const buildURI = (
  baseUrl: string,
  path: string,
  queryParams?: QueryParams,
) => {
  console.log("called build uri", path, baseUrl);
  const url = new URL(path, baseUrl);

  if (queryParams) {
    const searchParams = new URLSearchParams();

    // Append each key-value pair to the search parameters
    Object.keys(queryParams).forEach((key) => {
      const value = queryParams[key];
      if (value !== undefined) {
        searchParams.append(key, String(value)); // Convert numbers to strings
      }
    });

    url.search = searchParams.toString();
  }
  console.log("uri built: ", url.toString());
  return url.toString();
};
/*
// Example usage:
const baseUrl = 'https://api.example.com';
const path = '/products';
const queryParams: QueryParams = {
    category: 'electronics',
    sort: 'price',
    page: 3,
    limit: 20,
    search: undefined // Example of an undefined value (which will be ignored)
};

const fullURI = buildURI(baseUrl, path, queryParams);
console.log(fullURI); // Outputs: https://api.example.com/products?category=electronics&sort=price&page=3&limit=20
*/

export function createWikidataURI(id: string): string {
  const strippedId = stripWikidataPrefix(id);
  if (!isValidWikidataId(strippedId)) {
    console.log("not valid wikidata id: ", id);
    return "";
  }
  return `https://www.wikidata.org/wiki/${strippedId}`;
}

export const createOSMURI = (base, data: { osmId: string; osmType: string; }) => {
  if (!base || !data.osmId) return "";
  return base
    .replace(/{osmType}/g, data.osmType)
    .replace(/{osmId}/g, data.osmId);
};

export const resolveURI = (reconciliator: any, item: any) => {
  const cleanId = item.id?.includes(":") ? item.id.split(":")[1] : item.id;
  const baseUri = item?.uri || reconciliator?.uri;

  if (item.osmId && item.osmType) {
    return createOSMURI(baseUri, {
      osmId: item.osmId,
      osmType: item.osmType,
    });
  }

  if (item.uri && item.uri.startsWith("http")) {
    return item.uri;
  }

  return buildURI(baseUri, cleanId);
};

export const extractIdFromUri = (uri: string, prefix: string): string => {
  if (!uri) return "";
  const trimmedUri = uri.trim();

  if (trimmedUri.startsWith("http")) {
    try {
      const url = new URL(trimmedUri);

      // Wikidata: [https://www.wikidata.org/wiki/Q2807](https://www.wikidata.org/wiki/Q2807) -> Q2807
      if (prefix.startsWith("wd")) {
        return url.pathname.split("/").pop() || "";
      }

      // GeoNames: https://www.geonames.org/3117735/madrid.html -> 3117735
      if (prefix === "geo") {
        const parts = url.pathname.split("/").filter(Boolean);
        return parts[0] || "";
      }

      // OSM: https://www.openstreetmap.org/relation/5326784 -> 5326784
      if (prefix === "geoCoord" || prefix === "georss") {
        // URI in input: ?mlat=lat&mlon=lon
        const mlat = url.searchParams.get("mlat");
        const mlon = url.searchParams.get("mlon");
        if (mlat && mlon) return `${mlat},${mlon}`;

        // URI in input: #map=zoom/lat/lon
        if (url.hash.includes("#map=")) {
          const mapPart = url.hash.split("#map=")[1];
          const [, lat, lon] = mapPart.split("/");
          return `${lat},${lon}`;
        }

        // URI in input: /relation/ID or /node/ID
        const parts = url.pathname.split("/").filter(Boolean);
        if (parts.length >= 2 && ["relation", "way", "node"].includes(parts[0])) {
          return `${parts[0]}/${parts[1]}`;
        }
      }

      // Fallback: take last part
      return url.pathname.split("/").filter(Boolean).pop() || "";
    } catch (e) {
      console.error("Invalid URL in extractIdFromUri", e);
      return "";
    }
  }

  if (prefix === "geoCoord" || prefix === "georss") {
    return trimmedUri.replace(/\s+/g, "");
  }

  return trimmedUri.includes(":") ? trimmedUri.split(":").pop() || "" : trimmedUri;
};
