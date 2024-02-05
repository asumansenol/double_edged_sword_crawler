const fs = require('fs');
const path = require('path');
const program = require('commander');
const chalk = require('chalk').default;
const ProgressBar = require('progress');
const { exit } = require('process');
var psl = require('psl');
const METADATA_FILE_NAME = 'metadata.json';

program
    .option('-d, --homepage <paths...>', 'path(s) to folder(s) with home page data')
    .option('-i, --inner <paths...>', 'path(s) to folder(s) with inner page data')
    .option('-j, --jsonInnerLinks <path>', 'path to JSON file that has inner links and their corresponding home page')
    .option('-o, --output <path>', 'path to the output file')
    .parse(process.argv);

const options = program.opts();
console.log('Options: ', program.opts());
console.log('Remaining arguments: ', program.args);

//  || !options.inner || !options.jsonInnerLinks || !options.output
if (!options.homepage) {
    console.log(options.homepage)
    options.help();
    process.exit(1);
}

const homepageDirs = options.homepage;
const innerpageDirs = options.inner;

/**
 * 
 * @param {string} url 
 */
function getETLDplusOne(url) {
    // Strip out http://
    url = url.replace(/^(?:https?:\/\/)?/i, "");
    // Strip out / and anything that comes after
    let idx = url.indexOf('/');
    if (idx > -1) {
        url = url.slice(0, idx);
    }
    return psl.get(url);
}

/**
 * 
 * @param {string[]} dirArr 
 * @returns {DirFile[]}
 */
function getDirFiles(dirArr) {
    /** @type {DirFile[]} */ let result_files = [];
    for (const dir of dirArr) {
        const files = fs.readdirSync(dir)
            .filter(file => {
                const resolvedPath = path.resolve(process.cwd(), `${dir}/${file}`);
                const stat = fs.statSync(resolvedPath);

                return stat && stat.isFile() && file.endsWith('.json') && file !== METADATA_FILE_NAME;
            });

            result_files = result_files.concat(files.map(file => ({dir: dir, file: file})));
    }
    return result_files.slice(0,10);
}

/**
 * Collect login/signup results for each detection technique
 * @param {import('../crawler').CollectResult} data 
 * @param {LoginSignupResults} ret
 * @returns {LoginSignupResults}
 */
function processOnePage(data, ret) {
    Object.keys(data.data).forEach(sectionName => {
        // @ts-ignore
        const sectionData = data.data[sectionName];

        if (sectionName === 'autofill') {
            ret.autofillLogin = sectionData.isLogin;
            ret.autofillSignup = sectionData.isSignup;
        }

        if (sectionName === 'cookie_hunter_heuristics') {
            ret.cookieHunterLogin = sectionData.isLogin;
            ret.cookieHunterSignup = sectionData.isSignup;
        }

        if (sectionName === 'fathom') {
            ret.fathomLogin = sectionData.hasLoginForm;
            ret.fathomSignup = sectionData.hasSignupForm;
        }

        if (sectionName == 'signals') {
            // TODO: run ML model
            ret.signalsLogin = false;
            ret.signalsSignup = false;
        }

        if (sectionName == 'fingerprints') {
            // TODO: FP Heuristics
            ret.fp = false;
        }
    });
    return ret;
}

/** @type {LinkData[]} */ const innerPagesWithHomePages = JSON.parse(fs.readFileSync(options.jsonInnerLinks, 'utf8'));
const homePageFiles = getDirFiles(homepageDirs);
const innerPageFiles = getDirFiles(innerpageDirs);
/** @type {LoginSignupResults[]} */ let innerPageLoginSignupData = [];

// Get data for home pages
homePageFiles.forEach(file => {
    const resolvedPath = path.resolve(process.cwd(), `${file.dir}/${file.file}`);

    /**
     * @type {import('../crawler').CollectResult}
     */
    let data = null;

    try {
        const dataString = fs.readFileSync(resolvedPath, 'utf8');
        data = JSON.parse(dataString);
    } catch (e) {
        return;
    }

    // Add placeholder LoginSignupResults for this inner page if it doesn't
    // already exist
    /** @type {LoginSignupResults} */ let ret = innerPageLoginSignupData.find(innerPageData => innerPageData.url === data.finalUrl);
    if (!ret) {
        ret = {
            url: data.finalUrl,
            homePageUrl: data.finalUrl,
            cookieHunterLogin: false,
            cookieHunterSignup: false,
            autofillLogin: false,
            autofillSignup: false,
            fathomLogin: false,
            fathomSignup: false,
            signalsLogin: false,
            signalsSignup: false,
            fp: false};
        innerPageLoginSignupData.push(ret);
    }

    ret = processOnePage(data, ret);
})

// Make sure the results for the inner pages have the same eTLD+1 as the home
// page where we found the link (e.g.
// l.instagram.com/?u=https%3a%2f%2fitunes.apple.com will redirect to
// itunes.apple.com, which is not part of the same eTLD+1)

innerPageFiles.forEach(file => {
    console.log('Going to read file with directory ' + file.dir + ', filename ' + file.file);
    const resolvedPath = path.resolve(process.cwd(), `${file.dir}/${file.file}`);

    /**
     * @type {import('../crawler').CollectResult}
     */
    let data = null;

    try {
        const dataString = fs.readFileSync(resolvedPath, 'utf8');
        data = JSON.parse(dataString);
    } catch (e) {
        return;
    }

    console.log('Reading data for URL ' + data.initialUrl);
    const finalUrl = data.finalUrl;

    // Make sure that the inner page is in the same domain as the home page
    const homePage = innerPagesWithHomePages.filter((innerPagesData) => {
        const finalUrlDomain = getETLDplusOne(finalUrl);
        const homePageDomain = getETLDplusOne(innerPagesData.url);
        return finalUrlDomain == homePageDomain;
    });
    
    // Inner page redirected to a page outside of the eTLD+1 of the home page
    if (homePage.length == 0) return;

    // Add placeholder LoginSignupResults for this inner page if it doesn't
    // already exist
    /** @type {LoginSignupResults} */ let ret = innerPageLoginSignupData.find(innerPageData => innerPageData.url === data.finalUrl);
    if (!ret) {
        ret = {
            url: data.finalUrl,
            homePageUrl: homePage[0].url,
            cookieHunterLogin: false,
            cookieHunterSignup: false,
            autofillLogin: false,
            autofillSignup: false,
            fathomLogin: false,
            fathomSignup: false,
            signalsLogin: false,
            signalsSignup: false,
            fp: false};
        innerPageLoginSignupData.push(ret);
    }

    ret = processOnePage(data, ret);
});

fs.writeFileSync(options.output, JSON.stringify(innerPageLoginSignupData, null, 2));

/**
 * @typedef LinkData
 * @property {string} url
 * @property {string[]} links
 */

/**
 * @typedef DirFile
 * @property {string} dir
 * @property {string} file
 */

/**
 * @typedef LoginSignupResults
 * @property {string} url
 * @property {string} homePageUrl
 * @property {boolean} cookieHunterLogin
 * @property {boolean} cookieHunterSignup
 * @property {boolean} autofillLogin
 * @property {boolean} autofillSignup
 * @property {boolean} fathomLogin
 * @property {boolean} fathomSignup
 * @property {boolean} signalsSignup
 * @property {boolean} signalsLogin
 * @property {boolean} fp
 */