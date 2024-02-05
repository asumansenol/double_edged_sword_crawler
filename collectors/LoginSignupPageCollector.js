/* eslint-disable max-lines */
/* eslint-disable no-undef */
/* eslint-disable no-await-in-loop */
const BaseCollector = require('./BaseCollector');
const tld = require('tldts');
const {URL} = require('url');
const fs = require('fs');
const pageUtils = require('../helpers/utils');
const linkHelperSrc = fs.readFileSync('./helpers/linkHelper.js', 'utf8');
const tf = require('@tensorflow/tfjs-node');
const accountVocabsSource = fs.readFileSync('./helpers/register_login_feature_extraction/register_login_vocabulary/account_vocabs.js', 'utf8');
const confirmVocabsSource = fs.readFileSync('./helpers/register_login_feature_extraction/register_login_vocabulary/confirm_vocabs.js', 'utf8');
const currentVocabsSource = fs.readFileSync('./helpers/register_login_feature_extraction/register_login_vocabulary/current_vocabs.js', 'utf8');
const forgotActionVocabsSource = fs.readFileSync('./helpers/register_login_feature_extraction/register_login_vocabulary/forgot_action_vocabs.js', 'utf8');
const forgotVocabsSource = fs.readFileSync('./helpers/register_login_feature_extraction/register_login_vocabulary/forgot_vocabs.js', 'utf8');
const haveVocabsSource = fs.readFileSync('./helpers/register_login_feature_extraction/register_login_vocabulary/have_vocabs.js', 'utf8');
const loginActionVocabsSource = fs.readFileSync('./helpers/register_login_feature_extraction/register_login_vocabulary/login_action_vocabs.js', 'utf8');
const loginVocabsSource = fs.readFileSync('./helpers/register_login_feature_extraction/register_login_vocabulary/login_vocabs.js', 'utf8');
const newVocabsSource = fs.readFileSync('./helpers/register_login_feature_extraction/register_login_vocabulary/new_vocabs.js', 'utf8');
const newsletterVocabsSource = fs.readFileSync('./helpers/register_login_feature_extraction/register_login_vocabulary/newsletter_vocabs.js', 'utf8');
const nextVocabsSource = fs.readFileSync('./helpers/register_login_feature_extraction/register_login_vocabulary/next_vocabs.js', 'utf8');
const notHaveVocabsSource = fs.readFileSync('./helpers/register_login_feature_extraction/register_login_vocabulary/not_have_vocabs.js', 'utf8');
const passwordAttrVocabsSource = fs.readFileSync('./helpers/register_login_feature_extraction/register_login_vocabulary/password_attr_vocabs.js', 'utf8');
const passwordVocabsSource = fs.readFileSync('./helpers/register_login_feature_extraction/register_login_vocabulary/password_vocabs.js', 'utf8');
const registerActionVocabsSource = fs.readFileSync('./helpers/register_login_feature_extraction/register_login_vocabulary/register_action_vocabs.js', 'utf8');
const registerVocabsSource = fs.readFileSync('./helpers/register_login_feature_extraction/register_login_vocabulary/register_vocabs.js', 'utf8');
const rememberMeActionVocabsSource = fs.readFileSync('./helpers/register_login_feature_extraction/register_login_vocabulary/remember_me_action_vocabs.js', 'utf8');
const rememberMeVocabsSource = fs.readFileSync('./helpers/register_login_feature_extraction/register_login_vocabulary/remember_me_vocabs.js', 'utf8');
const usernameVocabsSource = fs.readFileSync('./helpers/register_login_feature_extraction/register_login_vocabulary/username_vocabs.js', 'utf8');
const registerloginRegexPatternesSource = fs.readFileSync('./helpers/register_login_feature_extraction/register_login_regexes.js', 'utf8');
const registerLoginSignalsUtilsSource = fs.readFileSync('./helpers/register_login_feature_extraction/register_login_signals_utils.js', 'utf8');
const registerLoginSignalsSource = fs.readFileSync('./helpers/register_login_feature_extraction/register_login_signals.js', 'utf8');
const isShownSource = fs.readFileSync('./helpers/isShown.js', 'utf8');

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

class LoginSignupPageCollector extends BaseCollector {

    id() {
        return 'login_signup_pages';
    }

