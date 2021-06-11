// ChatEvolvedDiscordBot requires redis and webdis to be installed
//  and also Chat Evolved mod to be running on Ark and have working cross chat (/settings).

// --- Do not edit ---
var config = {};
config.switches = {};
config.webdis = {};
config.rcon = {};

// --- Edit below ---

// Basic config
// The name of your Ark servers cluster. Required.
config.clusterName = "my-cluster";
// The Discord bot token. Required.
config.token = "my-bot-token";
// Set the prefix to trigger the bot commands
config.prefix = "~";
// The Discord channel ID in which the bot will use to send/receive chat messages. Required.
config.channelID = "my-channel-id";
// The Webdis URL. It should be good as is. Required.
config.webdis.url = "http://127.0.0.1";
// The Webdis port. It should be good as is. Required.
config.webdis.port = "7379";

// Extra features config
// Enable/disable console output for successful processes. Optional.
config.switches.showLog = true;
// Enable/disable ability to read other bots messages. Optional.
config.switches.ignoreBots = true;
// Enable/disable bot activity status. Optional.
config.switches.setBotActivity = true;
// Set bot activity status message. Optional. Depends on: Set bot activity.
config.botActivityMessage = "ChatEvolvedDiscord";
// For RCON features make sure to use ?RCONEnabled=True?RCONPort=<some port> and -servergamelog -servergamelogincludetribelogs
//  in you ark server's startup command parameters.
// Set your RCON password. Optional.
config.rcon.password = "my-password";
// Set IP(s) and RCON port(s) of your Ark server(s). Optional. Depends on: RCON password.
// If you set servers which may be sometimes offline, redirect error output when running the bot to avoid spam from server unreachable errors.
// --> If you don't use all the examples, remove them or they'll break the bot. Ofcourse, you can add more if you want.
config.rcon.rconServers = [
    {
        name: "The Island",
        IP: "127.0.0.1",
        port: 32330
    },
    {
        name: "Aberration",
        IP: "127.0.0.1",
        port: 32331
    },
    {
        name: "Extinction",
        IP: "my-second-domain.com",
        port: 32330
    }
];
// Enable/disable get the game log from RCON. Optional. Depends on: RCON password, RCON servers.
config.switches.rconGameLog = false;
// Enable/disable Discord topic change with current online players. Optional. Depends on: RCON password, RCON servers.
config.switches.rconTopicChange = false;
// Enable/disable player join/left messages to be sent to Discord channel. Optional. Depends on: RCON password, RCON servers, RCON game log.
config.switches.rconPlayerNotifications = false;
// Set Discord channel ID if you want separated player notifications from in game chat channel or else leave it blank. Optional.
//  Depends on: RCON password, RCON servers, RCON game log, RCON player notifications.
config.rconPlayerNotificationsChannelID = "";
// Enable/disable Admin command log to be sent to a Discord channel. Optional. Depends on: RCON password, RCON servers, RCON game log.
config.switches.rconAdminCmdLog = false;
// Set Discord channel ID if you want separated Admin log from in game chat channel or else leave it blank. Optional.
//  Depends on: RCON password, RCON servers, Admin command log.
config.rconAdminCmdChannelID = "";
// Enable/disable Discord tribe log feed. Optional. Depends on: RCON password, RCON servers, RCON game log.
config.switches.rconTribeLog = false;
// Setup the tribe(s) you want to get tribe log from. Optional. Depends on: RCON password, RCON servers, RCON game log, RCON tribe log.
// --> If you don't use all the examples, remove them or they'll break the bot. Ofcourse, you can add more if you want.
config.rconTribes = [
    {
        tribename: "my-tribe",
        tribeRconIP: "127.0.0.1",
        tribeRconPort: 32330,
        tribeID: "my-tribe-id",
        tribeChannelID: "my-tribe-channel-id"
    },
    {
        tribename: "my-second-tribe",
        tribeRconIP: "my-second-domain.com",
        tribeRconPort: 32330,
        tribeID: "my-tribe-id",
        tribeChannelID: "my-tribe-channel-id"
    }
];

// --- Do not edit below ---
module.exports = config;
