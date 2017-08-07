const Telebot = require('telebot');
const fs = require('fs');
const mysql = require('mysql');
const token = fs.readFileSync('TOKEN', 'utf8');
const en = JSON.parse(fs.readFileSync('en.json', 'utf8'));
const fa = JSON.parse(fs.readFileSync('fa.json', 'utf8'));
const bot = new Telebot(token);
let lang = en;
let flight = {
    number: null,
    date: null,
    mode: null
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
let keyboardMarkups = null;
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
    keyboardMarkups = {
        getFlightType: [[lang.flight.arrival, lang.flight.departure]]
    }
    return true;

}
function showKbPrompt(msg, prompt) {
    let replyMarkup = bot.keyboard(keyboardMarkups[state] || undefined, defaultOptions);
    return bot.sendMessage(msg.from.id, lang.flight[prompt], {
        replyMarkup
    });
}


async function flightInfoQuery(msg, flightObj) {
    let sqlQuery = 'SELECT * FROM airlineinfo WHERE flightnumber = ' + connection.escape(flightObj.number) + ' AND ' + 'flighttype = ' + connection.escape(flightObj.mode)
        + ' AND ' + 'dateflight = ' + connection.escape(flightObj.date);
    console.log(sqlQuery.toString());
    await connection.query(sqlQuery, (error, rows) => {
        if (error) {
            console.log(error);
            return false;
        }
        state = botStates.getFlightType;
        if (rows[0])
            bot.sendMessage(msg.from.id, flightInfoResponse(rows), { parseMode: 'Markdown' });
        else
            bot.sendMessage(msg.from.id, lang.flight.notFound);

    });
    setTimeout(() => showKbPrompt(msg, 'getType'), 1500);
    state = botStates.getFlightType;
    return;
}

function flightInfoResponse(dbRow) {
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
    let finalPart = null;
    if (flighttype === 'ARR') {
        finalPart = '*' + lang.flight.hall + ' *' + hallbelt;
    }
    else if (flighttype === 'DEP') {
        finalPart = '*' + lang.flight.gate + ' *' + gate;
    }

    return (
        '_' + lang.flight.responseHeader + '_' + '`' + flightnumber + '`' + '\n' +
        '*' + lang.flight.type + ': *' + (flighttype === 'ARR' ? lang.flight.arrival : lang.flight.departure) + '\n' +
        '*' + lang.flight.date + ': *' + dateflight + '\n' +
        '*' + lang.flight.airlineName + ' *' + airline + '\n' +
        '*' + (flighttype === 'ARR' ? lang.flight.from : lang.flight.destination) + ' *' + (lang === en ? destinationen : destinationfa) + '\n' +
        '*' + lang.flight.scheduled + ' *' + scheduled + '\n' +
        '*' + lang.flight.actual + ' *' + actual + '\n' +
        '*' + lang.flight.remarks + ' *' + (lang === en ? remarksen : remarksfa) + '\n' +
        '*' + lang.flight.status + ' *' + (lang === en ? statusen : statusfa) + '\n' +
        finalPart
        //'*' + (flighttype === 'ARR' ? lang.flight.hall + ': *' + hallbelt : (lang.flight.gate + ': *' + gate + '\n' + lang.flight.checkIn + ': *' + checkin))
        //'*' + (flighttype === 'ARR' ? lang.flight.hall + ': *' + hallbelt : (/*lang.flight.gate + ': *' + gate + '\n' + lang.flight.checkIn + ': *' + checkin*/undefined))
    )
}
bot.on(['/start'], (msg) => {
    let replyMarkup = bot.keyboard([
        [en.languageText, fa.languageText]], defaultOptions);
    state = botStates.langSelect;
    return bot.sendMessage(msg.from.id, '✈✈✈' + '\n\n' + fa.startText + '\n\n' + en.startText, { replyMarkup });
});


bot.on('text', (msg) => {
    switch (state) {
        case botStates.langSelect:
            if (languageSelector(msg.text)) {
                bot.sendMessage(msg.from.id, lang.languageText + lang.selected);
                state = botStates.getFlightType;
                showKbPrompt(msg, 'getType');
            } else {
                inputError(msg.from.id);
                state = botStates.start;
                setTimeout(() => bot.event(['/start'], msg), 500);
            }
            break;
        case botStates.getFlightType:
            console.log(msg.text);

            if (msg.text === lang.flight.arrival) {
                flight.mode = 'ARR';
            }
            else if (msg.text === lang.flight.departure) {
                flight.mode = 'DEP';
            }
            else {
                inputError(msg.from.id);
                state = botStates.getFlightType;
                setTimeout(() => showKbPrompt(msg, 'getType'), 500);
                break;
            }
            state = botStates.getflightInfo.Number;
            showKbPrompt(msg, 'getNumber');
            break;
        case botStates.getflightInfo.Number:
            flight.number = msg.text;
            state = botStates.getflightInfo.Date;
            showKbPrompt(msg, 'getDate');
            break;
        case botStates.getflightInfo.Date:
            flight.date = msg.text;
            state = botStates.response;
            flightInfoQuery(msg, flight);

            break;

    }

});
connection.connect();
bot.start();