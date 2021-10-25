var express = require('express');
var router = express.Router();
var mysql = require('mysql'); //含入mysql套件
var pool = require('./lib/db.js') //含入資料庫連線
// 加密
const crypto = require('crypto');

router.get('/', function (req, res, next) {
    var messages = ""
    var alert = ""

    pool.query('SELECT * from `member` WHERE `Email`=?', [req.session.Email], function (err, results) {
        var memberData = results[0]; // 撈取是否有登入session
        if (err) throw err;
        res.render('UserEditPswd', {
            memberData: memberData || "",
            messages: messages,
            alert: alert,
            isGuest: true, // footer 刊登送養 會員專區 判斷是否登入
            oldPswdVal: req.body.oldPswd || "",                  // 保留輸入的值
            newPswdVal: req.body.newPswd || "",                   // 保留輸入的值
            newPswdConfirmVal: req.body.newPswdConfirm || "",    // 保留輸入的值

        });
    });
});


router.post('/', function (req, res, next) {

    pool.query('SELECT * from `member` WHERE `Email`=?', [req.session.Email], function (err, results) {
        var memberData = results[0]; // 撈取是否有登入session
        var pageNo = parseInt(req.query.pageNo);
        var oldPswd = req.body['oldPswd'];  //取得輸入的類型
        var newPswd = req.body['newPswd'];
        var newPswdConfirm = req.body['newPswdConfirm'];

        // 加密
        let hashPassword = crypto.createHash('sha1');
        hashPassword.update(oldPswd);
        const oldPassword = hashPassword.digest('hex');

        var alert = ""

        // 資料庫密碼 != 輸入密碼
        if (memberData.Password != oldPassword && memberData.Password != oldPswd) {
            messages = "舊密碼不正確"
            res.render('UserEditPswd', {
                messages: messages,
                memberData: memberData || "",
                alert: true,
                isGuest: true, // footer 刊登送養 會員專區 判斷是否登入
                oldPswdVal: req.body.oldPswd,                  // 保留輸入的值
                newPswdVal: req.body.newPswd,                   // 保留輸入的值
                newPswdConfirmVal: req.body.newPswdConfirm,    // 保留輸入的值
            })
            return;
            // 輸入的新密碼 != 輸入的確認密碼
        } else if (newPswd !== newPswdConfirm) {
            messages = "新密碼不一致，請重新輸入"
            res.render('UserEditPswd', {
                memberData: memberData || "",
                alert: true,
                messages: messages,
                isGuest: true, // footer 刊登送養 會員專區 判斷是否登入
                oldPswdVal: req.body.oldPswd,                  // 保留輸入的值
                newPswdVal: req.body.newPswd,                   // 保留輸入的值
                newPswdConfirmVal: req.body.newPswdConfirm,    // 保留輸入的值
            })
            return;
            // 資料庫密碼 = 輸入的新密碼
        } else if (memberData.Password == newPswd) {
            messages = "輸入的新舊密碼一致，請重新輸入"
            res.render('UserEditPswd', {
                memberData: memberData || "",
                alert: true,
                messages: messages,
                isGuest: true, // footer 刊登送養 會員專區 判斷是否登入
                oldPswdVal: req.body.oldPswd,                  // 保留輸入的值
                newPswdVal: req.body.newPswd,                   // 保留輸入的值
                newPswdConfirmVal: req.body.newPswdConfirm,    // 保留輸入的值
            })
            return;
            // 新密碼 < 6 或  新密碼 > 12
        } else if (newPswd.length < 6 || newPswd.length > 12) {
            messages = "請輸入6~12為密碼",
                res.render('UserEditPswd', {
                    memberData: memberData || "",
                    alert: true,
                    messages: messages,
                    isGuest: true, // footer 刊登送養 會員專區 判斷是否登入
                    oldPswdVal: req.body.oldPswd,                  // 保留輸入的值
                    newPswdVal: req.body.newPswd,                   // 保留輸入的值
                    newPswdConfirmVal: req.body.newPswdConfirm,    // 保留輸入的值
                })
            return;
        }

        // 新密碼加密
        let hashPassword2 = crypto.createHash('sha1');
        hashPassword2.update(newPswd);
        const newPassword = hashPassword2.digest('hex');

        ;//錯誤訊息
        pool.query('update member set ? where Email=?', [{  //更新資料
            Password: newPassword,
        }, req.session.Email], function (err, results) {
            if (err) throw err;
            var messages = ""
            messages = "密碼更新成功"
            res.render('UserEditPswd', {
                messages: messages,
                alert: false,
                memberData: memberData || "",
                isGuest: true, // footer 刊登送養 會員專區 判斷是否登入
                oldPswdVal: req.body.oldPswd,                  // 保留輸入的值
                newPswdVal: req.body.newPswd,                   // 保留輸入的值
                newPswdConfirmVal: req.body.newPswdConfirm,    // 保留輸入的值
            });
        });
    });
});
module.exports = router;