# ChatEvolvedDiscordBot
Discord integration for ARK's Chat Evolved mod  
https://steamcommunity.com/sharedfiles/filedetails/?id=1551199162

- It will send/receive messages to/from specified Discord channel back/to your ARK servers
- Supports UTF-8. ARK doesn't. If I come up with a good font fix solution for ARK I'll update this post

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
Subscribe: steam://openurl/https://steamcommunity.com/sharedfiles/filedetails/?id=1551199162  
Install the mod both to your client and server and activate the mod  
  
From the game press enter to open chat and type:
```
/settings
```
There you can set your cluster name (servers will use that to talk to each other), your current server's name and for Backend edit the default ip with: 127.0.0.1:7379 (or whatever else it is in your 
case)  
Press all Set buttons and check if you have a working cross chat  
You should be able to communicate with the configured servers in your cluster now
### 4) Install Git
https://github.com/git-guides/install-git
### 5) Install nodejs
https://nodejs.org/en/download/
### 6) Install required npm modules
Type in terminal/cmd:
```
npm install discord.js request
```
### 7) Create a Discord Bot
https://discordpy.readthedocs.io/en/latest/discord.html
### 8) Install and run ChatEvolvedDiscordBot
Type in terminal/cmd:
```
git clone https://github.com/PerseusArkouda/ChatEvolvedDiscordBot
cd ChatEvolvedDiscordBot
```
Open and edit ChatEvolvedDiscord.js, setup the basic config, save and close  
```
//Basic config
// Required Discord Bot prefix - Whatever prefix symbol you want your bot to listen to trigger a command
const prefix = "~";
// Required Discord Bot Token - The Token you've got by completing step 7 (keep that secret)
const token = "Your-Discord-Bot-Token-Here";
// Required Discord Channel ID - The ID from the Channel the bot will receive/send messages from/to. Right click on Channel and Copy ID
const channelID = "Your-Discord-Channel-ID-Here";
// Required Cluster Name you've set in Chat Evolved mod (step 3)
var clusterName = "Your-Cluster-Name-Here";
// Required Webdis HTTP url to retrieve/send messages. Default: 127.0.0.1 (or localhost)
var URL = "127.0.0.1";
// Required Webdis port. Default: 7379
var port = "7379";
```
Type in terminal/cmd:
```
node ChatEvolvedDiscord.js
```
You should now have Chat Evolved mod fully working with cross chat capabalities and also ChatEvolvedDiscordBot to send/receive messages from/to defined Discord channel 
___

##### - **Windows notes:**
To make it easier to launch the bot open Notepad and type:
```
node ChatEvolvedDiscord.js >> ChatEvolvedDiscord-logs.txt 2>> ChatEvolvedDiscord-errors.txt
```
Save as ChatEvolvedDiscordBot.bat  
Now the bot can run just with double click and also will output to ChatEvolvedDiscord-logs.txt and the errors to ChatEvolvedDiscord-errors.txt  
Also you can drop it to your startup items to start automatically with Windows  
To do that press Windows key + R (Run) and type:
```
shell:startup
```
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
    file="ChatEvolvedDiscord.js"
    # Change path if different
    path="$HOME/ChatEvolvedDiscordBot"
    /usr/bin/node $path/$file >>$path/${file}-logs.txt 2>>$path/${file}-errors.txt
```
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
    ExecStop=/bin/kill -2 $MAINPID
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
