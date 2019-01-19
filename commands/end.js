const Discord = require("discord.js");
const functions = require("./functions");
const fs = require("fs");

module.exports.run = async (bot, message, args, ipc)=>{
  if(functions.userNeedsPermission(message)){
    return;
  }

  let games = JSON.parse(fs.readFileSync("./games.json", "utf8"));

  if(!games[message.guild.id]){
    functions.sendErrorMessage(message.channel, "No game has been created! ");
    return;
  } else {
    if(!games[message.guild.id].connected){
      functions.sendErrorMessage(message.channel, "No game has been started! ");
      return;
    }
  }
  functions.sendRichMessage(message.channel, "The game has ended.");
  ipc.emit(message.guild.id + " end");

}
module.exports.help = {
  name: "end"
}
