var express = require('express');
var router = express.Router();
var mysql = require('mysql');        //含入mysql套件
var pool = require('./lib/db.js');   //含入資料庫連線

//毛孩知識後台清單
var linePerPage = 5;  // 每頁資料筆數

router.get('/KnowManageList', function (req, res, next) {
    var pageNo = parseInt(req.query.pageNo);  //取得傳送的目前頁數
    if (isNaN(pageNo) || pageNo < 1) {  //如果沒有傳送參數,設目前頁數為第1頁
        pageNo = 1;
    }

    pool.query('select count(*) as cnt from articlenews', function (err, results) {  //讀取資料總筆數
        if (err) throw err;
        var totalLine = results[0].cnt;  //資料總筆數
        var totalPage = Math.ceil(totalLine / linePerPage);  //總頁數

        pool.query('select * from articlenews order by ArticleId desc limit ?, ?;',
            [(pageNo - 1) * linePerPage, linePerPage],
            function (err, results) {  //根據目前頁數讀取資料
                if (err) throw err;
                res.render('KnowManageList', {
                    data: results,
                    pageNo: pageNo,
                    totalLine: totalLine,
                    totalPage: totalPage,
                    linePerPage: linePerPage
                });
            });
    });
});


// 毛孩知識後台清單 查詢

router.post('/KnowManageList', function (req, res) {
    var ArticleTitle = req.body.ArticleTitle;
    var ArticleDateStart = req.body.ArticleDateStart;
    var ArticleDateEnd = req.body.ArticleDateEnd;

    if (ArticleTitle === undefined) {
        ArticleTitle = ''
    }
    if (ArticleDateStart === undefined) {
        ArticleDateStart = ''
    }
    if (ArticleDateEnd === undefined) {
        ArticleDateEnd = ''
    }
    var sql1 = `select count(*) as cnt from articlenews WHERE (ArticleTitle like '%${ArticleTitle}%' OR ?='') AND (ArticleDate>=? OR ?='' ) AND (ArticleDate<=? OR ?='' )`
    pool.query(sql1,
        [
            ArticleTitle,
            ArticleDateStart,
            ArticleDateStart,
            ArticleDateEnd,
            ArticleDateEnd,
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
            var sql2 = `select * from articlenews WHERE (ArticleTitle like '%${ArticleTitle}%'  OR  ?='') AND  (ArticleDate>=? OR ?='' ) AND (ArticleDate<=? OR ?='' )  order by ArticleDate DESC limit ?, ? `
            pool.query(sql2, // 選此資料表 用PetId排序
                [
                    ArticleTitle,
                    ArticleDateStart,
                    ArticleDateStart,
                    ArticleDateEnd,
                    ArticleDateEnd,
                    (pageNo - 1) * linePerPage, linePerPage
                ],
                function (err, results) {  //根據目前頁數讀取資料  )
                    if (err) throw err;
                    res.render('KnowManageList',  //丟到 ejs 模板上
                        {
                            data: results,
                            pageNo: pageNo,
                            totalLine: totalLine,
                            totalPage: totalPage,
                            linePerPage: linePerPage
                        });
                });
        })

});



// 毛孩知識後台新增
var message = '';

router.get('/KnowManageAdd', function (req, res, next) {
    var pageNo = parseInt(req.query.pageNo);
    res.render('KnowManageAdd', { pageNo: pageNo, message: message });
});

router.post('/KnowManageAdd', function (req, res, next) {

    var pageNo = parseInt(req.query.pageNo);
    var articleTitle = req.body['ArticleTitle'];  //取得輸入的類型
    var articleDate = req.body['ArticleDate'];
    var articleContent = req.body['ArticleContent'];

    // // 上傳圖片
    // if (!req.files)
    //     return res.status(400).send('No files were uploaded.');

    var file = req.files.uploadImg;
    // 將圖片重新命名
    var img_name = Date.now() + '-' + file.name;
    
    // 限定圖片格式
    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/jpg") {
        // 圖片儲存路徑
        file.mv('public/images/upload_images/' + img_name, function (err) {

            if (err) { return res.status(500).send(err); }
            // 存入資料庫
            else {
                pool.query('insert into articlenews set ?', [{//新增資料
                    ArticleTitle: articleTitle,
                    ArticleDate: articleDate,
                    ArticleCont: articleContent,
                    ArticleImg: img_name,
                    ArticleHits: 0, //點擊次數

                }], function (err, results) {
                    if (err) throw err;
                    res.redirect('/backKnowManage/KnowManageList');
                });
            }
        })
    }
});


