// const fs = require("fs");
// const path = require("path");
const GLOBAL_SELECTOR = "button, div, span, form, p, input";

// function readKeywords() {
//     const keywords = fs
//     .readFileSync(path.resolve(__dirname, "acceptKeywords.txt"), "utf8")
//     .split("\n");
//     let keywordsSet = new Set();
//     keywords.forEach(keyword => {
//         if (!keyword.startsWith("#") && keyword.length > 0) {
//             keywordsSet.add(keyword);
//         }
//     });
//     return keywords;
// }
// test = readKeywords();
// console.log(test);

function getCandidates(document) {
    let acceptWordList = new Set(["abilita","abilita tutto","accept","accept & close","accept & continue","accept & proceed","accept all","accept all cookies","accept all settings","accept and close","accept and continue","acceptera alla cookies","ja, ik accepteer ze", "accept and continue to site","accept cookies","accept our policy","accept recommended cookies","accepter","accepter & fermer","accepter et accéder gratuitement","accepter et continuer","accepter et fermer","accepter et poursuivre","accepter les cookies","accepter tous les cookies","accetta", "accetta i cookie","accetta cookie","accetta e chiudi","accetta e continua", "continua senza accettare", "accetta e continua la navigazione","accetta e procedi","accetta i cookie","accetta tutt","accetta tutte","accetta tutti","accetta tutti i cookie","accetta tutto","accetta tutto e continua","accetta tutto e visita il sito","accettare","accettare e continuare","accettare e proseguire","accettare tutto","accetto","accetto cookies","accetto i cookie","accetto i cookies","accetto il monitoraggio","accetto tutti","accetto tutti i cookie","accetto tutti i cookies","accetto tutto","accetto tutto e chiudi","accetto tutto e chiudo","acconsenti","acconsento","acconsento all'uso dei cookie","acconsento all'uso del cookie","accpter et fermer","aceitar todos","aceitar y prosseguir","acepta todas las cookies","aceptar","aceptar cookies","aceptar todas","aceptar todas las cookies","aceptar todas y continuar","aceptar todo","aceptar todo / cerrar","aceptar todo y cerrar","aceptar y cerrar","aceptar y continuar","aceptar y continuar navegando","aceptar y seguir navegando","acepto","acepto las cookies","acepto y sigo navegando","agree","agree & close","agree & continue","agree & exit","agree all","agree and close","agree and continue","agree and proceed","akzeptieren","akzeptieren & schließen","akzeptieren und fortfahren","akzeptieren und schließen","akzeptieren und weiter","alle akzeptieren","alle annehmen","alle auswählen","alle auswählen & bestätigen","alle auswählen, weiterlesen und unsere arbeit unterstützen","alle cookie akzeptieren","alle cookies accepteren","cookies aanvaarden","alle cookies akzeptieren","alle cookies annehmen","alle cookies zulassen","alle zulassen","allen cookies zustimmen","allen zustimmen","alles akzeptieren","alles klar","allow","allow all","allow all cookies","allow cookies","allows cookies","annehmen","approvo","autoriser","autoriser les cookies","autoriser tous les cookies","autorizza","autorizza e chiudi","c'est ok","chiudi","chiudi o scorri la pagina","close","close this message and continue","compris","conferma","confirm","consent","consenti","consento","continua","continuar","continuare","continue","continue (accept cookies)","continue and accept","continue to site","continue with recommended cookies","continuer","cookies akzeptieren","cookies erlauben","cookies zulassen","cогласен","d'accord","d'accordo","d'acord","d'acord i tancar","da, accept","dai il consenso e accedi al sito","de acordo","de acuerdo","de acuerdo & cerrar","d’accordo","einverstanden","einwilligen","einwilligen und weiter zur website","enable all","enable all cookies","entés","erlauben","estoy de acuerdo","fermer","fine by me","fine by me, i accept","fortfahren","geht klar","got it","got it, thanks","happy to accept cookies","ho capito","i accept","i accept all","i accept all cookies","i accept cookies","i accept cookies from this site","i agree","i agree/consent to its terms","i am ok with this","i consent","i consent to cookies","i understand","i'm fine with this","i'm ok with analytics cookies","i'm ok with that","i'm ok with this","ich akzeptiere","ich stimme allem zu","ich stimme zu","ik ga akkoord","j'accept tout","j'accepte","j'accepte les cookies","j'ai compris","ja, ich stimme zu","je comprends","j’accepte","j’ai compris","mit allem einverstanden","no problem","ok","ok - diese meldung nicht mehr anzeigen","ok accetto","ok pour moi","ok, accept all","ok, accetta tutto","ok, accetto","ok, acepto","ok, capito","ok, chiaro","ok, grazie","ok, ho capito","ok, i agree","ok, j'accepte","ok, tout accepter","ok, weiter","okay","okay got it","okay, thank you","okay, thanks","oui","oui, j'accepts","permetti","permetti cookie","permetti cookies","permetto","permetto cookie","permetto cookies","permitir todas las cookies","prihvati i zatvori","prosegui","prosseguir","przejdź dalej","save and close","seguir navegando","select all","si","si, accetto","si, acepto","soy mayor de edad y acepto las cookies","sì","sì, acconsento","sì, sono d'accordo","that's ok","this is okay","tout accepter","tout accepter et continuer","tout accepter et fermer","tout autorizer","va bene","vicino","yes agreed","yes, continue","yes, i accept","yes, i agree","yes, i'm happy","yes, i’m happy","zustimmen","zustimmen & schließen","zustimmen & weiter","zustimmen und schließen","zustimmen und weiter","entendi","Принять","Я согласен", "accepteren", "kabul et", "tümünü kabul et", "Çerezleri Kabul Et"]);
    let candidateElements = [];
    const contents = document.querySelectorAll(GLOBAL_SELECTOR);
    for (const content of contents) {
        try {
            if (acceptWordList.has(content.textContent.toLowerCase().trim().trim(" ✓›!\n"))) {
                candidateElements.push(content);
            }
        } catch (error) {
            console.log(`Exception in processing element: ${content.id}`);
        }
    }
    return candidateElements;
}