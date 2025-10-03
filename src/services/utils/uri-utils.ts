import { isValidWikidataId, stripWikidataPrefix } from "./regexs";

type QueryParams = {
  [key: string]: string | number | undefined;
};

// Function to build a URI
export const buildURI = (
  baseUrl: string,
  path: string,
  queryParams?: QueryParams
) => {
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
  console.log("uri built: " + url.toString());
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
    console.log("not valid wikidata id: " + id);
    return "";
  }
  return `https://www.wikidata.org/wiki/${strippedId}`;
}
