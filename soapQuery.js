//流量查询接口   每月都调用
//
var soap = require('soap');
var parseString = require('xml2js').parseString;
var async = require('async');

var url = 'http://dh.zj189.cn/services/HWGetFreeResAdapter?wsdl';

//小于10的月份前面补零
function modifyMonth(month){
    if(month.constructor === Number){
        return (month < 10 ? '0' : '') + month;    
    }
};
//获取起始日期   上月的第一天
//注意getMonth()的返回值是: 0（一月） 到 11（十二月） 之间的一个整数
function getStartDate(){
    var newDate = new Date();
    var month = newDate.getMonth();
    return '' + (month != 0 ? newDate.getFullYear() : newDate.getFullYear() - 1) + modifyMonth(month != 0 ? month : 12) + '01000000';
};
  var lastDays = {
    'M0'  :  '31',          //January
    'M1'  :  '28',          //February
    'M2'  :  '31',          //March
    'M3'  :  '30',          //April
    'M4'  :  '31',          //May
    'M5'  :  '30',          //June
    'M6'  :  '31',          //July
    'M7'  :  '31',          //August
    'M8'  :  '30',          //September
    'M9'  :  '31',          //October
    'M10' :  '30',          //November
    'M11' :  '31'           //December
    };
//获取终止日期 
function getEndDate(){
    var newDate = new Date();           //当年
    var month = newDate.getMonth();     //本月
  
//    return '' + (month != 0 ? newDate.getFullYear() : newDate.getFullYear() - 1) + modifyMonth(month != 0 ? month : 12) + '01000000';
    return '' + (month != 0 ? newDate.getFullYear() : newDate.getFullYear() - 1) + modifyMonth(month != 0 ? month : 12) + lastDays['M' + ((month !=0 ? month : 12)  - 1)] + '000000';
};

//需要检查入口参数
var System_Id     =0;   //System_Id：int 类型 参数固定为0
var Region_Id     =71;  //Region_Id：int 类型 区域标识。 70:衢州；71:杭州；72:湖州；73:嘉兴； 74:宁波；75:绍兴；76:台州；77:温州； 78:丽水；79:金华；80:舟山
var Code_Type     =2;   //Code_Type：int 类型 参数固定为2
//var Code_Number   ='13336021509';     //Code_Number：String类型 用户手机号码
//var Start_Date    ='20140101000000';  //Start_Date：String类型 格式为14位日期格式 生效时间，格式如：YYYYMMDDHHMMSS

var Start_Date    = getStartDate();
//var End_Date      ='20140131000000';  //End_Date：String类型 格式为14位日期格式 失效时间，格式如：YYYYMMDDHHMMS
var End_Date      = getEndDate();
console.log("日期日期: Start_Date: %s, End_Date: %s", getStartDate(), getEndDate());
//return;

var querySingle = function(phoneNumber, callback){

var Code_Number   = phoneNumber;
var args = {System_Id:System_Id,Region_Id:Region_Id,Code_Type:Code_Type,Code_Number:Code_Number,Start_Date:Start_Date,End_Date:End_Date};
//console.log(args);

//cb的正常返回值
var userInfo ;

soap.createClient(url, function(err, client) {
  if(!err){
//      console.dir(client.describe()); // return;
      client.getFreeRes(args, function(err, result) {
          if(!err){
//            console.log(result);  //  return;
            if(result.hasOwnProperty("getFreeResReturn")){
               var xml = result["getFreeResReturn"];
//                  console.log(xml);     console.log('------------------------');
                  parseString(xml, function (err, userResult) {
                    //处理错误: TypeError: Cannot call method 'hasOwnProperty' of undefined
                    if(userResult == undefined){
                       callback('##' + phoneNumber + '解析XML出错parseString返回undefined...');  
                       return;
                    }
                    //console.log(userResult);  return;
//                    console.log(userResult.FreeResQuery.FreeResList[0].FreeResItem.length);
                  //处理错误:TypeError: Cannot read property 'FreeResQuery' of undefined
                  if(!userResult.hasOwnProperty('FreeResQuery')){
                      callback('##' + phoneNumber + '连FreeResQuery字段也没有...');  
                      return;
                  }

                  //处理错误:TypeError: Cannot read property 'constructor' of undefined
                  if(userResult.FreeResQuery.FreeResList == undefined){
                      callback('##' + phoneNumber + '的FreeResList为undefined...');  
                      return;
                  }

                  if(userResult.FreeResQuery.FreeResList.constructor === Array){
                    var freeResItems = userResult.FreeResQuery.FreeResList[0].FreeResItem;
                    for(p in freeResItems){
                      if(phoneNumber != freeResItems[p]['KeyNum']){
                        callback('##' + phoneNumber + '连手机号码也与查询结果不符...');  
                        return;
                      }
                    
                      var  freeResType = parseInt(freeResItems[p]['FreeResType'])
                      if(1137 == freeResType || 1130 == freeResType ){
                        userInfo = new Object();
                        userInfo['KeyNum'] = freeResItems[p]['KeyNum'];
                        userInfo['FreeResType'] = freeResItems[p]['FreeResType'];
                        userInfo['FreeResTotal'] = freeResItems[p]['FreeResTotal'];
                        userInfo['FreeResUsed'] = freeResItems[p]['FreeResUsed'];
                        userInfo['ResUnit'] = freeResItems[p]['ResUnit'];
                      }
                    }
                   
                    if(userInfo){
                      callback(
                            userInfo['KeyNum'] + ' ' 
                          + userInfo['FreeResType'] + ' ' 
                          + userInfo['FreeResTotal'] + ' ' 
                          + userInfo['FreeResUsed'] + ' '
                          + userInfo['ResUnit']);
                    }else{
                      callback('## ' + phoneNumber + ' 不是1137也不是1130...');  
                    }                  
//                    console.log(userInfo);
                    }else{ //处理错误: **** Cannot read property '0'
                      callback('## ' + phoneNumber + ' 没有FreeResList字段...');
                    }
                  });//End of xml paser
            }else{
                callback('##' + phoneNumber + '连最外层的getFreeResReturn字段也没有...');  
                return;
            } //End of hasOwnProperty

          }else{
            console.log(err);
            callback(err);
          }
      });
  }else{
    console.log("creatClient ERROR");
    console.log(err);
  }
});
}

//
//var _execMi不用了ssion = function(mission, callback){
//  if(mission.constructor === Array){
//    setInterval(function(){
//      var phoneNumber = mission.shift();
//      if(phoneNumber != undefined){
////        console.log('任务号码: '+phoneNumber);
//        querySingle(phoneNumber, function(result){
//          if(result){  
//            callback(result);
//          }
//          });  // End of querySingle
//      }else{
//          callback('error');
//      }
//    }, 50);  //End of setInterval
//  }
//};
//
var _execMission = function(mission, callback){
  if(mission.constructor === Array){
    var count = 0;

    async.whilst(
        function(){ return count < mission.length; },
        function(cycle){
          querySingle(mission[count], function(result){
            if(result){
              callback(result);
 
            }    
           
            //放在外面， 无需等待回调完成再循环
            count++;
            cycle();
          });
        },
        function(err){
          callback('GameOver'); 
        }
    ); //End of async.whilst
  }
};


exports.execMission = _execMission;
