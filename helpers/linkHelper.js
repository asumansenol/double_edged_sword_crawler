
/**
 * @param {RegExp} regexAttr
 * @param {RegExp} regexText
 */
function getLinksFiltered(regexAttr, regexText) {
    // @ts-ignore
    const links = [...document.querySelectorAll('a,span,button,div')];
    let linkAttrs = [];
    let filteredLinks = links.filter(el => (
        (el.innerText && el.innerText.match(regexText) && (el.innerText === el.innerText.match(regexText)[0])) ||
        (el.title && el.title.match(regexAttr)) ||
        (el.ariaLabel && el.ariaLabel.match(regexAttr)) ||
        (el.href && (el.href instanceof SVGAnimatedString ? el.href.baseVal.match(regexAttr) : String(el.href).match(regexAttr))) ||
        (el.placeholder && el.placeholder.match(regexAttr)) ||
        (el.id && el.id.match(regexAttr)) ||
        (el.name && el.name.match(regexAttr)) ||
        (el.className && (el.href instanceof SVGAnimatedString ? el.className.baseVal.match(regexAttr) : String(el.className).match(regexAttr)))
    ));
    return [...new Set(filteredLinks.filter(el => el.href).map(el => el.href))];
}