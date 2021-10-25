const { json, application } = require('express');
var express = require('express');
var router = express.Router();
var mysql = require('mysql'); //含入mysql套件
var pool = require('./lib/db.js') //含入資料庫連線



router.get('/', function (req, res) {
    var PetId = 0;
    PetId = req.query.PetId;  //取得傳送的資料id
    // var PetId = parseInt(req.query.PetId);
    pool.query('select * from postforadopt where PetId=?',
        [
            PetId
        ],

        function (err, results) {  //根據PetId讀取資料

            if (err) throw err;
            res.render('FosterManageDele', { data: results, PetId: PetId });
        });
});

router.post('/', function (req, res) {
    // 1. req取得PetId 

    var PetId = req.body.PetId

    // 2. 根據PetId將資料抓出來刪除 
    pool.query('DELETE FROM `postforadopt` WHERE `postforadopt`.`PetId` = ?',

        [
            PetId
        ],

        function (err, results) {  //刪除資料
            if (err) throw err;

            // 3. 跳轉到List
            res.redirect('/FosterManageList');
        });
});




//刪除資料
// router.post('/', function (req, res) {

//     // DELETE statment
//     let sql = 'DELETE FROM `postforadopt` WHERE `postforadopt`.`PetId` = ?';

//     // delete a row with PetId 
//     pool.query(sql, PetId,

//         function (err, results) {

//             console.log(req.body.PetId)
//             if (err) throw err;
//             console.log(results)

//             // res.redirect('/FosterManageList');

//         });

//     // console.log(req.body.PetId)
// });


module.exports = router;