var express = require('express');
var router = express.Router();
var mysql = require('mysql'); //含入mysql套件
var pool = require('./lib/db.js'); //含入資料庫連線
var path = require('path');

var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/PetImgFoster')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
var upload = multer({ storage: storage })

router.get('/', function (req, res, next) {
    pool.query('select * from Member where Email=?', [req.session.Email], function (err, results) {
        var memberData = results[0]; // 撈取是否有登入session
        console.log(memberData)

        if (memberData == undefined) {  // 沒登入狀態
            res.redirect('/member/login')
        } else {
            res.render('Foster', {

                memberData: memberData,
                isGuest: true, // footer 刊登送養 會員專區 判斷是否登入
            });
        }
    });
});

router.post('/', upload.single('image'), function (req, res) {
    pool.query('select * from Member where Email=?', [req.session.Email], function (err, results) {

        var memberData = results[0]; // 撈取是否有登入session
        var image = req.file;
        console.log(req.file);

        pool.query('INSERT INTO `petimgdatas` ( `PetImgName`, `PetImgSize`, `PetImgType`,  `PetImgURL`  ) VALUES ( ?,?,?,?)',

            [

                req.file.originalname,
                req.file.size,
                req.file.mimetype,
                // req.file.filename,
                `/PetImgFoster/${req.file.filename}`,


            ],

            function (err, results, fields) {
                console.log(results.insertId);
                if (err) throw err;

                var memberDataJSON = JSON.parse(JSON.stringify(memberData));  //解析RowDataPacket
                var MemberID = memberDataJSON.MemberID;  // 撈出會員ID
                console.log(MemberID)

                pool.query('INSERT INTO `postforadopt` (`PetName`,`PetSpecies`,`PetBreed`,`BodyType`,`PetFur`,`PetAge`,`PetGender`,`Neuter`,`Microchip`,`CityId`,`ContactPerson`,`ContactPhone`,`PetDes`, `PetImgId` , `MemberID` ) VALUES (? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ?, ?, ? ,? )',
                    [  // 新增資料
                        req.body.PetName,       // 寵物名稱
                        req.body.PetSpecies,    // 種類
                        req.body.PetBreed,      // 品種
                        req.body.BodyType,      // 體型
                        req.body.PetFur,        // 毛色
                        req.body.PetAge,        // 年紀
                        req.body.PetGender,     // 性別
                        req.body.Neuter,        // 結紮
                        req.body.Microchip,     // 晶片
                        req.body.CityId,        // 區域
                        req.body.ContactPerson, // 聯絡人
                        req.body.ContactPhone,  // 聯絡人電話
                        req.body.PetDes,        // 個性描述
                        results.insertId,
                        MemberID
                    ],

                    function (err, results, fields) {

                        if (err) throw err;
                        console.log(results);
                        res.redirect('/AdoptList');
                    })
            });
    });
});


module.exports = router;