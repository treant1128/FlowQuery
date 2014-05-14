var soapQuery = require('./soapQuery.js');
//var globalCount = 0;

process.on('message', function(data){
//  console.log(data.constructor);
//    console.log(data.missionNumbers);
    soapQuery.execMission(data.missionNumbers, function(userInfo){
        if(userInfo != 'GameOver'){
          process.send(userInfo);
//          globalCount++;
//          if(globalCount == data.missionNumbers.length){
//            console.log('任务计数已满. exit(0).....');
//            process.exit(0);
//          }
//        }else{
//          console.log('收到error????' + userInfo);
        }else{
          process.send('Yes ... GameOver !');
        }
      });
    });
