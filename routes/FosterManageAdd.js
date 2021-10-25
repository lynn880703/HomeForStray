var express = require('express');
var router = express.Router();
var mysql = require('mysql'); //含入mysql套件
var pool = require('./lib/db.js') //含入資料庫連線


router.get('/', function (req, res) {  //網頁剛進入 走GET路由 "為了顯示空的頁面"

    res.render('FosterManageAdd');

});

router.post('/', function (req, res) {

    pool.query('INSERT INTO `postforadopt` ' + //js語法 >> "單引號" 加 "+"" 換行再用 "單引號" << 可縮排程式碼 原理:字串+字串  '12' = '1''2' = '1' + '2'
        ' (`PetName`,`MemberId`,`AdoptDate`,`PetSpecies`,`PetBreed`,`BodyType`,`PetFur`,`PetAge`,`PetGender`,`Neuter`,`Microchip`,`CityId`,`ContactPerson`,`ContactPhone`,`PetDes`,`AdoptState`) VALUES (? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ?)',

        [  // 新增資料
            req.body.PetName,
            req.body.MemberId,
            req.body.AdoptDate,
            req.body.PetSpecies,
            req.body.PetBreed,
            req.body.BodyType,
            req.body.PetFur,
            req.body.PetAge,
            req.body.PetGender,
            req.body.Neuter,
            req.body.Microchip,
            req.body.CityId,
            req.body.ContactPerson,
            req.body.ContactPhone,
            req.body.PetDes,
            req.body.AdoptState,
        ],

        function (err, results) {

            // console.log(results);

            if (err) throw err;

            res.redirect('/index');
        });


})


module.exports = router;