// 毛孩知識刪除 

var id = 0;

router.get('/KnowManageDel', function (req, res, next) {
    id = req.query.id;  //取得傳送的資料id
    var pageNo = parseInt(req.query.pageNo);
    pool.query('select * from articlenews where ArticleId=?', [id], function (err, results) {  //根據id讀取資料
        if (err) throw err;
        var date = results[0].ArticleDate;
        // 改變日期格式
        const formatDate = (date) => {
            if ((parseInt(date.getMonth() + 1)) >= 10 && parseInt(date.getDate()) >= 10) {
                let formatted_date1 = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
                return formatted_date1;
            } else if ((parseInt(date.getMonth() + 1)) >= 10 && parseInt(date.getDate()) <= 10) {
                let formatted_date2 = date.getFullYear() + "-" + (date.getMonth() + 1) + "-0" + date.getDate()
                return formatted_date2;
            } else if ((parseInt(date.getMonth() + 1)) <= 10 && parseInt(date.getDate()) <= 10) {
                let formatted_date3 = date.getFullYear() + "-0" + (date.getMonth() + 1) + "-0" + date.getDate()
                return formatted_date3;
            }
            else {
                let formatted_date4 = date.getFullYear() + "-0" + (date.getMonth() + 1) + "-" + date.getDate()
                return formatted_date4;
            }
        }
        // console.log(formatDate(date));

        res.render('KnowManageDel', { data: results, pageNo: pageNo, date: formatDate(date) });
    });
});

router.post('/KnowManageDel', function (req, res, next) {
    pool.query('delete from articlenews where ArticleId=?', [id], function (err, results) {  //刪除資料
        if (err) throw err;
        res.redirect('/backKnowManage/KnowManageList');
    });
});


// 毛孩知識編輯

var id = 0;

router.get('/KnowManageEdit', function (req, res, next) {
    var categories = ['標題', '發布日期', '內容', '狀態'];
    id = req.query.id;  //取得傳送的資料id
    var pageNo = parseInt(req.query.pageNo);


    pool.query('select * from articlenews where ArticleId=?', [id], function (err, results) {  //根據id讀取資料
        if (err) throw err;
        var date = results[0].ArticleDate;
        // 改變日期格式
        const formatDate = (date) => {
            if ((parseInt(date.getMonth() + 1)) >= 10 && parseInt(date.getDate()) >= 10) {
                let formatted_date1 = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
                return formatted_date1;
            } else if ((parseInt(date.getMonth() + 1)) >= 10 && parseInt(date.getDate()) <= 10) {
                let formatted_date2 = date.getFullYear() + "-" + (date.getMonth() + 1) + "-0" + date.getDate()
                return formatted_date2;
            } else if ((parseInt(date.getMonth() + 1)) <= 10 && parseInt(date.getDate()) <= 10) {
                let formatted_date3 = date.getFullYear() + "-0" + (date.getMonth() + 1) + "-0" + date.getDate()
                return formatted_date3;
            }
            else {
                let formatted_date4 = date.getFullYear() + "-0" + (date.getMonth() + 1) + "-" + date.getDate()
                return formatted_date4;
            }
        }

        res.render('KnowManageEdit', {
            data: results,
            date: formatDate(date),
            pageNo: pageNo,
            categories: categories
        });
    });
});


router.post('/KnowManageEdit', function (req, res, next) {
    var pageNo = parseInt(req.query.pageNo);
    var articleTitle = req.body['ArticleTitle'];  //取得輸入的類型
    var articleDate = req.body['ArticleDate'];
    var articleContent = req.body['ArticleContent'];
   
    // 上傳圖片
    // if (!req.files)
    //     return res.status(400).send('No files were uploaded.');
        
    var file = req.files.uploadImgEdit;
    // 將圖片重新命名
    var img_name = Date.now() + '-' + file.name;
    // 限定圖片格式
    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/jpg") {
        // 圖片儲存路徑
        file.mv('public/images/upload_images/' + img_name, function (err) {

            if (err) { return res.status(500).send(err); }
            // 存入資料庫
            else {
                pool.query('update articlenews set ? where ArticleId=?', [{  //更新資料
                    ArticleTitle: articleTitle,
                    ArticleDate: articleDate,
                    ArticleCont: articleContent,
                    ArticleImg: img_name,
                }, id], function (err, results) {
                    if (err) throw err;
                    res.redirect('/backKnowManage/KnowManageList');  //回到原來頁數的管理頁面
                });
            }
        });
    }
});



module.exports = router;