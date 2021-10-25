var express = require('express');
var router = express.Router();
const db = require('../models/connection_db');
// 加密
const crypto = require('crypto');


// 註冊
const MemberModifyMethod = require('../controllers/modify_controller');

memberModifyMethod = new MemberModifyMethod();

router.get('/register', function (req, res, next) {
  db.query('select * from Member where Email=?', [req.session.Email], function (err, results) {
    var memberData = results[0]; // 撈取是否有登入session

    res.render('register', {
      memberData: memberData || "",
      isLogin: false,
      notRegister: false,
      err: "",
      EmailVal: req.body.Email || "",  // 保留輸入的值
      PasswordVal: req.body.Password || "",  // 保留輸入的值
      PasswordConfirmVal: req.body.PasswordConfirm || "",  // 保留輸入的值
      MemberNameVal: req.body.MemberName || "",  // 保留輸入的值
      CellPhoneVal: req.body.CellPhone || "",  // 保留輸入的值
      isGuest: true, // footer 刊登送養 會員專區 判斷是否登入

    });
  });
});

router.post('/register', memberModifyMethod.postRegister);


// 登入

router.get('/login', function (req, res, next) {
  db.query('select * from Member where Email=?', [req.session.Email], function (err, results) {
    var memberData = results[0]; // 撈取是否有登入session
    res.render('login',
      {
        messages: '',
        memberData: memberData || "",
        okLogin: false,
        notLogin: false,
        EmailVal: req.body.Email || "", // 保留輸入的值
        PasswordVal: req.body.Password || "", // 保留輸入的值
        isGuest: true, // footer 刊登送養 會員專區 判斷是否登入

      });
  });
});

var messages = ""; //錯誤訊息
router.post('/login', function (req, res, next) {
  db.query("select * from member where Email=?", [req.session.Email], function (err, results) {
    var memberData = results[0];
    var Email = req.body.Email;
    var Password = req.body.Password;
    // 加密
    let hashPassword = crypto.createHash('sha1');
    hashPassword.update(Password);
    const rePassword = hashPassword.digest('hex');

    db.query("select * from member where Email=?", [Email], function (err, results) {  //根據帳號讀取資料
      if (err) throw err;
      console.log(results)
      if (results.length == 0) {  //帳號不存在
        messages = "帳號不存在"
        res.render('login', {
          messages: messages,
          memberData: memberData || "",
          okLogin: false,
          notLogin: true,
          EmailVal: req.body.Email || "", // 保留輸入的值
          PasswordVal: req.body.Password || "", // 保留輸入的值
          isGuest: true, // footer 刊登送養 會員專區 判斷是否登入

        })
      } else if (results[0].Password != rePassword && results[0].Password != req.body.Password) {  //密碼不正確
        messages = "密碼不正確"
        res.render('login', {
          messages: messages,
          memberData: memberData || "",
          okLogin: false,
          notLogin: true,
          EmailVal: req.body.Email || "", // 保留輸入的值
          PasswordVal: req.body.Password || "", // 保留輸入的值
          isGuest: true, // footer 刊登送養 會員專區 判斷是否登入

        })
      } else {  //帳號及密碼皆正確
        req.session.Email = req.body.Email;
        // 被停權
        if (results[0].memberState == 0) {
          messages = "會員停權中，如有問題請聯絡我們"
          res.render('login', {
            messages: messages,
            memberData: memberData || "",
            okLogin: false,
            notLogin: true,
            EmailVal: req.body.Email || "", // 保留輸入的值
            PasswordVal: req.body.Password || "", // 保留輸入的值
            isGuest: true, // footer 刊登送養 會員專區 判斷是否登入

          })
        } else {
          res.render('login', {
            okLogin: true,
            memberData: memberData || "",
            notLogin: false,
            EmailVal: req.body.Email || "", // 保留輸入的值
            PasswordVal: req.body.Password || "", // 保留輸入的值
            isGuest: true, // footer 刊登送養 會員專區 判斷是否登入

          }); //跳轉首頁
        }
      }
    });
  });
});

// 登出
var messages = '';  //錯誤訊息
router.get('/logout', function (req, res, next) {
  delete req.session.Email;
  res.redirect('/');
});


module.exports = router;