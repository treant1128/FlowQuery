var cp = require('child_process');
var lazy = require('lazy');
var fs = require('fs');

//配置参数
var CHILD_NUMBER = 10;      //共fork 10个process
console.log("__dirname: %s", __dirname);
var filePath = __dirname + '/nrPkgs/Mar.txt';
///////////////////

var phoneNumbers = new Array();
var children = new Array(CHILD_NUMBER);

for (var i=0; i< CHILD_NUMBER; i++){
  children[i] = cp.fork(__dirname + '/sub.js');
  children[i].on('message', function(m){
      console.log(m);
  });
}



var stream = fs.createReadStream(filePath);
stream.on('end', function(data){
    var len = phoneNumbers.length;
    console.log('手机号码数量: ' + len);

    var work_load_array = new Array();
    var split_width = Math.round(len / CHILD_NUMBER);
    console.log('Splited Width: '+ split_width);

    var start = 0;
    for(var i=0; i<CHILD_NUMBER; i++){
      start = i * split_width;
      var end = (start + split_width) >= len ? len : start + split_width;
      //如果是最后一个 再次确认
          end = (i == CHILD_NUMBER - 1 ? len : end);


      console.log('i:%d, start:%d, end:%d', i, start, end);
      
      work_load_array[i] = phoneNumbers.slice(start, end);
      children[i].send({'missionNumbers' : work_load_array[i]});
    }
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
