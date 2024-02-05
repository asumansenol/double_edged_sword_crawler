const BaseCollector = require('./BaseCollector');

/**
 * @typedef { import('./BaseCollector').CollectorInitOptions } CollectorInitOptions
 */

class AutofillCollector extends BaseCollector {
    
    id() {
        return 'autofill';
    }

    /**
     * @param {CollectorInitOptions} options
     */
    init(options) {
        /** @type {LoginSignupClassification} */ this.loginSignupResult = {isLogin: false, isSignup: false, annotations: null, formSignatures: null};
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

    /**
     * 
     * @returns {Promise<LoginSignupClassification>}
     */
    async getData({page}) {
        let inputResult, formResult, annotations;
        // Check all input elements on page
        [inputResult, annotations] = await page.evaluate(() => {
            let isLogin = false;
            /**
             * @type {string[]}
             */
            let annotations = [];
            const inputElements = Array.from(document.querySelectorAll('input'));
            for (const inputElement of inputElements) {
                if (inputElement.getAttribute('pm_parser_annotation') !== null) {
                    const annotation = inputElement.getAttribute('pm_parser_annotation');
                    annotations.push(annotation);
                    if (annotation === 'new_password_element' || annotation === 'confirmation_password_element') {
                        return ['signup', annotations];
                    } else if (annotation === 'password_element' || annotation === 'username_element') {
                        isLogin = true;
                    }
                }
            }
            return [isLogin, annotations];
        });

        // Check result of input elements
        if (inputResult === true) {
            this.loginSignupResult.isLogin = true;
            this.loginSignupResult.isSignup = false;
        } else if (inputResult === false) {
            this.loginSignupResult.isLogin = false;
            this.loginSignupResult.isSignup = false;
        } else if (inputResult === 'signup') {
            this.loginSignupResult.isSignup = true;
            this.loginSignupResult.isLogin = false;
        }

        // @ts-ignore
        this.loginSignupResult.annotations = annotations;

        // Check all forms on page for form_signature annotations
        formResult = await page.$$eval('form', forms => {
            /** @type {number[]} */ let formSignatures = [];
            forms.forEach(form => {
                if (form.getAttribute('form_signature') !== null) {
                    formSignatures.push(Number(form.getAttribute('form_signature')));
                }
            });
            return formSignatures;
        });

        this.loginSignupResult.formSignatures = formResult;
        return this.loginSignupResult;
    }

}

module.exports = AutofillCollector;

/**
 * @typedef LoginSignupClassification
 * @property {boolean} isLogin
 * @property {boolean} isSignup
 * @property {string[]} annotations
 * @property {number[]} formSignatures
 */