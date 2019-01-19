const Discord = require("discord.js");
const functions = require("./functions");
const fs = require("fs");
const Kahoot = require("kahoot-session");
const events = require("events");

module.exports.run = async (bot, message, args, ipc)=>{
  if(functions.userNeedsPermission(message)){
    return;
  }

  let games = JSON.parse(fs.readFileSync("./games.json", "utf8"));


  if(!games[message.guild.id]){
    functions.sendErrorMessage(message.channel, "No game has been created! ");
    return;
  } else {
    if(games[message.guild.id].connected){
      functions.sendErrorMessage(message.channel, "The game has already started! ");
      return;
    }
    if(!games[message.guild.id].available){
      functions.sendErrorMessage(message.channel, "No game has been created! ");
      return;
    }
  }
  functions.sendRichMessage(message.channel, "Starting game...");

  ipc.emit(message.guild.id + " start");



}
module.exports.help = {
  name: "start"
}
