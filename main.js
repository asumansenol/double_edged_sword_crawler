const crawlerConductor = require('./crawlerConductor');
const crawler = require('./crawler');

const RequestCollector = require('./collectors/RequestCollector');
const APICallCollector = require('./collectors/APICallCollector');
const AutofillCollector = require('./collectors/AutofillCollector');
const CookieCollector = require('./collectors/CookieCollector');
const CookieHunterHeuristicsCollector = require('./collectors/CookieHunterHeuristicsCollector');
const TargetCollector = require('./collectors/TargetCollector');
const TraceCollector = require('./collectors/TraceCollector');
const ScreenshotCollector = require('./collectors/ScreenshotCollector');
const CMPCollector = require('./collectors/CMPCollector');
const LoginSignupSignalsCollector = require('./collectors/LoginSignupSignalsCollector');
const LinkCollector = require('./collectors/LinkCollector');
const FingerprintCollector = require('./collectors/FingerprintCollector');
const FathomSignalsCollector = require('./collectors/FathomSignalsCollector');
const LoginSignupPageCollector = require('./collectors/LoginSignupPageCollector');

// reexport main pieces of code so that they can be easily imported when this project is used as a dependency
// e.g. `const {crawlerConductor} = require('3p-crawler');`
module.exports = {
    crawler,
    crawlerConductor,
    // collectors ↓
    RequestCollector,
    APICallCollector,
    AutofillCollector,
    CookieCollector,
    CookieHunterHeuristicsCollector,
    TargetCollector,
    TraceCollector,
    ScreenshotCollector,
    CMPCollector,
    LoginSignupSignalsCollector,
    FathomSignalsCollector,
    LinkCollector,
    FingerprintCollector,
    LoginSignupPageCollector
};