const BaseCollector = require('./BaseCollector');

/**
 * @typedef { import('./BaseCollector').CollectorInitOptions } CollectorInitOptions
 */

class CookieHunterHeuristicsCollector extends BaseCollector {

    id() {
        return 'cookie_hunter_heuristics';
    }

    /**
     * @param {CollectorInitOptions} options
     */
    init(options) {
        /** @type {LoginSignupClassification} */ this.loginResult = {isLogin: false, isSignup: false, reason: null};
        /** @type {import('puppeteer').CDPSession} */ this._cdpClient = null;
        this.context = options.context;
    }


    /**
     * @param {{cdpClient: import('puppeteer').CDPSession, url: string, type: import('./TargetCollector').TargetType}} targetInfo 
     */
    async addTarget({cdpClient, type}) {
        if (type === 'page') {
            this._cdpClient = cdpClient;
            await this._cdpClient.send('Page.enable');
        }
    }

    async getData() {
        const pages = await this.context.pages();
        if (pages.length > 0) {
            const page = pages[0];
            this.loginResult = await getAccountForms(page);
            return this.loginResult;
        }

        return null;
    }
}

module.exports = CookieHunterHeuristicsCollector;

/**
 * @param {import('puppeteer').Page} page
 * 
 */
async function getAccountForms(page) {
    /** @type {Object.<string, number[]>} */ let loginResults = await page.$$eval('form', forms => {
        /** @type {Object.<string, number[]>} */ let ret = {"login": [], "signup": []};

        const SIGNUP = "sign([^0-9a-zA-Z]|\s)*up|regist(er|ration)?|(create|new)([^0-9a-zA-Z]|\s)*(new([^0-9a-zA-Z]|\s)*)?(acc(ount)?|us(e)?r|prof(ile)?)";
        const LOGIN = "(log|sign)([^0-9a-zA-Z]|\s)*(in|on)|authenticat(e|ion)|/(my([^0-9a-zA-Z]|\s)*)?(user|account|profile|dashboard)";

    // All of these functions need to be inside the $$eval callback so that
    // they can access the DOM elements
        const getElementFullSrc = (/** @type {HTMLElement} */ el) => el.outerHTML;

        const getElementSrc = (/** @type {HTMLElement} */ el) => el.outerHTML.split(">")[0] + ">";

        const getDescendants = (/** @type {Node} */ node, /** @type {Node[]} */ accum) => {
            let i;
            accum = accum || [];
            for (i = 0; i < node.childNodes.length; i++) {
                accum.push(node.childNodes[i]);
                getDescendants(node.childNodes[i], accum);
            }
            return accum;
        };

        const isChildElement = (/** @type {Element} */ parent, /** @type {Element} */ child) => {
            if (child === null) {return false;}
            if (parent === child) {return true;}
            if (parent === null || typeof parent === 'undefined') {return false;}
            if (parent.children.length === 0) {return false;}
            let i = 0;
            for (i = 0; i < parent.children.length; i++) {
                if (isChildElement(parent.children[i], child)) {return true;}
            }
            return false;
        };

        const onTopLayer = (/** @type {HTMLElement} */ ele) => {
            if (!ele) {return false;}
            let document = ele.ownerDocument;
            let inputWidth = ele.offsetWidth;
            let inputHeight = ele.offsetHeight;
            if (inputWidth <= 0 || inputHeight <= 0) {return false;}
            let position = ele.getClientRects()[0];
            let j = 0;
            let score = 0;
            let topPos = position.top - window.scrollY;
            let leftPos = position.left - window.scrollX;
            let maxHeight = (document.documentElement.clientHeight - topPos > inputHeight) ? inputHeight : document.documentElement.clientHeight - topPos;
            let maxWidth = (document.documentElement.clientWidth > inputWidth) ? inputWidth : document.documentElement.clientWidth - leftPos;
            for (j = 0; j < 10; j++) {
                score = isChildElement(ele, document.elementFromPoint(leftPos + 1 + j * maxWidth / 10, position.top + 1 + j * maxHeight / 10)) ? score + 1 : score;
            }
            if (score >= 5) {return true;}
            return false;
        };

        forms.forEach(form => {
            let isOnTopLayer = onTopLayer(form);
            if (!isOnTopLayer) {
                return null;
            }

            let inputs = 0;
            let hiddenInputs = 0;
            let passwords = 0;
            let hiddenPasswords = 0;

            let checkboxesAndRadio = 0;
            let checkboxes = 0;
            let radios = 0;

            let signupTypeFields = 0;

            let loginSubmit = false;
            let signupSubmit = false;

            for (let child of getDescendants(form)) {
                let nodetag = child.nodeName.toLowerCase();
                let etype = (/** @type {any} */ (child)).type;
                let elSrc = getElementFullSrc(/** @type {any} */(child));
                if (nodetag === "button" || etype === "submit" || etype === "button" || etype === "image") {
                    if (elSrc.match(SIGNUP)) {signupSubmit = true;}
                    if (elSrc.match(LOGIN)) {loginSubmit = true;}
                }
                if (nodetag !== "input" && nodetag !== "select" && nodetag !== "textarea") {continue;}
                if (etype === "submit" || etype === "button" || etype === "hidden" || etype === "image" || etype === "reset") {continue;}
                if (etype === "password") {
                    if (onTopLayer(/** @type {any} */(child))) {passwords += 1;} else {hiddenPasswords += 1;}
                } else if (etype === "checkbox" || etype === "radio") { // count them as well, but not as inputs
                    if (etype === "checkbox") {checkboxes += 1;} else {radios += 1;}
                    checkboxesAndRadio += 1;
                } else {
                    if (onTopLayer(/** @type {any} */(child))) {inputs += 1;} else {hiddenInputs += 1;}
                    if (etype === "tel" || etype === "date" || etype === "datetime-local" || etype === "file" || etype === "month" || etype === "number" || etype === "url" || etype === "week") {
                        signupTypeFields += 1;
                    }
                }
            }
            let totalInputs = inputs + hiddenInputs;
            let totalPasswords = passwords + hiddenPasswords;

            if (totalPasswords === 0) {
                return null; // irrelevant form
            }

            let signup = false;
            let login = false;

            let reason = null;

            let formSrc = getElementSrc(form);
            if (totalPasswords > 1) {signup = true; reason = 1;} else { // Only one password field
                if (loginSubmit && !signupSubmit) {login = true; reason = 2;} // Only one should match, otherwise, rely on structure
                else if (signupSubmit && !loginSubmit) {signup = true; reason = 3;} else if (totalInputs === 1) {login = true; reason = 4;} else if (signupTypeFields > 0) {signup = true; reason = 5;} else if (inputs > 1) {signup = true; reason = 6;}// more than one visible inputs
                else if (inputs === 1) {login = true; reason = 7;} else { // no visible inputs
                    if (formSrc.match(SIGNUP) !== null) {signup = true; reason = 8;} else if (formSrc.match(LOGIN) !== null) {login = true; reason = 9;} else {signup = true; reason = 9;} // no luck with regexes
                }
            }

            if (passwords === 1 && form.className === "xenForm") {
                signup = false;
                login = true;
            }

            if (signup) {
                ret.signup.push(reason);
            } else if (login) {
                ret.login.push(reason);
            }
        }); return ret;
    });

    // Create return result
    /** @type {LoginSignupClassification} */ let result = {isLogin: false, isSignup: false, reason: null};
    if (loginResults.signup.length > 0) {
        result.isSignup = true;
        result.reason = loginResults.signup[0];
    } else if (loginResults.login.length > 0) {
        result.isLogin = true;
        result.reason = loginResults.login[0];
    }
    return result;
}

/**
 * @typedef LoginSignupClassification
 * @property {boolean} isLogin
 * @property {boolean} isSignup
 * @property {number | null} reason
 */