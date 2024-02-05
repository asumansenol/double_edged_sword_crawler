const fs = require('fs');
const path = require('path');
const program = require('commander');
const chalk = require('chalk').default;
const ProgressBar = require('progress');
const { exit } = require('process');
const METADATA_FILE_NAME = 'metadata.json';

program
    .option('-i, --input <path>', 'path to folder with data')
    .option('-o, --output <path>', 'path to the output file')
    .parse(process.argv);

const options = program.opts();
if (!options.input || !options.output) {
    options.help();
    process.exit(1);
}

const dataDir = options.input;

const dataFiles = fs.readdirSync(dataDir)
    .filter(file => {
        const resolvedPath = path.resolve(process.cwd(), `${dataDir}/${file}`);
        const stat = fs.statSync(resolvedPath);

        return stat && stat.isFile() && file.endsWith('.json') && file !== METADATA_FILE_NAME;
    });

const progressBar = new ProgressBar('[:bar] :percent ETA :etas :file', {
    complete: chalk.green('='),
    incomplete: ' ',
    total: dataFiles.length,
    width: 30
});

/**
 * @type {LinkData[]}
 */
let collectedLinks =  [];
/** @type {string[]} */ let linksOnly = [];

dataFiles.forEach(file => {
    progressBar.tick({file});

    const resolvedPath = path.resolve(process.cwd(), `${dataDir}/${file}`);

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

    if (data.data.links && data.data.links.length > 0) {
        /** @type {LinkData} */ const linkObj = {url: data.finalUrl, links: data.data.links};
        collectedLinks.push(linkObj);
        linksOnly = linksOnly.concat(data.data.links);
    }
});

fs.writeFileSync(options.output, JSON.stringify(collectedLinks, null, 2));

var linksOnlyFile = fs.createWriteStream(`${options.output.slice(0, -3)}.txt`);
linksOnlyFile.on('error', function(err) { exit(1) });
linksOnly.forEach(function(v) { linksOnlyFile.write(v + '\n'); });
linksOnlyFile.end();

/**
 * @typedef LinkData
 * @property {string} url
 * @property {string[]} links
 */