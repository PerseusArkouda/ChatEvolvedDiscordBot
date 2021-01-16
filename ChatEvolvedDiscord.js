const Discord = require("discord.js");
const axios = require("axios");
const Rcon = require("source-rcon-client").default;
const config = require("./config");

const clusterName = config.clusterName;
const token = config.token;
const prefix = config.prefix;
const channelID = config.channelID;
const webdisURL = config.webdis.url;
const webdisPort = config.webdis.port;
const showLog = config.switches.showLog;
const ignoreBots = config.switches.ignoreBots;
const setBotActivity = config.switches.setBotActivity;
const botActivityMessage = config.botActivityMessage;
const rconPassword = config.rcon.password;
const rconServers = config.rcon.rconServers;
const rconGameLog = config.switches.rconGameLog;
const rconTopicChange = config.switches.rconTopicChange;
const rconPlayerNotifications = config.switches.rconPlayerNotifications;
var rconPlayerNotificationsChannelID = config.rconPlayerNotificationsChannelID;
const rconAdminCmdLog = config.switches.rconAdminCmdLog;
var rconAdminCmdChannelID = config.rconAdminCmdChannelID;
const rconTribeLog = config.switches.rconTribeLog;
const rconTribes = config.rconTribes;

const client = new Discord.Client();

var gamelogID;
var rconServerName;
var antiSpamChatMessage;

client.once("ready", () => {

  if (setBotActivity) {
    client.user.setActivity(botActivityMessage, {
       type: "Type"
    });
  }

  setInterval(getChat, 300);

  if (rconGameLog) {
    setInterval(getGameLog, 10000);
  }

  if (rconTribeLog) {
    setInterval(getTribeLog, 25000);
  }

  if (rconTopicChange) {
    setInterval(getPlayers, 75000);
  }

  if (rconPlayerNotifications) {
    setInterval(getPlayerNotifications, 5000);
  }

  if (rconAdminCmdLog) {
    setInterval(getAdminCmd, 7000);
  }

 console.log("ChatEvolvedDiscord Ready!");
});

client.once("reconnecting", () => {
        console.log("ChatEvolvedDiscord Reconnecting!");
});

client.once("disconnect", () => {
        console.log("ChatEvolvedDiscord Disconnected!");
});

client.on("message", async message => {
  if (ignoreBots && message.author.bot) return;
  // Ignores messages starting with [. Useful if ignoreBots is disabled.
  if (message.content.startsWith("[")) return;
  // Ignores other channels' messages than the one specified
  if (message.channel.id !== channelID) return;
  // ~test in specified channel will return "Testing Ok" from the bot to verify it's running
  if (message.content.startsWith(`${prefix}test`)) {
    client.channels.cache.get(channelID).send("Testing ok!");
  }
  var user = message.author.username;
  var encodedUser = encodeURIComponent(message.author.username);
  var content = message.content;
  var encodedContent = encodeURIComponent(message.content);
  try {
    const sendChatMessage = await axios.get(`${webdisURL}:${webdisPort}/LPUSH/${clusterName}/\<RichColor%20Color=\"0.5,%200.5,%200.5,%201\"\>[Discord]%20\(${encodedUser}\):\<%2F\>%20${encodedContent}`);
    if (showLog) console.log(`Message from Discord to Ark: ${user}: ${content}`);
  } catch (err) {
    console.error(`Error (14). Axios failed to send chat message in message()! \n${err}`);
  };
});

