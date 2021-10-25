var express = require('express');
var router = express.Router();
var mysql = require('mysql'); //含入mysql套件
var pool = require('./lib/db.js') //含入資料庫連線


router.get('/', function (req, res, next) {
    pool.query('SELECT * from `member` WHERE `Email`=?', [req.session.Email], function (err, results) {
        var memberData = results[0]; // 撈取是否有登入session
        pool.query('SELECT * FROM `member` WHERE `Email`=?', [req.session.Email], function (err, results) {
            var UserData = results;
            console.log(UserData)
            if (err) throw err;
            res.render('UserEdit', {
                UserData: UserData[0] || "",
                memberData: memberData || "",
                isGuest: true, // footer 刊登送養 會員專區 判斷是否登入

            });
        })

    });
});

// 會員資料 編輯
router.post('/', function (req, res, next) {
    var pageNo = parseInt(req.query.pageNo);
    var CellPhone = req.body['CellPhone'];  //取得輸入的類型
    var Email = req.body['Email'];


        pool.query('update member set ? WHERE `Email`=?', [{  //更新資料
            CellPhone: CellPhone,
        }, req.session.Email], function (err, results) {
            if (err) throw err;
            res.redirect('UserEdit');
    });
});


module.exports = router;