var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var pool = require('./lib/db.js');

router.get('/', function (req, res, next) {
    pool.query('select * from Member where Email=?', [req.session.Email], function (err, results) {
        var memberData = results[0]; // 撈取是否有登入session


    var id = req.query.id;  //取得傳送的資料id
    var pageNo = parseInt(req.query.pageNo);  //取得傳送的目前頁數
    pool.query('select * from News where NewsId=?', [id], function (err, results) {  //根據id讀取資料
        if (err) throw err;
        res.render('NewsContent', { 
            data: results, 
            pageNo: pageNo,
            memberData: memberData || "", 
            isGuest: true, // footer 刊登送養 會員專區 判斷是否登入

        });  //傳送pageNo給返回首頁使用(回到原來頁面)

    });
});
});

module.exports = router;