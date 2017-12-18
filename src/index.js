'use strict';

const ViberBot = require('viber-bot').Bot;
const BotEvents = require('viber-bot').Events;
const TextMessage = require('viber-bot').Message.Text;
const UrlMessage = require('viber-bot').Message.Url;
require('dotenv').config();

const winston = require('winston');
const toYAML = require('winston-console-formatter');
const ngrok = require('./get_public_url');

var request = require('request');

function createLogger() {
    const logger = new winston.Logger({
        level: "debug" // We recommend using the debug level for development
    });

    logger.add(winston.transports.Console, toYAML.config());
    return logger;
}

function say(response, message) {
    //response.send(new TextMessage(message));
}

function checkUrlAvailability(botResponse, urlToCheck) {

    if (urlToCheck === '') {
        //say(botResponse, 'I need a URL to check');
        return;
    }

    //say(botResponse, 'One second...Let me check!');

    var url = urlToCheck.replace(/^http:\/\//, '');
    request('http://isup.me/' + url, function(error, requestResponse, body) {
        if (error || requestResponse.statusCode !== 200) {
            //say(botResponse, 'Something is wrong with isup.me.');
            return;
        }

        if (!error && requestResponse.statusCode === 200) {
            if (body.search('is up') !== -1) {
                //say(botResponse, 'Hooray! ' + urlToCheck + '. looks good to me.');
            } else if (body.search('Huh') !== -1) {
                //say(botResponse, 'Hmmmmm ' + urlToCheck + '. does not look like a website to me. Typo? please follow the format `test.com`');
            } else if (body.search('down from here') !== -1) {
                //say(botResponse, 'Oh no! ' + urlToCheck + '. is broken.');
            } else {
                //say(botResponse, 'Snap...Something is wrong with isup.me.');
            }
        }
    })
}

const logger = createLogger();



// Creating the bot with access token, name and avatar
const bot = new ViberBot(logger, {
    authToken: "471409239aa7d393-8092b2ab7f344f06-4cf82b8deb78a1b2", // Learn how to get your access token at developers.viber.com
    name: "Is It Up",
    avatar: "https://raw.githubusercontent.com/devrelv/drop/master/151-icon.png" // Just a placeholder avatar to display the user
});

// The user will get those messages on first registration
bot.onSubscribe(response => {
    //say(response, `Hi there ${response.userProfile.name}. I am ${bot.name}! Feel free to ask me if a web site is down for everyone or just you. Just send me a name of a website and I'll do the rest!`);
});



bot.on(BotEvents.MESSAGE_RECEIVED, (message, response) => {
    // This sample bot can answer only text messages, let's make sure the user is aware of that.
    if (!(message instanceof TextMessage)) {
        //say(response, `Sorry. I can only understand text messages.`);
    }else{

		
	}
});

bot.onTextMessage(/./, (message, response) => {
    checkUrlAvailability(response, message.text);




    var jsonData = {
        "auth_token":"471409239aa7d393-8092b2ab7f344f06-4cf82b8deb78a1b2",
        "receiver":"",
        "min_api_version":1,
        "sender":{
            "name":"John McClane",
            "avatar":"http://avatar.example.com"
        },
        "tracking_data":"tracking data",
        "type":"text",
        "text":"Hello world!"
    };

    request.post("https://chatapi.viber.com/pa/send_message", {json: true, body: jsonData}, function(err, res, body) {
        if (!err && res.statusCode === 200) {

            console.log(res);
        }
    });

});

bot.onTextMessage(/^hi|hello$/i, (message, response) => {

    var jsonData = {
        "auth_token":"471409239aa7d393-8092b2ab7f344f06-4cf82b8deb78a1b2",
        "receiver":"",
        "min_api_version":1,
        "sender":{
            "name":"John McClane",
            "avatar":"http://avatar.example.com"
        },
        "tracking_data":"tracking data",
        "type":"text",
        "text":"Hello world!"
    };

    request.post("https://chatapi.viber.com/pa/send_message", {json: true, body: jsonData}, function(err, res, body) {
        if (!err && res.statusCode === 200) {

            console.log(res);
        }
    });




});


if (process.env.NOW_URL || process.env.HEROKU_URL) {
    const http = require('http');
    const port = process.env.PORT || 8080;

    http.createServer(bot.middleware()).listen(port, () => bot.setWebhook(process.env.NOW_URL || process.env.HEROKU_URL));
} else {
    logger.debug('Could not find the now.sh/Heroku environment variables. Trying to use the local ngrok server.');
    return ngrok.getPublicUrl().then(publicUrl => {
        const http = require('http');
        const port = process.env.PORT || 8080;

        http.createServer(bot.middleware()).listen(port, () => bot.setWebhook(publicUrl));

    }).catch(error => {
        console.log('Can not connect to ngrok server. Is it running?');
        console.error(error);
        process.exit(1);
    });
}
