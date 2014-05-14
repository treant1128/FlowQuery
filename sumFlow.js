console.time('Sum');
var lazy = require('lazy');
var fs = require('fs');

var filePath = __dirname + '/MarResult.txt';
var stream = fs.createReadStream(filePath);
var count = 0, count1130 = 0, count1137 = 0;
var totalResTotal1130 = 0, totalFreeResUsed1130 =0;
var totalResTotal1137 = 0, totalFreeResUsed1137 =0;
var line = undefined, props = undefined;;

lazy(stream)
    .lines
    .forEach(function(line){
        line = line.toString();
        if(line.charAt(0) == '1'){  //有效行以1开头
            props = line.split(' ');
        
            if(props[1] === '1130'){
                totalResTotal1130    += Number(props[2]);
                totalFreeResUsed1130 += Number(props[3]);
                count1130++;
            }else if(props[1] === '1137'){
                totalResTotal1137    += Number(props[2]);
                totalFreeResUsed1137 += Number(props[3]);
                count1137++;
            }
            count++;
        }
    });

stream.on('open', function(){
    console.log('----Start----');
});

stream.on('end', function(){
    console.log('有效号码数量：' + count);
    console.log('######################');
    console.log('时长用户数量: ' + count1130);
    console.log('总FreeResTotal时长：' + totalResTotal1130+ '秒钟');
    console.log('总FreeResUsed时长：' + totalFreeResUsed1130 + '秒钟');
    console.log('************************');
    console.log('流量用户数量: ' + count1137);
    console.log('总FreeResTotal流量：' + totalResTotal1137+ 'k');
    console.log('总FreeResUsed流量：' + totalFreeResUsed1137 + 'k');

    console.timeEnd('Sum');
});

stream.on('error', function(){
    console.log('-----------error-------------');
});
