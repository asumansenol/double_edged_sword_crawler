/* eslint-disable no-await-in-loop */
const BaseCollector = require('./BaseCollector');
const fs = require('fs');

const fathomSrc = fs.readFileSync('./helpers/fathom/fathom.js', 'utf8');
const fathomLoginSrc = fs.readFileSync('./helpers/fathom/fathom_login_form_detection.js', 'utf8');
const fathomSignupSrc = fs.readFileSync('./helpers/fathom/fathom_signup_form_detection.js', 'utf8');

class FathomSignalsCollector extends BaseCollector {

    id() {
        return 'fathom';
    }

    /**
     * @param {import('./BaseCollector').CollectorInitOptions} options
     */
    init({
        log,
    }) {
        this._log = log;
        /**
         * @type {boolean[]}
         */
        this._pageSignals = [];
    }

    // @ts-ignore
    async addTarget({page, type}) {
        if (page && type === 'page') {
            try {
                await page.evaluateOnNewDocument(fathomSrc);
                await page.evaluateOnNewDocument(fathomLoginSrc);
                await page.evaluateOnNewDocument(fathomSignupSrc);
            } catch (error) {
                this._log(`FathomSignalsCollector: Error while adding target: ${error}`);
            }
        }
    }

    /**
     *  @param {{ finalUrl: any; urlFilter?: any; page?: any; }} options
     */
    async getData(options) {
        let fathomFormResult;
        try {
            fathomFormResult = await options.page.evaluate(function() {
                // @ts-ignore
                return {hasLoginForm: hasLoginForm(), hasSignupForm: hasSignupForm()};
            });
        } catch (error) {
            this._log(`FathomSignalsCollector: Error while getting signals from page ${options.page.url()}: ${error}`);
        }
        this._log(`FathomSignalsCollector: Received signals from page ${options.page.url()}`);
        const frames = await options.page.frames();
        for (const frame of frames) {
            try {
                this._log(`FathomSignalsCollector: Getting signals from frame ${frame.name()}`);
                let fathomFormResultFrame;
                const frameUrl = await frame.url();
                const frameName = await frame.name();
                this._log(`Frame url: ${frameUrl}`);
                this._log(`Frame name: ${frameName}`);
                if(frameName === '' || frameUrl === '' || frameUrl.includes('chrome-error://')) {
                    this._log(`FathomSignalsCollector: Frame is detached or chrome-error://`);
                    continue;
                }
                try {
                    fathomFormResultFrame = await frame.evaluate(function() {
                        return {hasLoginForm: hasLoginForm(), hasSignupForm: hasSignupForm()};
                    });
                } catch (error) {
                    this._log(`FathomSignalsCollector: Error while getting signals from frame ${frame.name()}: ${error}`);
                }
                if(fathomFormResultFrame.hasLoginForm) {
                    fathomFormResult.hasLoginForm = true;
                }
                if(fathomFormResultFrame.hasSignupForm) {
                    fathomFormResult.hasSignupForm = true;
                }
                if (fathomFormResult.hasLoginForm && fathomFormResult.hasSignupForm) {
                    break;
                }
            } catch (error) {
                this._log(`FathomSignalsCollector: Error while getting signals from frame ${frame.name()}: ${error}`);
            }
        }
        return fathomFormResult;
    }
}

module.exports = FathomSignalsCollector;