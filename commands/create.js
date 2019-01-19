const Discord = require("discord.js");
const functions = require("./functions");
const fs = require("fs");
const Kahoot = require("kahoot-session");

module.exports.run = async (bot, message, args, ipc)=>{


  if(functions.userNeedsPermission(message)){
    return;
  }

  let games = JSON.parse(fs.readFileSync("./games.json", "utf8"));

  if(games[message.guild.id]){
    if(games[message.guild.id].connected){
      functions.sendErrorMessage(message.channel, "The game has already started! ");
      return;
    }
    if(games[message.guild.id].started){
      functions.sendErrorMessage(message.channel, "The game has already started! ");
      return;
    }
  }
  if(!args[0]){
    functions.sendErrorMessage(message.channel, "Provide a valid Quiz ID", "", "Example: c5429a87-08b5-4aeb-a90c-bd56ebf09540");
    return;
  }

  functions.sendRichMessage(message.channel, "Creating Kahoot game...");
  const Session = new Kahoot(args[0]);

  var currentQuestion;
  var answers = [];
  var hasAnswered = [];
  var streaks = [];



  Session.on("ready",session=>{
    if(!canContinue){return}
    console.log(Session.quiz);
    if(Session.quiz.error){
      functions.sendErrorMessage(message.channel, "The ID provided is not a valid Kahoot! Quiz ID.");
      Session.close();
    } else {
      var title = Session.quiz.title;
      var image = Session.quiz.cover;
      if(!image){
        image = "https://kahoot.com/files/2017/08/kahoot_logo_570x320.jpg";
      }
      var description = Session.quiz.description;
      message.channel.send("", {files: ["./kahoot-banner.png"]}).then(function(){
        functions.sendRichMessage(message.channel, description, title,"Type k!start to begin!", image);
      });
    }

    let g = JSON.parse(fs.readFileSync("./games.json", "utf8"));
    g[message.guild.id] = {
      g: args[0],
      connected: false,
      available: true,
      started: false,
      channel: message.channel.id
    };

    fs.writeFile("./games.json", JSON.stringify(g), (err) => {
      if(err) console.log(err);
    });
  });
  var timeStart = 0;
  //on begin of question
  Session.on("questionStart", question=>{
    if(!canContinue){return}
    if(!Session){ return };
    currentQuestion = question;
    timeStart = Math.floor(Date.now() / 1000);
    var time = question.time;
    if(question.video){
      console.log(question.video);
    }

    var answers = question.choices;
    var string = [];
    for(var x = 0; x < question.numberOfAnswers+1; x++){
      var symbol = "";
      if( x == 0 ) symbol = ":regional_indicator_a:";
      if( x == 1 ) symbol = ":regional_indicator_b:";
      if( x == 2 ) symbol = ":regional_indicator_c:";
      if( x == 3 ) symbol = ":regional_indicator_d:";
      var inline = true;
      if(x == 2 || x == 4){string.push({name: "\u200B", value: "\u200B", inline: true, multiLine: true}) }
      if(x < question.numberOfAnswers){
      string.push({ name: symbol, value: answers[x].answer.replace("&nbsp;",""), inline: inline});
      }
    }
    var image = question.image;
    if(!image){ image = "" };
    functions.sendRichMessage(message.channel, "Answer by typing 'A', 'B', 'C', or 'D'", question.question.replace("&nbsp;",""), time/1000+ " seconds to answer.", "", string, image);
  });


  Session.on("questionEnd",players=>{
    if(!canContinue){return}
    if(!Session){ return };
    handleEndQuestion();
  });
  var goToNextQuestion = true;
  var totalPoints = [];
  var canContinue = true;
  function handleEndQuestion(){
      var alphabet = [":regional_indicator_a:",":regional_indicator_b:",":regional_indicator_c:",":regional_indicator_d:"];
      goToNextQuestion = false;
      var correct = [];
      for(var x = 0; x < currentQuestion.choices.length; x++){
        if(currentQuestion.choices[x].correct){
          correct.push(x);
        }
      }
      var correctAnswers = "";
      for(var x = 0; x < correct.length; x++){
        if(x == 0){
          correctAnswers = correctAnswers + alphabet[correct[x]];
        } else {
          correctAnswers = correctAnswers + " "+alphabet[correct[x]];
        }
      }
      var pointValues = [];
      var newTotalPoints = [];
      for(var x = 0; x < answers.length; x++){
        console.log(correct);
        if(!correct.includes(answers[x].answer-1)) {
          let result = totalPoints.filter(obj => {
            return obj.member.user === answers[x].member.user
          });
          console.log("TOTAL POINTS: "+totalPoints);
          if((result === undefined || result.length == 0)){
            newTotalPoints.push({
              points: 0,
              member: answers[x].member,
              gained: 0,
              streak: 0
            });
          } else {
            newTotalPoints.push({
              points: result[0].points,
              member: answers[x].member,
              gained: 0,
              streak: 0
            });
          }
          continue;

         }
        var points = Math.round((( 1000 * ( 1 - (( (answers[x].timestamp - timeStart) / (currentQuestion.time/1000) ) / 2 ))))/100)*100;
        pointValues.push({
          points: points,
          member: answers[x].member
        });


        let result = totalPoints.filter(obj => {
          return obj.member.user === answers[x].member.user
        });
        console.log("TOTAL POINTS: "+result[0]);
        if((result === undefined || result.length == 0)){
          newTotalPoints.push({
            points: points,
            member: answers[x].member,
            gained: points,
            streak: 1
          });
        } else {
          newTotalPoints.push({
            points: result[0].points + points + 100*(result[0].streak),
            member: answers[x].member,
            gained: points,
            streak: result[0].streak + 1
          });
        }
        streaks[answers[x].member.user.id] = streaks[answers[x].member.user.id]+1;

      }
      for(var x = 0; x < hasAnswered.length; x++){
        var member = hasAnswered[x];
        let result = newTotalPoints.filter(obj => {
          return obj.member.user === member.user
        });
        if(result === undefined || result.length == 0){
          let res = totalPoints.filter(obj => {
            return obj.member.user === member.user
          });
          if(!(res === undefined || res.length == 0)){
            newTotalPoints.push({
              points: res[0].points,
              member: member,
              gained: 0,
              streak: 0
            });

          }
        }
      }

      console.log("NEW TOTAL POINTS: "+newTotalPoints);
      totalPoints = newTotalPoints;


      function compare(a,b) {
        if (a.points < b.points)
          return -1;
        if (a.points > b.points)
          return 1;
        return 0;
      }

      totalPoints.sort(compare);
      totalPoints.reverse();

      var topPlayers = 5;
      var richObjects = [];
      for(var x = 0; x < 5; x++){
        if(!totalPoints[x]){ topPlayers = x; break;}
        var special = ":medal:";
        if(x == 0){ special = ":trophy:" }

        var streakText = "";
        if(totalPoints[x].streak > 1){
          streakText = " :fire:"+totalPoints[x].streak;
        }
        richObjects.push({
          name: special+" "+totalPoints[x].member.displayName,
          value: totalPoints[x].points + " points (+"+totalPoints[x].gained+")"+streakText,
          multiLine: true
        });
      }
      if(topPlayers == 0){ richObjects = null};
      functions.sendRichMessage(message.channel, "Correct Answer(s): "+correctAnswers, "Round Results (Top "+topPlayers + ")", "", "", richObjects);
      //sendRichMessage = function(channel, description, title, footer, image, fields)
      setTimeout(function(){ if(Session){Session.nextQuestion()}; goToNextQuestion = true; answers = [];}, 7500);
  };

  Session.on("quizEnd",players=>{
    if(!canContinue){return}
    canContinue = false;
    function compare(a,b) {
      if (a.points < b.points)
        return -1;
      if (a.points > b.points)
        return 1;
      return 0;
    }

    totalPoints.sort(compare);
    totalPoints.reverse();
    var topPlayers = 5;
    var richObjects = [];
    for(var x = 0; x < 5; x++){
      if(!totalPoints[x]){ topPlayers = x; break;}
      var special = ":medal:";
      if(x == 0){ special = ":trophy:" }
      var streakText = "";
      if(totalPoints[x].streak > 1){
        streakText = " :fire:"+totalPoints[x].streak;
      }
      richObjects.push({
        name: special+" "+totalPoints[x].member.displayName,
        value: totalPoints[x].points + " points"+streakText,
        multiLine: true
      });
    }
    var description = "";
    if(topPlayers == 0){ richObjects = null; description ="Nobody played that round!"};
    functions.sendRichMessage(message.channel, description, "Game Over", "", "https://cdn.discordapp.com/avatars/535996110368407552/bbc7c6c402223e4fd95bd47233ab6b38.png?size=128", richObjects);
    let g = JSON.parse(fs.readFileSync("./games.json", "utf8"));
    g[message.guild.id] = {
      g: args[0],
      connected: false,
      available: false,
      started: false,
      channel: message.channel.id
    };
    fs.writeFile("./games.json", JSON.stringify(g), (err) => {
      if(err) console.log(err);
    });
    Session.close();
  });



  ipc.on(message.guild.id+" nextQuestion", function(response){
    if(!canContinue){return}
    if(goToNextQuestion){
      //handleEndQuestion();
    }

  });



  ipc.on(message.guild.id + " answer", function(number, msg, nickname){
    if(!canContinue){return}
    var numAnswers = currentQuestion.numberOfAnswers;
    console.log(numAnswers);
    let result = answers.filter(obj => {
      return obj.member.user === msg.member.user
    });
    if(number <= numAnswers){
      msg.delete();
    }
    if(!(result === undefined || result.length == 0)){ console.log(result); return; };
    if(number <= numAnswers){
      answers.push({
        answer: number,
        timestamp: Math.floor(Date.now()/1000),
        member: msg.member
      });
      console.log("LOGGED ANSWERS" + answers);
      hasAnswered.push(msg.member);
      let g2 = JSON.parse(fs.readFileSync("./stats.json", "utf8"));
      var newG = {
        questionsAnswered: g2.questionsAnswered + 1,
        gamesPlayed: g2.gamesPlayed
      };
      fs.writeFile("./stats.json", JSON.stringify(newG), (err) => {
        if(err) console.log(err);
      });
    }



  });
  ipc.on(message.guild.id+" start", function(response){
    if(!canContinue){return}
    console.log("received");
    let g = JSON.parse(fs.readFileSync("./games.json", "utf8"));
    g[message.guild.id] = {
      g: args[0],
      connected: true,
      available: true,
      started: true,
      channel: message.channel.id
    };

    fs.writeFile("./games.json", JSON.stringify(g), (err) => {
      if(err) console.log(err);
    });
    let g2 = JSON.parse(fs.readFileSync("./stats.json", "utf8"));
    var newG = {
      questionsAnswered: g2.questionsAnswered,
      gamesPlayed: g2.gamesPlayed+1
    };
    fs.writeFile("./stats.json", JSON.stringify(newG), (err) => {
      if(err) console.log(err);
    });
    Session.startQuiz();
  });
  ipc.on(message.guild.id+ " end", function(response){
    Session.endQuiz();


  });

  ipc.on(message.guild.id+" info", function(msg){
    if(!canContinue){return}
    var quiz = Session.quiz;
    var description = "No description";
    var questionCt = quiz.questions.length;
    var cover = "";
    if(quiz.cover){ cover = quiz.cover}
    if(quiz.description){ description = quiz.description }
    functions.sendRichMessage(msg.channel, "", quiz.title, "", cover,
    [
      {
        name: "Creator",
        value: quiz.creator_username,
        multiLine: true
      },
      {
        name: "Description",
        value: description,
        multiLine: true
      },
      {
        name: "Questions",
        value: questionCt,
        multiLine: true
      }

    ]);
    //sendRichMessage = function(channel, description, title, footer, image, fields)
  });


  Session.start();


}
module.exports.help = {
  name: "create"
}
