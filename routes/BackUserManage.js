var express = require('express');
var router = express.Router();
var mysql = require('mysql');        //含入mysql套件
var pool = require('./lib/db.js');   //含入資料庫連線



// 會員管理後台清單
var linePerPage = 5;  // 每頁資料筆數

router.get('/UserManageList', function (req, res, next) {
    var pageNo = parseInt(req.query.pageNo);  //取得傳送的目前頁數
    if (isNaN(pageNo) || pageNo < 1) {  //如果沒有傳送參數,設目前頁數為第1頁
        pageNo = 1;
    }

    pool.query('select count(*) as cnt from  member', function (err, results) {  //讀取資料總筆數
        if (err) throw err;
        var totalLine = results[0].cnt;  //資料總筆數
        var totalPage = Math.ceil(totalLine / linePerPage);  //總頁數

        pool.query('select * from member order by MemberID desc limit ?, ?',
            [(pageNo - 1) * linePerPage, linePerPage],
            function (err, results) {  //根據目前頁數讀取資料
                if (err) throw err;
                res.render('UserManageList', {
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
router.post('/UserManageList', function (req, res) {
    var MemberName = req.body.MemberName;
    var RegistrationDateStart = req.body.RegistrationDateStart;
    var RegistrationDateEnd = req.body.RegistrationDateEnd;
    var ModifiedDateStart = req.body.ModifiedDateStart;
    var ModifiedDateEnd = req.body.ModifiedDateEnd;
    var memberState = req.body.memberState;

    if (MemberName === undefined) {
        MemberName = ''
    }
    if (RegistrationDateStart === undefined) {
        RegistrationDateStart = ''
    } 
    if (RegistrationDateEnd === undefined) {
        RegistrationDateEnd = ''
    }
    if (ModifiedDateStart === undefined) {
        ModifiedDateStart = ''
    }
    if (ModifiedDateEnd === undefined) {
        ModifiedDateEnd = ''
    }
    if (memberState === undefined) {
        memberState = ''
    }
    var sql1 = `select count(*) as cnt from member WHERE (MemberName like '%${MemberName}%' OR ?='') AND (RegistrationDate>=? OR ?='') AND (RegistrationDate<=? OR ?='') AND (ModifiedDate>=? OR ?='') AND (ModifiedDate<=? OR ?='') AND (memberState=? OR ?='')`
    pool.query(sql1,
        [
            MemberName,
            RegistrationDateStart,
            RegistrationDateStart,
            RegistrationDateEnd,
            RegistrationDateEnd,
            ModifiedDateStart,
            ModifiedDateStart,
            ModifiedDateEnd,
            ModifiedDateEnd,
            memberState,
            memberState,
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
            var sql2 = `select * from member WHERE (MemberName like '%${MemberName}%' OR ?='') AND (RegistrationDate>=? OR ?='') AND (RegistrationDate<=? OR ?='') AND (ModifiedDate>=? OR ?='') AND (ModifiedDate<=? OR ?='') AND (memberState=? OR ?='')  order by MemberID DESC limit ?, ?`
            pool.query(sql2, // 選此資料表 用PetId排序
                [
                    MemberName,
                    RegistrationDateStart,
                    RegistrationDateStart,
                    RegistrationDateEnd,
                    RegistrationDateEnd,
                    ModifiedDateStart,
                    ModifiedDateStart,
                    ModifiedDateEnd,
                    ModifiedDateEnd,
                    memberState,
                    memberState,
                    (pageNo - 1) * linePerPage, linePerPage
                ],
                function (err, results) {  //根據目前頁數讀取資料  )
                    if (err) throw err;
                    res.render('UserManageList',  //丟到 ejs 模板上
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



// 會員管理後台編輯

var message = '';
var id = 0;

router.get('/UserManageEdit', function (req, res, next) {
    id = req.query.id;  //取得傳送的資料id
    var categories = ['公告', '更新', '活動', '其他'];
    var pageNo = parseInt(req.query.pageNo);
    pool.query('select * from member where MemberID=?', [id], function (err, results) {  //根據id讀取資料
        if (err) throw err;
        res.render('UserManageEdit', { data: results, pageNo: pageNo, categories: categories });
    });
});
router.post('/UserManageEdit', function (req, res, next) {
    var pageNo = parseInt(req.query.pageNo);
    var memberState = req.body['memberState']; //取得輸入的類型
    pool.query('update Member set ? where MemberId=?', [{  //更新資料
        ModifiedDate: new Date(),
        memberState: memberState,

    }, id], function (err, results) {
        if (err) throw err;
        res.redirect('/BackUserManage/UserManageList?pageNo=' + pageNo);  //回到原來頁數的管理頁面    });
    });
});



module.exports = router;