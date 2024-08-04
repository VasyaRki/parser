import 'dotenv/config';
import { requireEnv } from './utils/env.js';
import { catalogService } from './catalogs-service/catalog.service.js';

(async () => {
  const url = requireEnv('SITE_URL');
  const catalogs = await catalogService.getCatalogsPayload(url);
  await catalogService.downloadCatalogs(catalogs);
})();
