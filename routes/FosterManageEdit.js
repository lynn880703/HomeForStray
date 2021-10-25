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
            res.render('FosterManageEdit', { data: results, PetId: PetId });
        });
});

router.post('/', function (req, res) {
    // 1. req取得PetId 

    var PetId = req.body.PetId
    var PetName = req.body.PetName
    var AdoptDate = req.body.AdoptDate
    var PetSpecies = req.body.PetSpecies
    var PetBreed = req.body.PetBreed
    var BodyType = req.body.BodyType
    var PetFur = req.body.PetFur
    var PetAge = req.body.PetAge
    var PetGender = req.body.PetGender
    var Neuter = req.body.Neuter
    var Microchip = req.body.Microchip
    var ContactPerson = req.body.ContactPerson
    var ContactPhone = req.body.ContactPhone
    var PetDes = req.body.PetDes
    // var AdoptSatae = req.body.AdoptSatae

    // 2. 根據PetId將資料 
    pool.query('UPDATE `postforadopt` SET ? WHERE PetId=? ',
        [{
            PetName,
            AdoptDate,
            PetSpecies,
            PetBreed,
            BodyType,
            PetFur,
            PetAge,
            PetGender,
            Neuter,
            Microchip,
            ContactPerson,
            ContactPhone,
            PetDes,
            // AdoptSatae,
        }, PetId],
        function (err, results) {  //料
            if (err) throw err;

            // 3. 跳轉到List
            res.redirect('/FosterManageList');
        });
});


module.exports = router;