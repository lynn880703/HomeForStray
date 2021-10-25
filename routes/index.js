var express = require('express');
var router = express.Router();
var mysql = require('mysql');  //含入mysql套件
var pool = require('./lib/db.js');  //含入資料庫連線



/* GET home page. */
router.get('/', function (req, res, next) {
  pool.query('select * from Member where Email=?', [req.session.Email], function (err, results) {
    var memberData = results[0]; // 撈取是否有登入session
    pool.query('select * from News order by ShowStartDate desc;', function (err, results) {
      if (err) throw err;
      res.render('index', {
        data: results,
        memberData: memberData || "",
        isGuest: true, // footer 刊登送養 會員專區 判斷是否登入
      });
    });
  });
});

module.exports = router;