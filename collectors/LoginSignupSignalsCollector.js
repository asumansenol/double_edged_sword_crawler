/* eslint-disable no-await-in-loop */
const BaseCollector = require('./BaseCollector');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const pageUtils = require('../helpers/utils');
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


class LoginSignupSignalsCollector extends BaseCollector {

    id() {
        return 'signals';
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
                this._log(`LoginSignupSignalsCollector: Error while adding target: ${error}`);
            }
        }
    }

    /**
     *  @param {{ finalUrl: any; urlFilter?: any; page?: any; }} options
     */
    async getData(options) {
        const signalsFromPageAndFrames = [];
        const pageSignals = await options.page.evaluate(() => getSignalsAndConvertToBinary());
        signalsFromPageAndFrames.push(pageSignals);
        this._log(`LoginSignupSignalsCollector: Received signals from page ${options.page.url()}`);
        const frames = await options.page.frames();
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

module.exports = LoginSignupSignalsCollector;