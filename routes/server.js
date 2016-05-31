var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('Hello');
    //res.render('index', { });
});
router.post('/', function(req,res,next){
    var str = "USER ID : " + req.body.userid;
    var energy =  " energy :" + req.body.energy;
    var emotion =  " emotion : "+req.body.emotion;
    var imgUrl = "imgUrl : "+req.body.imgUrl;
    res.send(str+"<br>"+energy+"<br>"+emotion+"<br>"+imgUrl);
   
    var text = JSON.parse(req.body.messages);
    var realText="";
    for(key in text)
    {
        if(text[key].message === undefined) continue;
        realText += text[key].message+"\n";
    }   
    console.log(realText);
});

module.exports = router;
