const Discord = require('discord.js');
require('dotenv').config();
const Chalk = require('chalk')
const Client = new Discord.Client();
const fs = require('fs');
const randomToken = require('random-token');

const userData = JSON.parse(fs.readFileSync('userData.json', 'utf8'))
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const prefix = config.prefix;

Client.login(process.env.ojo);

Client.on('ready', () => {
    var datetime = new Date();
    console.log(Chalk.green("Bot Ready!\n" + Chalk.cyan("Initialized: " + datetime)));
})

//TORD Items
var playingTORD = [];
var isLocked = false;
var lastChosen = "";
var outputs = ['truth', 'dare']
//

Client.on('message', message => {
    var sender = message.author;
    var content = message.content;
    var loggerContent = fs.readFileSync('chatLogs.txt', 'utf8');

    logger();

    function logger() {
        //console.log(Chalk.cyan(`${sender.id} (${sender.tag}) - ${content}`))
        fs.writeFileSync('chatLogs.txt', loggerContent + `\n${sender.id}/${sender.tag} - ${content} (${message.createdAt})`)
    }

    if (!userData[sender.id]) userData[sender.id] = {
        tag: sender.tag,
        verifyCode: 0,
        verified: false
    }

    write();

    if (message.isMemberMentioned(Client.user)) {
        var helpEmb = new Discord.RichEmbed()
        .setAuthor('Turtle Commands', Client.user.avatarURL)
        .setDescription(`Bot Prefix: '${prefix}'`)
        .addField('📰 General Commands', '`tord`')
        .addField('🔐 Security Commands', '`verify`')
        .setFooter(`Made by Jack 🌹👑#7908`)
        .setColor(0x82B358)
        message.channel.send(helpEmb);
    } 

    /*if (message.guild == null || "") return;*/

    
    if (!content.startsWith(prefix) || sender.equals(Client.user)) return;
    var args = content.substring(prefix.length).split(' ')
    
    switch(args[0]) {

        case "verify":
        if (args[1] == "lost") {
            sender.send("If you have lost your token, please join \`https://discord.gg/q9wfUs7\`")
        } else if (args[1] == null) {
            if (userData[sender.id]) {
                if (userData[sender.id].verifyCode == 0) {
                    var token = randomToken(16);
                    sender.send(`Your random token is \`${token}\`. Do not share this, this is your only verification means.\nNote: Tokens may be regenrated. Use \`$_verify lost\` to get more information on this.\n\n**Please type your code below to verify**`)
                    userData[sender.id].verifyCode = token;
                    write(); 
                    const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 10000 });
                    collector.on('collect', message => {
                        if (message.content == token) {
                            sender.send("You are now verified!");
                            userData[sender.id].verified = true;
                            write(); 
                            collector.stop();
                        } else {
                            sender.send("Incorrect!")
                            userData[sender.id].verifyCode = 0;
                            write(); 
                            collector.stop();
                        }
                    }) 
                } else {
                    message.reply("you already have a token!")
                }
        } 
        } else {
            message.reply(`Command \`${content}\` not found!`)
        }
        break;

        case "tord":
        if (args[1] == "join") {
            if (playingTORD.length < 5) {
                if (!isLocked) {
                    if (!playingTORD.includes(`<@${sender.id}>`)) {
                        userPlayingAdd(`<@${sender.id}>`)
                        message.reply('joined game!')
                    } else {
                        userPlayingRemove(`<@${sender.id}>`)
                        message.reply('left game!')
                    }
                } else {
                    message.reply('this lobby is locked!')
                }
            } else {
                message.channel.send(`Sorry, ${sender}, the game is currently full!`)
            }
        } else if (args[1] == "lobby") {
            if (playingTORD >= 1) {
                if (isLocked) {
                    var tordLobbyL = new Discord.RichEmbed()
                    .setTitle(`🔒TORD Lobby`)
                    .addField(`Users Playing: ${playingTORD.length}/5`, `${playingTORD.join("\n")}`)
                    .setColor(0x82B358)
                    message.channel.send(tordLobbyL);
                } else {
                    var tordLobby = new Discord.RichEmbed()
                    .setTitle(`TORD Lobby`)
                    .addField(`Users Playing: ${playingTORD.length}/5`, `${playingTORD.join("\n")}`)
                    .setColor(0x82B358)
                    message.channel.send(tordLobby);
                }
            } else { 
                var tordLobby = new Discord.RichEmbed()
                .setTitle(`TORD Lobby`)
                .addField(`Users Playing: 0/5`, `No users playing!`)
                .setColor(0x82B358)
                message.channel.send(tordLobby);
            }
        } else if (args[1] == "lock") {
            if (sender.id == '412268614696304642') {
                if (isLocked == true) {
                    isLocked = false;
                    message.reply('game unlocked!')
                } else {
                    isLocked = true;
                    message.reply('game locked!')
                }
            } else {

            }
        } else if (args[1] == "spin") {
            if (playingTORD.includes(`<@${sender.id}>`)) {
                if (lastChosen != `<@${sender.id}>`) {
                    var outputItem = outputs[Math.floor(Math.random()*outputs.length)];
                    var user1 = playingTORD[Math.floor(Math.random()*outputs.length)];
                    var user2 = playingTORD[Math.floor(Math.random()*outputs.length + 1)];
                    if (user1 == user2) {
                        message.reply("User1 == User2 (Please respin)")
                    } else {
                        message.channel.send(`${user1} will give ${user2} a ${outputItem}`);
                        lastChosen = user2;
                    }
                } else {
                    message.reply("trying to skip?")
                }
            } else {
                message.reply("you are not in the lobby!")
            }
        }
        break;

        default:
        message.reply('command not found!')
        break;

    }
})

var userPlayingAdd = function(id){
    playingTORD.push(`${id}`);
 }
 
 var userPlayingRemove = function(id){
    playingTORD.pop(`${id}`);
 }

function write() {
    fs.writeFileSync('userData.json', JSON.stringify(userData))
}