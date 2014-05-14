console.time('SingleSoapQuery');

var soap = require('soap');
var parseString = require('xml2js').parseString;
var util = require('util');

var url = 'http://115.239.134.77/flow/services/FlowInterfaceAdapter?wsdl';
//需要检查入口参数
var System_Id     =0;   //System_Id：int 类型 参数固定为0
var Region_Id     =71;  //Region_Id：int 类型 区域标识。 70:衢州；71:杭州；72:湖州；73:嘉兴； 74:宁波；75:绍兴；76:台州；77:温州； 78:丽水；79:金华；80:舟山
var Code_Type     =2;  //Code_Type：int类型 参数固定为2
var Code_Number   ="13306748379";     //Code_Number：String类型 用户手机号码
var Start_Date    ='20140201000000';  //Start_Date：String类型 格式为14位日期格式 生效时间，格式如：YYYYMMDDHHMMSS
var End_Date      ='20140301000000';  //End_Date：String类型 格式为14位日期格式 失效时间，格式如：YYYYMMDDHHMMS

var args = {System_Id:System_Id,Region_Id:Region_Id,Code_Type:Code_Type,Code_Number:Code_Number,Start_Date:Start_Date,End_Date:End_Date};
//console.log("====FORM getUserType======");
//console.log(args);

//cb的正常返回值
var userInfo = {};

soap.createClient(url, function(err, client) {
  if(!err){
      //console.log('-----------------console.log------------------');
      //console.log(client.describe());
      //console.log('-----------------console.dir------------------');
      //console.dir(client.describe());  return;
      client.getFreeRes(args, function(err, result) {
          if(!err){
//            console.log(result);    return;

            if(result.hasOwnProperty("getFreeResReturn")){
               var xml = result["getFreeResReturn"];
                  console.log(xml);
                  console.log('------------------------'+xml.constructor);  return;
                  parseString(xml, function (err, userResult) {
                    //console.log(util.inspect(userResult, {showHidden:true, depth:null}));  return;
                    //[ { FreeResItem: [ [Object], [Object] ] } ]
//                    console.log(userResult.FreeResQuery.FreeResList[0].FreeResItem.length);
                    var freeResItems = userResult.FreeResQuery.FreeResList[0].FreeResItem;

                    for(p in freeResItems){
                      if('13305788036' != freeResItems[p]['KeyNum']){
                        console.log('手机号码不符.....');
                      //  return;
                      }
                      
                      var  freeResType = parseInt(freeResItems[p]['FreeResType'])
                      if(1137 == freeResType || 1130 == freeResType ){
                        userInfo['KeyNum'] = freeResItems[p]['KeyNum'];
                        userInfo['FreeResType'] = freeResItems[p]['FreeResType'];
                        userInfo['FreeResTotal'] = freeResItems[p]['FreeResTotal'];
                        userInfo['FreeResUsed'] = freeResItems[p]['FreeResUsed'];
                        userInfo['ResUnit'] = freeResItems[p]['ResUnit'];
                      }
                    }

//                    console.log(freeResItems);
//
//                    for(p in freeResItems){
//                        userInfo[p] = new Object();
//                      for(q in freeResItems[p]){
//                        if(q.trim() == 'KeyNum' ||
//                            q.trim() == 'FreeResType' ||
//                            q.trim() == 'FreeResName' ||
//                            q.trim() == 'FreeResTotal' ||
//                            q.trim() == 'FreeResUsed' ||
//                            q.trim() == 'ResUnit'
//                          ){
//                          userInfo[p][q] = freeResItems[p][q];
//                        }
//                      }
//                    }
console.log(userInfo);
                  });//End of xml paser
            }//End of hasOwnProperty

          }else{
            console.log("client ERROR");
            console.log(err);
            cb(err);
          }
      });
  }else{
    console.log("creatClient ERROR");
    console.log(err);
  }
});

console.timeEnd('SingleSoapQuery');