    /**
     * @param {import('./BaseCollector').CollectorInitOptions} options
     */
    async init({
        log,
    }) {
        this._log = log;
        // @ts-ignore
        this._links = [];
        // @ts-ignore
        this._internalLinks = [];
        this._model = await this.loadModel();
    }

    // @ts-ignore
    async addTarget({page, type}) {
        if (page && type === 'page') {
            try {
                await page.evaluateOnNewDocument(linkHelperSrc);
                await page.evaluateOnNewDocument(isShownSource);
                await page.evaluateOnNewDocument(accountVocabsSource);
                await page.evaluateOnNewDocument(confirmVocabsSource);
                await page.evaluateOnNewDocument(currentVocabsSource);
                await page.evaluateOnNewDocument(forgotActionVocabsSource);
                await page.evaluateOnNewDocument(forgotVocabsSource);
                await page.evaluateOnNewDocument(haveVocabsSource);
                await page.evaluateOnNewDocument(loginActionVocabsSource);
                await page.evaluateOnNewDocument(loginVocabsSource);
                await page.evaluateOnNewDocument(newVocabsSource);
                await page.evaluateOnNewDocument(newsletterVocabsSource);
                await page.evaluateOnNewDocument(nextVocabsSource);
                await page.evaluateOnNewDocument(notHaveVocabsSource);
                await page.evaluateOnNewDocument(passwordAttrVocabsSource);
                await page.evaluateOnNewDocument(passwordVocabsSource);
                await page.evaluateOnNewDocument(registerActionVocabsSource);
                await page.evaluateOnNewDocument(registerVocabsSource);
                await page.evaluateOnNewDocument(rememberMeActionVocabsSource);
                await page.evaluateOnNewDocument(rememberMeVocabsSource);
                await page.evaluateOnNewDocument(usernameVocabsSource);
                await page.evaluateOnNewDocument(registerloginRegexPatternesSource);
                await page.evaluateOnNewDocument(registerLoginSignalsUtilsSource);
                await page.evaluateOnNewDocument(registerLoginSignalsSource);
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
    shouldIncludeLink(linkUrlStripped, pageDomain, pageUrl) {
        // TODO: no pdf, png etc, links
        // TODO: no links to external domains
        // TODO: no links without path and param: abc.com/, abc.com/#
        // TODO: don't collect variants of the same link such as /about and /about/
        if (tld.getDomain(linkUrlStripped) !== pageDomain) {
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


    async loadModel() {
        const modelPath = "file://helpers/model/login_signup_classifier.json";
        console.log("Model loading in progress from ".concat(modelPath));
        const model = await tf.loadGraphModel(modelPath);
        return model;
    }

    /**
     * @param {any} links
     * @param {string} pageUrl
     * @param {string} pageDomain
     */
    controlLinks(links, pageUrl, pageDomain) {
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
            if (!this.shouldIncludeLink(linkUrlStripped, pageDomain, pageUrl)) {
                continue;
            }
            returnLinks.push(linkUrlStripped);
        }
        return returnLinks;
    }

    /**
     * @param {{ finalUrl?: string; urlFilter?: any; page?: any; }} [options]
     */
    async getLinks(options) {
        // scroll to the top of the page
        await options.page.evaluate(() => {
            window.scrollTo(0, 0);
        });
        const page = options.page;
        const pageUrl = page.url().toLowerCase();
        const pageDomain = tld.getDomain(pageUrl);
        let loginLinks = await page.evaluate(() => getLinksFiltered(loginActionRegexPattern, loginRegexPattern));
        loginLinks = this.controlLinks(loginLinks, pageUrl, pageDomain);
        let signupLinks = await page.evaluate(() => getLinksFiltered(registerActionRegex,registeRegexPattern));
        signupLinks = this.controlLinks(signupLinks, pageUrl, pageDomain);
        const innerLinks = this.controlLinks(await page.evaluate(INNER_LINKS_QUERY), pageUrl, pageDomain);
        const innerLinksNotInLoginSignupLinks = innerLinks.filter(link => !loginLinks.includes(link) && !signupLinks.includes(link));

        this._links = [...loginLinks.slice(0, 5), ...signupLinks.slice(0, 5), ...innerLinksNotInLoginSignupLinks.slice(0, 5)];
        this._log(`Found ${this._links.length} links`);
        return this._links;
    }


    /**
     * @param {number[]} array
     */
    argMax(array) {
        return array
        .map((x, i) => [x, i])
        .reduce((r, a) => (a[0] > r[0] ? a : r))[1];
    }

    /**
     * @param {{ finalUrl?: string; urlFilter?: any; page?: any; }} [options]
     */
    async getData(options) {
        let loginSignupPageUrlDetails = {loginUrl: '', signupUrl: ''};
        let pageSignals = await this.getPageSignals(options.page);
        let predictionResult = await this.predictPageType(pageSignals);
        let pageURL = options.page.url();
        if (predictionResult.isLogin) {
            this._log(`Found login page: ${pageURL}`);
            loginSignupPageUrlDetails.loginUrl = pageURL;
        }else if (predictionResult.isSignup) {
            this._log(`Found signup page: ${pageURL}`);
            loginSignupPageUrlDetails.signupUrl = pageURL;
        }
        if (loginSignupPageUrlDetails.loginUrl !== '' && loginSignupPageUrlDetails.signupUrl !== '') {
            return loginSignupPageUrlDetails;
        }
        this._log(`Getting links from ${options.page.url()}`);
        const links = await this.getLinks(options);
        this._log(`Not found login and signup page on the landing page, will try to find from links`);
        for (const link of links) {
            this._log(`Navigating to ${link}`);
            await options.page.goto(link);
            await options.page.waitForTimeout(2500);
            pageURL = options.page.url();
            pageSignals = await this.getPageSignals(options.page);
            predictionResult = await this.predictPageType(pageSignals);
            if (loginSignupPageUrlDetails.loginUrl === '' &&  predictionResult.isLogin) {
                this._log(`Found login page: ${pageURL}`);
                loginSignupPageUrlDetails.loginUrl = pageURL;
            } else if (loginSignupPageUrlDetails.signupUrl === '' && predictionResult.isSignup) {
                this._log(`Found signup page: ${pageURL}`);
                loginSignupPageUrlDetails.signupUrl = pageURL;
            }
            if (loginSignupPageUrlDetails.loginUrl !== '' && loginSignupPageUrlDetails.signupUrl !== '') {
                break;
            }
        }
        return loginSignupPageUrlDetails;
    }

    /**
     * @param {number[]} pageSignals
     */
    predictPageType(pageSignals) {
        let result = {isLogin: false, isSignup: false, url: ''};
        const predictionResult = this._model.predict([tf.tensor([pageSignals])]);
        const predictionResultArr = predictionResult.dataSync();
        const resArgmax = this.argMax(Array.from(predictionResultArr));
        if (resArgmax === 1) {
            result.isLogin = true;
        } else if (resArgmax === 2) {
            result.isSignup = true;
        }
        return result;
    }

    /**
     * @param {{ evaluate: (arg0: () => boolean[]) => any; url: () => any; frames: () => any; }} page
     */
    async getPageSignals(page) {
        const signalsFromPageAndFrames = [];
        const pageSignals = await page.evaluate(() => getSignalsAndConvertToBinary());
        signalsFromPageAndFrames.push(pageSignals);
        this._log(`LoginSignupSignalsCollector: Received signals from page ${page.url()}`);
        const frames = await page.frames();
        for (const frame of frames) {
            try {
                // console.log(frame._loaderId, frame.name());
                const frameUrl = await frame.url();
                const frameName = await frame.name();
                this._log(`Frame url: ${frameUrl}`);
                this._log(`Frame name: ${frameName}`);
                if(frameName === '' || frameUrl === '' || frameUrl.includes('chrome-error://')) {
                    this._log(`LoginSignupSignalsCollector: Frame is detached or chrome-error://`);
                    continue;
                }
                this._log(`LoginSignupSignalsCollector: Getting signals from frame`);
                const frameSignals = await frame.evaluate(() => getSignalsAndConvertToBinary());
                signalsFromPageAndFrames.push(frameSignals);
            } catch (error) {
                this._log(`LoginSignupSignalsCollector: Error while getting signals from frame ${error}`);
            }
        }
        const combinedSignals = pageUtils.combinePageFrameSignals(signalsFromPageAndFrames);
        return combinedSignals;
    }

}

module.exports = LoginSignupPageCollector;