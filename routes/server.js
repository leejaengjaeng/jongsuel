var express = require('express');
var router = express.Router();
var dbConn = require('../lib/dbConnection.js');
var mecab = require('mecab-ffi');
var url = require('url');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('Hello');
    //res.render('index', { });
});

/*class에 속한 사람들의 uid 보내주기 */
router.get('/getPeoplesInClass', function(req,res,next)
{
    //var cid = req.param.cid;
    var reqUrl = url.parse(req.url,true).query;
    var cid = reqUrl.cid;
    dbConn.query('select uid,uname,uimg from user where cid = ?',[cid],function(err,rows){
        if(err){
            console.log('get Peoples in Class Err');
            console.log("cid : "+cid);
            console.log(err);
            return next(err);
        }
        else{
            res.writeHead(200,{'Content-Type':'application/json'});
            //rows[0].uid 로 써내서 씀
            res.end(JSON.stringify(rows));
        }
    });
});

/* 관리자 에게 정보보여주기 */
router.get('/getInfomAboutPerson',function(req,res,next)
{
    var reqUrl = url.parse(req.url,true).query;
    var uid = reqUrl.uid;
    dbConn.query('select edate,energy,feeling from emotion where uid = ? order by edate desc limit 5',[uid],function(err,rows){
        if(err){
            console.log('get Inform err');
            console.log('uid :'+uid);
            console.log(err);
            return(err);
        }
        else{
            res.writeHead(200,{'Content-Type':'application/json'});
            //rows[0].edate, rows[0].energy, rows[0].feeling;
            res.end(JSON.stringify(rows));
        }
    });
});

/* 사람별 top10개 키워드 보내주기 */
router.get('/getPersonsWord',function(req,res,next)
{
    var reqUrl = url.parse(req.url,true).query;
    var uid = reqUrl.uid;
    dbConn.query('select word, count(*) as cnt from word where uid = ? group by uid, word order by count(*) desc limit 10  ',[uid],function(err,rows){
        if(err){
            console.log('get Inform err');
            console.log('uid :'+uid);
            console.log(err);
            return(err);
        }
        else{
            res.writeHead(200,{'Content-Type':'application/json'});
            res.end(JSON.stringify(rows));
        }
    });
});

/* 사용자 정보 받기 */
router.post('/', function(req,res,next){
    var userId = req.body.userid;
    var energy = req.body.energy;
    var feeling = req.body.emotion;
    var imgUrl = req.body.imgUrl;
    var date = req.body.date;
    var uname = req.body.uname;
    var text="";
    var realText="";

    if(energy == 'undefined') energy = 0;
    if(feeling == 'undefined') feeling = 1;


    //null 체크를 이렇게 밖에못하는 자신을 탓해봅시다
    if(req.body.messages == "undefined")
    {
        console.log('왜 안찍히냐');
    }
    else
    {
        console.log('원본 피드 : '+req.body.messages);
        text = JSON.parse(req.body.messages);
        var realText="";
        for(key in text)
        {
           if(text[key].message === undefined) continue;
           realText += text[key].message+"\n";
        }
    }

    /* 
    mecab.extractSortedNounCounts(realText,function(err,result){
        console.log("---------명사 추출------");
        for(key in result)
        {
            console.log(result[key].noun +","+result[key].count);
        }
        console.log("---------------------");
    });
    */
    
    var responseToClinet = function()
    {
        res.writeHead(301,
                {
                    Location:'http://ec2-52-79-93-55.ap-northeast-2.compute.amazonaws.com:8100/'	
	        }
        );
        console.log('response Done');
        res.end();
    } 
    var insertWords = function(result){
        var insertQuery = 'insert into word values';
        var n = result.length;
	    console.log('\n------------형태소 분석 후 추출  값---------\n'+result);
    if(n==0);
        else
        {
            for(var i=0;i<n;i++)
            {
                insertQuery += '(\'\','+userId+',\''+result[i]+'\',\''+date+'\'),';   
            }
            //마지막 , 제거
            insertQuery = insertQuery.slice(0,-1);
            //dbConn.query('insert into word values('',?,?)',[userId,result[i]],function(err,rows)
            //console.log(insertQuery);
            dbConn.query(insertQuery,[],function(err,rows)
            {
               if(err)
               {
                    console.log('Word INSERT Err');
                    console.error(err);
                    return next(err);
                }  
                else
                {
                   console.log(i+': word insert done..');
                }
            });
        }
        responseToClinet();
    } 
  
    //임시) 뺴고 체크할 단어들
    var passList = ["모니터","해야","생일","축하","오빠","선배","드려요","드려","정도","보여","해서","모습","이번","이당","생신","누군가","오늘","하루","해서","해라"]; 
  
    var wordCheck = function(){
        new Promise(function(resolve,reject){
            mecab.parse(realText,function(err,result){
                if(err) return reject(err);

                console.log("----------형태소 분석------\n");
                console.log(result);

                var t =[];
                var cnt=0;
                for(key in result)
                {
                    if(result[key][0].length!=1)
                    {
                        if((result[key][1].indexOf("+EC") != -1) || (result[key][1].indexOf("NNG") != -1))
                        {
                            // if(result[key][0] == "생일" || result[key][0] == "축하" || result[key][0] =="오빠" || result[key][0] == "드려요" || result[key][0] == "드려")continue;
                            var flag = 0;
                            for(var i =0; i < passList.length ; i++)
                            {
                                if(result[key][0] == passList[i])
                                {
                                    flag = 1;
                                    break;
                                } 
                            }
                            if(flag == 0) t[cnt++] = result[key][0];
                        }
                    }
                    else continue;
                }
                resolve(t);
            });
        //insertWord() 같은 형식이 아니라는거 주의!
        }).then(insertWords);
    }
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
                 
           
            dbConn.query('INSERT INTO emotion values(\'\',?,?,?,?)',[userId,energy,feeling,date],function(err,rows)
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
            wordCheck();
        }
        //이용중인 사용자
        else
        {
            console.log('디비에 값 있음');
            dbConn.query('INSERT INTO emotion values(?,?,?,?,?)',['',userId,energy,feeling,date],function(err,rows)
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
            wordCheck();
        }
    });
});

module.exports = router;
