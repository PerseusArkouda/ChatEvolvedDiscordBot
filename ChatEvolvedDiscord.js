//Basic config
// Required Discord prefix
const prefix = "~";
// Required Discord Bot token
const token = "Your-Discord-Bot-Token-Here";
// Required Discord Channel ID
const channelID = "Your-Discord-Channel-ID-Here";
// Required Webdis HTTP url to retrieve messages
var getMessageURL = "http://127.0.0.1:7379/LRANGE/YOUR-CLUSTER-HERE/0/1";
// Required Webdis HTTP url to send messages
var sendMessageURL = "http://127.0.0.1:7379/LPUSH/YOUR-CLUSTER-HERE/";


// No need to change below
// Required discord.js npm module
const Discord = require("discord.js");
// Required HTTP request npm module
var request = require('request');

var result;
var previousResult;
var olderResult;
const client = new Discord.Client();

client.once("ready", () => {
 client.user.setActivity("ChatEvolved Ark Cross Chat", {type: "Type"});

 // Read messages from Webdis every 0.2s and post to Discord if any new comes up
 setInterval(() => lastMessage(getMessageURL, function(body) {
  Object.keys(body).forEach(e => result=`${body[e]}`);
  result = result.replace(/,<.*/, "");
  result = result.replace(/<.*\">/, "");
  result = result.replace(/<\/>/, "");
  if (result !== previousResult && result !== olderResult) {
   if (result.indexOf("[Discord]") >= 0) return;
   client.channels.cache.get(channelID).send(result);
   //console.log(result);
   previousResult = result;
   olderResult = previousResult;
  }
 return;
 }), 200);

function lastMessage(getMessageURL, callback) {
  request({
   url: getMessageURL,
   json: true
  }, function (error, response, body) {
   if (!error && response.statusCode === 200) {
    callback(body);
   }
  });
 }

 console.log("Ready!");
});

client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

client.once("disconnect", () => {
  console.log("Disconnect!");
});

client.on("message", async message => {
 // Ignores other bot messages
 if (message.author.bot) return;
 // Ignores other channel messages than the one specified here
 if (message.channel.id !== channelID) return;

 // ~test in specified channel will return "Testing Ok" from the bot to verify it's running
 if (message.content.startsWith(`${prefix}test`)) {
  test(message);
  return;
 }

 // Start executing commands
 execute(message, getMessageURL);
});

function execute(message, getMessageURL) {
 var args = message.content.split(" ").slice(1);
 var args = args.toString().replace(/,/g," ");

// Send messages from Discord to Webdis
 try {
  var user = encodeURIComponent(message.author.username);
  var content = encodeURIComponent(message.content);
  var sendMessageWebdis = sendMessageURL + "\<RichColor%20Color=\"0.5,%200.5,%200.5,%201\"\>[Discord]%20\(" + user + "\):\<%2F\>%20" + content;
  sendMessage(message, sendMessageWebdis);
 } catch (err) {
  console.log(err);
 }
}

function test(message) {
 client.channels.cache.get(channelID).send("Testing ok!");
 return;
}


function sendMessage(message, sendMessageWebdis) {
 request(sendMessageWebdis, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(body)
  }
 });
 return;
}

client.login(token);
