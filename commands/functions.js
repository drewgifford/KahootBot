const fs = require("fs");
const Discord = require("discord.js");

function getUser(message){
  return message.user;
}
module.exports.userNeedsPermission = function(message){
  if(!module.exports.hasAdminPermission(message.member)){
    module.exports.sendErrorMessage(message.channel, "You don't have permission to manage Kahoots!");
  return true;
  } else {
    return false;
  }
}

function hasKahootRole(user){
  if(user.hasPermission("MANAGE_GUILD", false, true, true)){
    return true;
  }
  let roles = JSON.parse(fs.readFileSync("./roles.json", "utf8"));
  var role = roles[user.guild.id];

  if(!role){
    return false;
  }
  var ret = false;
  user.roles.forEach(function(r){
    console.log(r.id === role);
    console.log("ROLE CHECK ID: "+r.id);
    console.log("COMPARE TO ROLE ID: "+role);
    //{"535994953227173888":{"rolename":"536016890611630083"}}
    if(r.id === role){
      console.log("compared successfully");
      ret = true;

    }
  });
  return ret;

}
var errorColor = 0xFF3355;
var colors = [0x45A3E5, 0x66BF39, 0xEB670F, 0x864CBF];
module.exports.sendRichMessage = function(channel, description, title, footer, image, fields, largeImage){
  var color = colors[Math.floor(Math.random()*colors.length)];
  var rich = new Discord.RichEmbed()
    .setColor(color);
  if(description){
    if(description != ""){
      rich.setDescription(description);
    }
  }
  if(fields){
    //debug
    console.log("fields: "+ fields);
    fields.forEach(function(field){
      console.log(field);
      var name = field.name;
      var value = field.value;
      var inline = false;
      if(field.inline){ inline = field.inline}
      if(field.multiLine){rich.addField(name, value, inline)} else {
      rich.addField(name + " : "+ value, "\u200B", inline); }

    });
  }
  if(title){
    if(title != ""){
      rich.setTitle(title);
    }
  }
  if(footer){
    if(footer != ""){
      rich.setFooter(footer);
    }
  }
  if(image){
    if(image != ""){
      rich.setThumbnail(image);
    } else {
      rich.setThumbnail("https://cdn.discordapp.com/avatars/535996110368407552/bbc7c6c402223e4fd95bd47233ab6b38.png?size=128");
    }
  }
  if(largeImage){
    if(largeImage != ""){
      rich.setImage(largeImage);
    }
  }
  channel.send(rich);
  return true;
}
module.exports.sendErrorMessage = function(channel, text, title, footer){
  var rich = new Discord.RichEmbed()
    .setColor(errorColor)
    .setDescription(text);
    if(title){
      if(title != ""){
        rich.setTitle(title);
      }
    }
    if(footer){
      if(footer != ""){
        rich.setFooter(footer);
      }
    }
  channel.send(rich);
}

module.exports.hasAdminPermission = function(user){

  return hasKahootRole(user);


}
function isAdmin(user){
  return null;
}
