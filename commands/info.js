const Discord = require("discord.js");
const functions = require("./functions");
const fs = require("fs");

module.exports.run = async (bot, message, args, ipc)=>{

  let games = JSON.parse(fs.readFileSync("./games.json", "utf8"));

  if(!games[message.guild.id]){
    functions.sendErrorMessage(message.channel, "No game has been created! ");
    return;
  } else {
    if(!games[message.guild.id].started){
      functions.sendErrorMessage(message.channel, "No game is currently running! ");
      return;
    }
  }
  ipc.emit(message.guild.id + " info", message);


}
module.exports.help = {
  name: "info"
}
