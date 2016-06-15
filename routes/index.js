var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.sendfile('views/index.html');
    //res.render('index', { });
});
router.get('/manager',function(req,res,next){
    res.sendfile('views/manager_cp.html');
});
router.get('/details',function(req,res,next){
    res.sendfile('views/details.html');
});
module.exports = router;
