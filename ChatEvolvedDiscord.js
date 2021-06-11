const Discord = require("discord.js");
const axios = require("axios");
const Rcon = require("source-rcon-client").default;
const fs = require("fs");
const path = require("path");
const process = require("process");
let config = require("./config");
const isNode = process.argv[0].replace(/\.exe/g, "").endsWith("node");
if (!isNode) {
  const deployPath = path.dirname(process.execPath);
  config = require(path.join(deployPath, "config.js"));
}

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

  const checkWebdis = async () => {
    try {
      await axios.get(`${webdisURL}:${webdisPort}/SET/hello/world`);
      await axios.get(`${webdisURL}:${webdisPort}/GET/hello`);
    } catch (err) {
      console.error(`Webdis seems not to be installed or not properly configured! \n${err}`);
      return;
    };
  };
  checkWebdis();

  if (setBotActivity) {
    setBotActivityMessage();
  }

  setInterval(getChat, 300);

  if (rconGameLog) {
    setInterval(getGameLog, 10000);
  }

  if (rconTribeLog) {
    setInterval(getTribeLog, 25000);
  }

  if (rconTopicChange) {
    setInterval(getPlayers, 300000);
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
  // ~test in any channel will return "Testing Ok" from the bot to verify it's running
  if (message.content.startsWith(`${prefix}test`)) {
    await message.channel.send("Testing ok!");
    return;
    //client.channels.cache.get(channelID).send("Testing ok!");
  }
  // ~help on any channel will display the available bot commands
  if (message.content.startsWith(`${prefix}help`)) {
    await message.channel.send(`\`\`\`Supported commands: \n${prefix}del <message number> - Deletes the specified amount of messages\`\`\``);
    return;
  }
  // Returns your most popular Discord invite
  if (message.content.startsWith(`${prefix}discord`)) {
    sendDiscordInvite(message);
    return
  }
  // ~del <number of messages> on channel will delete the specified amount of messages
  var args;
  var ownMsg;
  if (message.content.startsWith(`${prefix}del`)) {
    args = message.content.split(' ').splice(1)[0];
    if (message.member.hasPermission("MANAGE_MESSAGES")) {
      if (!args || !args === parseInt(args, 10) || args >= 100) {
        ownMsg = await message.channel.send("Define how many messages you want to delete (max 100 and newer than 14days)...");
        await ownMsg.delete({ timeout: 5000 });
      } else {
        var msgNum = args;
        msgNum++;
        try {
          const msgList = await message.channel.messages.fetch({ limit: msgNum });
          if (msgList) {
            await message.channel.bulkDelete(msgList);
            ownMsg = await message.channel.send(`Deleted ${args} messages.`);
            await ownMsg.delete({ timeout: 1000 });
          }
        } catch (err) {
          ownMsg = await message.channel.send("Couldn't delete the messages.");
          await ownMsg.delete({ timeout: 3000 });
        };
      }
    } else {
      ownMsg = await message.channel.send("You don't have the permissions required for that action!");
      await ownMsg.delete({ timeout: 3000 });
    }
  return;
  }
  // If IgnoreBots is disabled, messages starting with ~ from game chat will trigger the specified bot commands.
  // Returns your most popular Discord invite from the game chat
  if (message.content.indexOf(`: ${prefix}discord`) >= 0) {
    sendDiscordInvite(message);
    return;
  }
  // Ignores other channels' messages than the one specified to send to Ark servers
  if (message.channel.id !== channelID) return;
  // Ignores messages starting with [. Useful if ignoreBots is disabled.
  if (message.content.startsWith("[")) return;
  var user = message.author.username;
  var encodedUser = encodeURIComponent(message.author.username);
  var content = message.content;
  var encodedContent = encodeURIComponent(message.content);
  var sessionNameCE = encodeURIComponent(`${clusterName} Discord`);
  var serverNameCE = encodeURIComponent("Discord");
  let date = new Date();
  let epoch = date.getTime() / 1000;
  let epochString = epoch.toFixed(7);
  let year = (date.getUTCFullYear());
  let day = ("0" + date.getUTCDate()).slice(-2);
  let month = ("0" + (date.getUTCMonth() + 1)).slice(-2);
  let hours = ("0" + date.getUTCHours()).slice(-2);
  let minutes = ("0" + date.getUTCMinutes()).slice(-2);
  let seconds = ("0" + date.getUTCSeconds()).slice(-2);
  try {
    const sendChatMessage = await axios.get(`${webdisURL}:${webdisPort}/LPUSH/${clusterName}/%7B%22SessionName%22%3A%20%22${sessionNameCE}%22%2C%22Color%22%3A%20%5B%20128%2C%20128%2C%20128%2C%201%20%5D%2C%22Epoch%22%3A%20${epochString}%2C%22Date%22%3A%20%5B%22${year}%22%2C%22${month}%22%2C%22${day}%22%5D%2C%22Timestamp%22%3A%20%5B%22${hours}%22%2C%22${minutes}%22%2C%22${seconds}%22%5D%2C%22ServerName%22%3A%20%22${serverNameCE}%22%2C%22SurvivorName%22%3A%20%22${encodedUser}%22%2C%22TribeName%22%3A%20%22%22%2C%22Message%22%3A%20%22${encodedContent}%22%7D`);
    if (showLog) console.log(`Message from Discord to Ark: ${user}: ${content}`);
  } catch (err) {
    console.error(`Error (14). Axios failed to send chat message in message()! \n${err}`);
  };
});

const setBotActivityMessage = async () => {
  try {
    await client.user.setActivity(botActivityMessage, {
      type: "Running"
    });
  } catch (err) {
    console.error(`Failed to set bot activity in setBotActivityMessage()! \n${err}`);
  };
};

const sendDiscordInvite = async (message) => {
  try {
    var invites = await message.guild.fetchInvites();
    let invitesArray = [];
    invites.forEach(invite => invitesArray.push({ code: invite.code, uses: invite.uses }));
    invitesArray.sort((a, b) => { return a.uses - b.uses; });
    var discordInvite = invitesArray.slice(-1)[0].code;
    await message.channel.send(`https://discord.gg/${discordInvite}`);
  } catch (err) {
    console.error(`Error (21). Failed to send Discord invite in sendDiscordInvite()! \n${err}`);
  };
};

const getChat = async () => {
  try {
    var chatMessage = await axios.get(`${webdisURL}:${webdisPort}/LRANGE/${clusterName}/0/1`);
    chatMessage = chatMessage.data.LRANGE[0];
    chatMessage = JSON.parse(chatMessage);
    if (!chatMessage.TribeName) chatMessage.TribeName = "No Tribe";
    chatMessage = `[${chatMessage.ServerName}] (${chatMessage.SurvivorName}) [${chatMessage.TribeName}]: ${chatMessage.Message}`;
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
      await client.channels.cache.get(channelID).send(chatMessage);
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
                await client.channels.cache.get(tribeChannelID).send(`[${rconServerName}]: ${tribeLog}`);
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
              await client.channels.cache.get(rconAdminCmdChannelID).send(`[${rconServerName}]: ${adminCmdLog}`);
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
              await client.channels.cache.get(rconPlayerNotificationsChannelID).send(`[${rconServerName}]: ${playerNotificationsLog.replace(/^.*: /, "")}`);
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
