const Discord = require("discord.js");
const functions = require("./functions");

module.exports.run = async (bot, message, args)=>{
    var color = 0x66bf39;
    var rich = new Discord.RichEmbed().setColor(color);

    rich.setAuthor("Kahoot! Invite", bot.user.avatarURL);
    rich.setThumbnail("https://cdn.discordapp.com/avatars/535996110368407552/bbc7c6c402223e4fd95bd47233ab6b38.png?size=128");
    rich.setDescription("Start quizzes with your friends on your own server!\n[Invite me to your server!](https://discordapp.com/api/oauth2/authorize?client_id=535996110368407552&permissions=268561408&scope=bot)");
    rich.setFooter("Bot created by Toadally#0001", "https://cdn.discordapp.com/avatars/138479204416094209/a_4efe46e56f9614689f230adca90dff3c.gif");
    message.channel.send(rich);
}
module.exports.help = {
  name: "invite"
}
