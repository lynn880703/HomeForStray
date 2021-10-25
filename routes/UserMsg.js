var express = require('express');
var router = express.Router();
// 使用資料庫
var mysql = require('mysql'); //含入mysql套件
var pool = require('./lib/db.js') //含入資料庫連線
//設定網頁 每頁資料筆數
var LinePerPage = 5;

router.get('/', function (req, res, next) {
    var PageNo = parseInt(req.query.PageNo);  //取得傳送的目前頁數
    if (isNaN(PageNo) || PageNo < 1) {  //如果沒有傳送參數,設目前頁數為第1頁
        PageNo = 1;
    }
    pool.query('select * from Member where Email=?', [req.session.Email], function (err, results) {
        var memberData = results[0]; // 撈取是否有登入session
        var memberDataJSON = JSON.parse(JSON.stringify(memberData));  //解析RowDataPacket
        var MemberID = memberDataJSON.MemberID;  // 撈出會員ID


        pool.query('SELECT * from UserMsg where MemberID=?', [MemberID], function (err, results) {
            var MsgData = results; 
            var TotalLine = MsgData.length;  // 資料總筆數 
            var TotalPage = Math.ceil(TotalLine / LinePerPage);  //資料總頁數＝總筆數/每頁顯示數
            
            pool.query('SELECT * from UserMsg where MemberID=? order by MsgID DESC limit ?, ?',
                [ MemberID , (PageNo - 1) * LinePerPage, LinePerPage],

                function (err, results) {  //根據目前頁數讀取資料
                    if (err) throw err;
                    res.render('UserMsg', {
                        data: results || "", //全部筆數
                        PageNo: PageNo,
                        TotalLine: TotalLine,
                        TotalPage: TotalPage,
                        LinePerPage: LinePerPage,
                        memberData: memberData || "",
                        isGuest: true, // footer 刊登送養 會員專區 判斷是否登入

                    });
                });
        });
    });
});






module.exports = router;


// 下面筆記
// node.js 的 mysql 套件提供 SQL 命令使用參數功能：可用「?」做為參數，再將參數值置於中括號中即可，語法為：
// pool.query(含問號的資料庫操作命令, [參數值一, 參數值二,……]
    // pool.query('select * from newscenter where news_type=     "公告"'
    // 例如上面 SQL 命令可改寫為：
    // pool.query('select * from newscenter where news_type=   ?', ["公告"]

// 參數值也可超過一個，參數值以逗點「,」分隔，例如由第 5 筆資料開始取得 3 筆資料記錄 (即第 5、6、7 筆資料記錄)：
// pool.query('select * from newscenter limit ?, ?', [4,3] 
// 以下測試失敗

// 以下測試成功
// SELECT * FROM UserMsg JOIN register ON(register.MemberID=UserMsg.MemberID) WHERE UserMsg.MemberID=1
// SELECT * FROM UserMsg,register WHERE register.MemberID=UserMsg.MemberID AND UserMsg.MemberID=1