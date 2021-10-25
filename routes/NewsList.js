var express = require('express');
var router = express.Router();
var mysql = require('mysql');        //含入mysql套件
var pool = require('./lib/db.js');   //含入資料庫連線

var linePerPage = 10;  // 每頁資料筆數

/* GET home page. */
router.get('/', function (req, res, next) {
    var pageNo = parseInt(req.query.pageNo);  //取得傳送的目前頁數
    if (isNaN(pageNo) || pageNo < 1) {  //如果沒有傳送參數,設目前頁數為第1頁
        pageNo = 1;
    }
    pool.query('select * from Member where Email=?', [req.session.Email], function (err, results) {
        var memberData = results[0]; // 撈取是否有登入session

        pool.query('select count(*) as cnt from News', function (err, results) {  //讀取資料總筆數
            if (err) throw err;
            var totalLine = results[0].cnt;  //資料總筆數
            var totalPage = Math.ceil(totalLine / linePerPage);  //總頁數

            pool.query('select * from News order by NewsId desc limit ?, ?', [(pageNo - 1) * linePerPage, linePerPage], function (err, results) {  //根據目前頁數讀取資料
                if (err) throw err;
                res.render('NewsList', { 
                    data: results, 
                    pageNo: pageNo, 
                    totalLine: totalLine, 
                    totalPage: totalPage, 
                    linePerPage: linePerPage, 
                    memberData: memberData || "" ,
                    isGuest: true, // footer 刊登送養 會員專區 判斷是否登入
                });
            });
        });
    });
});

module.exports = router;





