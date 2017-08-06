const Telebot = require('telebot');
const fs = require('fs');
const mysql = require('mysql');
const token = fs.readFileSync('TOKEN', 'utf8');
const en = JSON.parse(fs.readFileSync('en.json'));
const fa = JSON.parse(fs.readFileSync('fa.json'));
const bot = new Telebot(token);
let lang = null;
let flight = {
    number: null,
    date: null
}
const botStates = {
    start: "start",
    langSelect: "langSelect",
    getFlightType: "getFlightType",
    getflightInfo: {
        Date: "Date",
        Number: "Number",
    },
    response: "response"
}
const connection = mysql.createConnection({
    host: '192.3.63.197',
    user: 'reza',
    password: 'bioshits00',
    database: 'airline'
});
const defaultOptions = {
    resize: true,
    once: true
}
let keyboardMarkups = {
    getFlightType =[[lang.flight.arrival, lang.flight.departure]],
};
let state = botStates.start;
function inputError(messageId) {
    bot.sendMessage(messageId, (en.entryUndefined) + '\n\n' + (fa.entryUndefined));
}
function languageSelector(message) {
    if (message === fa.languageText)
        lang = fa;
    else if (message === en.languageText)
        lang = en;
    else
        return false;
    return true;
}
function showKbPrompt(msg, prompt) {
    let replyMarkup = bot.keyboard(keyboardMarkups[state] || undefined, defaultOptions);
    return bot.sendMessage(msg.from.id, lang.prompt, {
        replyMarkup
    });
}


function flightStatusResponse(dbRow) {
    const dependantCols = {
        destination: (lang === en ? destinationen : destinationfa),
        remarks: (lang === en ? remarksen : remarksfa),
        status: (lang === en ? statusen : statusfa)

    }
    const {
        flightnumber,
        airline,
        scheduled,
        flighttype,
        actual,
        dateflight,
        checkin,
        gate,
        hallbelt,
        remarksen,
        destinationen,
        statusen,
        remarksfa,
        destinationfa,
        statusfa,
    } = dbRow[0];

    return (
        '*' + lang.flight.flight + lang.flight.type + ': *' + (flighttype === 'ARR' ? lang.flight.arrival : lang.flight.departure) + '\n' +
        '*' + lang.flight.date + '*' +  dateflight + '\n' +
        '*' + lang.flight.airlineName + ': *' + airline + '\n' +
        '*' +  (flighttype === 'ARR' ? lang.flight.from : lang.flight.destination) + ': *' + (lang === en ? destinationen : destinationfa) + '\n' +
        '*' + lang.flight.scheduled + ': *' + scheduled + '\n' +
        '*' + lang.flight.actual + ': *' + actual + '\n' +
        '*' + lang.flight.remarks + ': *' + (lang === en ? remarksen : remarksfa) + '\n' +
        '*' + lang.flight.status + ': *' + (lang === en ? statusen : statusfa) + '\n' +
        '*' +  (flighttype === 'ARR' ? lang.flight.hall + ': *' + hallbelt : lang.flight.gate+ ': *' +gate+ '\n' + lang.flight.checkIn+ ': *'+checkin )
    )
}