const getChat = async () => {
  try {
    var chatMessage = await axios.get(`${webdisURL}:${webdisPort}/LRANGE/${clusterName}/0/1`);
    chatMessage = chatMessage.data.LRANGE[0].replace(/,<.*/, "").replace(/<.*\">/, "").replace(/<\/>/, "");
    var previousChatMessage = await axios.get(`${webdisURL}:${webdisPort}/GET/${clusterName}-lastMessage`);
    previousChatMessage = previousChatMessage.data.GET;
    if (chatMessage !== previousChatMessage && chatMessage !== antiSpamChatMessage) {
      antiSpamChatMessage = chatMessage;
      //console.log(`DEBUG: chatMessage: ${chatMessage}`);
      //console.log(`DEBUG: previousChatMessage: ${previousChatMessage}`);
      var encodedChatMessage = encodeURIComponent(chatMessage);
      try {
        const setPreviousChatMessage = await axios.get(`${webdisURL}:${webdisPort}/SET/${clusterName}-lastMessage/${encodedChatMessage}`);
      } catch (err) {
        console.error(`Error (12). Axios failed to set previous chat message in getChat()! \n${err}`);
      };
      if (chatMessage.indexOf("[Discord]") >= 0) return;
      if (showLog) console.log(`Message from Ark: ${chatMessage}`);
      client.channels.cache.get(channelID).send(chatMessage);
    }
  } catch (err) {
    console.error(`Error (13). Failed to get chat messages in getChat()! \n${err}`);
  };
};

function getServerInfo(rconServer, rconPort, rconServerName) {
  for (let i = 0, l = rconServers.length; i < l; i++) {
    var getServerIP = rconServers[i].IP.match(rconServer);
    var getServerPort = rconServers[i].port.toString().match(rconPort);
    if (getServerIP && getServerPort) {
      if (rconServerName) {
        rconServerName = `${rconServers[i].name}`;
        return rconServerName;
      } else {
        gameLogID = `${i}${getServerPort}`;
        return gameLogID;
      }
    }
  }
}

const getGameLog = async () => {
    for (let i = 0, l = rconServers.length; i < l; i++) {
      var rconServer = rconServers[i].IP;
      var rconPort = rconServers[i].port;
      var gameLogID = `${i}${rconPort}`;
      const delGameLog = async () => {
        try {
          //tmp
	  const delOldTable = await axios.get(`${webdisURL}:${webdisPort}/DEL/gameLog-${rconPort}`);
          const delTable = await axios.get(`${webdisURL}:${webdisPort}/DEL/gameLog-${gameLogID}`);
        } catch (err) {
          console.error(`Error (6). Axios failed to delete gameLog table in getTribeLog()! \n${err}`);
        };
      };
      setInterval(delGameLog, 86400000);
      var rcon = new Rcon(rconServer, rconPort, rconPassword);
      try {
        const rconConnect = await rcon.connect();
        const rconReply = await rcon.send("getgamelog");
        const gameLog = rconReply.split(/\n/g);
        if (gameLog) {
          for (let j = 0, m = gameLog.length; j < m; j++) {
            if (gameLog[j].match(/[a-z]/)) {
               var filteredGameLog = gameLog[j].match(/Server received, But no response!!/);
               if (!filteredGameLog) {
                 //console.log(`DEBUG: gameLog for ${rconServer}:${rconPort}: ${gameLog[j]}`);
                 var encodedGameLog = encodeURIComponent(gameLog[j]);
                 try {
                   const sendGameLog = await axios.get(`${webdisURL}:${webdisPort}/LPUSH/gameLog-${gameLogID}/${gameLog[j]}`);
                 } catch (err) {
                   console.error(`Error (7). Axios failed to send gameLog in getGameLog()! \n${err}`);
                 };
               }
            }
          }
        }
        const rconDisconnect = await rcon.disconnect();
      } catch (err) {
        // Commented out the actual error output to avoid spam from offline servers.
        //console.error(`Error (8). ${rconServer}:${rconPort} is unreachable in getGameLog()! \n${err}`);
      };
    }
  };

const getTribeLog = async () => {
    for (let i = 0, l = rconTribes.length; i < l; i++) {
      var tribeName = rconTribes[i].tribeName;
      var tribeRconServer = rconTribes[i].tribeRconIP;
      var tribeRconPort = rconTribes[i].tribeRconPort;
      var tribeID = rconTribes[i].tribeID;
      var tribeChannelID = rconTribes[i].tribeChannelID;
      gameLogID = getServerInfo(tribeRconServer, tribeRconPort);
      try {
        const getTribeLog = await axios.get(`${webdisURL}:${webdisPort}/LRANGE/gameLog-${gameLogID}/0/100`);
        var tribeLog = getTribeLog.data.LRANGE.sort().filter(item => item.indexOf(tribeID) !== -1).slice(-1)[0];
        if (tribeLog) {
          tribeLog = tribeLog.replace(/,<.*/, "").replace(/<.*\">/, "").replace(/<\/>/, "").replace(/<$/, "");
          try {
            var previousTribeLog = await axios.get(`${webdisURL}:${webdisPort}/GET/tribeLog-${tribeID}-${tribeRconPort}`);
            previousTribeLog = previousTribeLog.data.GET;
            if (tribeLog !== previousTribeLog) {
              //console.log(`DEBUG: tribeLog for ${tribeRconServer}:${tribeRconPort}: ${tribeLog}`);
              rconServerName = getServerInfo(tribeRconServer, tribeRconPort, "true");
              var encodedTribeLog = encodeURIComponent(tribeLog);
              try {
                const sendTribeLog = await axios.get(`${webdisURL}:${webdisPort}/SET/tribeLog-${tribeID}-${tribeRconPort}/${encodedTribeLog}`);
                client.channels.cache.get(tribeChannelID).send(`[${rconServerName}]: ${tribeLog}`);
                if (showLog) console.log(`Tribe log: ${tribeLog}`);
              } catch (err) {
                console.error(`Error (10). Failed to send tribeLog in getTribeLog()! \n${err}`);
              };
            }
          } catch (err) {
            console.error(`Error (11). Failed to get tribeLog in getTribeLog()! \n${err}`);
          };
        }
      } catch (err) {
        // Commented out the actual error output to avoid spam when there are no tribe logs.
        //console.error(`Error (1). ${tribeRconServer}:${tribeRconPort} is unreachable in getTribeLog()! \n${err}`);
      };
    }
  };

const getAdminCmd = async () => {
  for (let i = 0, l = rconServers.length; i < l; i++) {
    var rconServer = rconServers[i].IP;
    var rconPort = rconServers[i].port;
    var rconServerName = rconServers[i].name;
    var gameLogID = `${i}${rconPort}`;
    try {
      const getAdminCmdLog = await axios.get(`${webdisURL}:${webdisPort}/LRANGE/gameLog-${gameLogID}/0/100`);
      var adminCmdLog = getAdminCmdLog.data.LRANGE.sort().filter(item => item.indexOf("AdminCmd") !== -1).slice(-1)[0];
      if (adminCmdLog) {
        try {
          var previousAdminCmdLog = await axios.get(`${webdisURL}:${webdisPort}/GET/lastAdminCmdLog-${gameLogID}`);
          previousAdminCmdLog = previousAdminCmdLog.data.GET;
          if (adminCmdLog !== previousAdminCmdLog) {
            //console.log(`DEBUG: [${rconServerName}]: AdminCmd log: ${adminCmdLog}`);
            var encodedAdminCmdLog = encodeURIComponent(adminCmdLog);
            try {
              const sendAdminCmdLog = await axios.get(`${webdisURL}:${webdisPort}/SET/lastAdminCmdLog-${gameLogID}/${encodedAdminCmdLog}`);
              if (rconAdminCmdChannelID) {
                rconAdminCmdChannelID = rconAdminCmdChannelID;
              } else {
                rconAdminCmdChannelID = channelID;
              }
              client.channels.cache.get(rconAdminCmdChannelID).send(`[${rconServerName}]: ${adminCmdLog}`);
              if (showLog) console.log(`[${rconServerName}]: AdminCmd log: ${adminCmdLog}`);
            } catch (err) {
              console.error(`Error (15). Failed to send adminCmdLog in getAdminCmd()! \n${err}`);
            };
          }
        } catch (err) {
          console.error(`Error (16). Failed to get adminCmdLog in getAdminCmd()! \n${err}`);
        };
      }
    } catch (err) {
     // Commented out the actual error output to avoid spam from offline servers.
     // console.error(`Error (17). ${rconServerName} is unreachable in getAdminCmd()! \n${err}`);
    };
  }
};

const getPlayerNotifications = async () => {
  for (let i = 0, l = rconServers.length; i < l; i++) {
    var rconServer = rconServers[i].IP;
    var rconPort = rconServers[i].port;
    var rconServerName = rconServers[i].name;
    var gameLogID = `${i}${rconPort}`;
    try {
      const getPlayerNotificationsLog = await axios.get(`${webdisURL}:${webdisPort}/LRANGE/gameLog-${gameLogID}/0/100`);
      var playerNotificationsLog = getPlayerNotificationsLog.data.LRANGE.sort().filter(item => item.indexOf("this ARK!") !== -1).slice(-1)[0];
      if (playerNotificationsLog) {
        try {
          var previousPlayerNotificationsLog = await axios.get(`${webdisURL}:${webdisPort}/GET/lastPlayerNotificationsLog-${gameLogID}`);
          previousPlayerNotificationsLog = previousPlayerNotificationsLog.data.GET;
          if (playerNotificationsLog !== previousPlayerNotificationsLog) {
            //console.log(`DEBUG: [${newRconServerName}]: playerNotifications log: ${playerNotificationsLog}`);
            var encodedPlayerNotificationsLog = encodeURIComponent(playerNotificationsLog);
            try {
              const sendPlayerNotificationsLog = await axios.get(`${webdisURL}:${webdisPort}/SET/lastPlayerNotificationsLog-${gameLogID}/${encodedPlayerNotificationsLog}`);
              if (rconPlayerNotificationsChannelID) {
                rconPlayerNotificationsChannelID = rconPlayerNotificationsChannelID;
              } else {
                rconPlayerNotificationsChannelID = channelID;
              }
              client.channels.cache.get(rconPlayerNotificationsChannelID).send(`[${rconServerName}]: ${playerNotificationsLog.replace(/^.*: /, "")}`);
              if (showLog) console.log(`[${rconServerName}]: Player Notifications log: ${playerNotificationsLog.replace(/^.*: /, "")}`);
            } catch (err) {
              console.error(`Error (18). Failed to send playerNotificationsLog in getPlayerNotifications()! \n${err}`);
            };
          }
        } catch (err) {
          console.error(`Error (19). Failed to get playerNotificationsLog in getPlayerNotifications()! \n${err}`);
        };
      }
    } catch (err) {
      // Commented out the actual error output to avoid spam from offline servers.
      //console.error(`Error (20). ${rconServerName} is unreachable in getPlayerNotifications()! \n${err}`);
    };
  }
};

function getPlayers() {
        const delRconTable = async () => {
            try {
                const delTable = await axios.get(`${webdisURL}:${webdisPort}/DEL/listplayers`);
            } catch (err) {
                console.error(`Error (2). Axios failed to delete rcon table in delRconPlayers()! \n${err}`);
            };
        };
        delRconTable();

        const addRconPlayers = async () => {
            for (let i = 0, l = rconServers.length; i < l; i++) {
                var rconServer = rconServers[i].IP;
                var rconPort = rconServers[i].port;
                var rcon = new Rcon(rconServer, rconPort, rconPassword);
                try {
                    const rconConnect = await rcon.connect();
                    const rconReply = await rcon.send("listplayers");
                    const players = rconReply.match(/\n/g).length - 1;
                    //console.log(`DEBUG: Checking ${rconServer}:${rconPort}: ${players} players found.`);
                    try {
                        const addRconPlayers = await axios.get(`${webdisURL}:${webdisPort}/LPUSH/listplayers/${players}`);
                    } catch (err) {
                        console.error(`Error (3). Axios failed to add players in addRconPlayers()! \n${err}`);
                    };
                    const rconDisconnect = await rcon.disconnect();
                } catch (err) {
                    // Commented out the actual error output to avoid spam from offline servers.
                    //console.error(`Error (4). ${rconServer}:${rconPort} is unreachable in addRconPlayers()! \n${err}`);
                };
            }
            try {
                const gettingPlayers = await axios.get(`${webdisURL}:${webdisPort}/LRANGE/listplayers/0/30`);
                const totalPlayers = gettingPlayers.data.LRANGE.map(function (x) {
                    return parseInt(x, 10);
                }).reduce(function (a, b) {
                    return a + b;
                }, 0);
               if (showLog) console.log(`Total players in ${clusterName}: ${totalPlayers}`);
               client.channels.cache.get(channelID).setTopic(`Current online players in ${clusterName}: ${totalPlayers}`);
            } catch (err) {
                console.error(`Error (5). Axios failed to set totalPlayers in addRconPlayers()! \n${err}`);
            };
        };
        addRconPlayers();
    }

client.login(token);
