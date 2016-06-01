var express = require('express');
var router = express.Router();
var dbConn = require('../lib/dbConnection.js');
var mecab = require('mecab-ffi');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('Hello');
    //res.render('index', { });
});
router.post('/', function(req,res,next){
    var userId = req.body.userid;
    var energy =  " energy :" + req.body.energy;
    var feeling =  " emotion : "+req.body.emotion;
    var imgUrl = "imgUrl : "+req.body.imgUrl;
    var uname = req.body.uname;
    
    var text = JSON.parse(req.body.messages);
    var realText="";
    for(key in text)
    {
        if(text[key].message === undefined) continue;
        realText += text[key].message+"\n";
    }  
    /* 
    mecab.extractSortedNounCounts(realText,function(err,result){
        console.log("---------형태소------");
        for(key in result)
        {
            console.log(result[key].noun +","+result[key].count);
        }
        console.log("---------------------");
    });
    */
    
    console.log("----------형태소 분석------");
    /*
    mecab.parse(realText,function(err,result){
        var t ="";
        for(key in result)
        {
            if(result[key][0].length!=1)
            {
                if((result[key][1].indexOf("+EC") != -1) || (result[key][1].indexOf("NNG") != -1))
                    t += result[key][0]+"<br>";
            }
            else continue;
        }
        //console.log(result);
    });
    */
    var printT = function(result){res.send(result);} 
 
    new Promise(function(resolve,reject){
        mecab.parse(realText,function(err,result){
            if(err) return reject(err);

            var t =[];
            var cnt=0;
            for(key in result)
            {
                if(result[key][0].length!=1)
                {
                    if((result[key][1].indexOf("+EC") != -1) || (result[key][1].indexOf("NNG") != -1))
                        t[cnt++] = result[key][0];
                }
                else continue;
            }
            resolve(t);
        });
        //printT() 같은 형식이 아니라는거 주의!
    }).then(printT);

/*
    dbConn.query('select uid from user where uid = ?',[userId],function(err,rows){
        if(err)
        {
            console.log('유저아이디');
            console.log(userId);
        }
        //처음 이용하는 사용자 
        else if(rows[0] == null)
        {
            console.log(rows);
            console.log(userId);
            console.log("-----------------");
            console.log(rows.uid);
            console.log("-----------------");
            dbConn.query('INSERT INTO user values(?,?,?,?,?)',[userId,uname,imgUrl,1,1],function(err,rows)
            {
                 if(err)
                 {
                      console.log('User INSERT Err');
                      console.error(err);
                      return next(err);
                 }  
                 else
                 {
                    console.log('user insert done..');
                 }
            });
            dbConn.query('INSERT INTO emotion values(?,?,?,?)',['',uname,energy,feeling],function(err,rows)
            {
                if(err)
                {
                    console.log('Emotion INSERT Err');
                    console.error(err);
                    return next(err);
                }
                else
                {
                    console.log('emotion insert done..');
                }
            });
        }
        //이용중인 사용자
        else
        {
            console.log('디비에 값 있음');
            dbConn.query('INSERT INTO emotion values(?,?,?,?)',['',userId,energy,feeling],function(err,rows)
            {
                if(err)
                {
                    console.log('Emotion INSERT Err');
                    console.error(err);
                    return next(err);
                }
                else
                {
                    console.log('emotion insert done..');
                }
            });
        }
    });
*/
});

module.exports = router;
