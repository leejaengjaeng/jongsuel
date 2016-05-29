var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.sendfile('views/index.html');
    //res.render('index', { });
});
router.get('/manager',function(req,res,next){
    res.sendfile('views/manager.html');
});

module.exports = router;
