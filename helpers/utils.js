/**
 * @param {puppeteer.Page} page
 * @param {(arg0: string) => void} log
 */
async function acceptAllCookies(page, log = null) {
    const cookieAccepted = await page.evaluate(() => {
        let clicked = false;
        [...getCandidates(document)].forEach(candidate => {
            candidate.click();
            clicked = true;
        });
        return clicked;
    });
    log('Cookie accepted: ' + cookieAccepted);
}

    /**
     * @param {string | any[]} pageFrameSignals
     */
function combinePageFrameSignals(pageFrameSignals) {
    const combinedSignals = Array.from({length: 88}, i => i = 0);
    for (let i = 0; i < pageFrameSignals.length; i++) {
        const eachSignals = pageFrameSignals[i];
        for (let j = 0; j < eachSignals.length; j++) {
            if (eachSignals[j] === true) {
                combinedSignals[j] = 1;
            }
        }
    }
    return combinedSignals;
}

module.exports = {
    acceptAllCookies,
    combinePageFrameSignals
};