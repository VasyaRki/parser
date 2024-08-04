export interface Catalog {
  name: string;
  link: string;
  date: string;
}

export interface CatalogService {
  getCatalogsPayload: (url: string) => Promise<Catalog[]>;
  downloadFile: (url: string, fileName: string) => Promise<void>;
  downloadCatalogs: (catalogs: Catalog[]) => Promise<void>;
}
