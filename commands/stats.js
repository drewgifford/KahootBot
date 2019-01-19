const Discord = require("discord.js");
const functions = require("./functions");
const fs = require("fs");

module.exports.run = async (bot, message, args, ipc)=>{

  var color = 0x66bf39;
  var rich = new Discord.RichEmbed().setColor(color);

  rich.setAuthor("Kahoot! Statistics", bot.user.avatarURL);
  rich.setFooter("Bot created by Toadally#0001", "https://cdn.discordapp.com/avatars/138479204416094209/a_4efe46e56f9614689f230adca90dff3c.gif");
  rich.setThumbnail("https://cdn.discordapp.com/avatars/535996110368407552/bbc7c6c402223e4fd95bd47233ab6b38.png?size=128");
  let g = JSON.parse(fs.readFileSync("./stats.json", "utf8"));
  rich.addField("Servers", bot.guilds.size,true);
  rich.addField("Users",bot.users.size,true);
  rich.addField("Quizzes Played",g.gamesPlayed,true);
  rich.addField("Answers given",g.questionsAnswered,true);
  message.channel.send(rich);



}
module.exports.help = {
  name: "stats"
}
