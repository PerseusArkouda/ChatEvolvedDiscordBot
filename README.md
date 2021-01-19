# ChatEvolvedDiscordBot
Discord integration for ARK's Chat Evolved mod  
https://steamcommunity.com/sharedfiles/filedetails/?id=1551199162

### News:
- Added support to compile to executable binary
- Added precompiled executable binaries to Releases
- Removed instructions for running from source with node and replaced with the ones for precompiled executable binaries  
To install yourself: npm install
To build binary: npm run build-win or npm run build-linux
To run: npm start

## Features
- It will send/receive messages to/from specified Discord channel back/to your ARK servers 
- Supports UTF-8. ARK doesn't. Global font fix guide: https://steamcommunity.com/sharedfiles/filedetails/?id=732646921
- It can send tribe log to Discord in specified tribe channels
- It can set channel's topic with online players of your cluster
- It can show player notifications (join/left)
- It can log Admin commands and send in specified channel
- Supported commands:  
~del <messages number> - Deletes specified number of messages in current Discord channel  
~discord - Returns your most popular Discord invite (works also from the game chat)  
(more to come...)

### Instructions for fully working Chat Evolved mod with ChatEvolvedDiscordBot
### 1) Install Docker
(Required enabled Virtualization in your BIOS/UEFI.)
#### Windows:
Leave everything default on setup. It may ask you to enable Hyper-V. Say yes.  
https://hub.docker.com/editions/community/docker-ce-desktop-windows
#### Linux:
Install via your package manager. Ubuntu:
```
sudo apt install docker
sudo systemctl enable docker
sudo systemctl start docker
```
Verify:
```
sudo systemctl status docker
```
### 2) Install Redis and Webdis for Docker
In terminal or cmd (Windows) type: 
```
docker run -d -p 7379:7379 -e LOCAL_REDIS=true anapsix/webdis
```
(Added Webdis check in bot's code. If something is wrong with the Webdis the bot will output an error, so the following test can be skipped)
- Test if everything is ok  
Type in terminal/cmd: 
```
curl http://127.0.0.1:7379/SET/hello/world
```
Result should be:
```
{"SET":[true,"OK"]}
```
Type in terminal/cmd:
```
curl http://127.0.0.1:7379/GET/hello
```
Result should be:
```
{"GET":"world"}
```
### 3) Install Chat Evolved mod
Subscribe: https://steamcommunity.com/sharedfiles/filedetails/?id=1551199162  
Install the mod both to your client and server and activate the mod  
  
From the game press enter to open chat and type:
```
/settings
```
There you can set your cluster name (servers will use that to talk to each other), your current server's name and for Backend edit the default ip with: 127.0.0.1:7379 (or whatever else it is in your 
case)  
Press all Set buttons and check if you have a working cross chat  
You should be able to communicate with the configured servers in your cluster now
### 4) Install Git (skip if you have the executable binary of ChatEvolvedDiscord)
https://github.com/git-guides/install-git
### 5) Install nodejs (skip if you have the executable binary of ChatEvolvedDiscord)
https://nodejs.org/en/download/
### 6) Create a Discord Bot
https://discordpy.readthedocs.io/en/latest/discord.html
### 7) Install and run ChatEvolvedDiscordBot
Get the latest version from here: https://github.com/nvm-sh/ChatEvolvedDiscordBot/releases/latest
Extract ChatEvolvedDiscord-your_platform.zip and edit config.js. Setup at least the basic config, save and close  
```
// The name of your Ark servers cluster. Required.
config.clusterName = "my-cluster"
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
```
Type in terminal/cmd (or double click):
Linux:
```
./ChatEvolvedDiscord
```
Windows:
```
ChatEvolvedDiscord.exe
```
You should now have Chat Evolved mod fully working with cross chat capabalities and also ChatEvolvedDiscordBot to send/receive messages from/to defined Discord channel 
___

##### - **Windows notes:**
If you want to store the output log and/or error you can open Notepad and enter:
```
ChatEvolvedDiscord.exe > ChatEvolvedDiscord-logs.txt 2> ChatEvolvedDiscord-errors.txt
```
Save as ChatEvolvedDiscordBot.bat  
Now the bot can save the log output to ChatEvolvedDiscord-logs.txt and the errors to ChatEvolvedDiscord-errors.txt 
(change > to >> if you want to append the output of each session. Otherwise the files will be replaced each time the bot restarts)  
Also you can drop it to your startup items to start automatically with Windows  
To do that press Windows key + R (Run) and type:
```
shell:startup
```
Drag & drop ChatEvolvedDiscordBot.bat there
___

##### - **Linux notes:**
For distributions with systemd (like Ubuntu) you can create a service file for the bot  
First create a script  
cd inside ChatEvolvedDiscordBot directory and type:
```
nano ChatEvolvedDiscord.sh
```
Paste:
```
    #!/bin/bash
    file="ChatEvolvedDiscord"
    # Change path if different
    path="$HOME/ChatEvolvedDiscordBot"
    $path/$file >$path/${file}-logs.txt 2>$path/${file}-errors.txt
```
(change > to >> if you want to append the output of each session. Otherwise the files will be replaced each time the bot restarts)  
Press: Ctrl + O (Save), Ctrl + X (Close)  
Type:
```
chmod +x ChatEvolvedDiscord.sh
```
Type:
```
nano /lib/systemd/system/ChatEvolvedDiscord.service
```
Paste and edit User, Group and ExecStart path with your username:
```
    [Unit]
    Description=Chat Evolved Discord Bot
    [Service]
    Type=simple
    Restart=on-failure
    RestartSec=5
    StartLimitInterval=60s
    StartLimitBurst=3
    User=USER
    Group=USER
    ExecStart=/home/USER/ChatEvolvedDiscordBot/ChatEvolvedDiscord.sh
    WorkingDirectory=/home/USER/ChatEvolvedDiscordBot
    [Install]
    WantedBy=multi-user.target
```
Press: Ctrl + O (Save), Ctrl + X (Close)  
Type:
```
sudo systemctl enable ChatEvolvedDiscord.service
sudo systemctl daemon-reload
sudo systemctl start ChatEvolvedDiscord.service
```
Verify:
```
sudo systemctl status ChatEvolvedDiscord.service
```
