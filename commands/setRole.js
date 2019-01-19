const Discord = require("discord.js");
const functions = require("./functions");
const fs = require("fs");

module.exports.run = async (bot, message, args)=>{

  if(!message.member.hasPermission("MANAGE_GUILD", false, true, true)){
    module.exports.sendErrorMessage(message.channel, "You don't have permission to change the Kahoot! role");
    return;
  }
  var role = null;
  message.guild.roles.forEach(function(r){
    if(r.name.toLowerCase() === args.join(" ").toLowerCase()){
      role = r;
    } else {

      var roleid = args[0].substring(3,args[0].length-1);
      console.log("Role ID: " + roleid);
      if(r.id === roleid){
        role = r;
      }

    }
  });
  if(role){


    let roles = JSON.parse(fs.readFileSync("./roles.json", "utf8"));

    roles[message.guild.id] = role.id;

    fs.writeFile("./roles.json", JSON.stringify(roles), (err)=>{
      if(err) console.log(err);
    });
    functions.sendRichMessage(message.channel, "**Set Kahoot! admin role to "+role.name+"**");
  } else {
    functions.sendErrorMessage(message.channel, "Role "+args[0] + " not found.");
  }

}
module.exports.help = {
  name: "setRole"
}
