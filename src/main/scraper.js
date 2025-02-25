const { BrowserWindow } = require('electron');
const puppeteer = require('puppeteer-core');
const cheerio = require('cheerio');

class EbayScraper {
    constructor() {
        this.browser = null;
        this.page = null;
    }

    async init() {
        this.browser = await puppeteer.connect({
            browserWSEndpoint: (await BrowserWindow.webContents.getDevToolsWebSocketUrl()).replace('ws://', 'http://'),
            defaultViewport: null
        });
        this.page = await this.browser.newPage();
    }

    async searchServers(filters) {
        const baseUrl = 'https://www.ebay.es/b/Servidores-de-ordenador-para-redes-de-empresa/11211/bn_16588300';
        const queryParams = this.buildQueryParams(filters);

        await this.page.goto(`${baseUrl}?${queryParams}`);
        const html = await this.page.content();
        return this.parseResults(html);
    }

    buildQueryParams(filters) {
        const params = new URLSearchParams();

        // Ejemplo para procesadores
        if (filters.processorType) {
            params.append('Processor Type', filters.processorType);
        }

        // Implementar demás filtros
        return params.toString();
    }

    parseResults(html) {
        const $ = cheerio.load(html);
        const results = [];

        $('.s-item__wrapper').each((i, el) => {
            results.push({
                title: $(el).find('.s-item__title').text().trim(),
                price: $(el).find('.s-item__price').text().trim(),
                specs: this.parseSpecs($(el).find('.s-item__details'))
            });
        });

        return results;
    }
}

module.exports = EbayScraper;