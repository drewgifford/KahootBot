const Discord = require("discord.js");
const functions = require("./functions");

module.exports.run = async (bot, message, args, ipc)=>{

  var color = 0x66bf39;
  var rich = new Discord.RichEmbed().setColor(color);

  rich.setAuthor("Kahoot! Help", bot.user.avatarURL);

  rich.setDescription("**All Kahoot! commands begin with** `k!`\n\n`create [id]` Creates a new Kahoot! game.\n`start` - Starts a created game.\n`end` - Ends a Kahoot! game.\n`info` - Shows information about the game being played.\n`setrole` - Sets the role that will be able to manage Kahoot! games.\n`invite` - Generate an invite link and invite me to your server!\n`stats` - View various statistics about Kahoot!\n\nSupport Server: https://discord.gg/gSVd3xS");
  rich.setFooter("Bot created by Toadally#0001", "https://cdn.discordapp.com/avatars/138479204416094209/a_4efe46e56f9614689f230adca90dff3c.gif");
  message.channel.send(rich);



}
module.exports.help = {
  name: "help"
}
