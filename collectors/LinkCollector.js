/* eslint-disable no-await-in-loop */
const BaseCollector = require('./BaseCollector');
const tld = require('tldts');
const { URL } = require('url');
const fs = require('fs');
const linkHelperSrc = fs.readFileSync('./helpers/linkHelper.js', 'utf8');
const MAX_LINKS_TO_COLLECT = 100;

const INNER_LINKS_QUERY = `
// select a and button elements
(function getLinks() {
    const links = window.document.querySelectorAll('a, button');
    // find the center of the viewport
    const center = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
    };
    let linkAttrs = [];
    for (const link of links) {
        // find the center of each link
        const rect = link.getBoundingClientRect();
        const linkCenter = {
            x: rect.left + (rect.width / 2),
            y: rect.top + (rect.height / 2)
        };
        // find the distance between the link and the viewport center
        const distance = Math.hypot(center.x - linkCenter.x, center.y - linkCenter.y);
        const href = link.getAttribute('href');
        // get the title of the link
        const title = link.getAttribute('title');
        // get the text of the link
        const text = link.innerText;
        if (href) {
            linkAttrs.push({
                distance,
                href,
            });
        }
        // add the distance and the href to an array
    }
    // sort the array by distance, ascending
    linkAttrs.sort((a, b) => a.distance - b.distance);
    return [...new Set(linkAttrs.map(link => link.href))];
})();
`;

const EXCLUDED_EXTS = [".jpg", ".jpeg", ".pdf", ".png"];

class LinkCollector extends BaseCollector {

    id() {
        return 'links';
    }

    /**
     * @param {import('./BaseCollector').CollectorInitOptions} options
     */
    init({
        log,
    }) {
        this._log = log;
        // @ts-ignore
        this._links = [];
        // @ts-ignore
        this._internalLinks = [];
    }

    // @ts-ignore
    async addTarget({ page, type }) {
        if (page && type === 'page') {
            try {
                page.evaluateOnNewDocument(linkHelperSrc);
            } catch (error) {
                this._log(`AdCollector: Error while adding target: ${error}`);
            }
        }
    }

    // add link param to the function
    /**
     * @param {string} linkUrlStripped
     * @param {string} pageDomain
     * @param {string} pageUrl
     * @returns {boolean}
     */
    shouldIncludeLink(linkUrlStripped, pageDomain, pageUrl, type) {
        // TODO: no pdf, png etc, links
        // TODO: no links to external domains
        // TODO: no links without path and param: abc.com/, abc.com/#
        // TODO: don't collect variants of the same link such as /about and /about/
        if (tld.getDomain(linkUrlStripped) !== pageDomain && type === 'non-login-signup') {
            // external link
            this._log(`Will skip the external link: ${linkUrlStripped}`);
            return false;
        }
        if (EXCLUDED_EXTS.some(fileExt => linkUrlStripped.includes(fileExt))) {
            this._log(`Bad file extension, will skip: ${linkUrlStripped}`);
            return false;
        }
        // remove trailing slash and # from the page url
        const pageUrlStripped = pageUrl.replace(/#$/, '').replace(/\/$/, '');
        if (linkUrlStripped === pageUrlStripped) {  // same page link
            this._log(`Skipping same page link: ${linkUrlStripped} (pageUrl: ${pageUrl}) `);
            return false;
        }

        return true;
    }

    /**
     * @param {any} links
     * @param {string} pageUrl
     * @param {string} pageDomain
     */
    controlLinks(links, pageUrl, pageDomain, type) {
        const returnLinks = [];
        // iterate over the links
        for (let link of links) {
            // convert relative links to absolute
            link = new URL(link, pageUrl).href.toLowerCase();
            // strip the hash and trailing slash
            const linkUrlStripped = link.replace(/#$/, '').replace(/\/$/, '');
            // convert links to lowercase
            // const oldHref = link.href;
            // this._log(`Constructed absolute link: ${link.href} (was ${oldHref})`);
            if (!this.shouldIncludeLink(linkUrlStripped, pageDomain, pageUrl, type)) {
                continue;
            }
            returnLinks.push(linkUrlStripped);
        }
        return returnLinks;
    }

    /**
     * @param {{ finalUrl?: string; urlFilter?: any; page?: any; }} [options]
     */
    async getData(options) {
        await options.page.waitForTimeout(5000);
        // scroll to the top of the page
        await options.page.evaluate(() => {
            window.scrollTo(0, 0);
        });
        const page = options.page;
        const pageUrl = page.url().toLowerCase();
        const pageDomain = tld.getDomain(pageUrl);
        let loginLinks = await page.evaluate(() => { return getLinksFiltered(loginActionRegexPattern, loginRegexPattern)});
        loginLinks = this.controlLinks(loginLinks, pageUrl, pageDomain, 'login');
        let signupLinks = await page.evaluate(() => { return getLinksFiltered(registerActionRegex,registeRegexPattern)});
        signupLinks = this.controlLinks(signupLinks, pageUrl, pageDomain, 'signup');
        const innerLinks = this.controlLinks(await page.evaluate(INNER_LINKS_QUERY), pageUrl, pageDomain, 'non-login-signup');
        const innerLinksNotInLoginSignupLinks = innerLinks.filter(link => !loginLinks.includes(link) && !signupLinks.includes(link));

        this._links = [...loginLinks.slice(0, 5), ...signupLinks.slice(0, 5), ...innerLinksNotInLoginSignupLinks.slice(0, 5)];
        this._log(`Found ${this._links.length} links`);

        // this._log(`Found internal links ${JSON.stringify(this._internalLinks)}`);
        return this._links;
    }

}

module.exports = LinkCollector;
