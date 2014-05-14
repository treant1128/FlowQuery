var cp = require('child_process');
var lazy = require('lazy');
var fs = require('fs');

//配置参数
console.log("__dirname: %s", __dirname);
var filePath = __dirname + '/nrPkgs/January.txt';
///////////////////

var phoneNumbers = new Array();

var stream = fs.createReadStream(filePath);
stream.on('end', function(data){
    var len = phoneNumbers.length;
    console.log('手机号码数量: ' + len);
    console.log(phoneNumbers);
});

lazy(stream)
  .lines
  .forEach(function(line){
    var line = line.toString().trim().substr(0, 11);
//    console.log(line);
    if(line.charAt(0) === '1'){
      phoneNumbers.push(line);
    }else{
      console.log(line+' 不是有效手机号码!');
    }
  });
