const Discord = require('discord.js');
const fs = require('fs');
const botconfig = require("./botconfig.json");
const prefix = botconfig.prefix;
const bot = new Discord.Client({disableEveryone: true});
const Kahoot = require("kahoot-session");
const events = require("events");

var ipc = new events.EventEmitter();

fs.writeFile("./games.json", JSON.stringify({}), (err) => {
  if(err) console.log(err);
});

bot.commands = new Discord.Collection();

fs.readdir("./commands", (err, files) => {

  if(err){console.log(err); return;}

  let jsfile = files.filter(f => f.split(".").pop() === "js");
  if(jsfile.length <= 0){
    console.log("Couldn't find commands.");
    return;
  }

  jsfile.forEach((f,i) =>{
    let props = require(`./commands/${f}`);
    if(!(f=== "functions.js")){
      if(!props.help){
        console.log(`${f} missing template format!`);
      } else {
        if(!(`${f}`=== "functions.js")){
          console.log(`${f} loaded!`);
          bot.commands.set(props.help.name.toLowerCase(), props);
        }
      }
    }
  });
});
bot.on('ready', () => {
  console.log(`Logged in as ${bot.user.tag}!`);
});

var sessions = [];

bot.on('message', async message => {
  if(message.author.bot) return;
  if(message.channel.type === "dm") return;
  var letter = message.content.toLowerCase();
  if((letter == "a" || letter == "b" || letter == "c" || letter == "d")){ handleAnswer(message, letter); return; }

  let prefix = botconfig.prefix;
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  if(message.content.substring(0,2).toLowerCase() != botconfig.prefix.toLowerCase()) {  return;}
  let args = messageArray.slice(1);
  let commandFile = bot.commands.get(cmd.slice(prefix.length).toLowerCase());
  bot.user.setActivity('k!help | ' + bot.guilds.size + " servers");
  var session = sessions[message.guild.id];
  try { var x = commandFile.run(bot, message, args, ipc) } catch(err){

  }

  var letter = message.content.toLowerCase();
  console.log(letter);

});

function handleAnswer(message, letter){
  let games = JSON.parse(fs.readFileSync("./games.json", "utf8"));
  if(!(message.channel.id === games[message.guild.id].channel)) { return }
  if(!games[message.guild.id]){
    return;
  } else {
    if(!games[message.guild.id].connected){
      return;
    }
  }
  var answer = 1;
  if(letter == "a") { answer = 1 }
  if(letter == "b") { answer = 2 }
  if(letter == "c") { answer = 3 }
  if(letter == "d") { answer = 4 }
  ipc.emit(message.guild.id + " answer", answer, message, message.member.displayName);
}
bot.login(botconfig.token);
bot.on('ready', () => { bot.user.setActivity('k!help | ' + bot.guilds.size + " servers") })
