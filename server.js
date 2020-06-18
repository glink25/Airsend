var fs = require('fs');
const multer = require('multer');
var path = require('path');
var bodyParser = require('body-parser');
const express=require('express');
const { shell }=require('electron')
const e_app=express()
console.log(require.resolve('electron'));
e_app.use(bodyParser.json());

// 访问静态资源文件 这里是访问所有dist目录下的静态资源文件
e_app.use(express.static(path.resolve(__dirname, './server')))
e_app.use(express.static('public'));
e_app.use(multer({dest: './server'}).array('file')); 

e_app.get('／g', function(req, res) {
  const html = fs.readFile(path.resolve(__dirname, './server/index.html'), 'utf-8');
  res.send(html)
});
e_app.post('/p',function(req,res,next){
    var query = req.body;
    console.log("post", query);
    console.log('hello')
    fs.readFile(req.files[0].path, function(err, data){
        if(err){
            console.log('Error');
        }else{
            var dir_file = './file_recv/'+req.files[0].originalname
            // console.log(dir_file);
            fs.writeFile(dir_file, data, function(err){
                var obj = {
                    msg: 'upload success',
                    filename: req.files[0].originalname
                }
                console.log(obj);
                res.send(JSON.stringify(obj));
                shell.openExternal('e_apple.com')
            })
            
            if(req.files[0].originalname=='clipboard.txt'){

            }
        }
    })
    

})

//处理请求跨域

e_app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Content-Type", "e_application/json;charset=utf-8");
  res.header("Access-Control-Allow-Headers", "content-type");
  next();
});

e_app.listen('9999',function(){
    console.log('express started')
})