//付费订购
//https://github.com/milewise/node-soap
//npm install soap
var soap = require('soap');
var crypto = require('crypto');
var parseString = require('xml2js').parseString;

var verifyNumber= function(number){
	if(number.constructor === String){
		if(number.length == 11 && number.charAt(0) == '1'){
			return number;
		}else if(number.length == 13 && number.substring(0, 2) == '86'){
			return number.substr(2);
		}else {
			return "Unknown";
		}
	}
};

var order_url = 'http://115.239.134.77/flow/services/FlowInterfaceAdapter?wsdl';

var _order=function(number, type, cb){
//入口参数就一个，就requestParam，另外这个参数就是一整个XML
//
//<?xml version="1.0" encoding="utf-8"?>
//<request>
//<userId>xxx</userId>             必须：手机号
//<aCode>xxx</aCode>               必须（授权码为s_wukong）
//<tp>xxx</tp>
//                                 必须，流量包类型（对应tp的值） 流量包名称
//                                       3  天翼20元包150M手机上网流量
//                                       4  天翼30元包300M手机上网流量
//                                       5  天翼50元包800M手机上网流量

//                                      12  100M免费流量包
//                                      14  50M免费流量包
//                                      15  300M免费流量包
//<globalKey>xxx</globalKey>       必须，规则“用户号码_时间戳”，例如15355096273_1370332441941
//<fromID>xxx</fromID>             必须,统一为微视窗拼音简写wsc
//<verifyPwd>xxx</verifyPwd>       必须，verifyPwd = MD5(aCode +userId)
//<verifyCode>xxx</verifyCode>     必须，verifyCode = MD5(verifyStr)，其中verifyStr，为<request></request>之间的内容
//</request>

//需要检查入口参数

var phonenumber = verifyNumber(number);
if(phonenumber === "Unknown"){
	cb('手机号码有误, 请查证!');
	return;
}

var aCode = "s_wukong";
var tp = type; //3yuan 15M
var globalKey = phonenumber + "_" + Date.now();
var fromID = "wsc";

var md5 = crypto.createHash('md5');
    md5.update(aCode + phonenumber);
var verifyPwd = md5.digest('hex');


var payload = "<userId>" + phonenumber + "</userId>" +
              "<aCode>" + aCode + "</aCode>" +
              "<tp>" + tp + "</tp>" +
              "<globalKey>" + globalKey + "</globalKey>" +
              "<fromID>" + fromID + "</fromID>";
var md5b = crypto.createHash('md5');
    md5b.update(payload);

var verifyCode = md5b.digest('hex');

var verifySeg = "<verifyPwd>" + verifyPwd + "</verifyPwd>" +
                "<verifyCode>" + verifyCode + "</verifyCode>";

var reqStr = "<?xml version='1.0' encoding='utf-8'?><request>" + payload + verifySeg + "</request>"

console.log("REQUEST:\n%s",reqStr);

var args = {requestParam : reqStr};

soap.createClient(order_url, function(err, client) {
    console.log("I AM CREATE client....");
  if(!err){
      client.orderRate(args, function(err, result) {
        console.log('---------------------result--------------------');
          console.log(result);  			return;
          if(!err){
            if(result.hasOwnProperty("orderRateReturn")){


///////////////////
                var rc=result["orderRateReturn"].indexOf("订单提交成功");
                  console.log("rc in soap %s",rc);
                  if(rc!=-1){
                   cb("ok");
                 }   
           rc=result["orderRateReturn"].indexOf("该资产有在途订单");
               console.log("rc in soap %s",rc);
                if(rc!=-1){
                   cb("repeat");
                }   
          rc=result["orderRateReturn"].indexOf("当前号码不属于浙江省资产");                                                                           
               console.log("rc in soap %s",rc);
                if(rc!=-1){
                   cb("wrongnumber");
                }   

          rc=result["orderRateReturn"].indexOf("null");                                                                           
               console.log("rc in soap %s",rc);
                if(rc!=-1){
                   cb("wrongbill");
                }   
///////////////////

            }else{
              console.log("Unkonwn ERROR");
              cb("Unkonwn ERROR");
            }//END OF hasOwnProperty.....
          }else{
            console.log(err);
            cb(err);
          }//END OF client not err
        });//END of client orderRate...
  }else{
    console.log(err);
    cb(err);
  }
});//END of createClient...


};//END OF FUNCTION
  
//Public Method....
exports.order = _order;


if(1){
	_order('18006783900', 9, function(result){
		console.log(result);
	});
}
