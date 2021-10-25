var express = require('express');
var router = express.Router();
var mysql = require('mysql'); //含入mysql套件
var pool = require('./lib/db.js') //含入資料庫連線
//設定網頁 每頁資料筆數
var LinePerPage = 5;

router.get('/', function (req, res, next) {
    var PageNo = parseInt(req.query.PageNo);  //取得傳送的目前頁數
    if (isNaN(PageNo) || PageNo < 1) {  //如果沒有傳送參數,設目前頁數為第1頁
        PageNo = 1;
    }
    pool.query('select * from `Member` where `Email`=?', [req.session.Email], function (err, results) {
        var memberData = results[0]; // 撈取是否有登入session

        pool.query('SELECT * FROM `UserFollow` JOIN `member` ON(`member`.MemberID=`UserFollow`.`MemberID`) JOIN PostForAdopt ON (`PostForAdopt`.`Petid`=`UserFollow`.`Petid`) WHERE `UserFollowState` = 1 AND `Email`=?', [req.session.Email], function (err, results) {
            var FollowData = results;
            var TotalLine = FollowData.length; //資料總筆數 朱建輝 有兩筆追蹤資料
            var TotalPage = Math.ceil(TotalLine / LinePerPage); //資料總頁數＝總筆數/每頁顯示數  朱建輝資料總頁數 1 ，因為總共2筆/每頁顯示5筆資料

            pool.query('SELECT * FROM `UserFollow`JOIN `member` ON(`member`.MemberID=`UserFollow`.`MemberID`) JOIN PostForAdopt ON (`PostForAdopt`.`Petid`=`UserFollow`.`Petid`) WHERE `UserFollowState` = 1 ORDER BY `FollowDate` DESC LIMIT ?,?', [(PageNo - 1) * LinePerPage, LinePerPage], function (err, results) {

                if (err) throw err;
                res.render('UserFollow', {
                    data: results,
                    FollowData: FollowData || "",
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


router.post('/', function (req, res, next) {
    var PageNo = parseInt(req.query.PageNo);  //取得傳送的目前頁數
    if (isNaN(PageNo) || PageNo < 1) {  //如果沒有傳送參數,設目前頁數為第1頁
        PageNo = 1;
    }

    pool.query('select * from `Member` where `Email`=?', [req.session.Email], function (err, results) {
        var memberData = results[0]; // 撈取是否有登入session
        var memberDataJSON = JSON.parse(JSON.stringify(memberData));  //解析RowDataPacket
        var MemberID = memberDataJSON.MemberID;  // 撈出會員ID


        pool.query('SELECT * FROM `UserFollow`JOIN `member` ON(`member`.MemberID=`UserFollow`.`MemberID`) JOIN PostForAdopt ON (`PostForAdopt`.`Petid`=`UserFollow`.`Petid`) WHERE `UserFollowState` = 1 ORDER BY `FollowDate` DESC LIMIT ?,?', [(PageNo - 1) * LinePerPage, LinePerPage], function (err, results) {
            var FollowData = results[0];
            var FollowDataJSON = JSON.parse(JSON.stringify(FollowData));  //解析RowDataPacket
            var PetName = FollowDataJSON.PetName;  // 撈出寵物名字

            // 接收前台name的值，取出FollowID，再將UserFollowState設置為0
            pool.query('UPDATE userfollow set UserFollowState = 0 where FollowID=?', [
                req.body.FollowID
            ], function (err, results) {
                if (err) throw err;
                res.redirect('/UserFollow') // 重新倒回這頁，才會再重新載入 

                // 寫入 通知訊息
                pool.query(`INSERT INTO usermsg (MemberID,MsgDate,Msg) VALUES ('${MemberID}' , '${onTime()}','【系統通知】寵物${PetName}，已取消追蹤!' )`, [], function (err, results) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                });
            });

        });

    });
});
module.exports = router;

const onTime = () => {
    const date = new Date();
    const mm = date.getMonth() + 1;
    const dd = date.getDate();
    const hh = date.getHours();
    const mi = date.getMinutes();
    const ss = date.getSeconds();

    return [date.getFullYear(), "-" +
        (mm > 9 ? '' : '0') + mm, "-" +
        (dd > 9 ? '' : '0') + dd, " " +
        (hh > 9 ? '' : '0') + hh, ":" +
        (mi > 9 ? '' : '0') + mi, ":" +
        (ss > 9 ? '' : '0') + ss
    ].join('');
}