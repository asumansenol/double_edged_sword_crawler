# The Double-Edged Sword: Identifying Authentication Pages and their Fingerprinting Behavior (WWW'24)

This repository contains the crawler code for our paper [The Double-Edged Sword: Identifying Authentication Pages and their Fingerprinting Behavior](https://cosicdatabase.esat.kuleuven.be/backend/publications/files/conferencepaper/3756).

The paper introduces a novel machine learning-based approach for automated identification of authentication pages (i.e. login and signup pages) and measures the prevalence of fingerprinting scripts on those pages. Achieving a precision and recall rate of **96-98%**, [our ML model](https://github.com/asumansenol/double_edged_sword_crawler/tree/main/helpers/model) uses [88 diverse features](https://github.com/asumansenol/double_edged_sword_crawler/blob/main/helpers/register_login_feature_extraction/register_login_signals.js) of authentication pages to cover different designs. This design makes our ML model more robust compared to previous methods that relied on heuristics and regex patterns, which often struggled to detect complicated authentication flows such as multi-step login processes.


# Crawler
<p align="center">
<img src="https://github-production-user-asset-6210df.s3.amazonaws.com/48864422/302319928-0c313b3f-2eaf-4f97-9818-6cc1df303fed.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20240205%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240205T142832Z&X-Amz-Expires=300&X-Amz-Signature=1ee1d88b78572a321b86e4b6bdd8d64c0096b03c71a949872f7924b2495a4dd3&X-Amz-SignedHeaders=host&actor_id=48864422&key_id=0&repo_id=753114239" width=50% height=50%>
</p>

🕸 In order to identify authentication pages (i.e. login and signup pages) and quantify the prevalence of fingerprinting scripts across login and sign-up pages, we extended [Tracker Radar Collector](https://github.com/duckduckgo/tracker-radar-collector) by adding:

1. **LoginSignupSignalsCollector:** extracts login signup-related page signals to be used in the [ML model](https://github.com/asumansenol/double_edged_sword_crawler/tree/main/helpers/model).
2. **FingerprintCollector:** detects fingerprinting-related function calls and property accesses.
3. **LinkCollector:** extracts inner page links.
4. **CookieHunterHeuristicsCollector:** extracts login and signup forms (if present) by using heuristics from a [study](https://dl.acm.org/doi/10.1145/3372297.3417869) by Drakonakis, Ioannidis, and Polakis.
5. **AutofillCollector:** extracts login and signup forms, if available, using Chrome's autofill annotations.
6. **FathomCollector:** extracts login and signup forms, if any, by using Mozilla's [login](https://github.com/mozilla-services/fathom-login-forms/blob/96123f98b85bedc7bcc1bbc65f65181aab141526/lockwise-proof-of-concept/trainees.js#L239) and [signup](https://searchfox.org/mozilla-central/source/toolkit/components/satchel/SignUpFormRuleset.sys.mjs) page detector models.
7. **LoginSignupPageCollector:** crawls both inner and homepages associated with a given URL to locate the login and signup pages corresponding to that URL. This collector first collects signals and sends them to our ML model to identify whether the page has any login and signup forms.

🕸 To accept all the data processing, we integrated [Priv-Accept](https://github.com/marty90/priv-accept) into our crawler.

## How do I use it?

### Use it from the command line

1. Clone this project locally (`git clone https://github.com/asumansenol/double_edged_sword_crawler.git`)
2. Install all dependencies (`npm i`)
3. Run the command line tool with the desired collector's (listed above) id(s):
```sh
npm run crawl -- -u 'facebook.com' -o ./data/ -v -f -d "login_signup_pages"  --reporters 'cli,file' -l ./data/
```


https://github.com/asumansenol/double_edged_sword_crawler/assets/48864422/014e24b6-2408-4888-a814-0767b350f8d1


### Browser Add-on
We also developed a browser extension through the integration of our ML-based classifier. You can find the source code of this add-on in [this repo](https://github.com/asumansenol/login_signup_classfier_chrome_extension).


### Reference

```tex
@article{
    author    = {Asuman Senol, Alisha Ukani, Dylan Cutler and Igor Bilogrevic},
    title     = {{The Double Edged Sword: Identifying Authentication Pages and their Fingerprinting Behavior}},
    booktitle = {Proceedings of The Web Conference 2024},
    year      = 2024,
    month     = May
}
```
