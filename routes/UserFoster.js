var express = require('express');
var router = express.Router();
var mysql = require('mysql'); //含入mysql套件
var pool = require('./lib/db.js') //含入資料庫連線
//設定網頁 每頁資料筆數
var LinePerPage = 5



//抓資料  先抓總頁數  在抓屬於這個會員的資料  在從資料庫撈出跟這個會員有關的
router.get('/', function (req, res, next) {
    var PageNo = parseInt(req.query.PageNo);  //取得傳送的目前頁數
    if (isNaN(PageNo) || PageNo < 1) {  //如果沒有傳送參數,設目前頁數為第1頁
        PageNo = 1;
    }
    pool.query('SELECT * from `Member` where Email=?', [req.session.Email], function (err, results) {
        var memberData = results[0]; // 撈取是否有登入session
        console.log(memberData)
        //編號 寵物膩稱 刊登日期 狀態(以批准) 認養狀態(開放認養)  功能(編輯)
        pool.query('SELECT * FROM `PostForAdopt` JOIN `member` ON(`member`.MemberID=`PostForAdopt`.MemberID)  WHERE `Email`=?', [req.session.Email], function (err, results) {
            var FosterData = results; // 把所有資料都抓出來
            console.log(FosterData)
            console.log("[mysql error]", err);
            var TotalLine = FosterData.length; //資料總筆數 
            var TotalPage = Math.ceil(TotalLine / LinePerPage); //資料總頁數＝總筆數/每頁顯示數  

            pool.query('SELECT * FROM `PostForAdopt`  JOIN `member` ON(`member`.MemberID=`PostForAdopt`.MemberID) JOIN `AuditData` ON(`AuditData`.PetId=`PostForAdopt`.PetId)ORDER BY `AdoptDate` DESC LIMIT ?,?', [(PageNo - 1) * LinePerPage, LinePerPage], function (err, results) {
                var pageData = results;   //針對撈出來的資料做排序
                console.log(pageData)
                if (err) throw err;
                res.render('UserFoster', {
                    pageData: results,
                    FosterData: FosterData || "",
                    PageNo: PageNo,         //目前頁數 1
                    TotalLine: TotalLine,   //總筆數  100
                    TotalPage: TotalPage,   //資料總頁數  20
                    LinePerPage: LinePerPage, //每頁顯示數  5
                    memberData: memberData || "",//會員資料
                    isGuest: true, // footer 刊登送養 會員專區 判斷是否登入

                });
            });
        });
    });
});

module.exports = router;