/** @typedef {import('./types').CatalogService} CatalogService */
/** @typedef {import('./types').Catalog} Catalog */

import { load } from 'cheerio';
import { resolve } from 'path';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync, createWriteStream } from 'fs';
import { PATH_CONSTANTS } from './constants.js';

export const catalogService = {
  /** @type {CatalogService['getCatalogsPayload']} */
  getCatalogsPayload: async (url) => {
    try {
      const response = await fetch(url);
      const data = await response.text();
      const $ = load(data);
      const catalogs = [];

      $('a.link-icon.solid.pdf').each((index, element) => {
        const link = $(element).attr('href');
        const cardCatalogue = $(element).closest('.card-catalogue');
        const name = cardCatalogue.find('h3 a').text().trim();
        const startDate = cardCatalogue.find('time').first().attr('datetime');
        const endDate = cardCatalogue.find('time').last().attr('datetime');
        const dateRange = `${startDate} - ${endDate}`;

        catalogs.push({
          name,
          link,
          date: dateRange,
        });
      });

      return catalogs;
    } catch (error) {
      console.error('Error fetching catalog links:', error);
      return [];
    }
  },

  /** @type {CatalogService['downloadFile']} */
  downloadFile: async (url, fileName) => {
    if (!existsSync(PATH_CONSTANTS.CATALOGS_PATH))
      await mkdir(PATH_CONSTANTS.CATALOGS_PATH);
    const destination = resolve(PATH_CONSTANTS.CATALOGS_PATH, fileName);
    if (existsSync(destination)) {
      console.log(`File ${fileName} already exist!`);
      return;
    }
    const res = await fetch(url);
    const fileStream = createWriteStream(destination, { flags: 'wx' });
    await finished(Readable.fromWeb(res.body).pipe(fileStream));
  },

  /** @type {CatalogService['downloadCatalogs']} */
  downloadCatalogs: async (catalogs) => {
    await writeFile(
      `${PATH_CONSTANTS.CATALOGS_PATH}/catalogs.json`,
      JSON.stringify(catalogs, null, 2),
    );
    await Promise.all(
      catalogs.map(async (catalog) => {
        await catalogService.downloadFile(catalog.link, `${catalog.name}.pdf`);
      }),
    );
  },
};
