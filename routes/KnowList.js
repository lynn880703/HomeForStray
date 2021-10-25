var express = require('express');
var router = express.Router();
var mysql = require('mysql');        //含入mysql套件
var pool = require('./lib/db.js');   //含入資料庫連線

var linePerPage = 5;  // 每頁資料筆數

/* GET home page. */
router.get('/', function (req, res, next) {
    var pageNo = parseInt(req.query.pageNo);  //取得傳送的目前頁數
    if (isNaN(pageNo) || pageNo < 1) {  //如果沒有傳送參數,設目前頁數為第1頁
        pageNo = 1;
    }

    pool.query('select count(*) as cnt from articlenews', function (err, results) {  //讀取資料總筆數
        if (err) throw err;
        var totalLine = results[0].cnt;  //資料總筆數
        var totalPage = Math.ceil(totalLine / linePerPage);  //總頁數

        pool.query('select * from Member where Email=?', [req.session.Email], function (err, results) {
            var memberData = results[0]; // 撈取是否有登入session

            pool.query('select * from articlenews order by ArticleId desc limit ?, ?;select * from articlenews order by ArticleHits desc limit 0, 6',
                [(pageNo - 1) * linePerPage, linePerPage],
                function (err, results) {  //根據目前頁數讀取資料
                    if (err) throw err;
                    res.render('KnowList', {
                        data: results[0],
                        hotdata: results[1],
                        memberData: memberData || "",
                        pageNo: pageNo,
                        totalLine: totalLine,
                        totalPage: totalPage,
                        linePerPage: linePerPage,
                        isGuest: true, // footer 刊登送養 會員專區 判斷是否登入

                    });
                });
        })
    });
});

// 毛孩知識清單 查詢

router.post('/', function (req, res) {
    var search = req.body.search;
    if (search === undefined) {
        search = ''
    }
    var sql1 = `select count(*) as cnt from articlenews WHERE (ArticleTitle like '%${search}%' OR ?='')`
    pool.query(sql1,
        [
            search,
        ],
        function (err, results) {  //讀取資料總筆數
            if (err) throw err;
            var linePerPage = 100;   // 每頁資料筆數
            var totalLine = results[0].cnt;  //資料總筆數
            var totalPage = Math.ceil(totalLine / linePerPage);  //總頁數
            var pageNo = parseInt(req.query.pageNo);  //取得傳送的目前頁數
            if (isNaN(pageNo) || pageNo < 1) {  //如果沒有傳送參數,設目前頁數為第1頁
                pageNo = 1;
            }
            pool.query('select * from Member where Email=?', [req.session.Email], function (err, results) {
                var memberData = results[0]; // 撈取是否有登入session

                var sql2 = `select * from articlenews WHERE (ArticleTitle like '%${search}%'  OR  ?='') order by ArticleId DESC limit ?, ? ;select * from articlenews order by ArticleHits desc limit 0, 6`
                pool.query(sql2, // 選此資料表 用PetId排序
                    [
                        search,
                        (pageNo - 1) * linePerPage, linePerPage
                    ],
                    function (err, results) {  //根據目前頁數讀取資料  )
                        if (err) throw err;
                        res.render('KnowList',  //丟到 ejs 模板上
                            {
                                data: results[0],
                                hotdata: results[1],
                                memberData: memberData || "",
                                pageNo: pageNo,
                                totalLine: totalLine,
                                totalPage: totalPage,
                                linePerPage: linePerPage,
                                isGuest: true, // footer 刊登送養 會員專區 判斷是否登入
                            });
                    });
            });
        })

});


module.exports = router;

