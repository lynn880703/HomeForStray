const { json, application } = require('express');
var express = require('express');
var router = express.Router();
var mysql = require('mysql');        //含入mysql套件
var pool = require('./lib/db.js');   //含入資料庫連線

//毛孩知識後台清單
var LinePage = 5;  // 每頁資料筆數

router.get('/FosterManageList', function (req, res, next) {
    var PageNum = parseInt(req.query.PageNum);  //取得傳送的目前頁數
    if (isNaN(PageNum) || PageNum < 1) {  //如果沒有傳送參數,設目前頁數為第1頁
        PageNum = 1;
    }

    pool.query('select count(*) as cnt from postforadopt', function (err, results) {  //讀取資料總筆數
        if (err) throw err;
        var TotalLine = results[0].cnt;  //資料總筆數
        var TotalPage = Math.ceil(TotalLine / LinePage);  //總頁數

        pool.query('select * from postforadopt order by PetId desc limit ?, ?;',
            [(PageNum - 1) * LinePage, LinePage],
            function (err, results) {  //根據目前頁數讀取資料
                if (err) throw err;
                res.render('FosterManageList', {
                    data: results,
                    PageNum: PageNum,
                    TotalLine: TotalLine,
                    TotalPage: TotalPage,
                    LinePage: LinePage
                });
            });
    });
});

// 刊登審核後台清單 查詢
router.post('/FosterManageList', function (req, res) {
    var PetName = req.body.PetName
    var FosterDateStart = req.body.FosterDateStart
    var FosterDateEnd = req.body.FosterDateEnd
    var AdoptState = req.body.AdoptState

    if (PetName === undefined) {
        PetName = ''
    }
    if (FosterDateStart === undefined) {
        FosterDateStart = ''
    }
    if (FosterDateEnd === undefined) {
        FosterDateEnd = ''
    }
    if (AdoptState === undefined) {
        AdoptState = ''
    }
    var sql1 = `select count(*) as cnt from postforadopt WHERE (PetName like '%${PetName}%' OR ?='')  AND (AdoptDate>=? OR ?='' ) AND (AdoptDate<=? OR ?='' ) AND (AdoptState=? OR ?='') `
    pool.query(sql1,
        [
 
            PetName,
            FosterDateStart,
            FosterDateStart,
            FosterDateEnd,
            FosterDateEnd,
            AdoptState,
            AdoptState
        ],
        function (err, results) {  //讀取資料總筆數
            if (err) throw err;
            var LinePage = 100; //每頁筆數
            var TotalLine = results[0].cnt;  //資料總筆數
            var TotalPage = Math.ceil(TotalLine / LinePage);  //總頁數 補充: Math.ceil 讓多一筆資料直接變成新一頁放置其中
            var PageNum = parseInt(req.query.PageNum);  //取得傳送的目前頁數 (字串轉成整數如果第一個字串無法被解析為任何數字，parseInt 會回傳 NaN)
            if (isNaN(PageNum) || PageNum < 1)          //如果沒有傳送參數,設目前頁數為第1頁 || 是 or 的意思
            {
                PageNum = 1;
            }



            var sql2 = `select * from postforadopt WHERE (PetName like '%${PetName}%'  OR  ?='') AND (AdoptDate>=? OR ?='' ) AND (AdoptDate<=? OR ?='' ) AND (AdoptState=? OR ?='' ) order by  AdoptDate , PetId  limit ?, ?  `
            pool.query(sql2, // 選此資料表 用PetId排序
                [
                    PetName,
                    FosterDateStart,
                    FosterDateStart,
                    FosterDateEnd,
                    FosterDateEnd,
                    AdoptState,
                    AdoptState,

                    (PageNum - 1) * LinePage,
                    LinePage
                ],
                function (err, results) {  //根據目前頁數讀取資料  )
                    if (err) throw err;
                    res.render('FosterManageList',  //丟到 ejs 模板上
                        {
                            data: results,
                            PageNum: PageNum,
                            TotalLine: TotalLine,
                            TotalPage: TotalPage,
                            LinePage: LinePage
                        });
                });
        })

});


// // 刊登審核後台清單
// router.get('/FosterManageList', function (req, res) {
//     var PetName = req.query.PetName
//     var FosterDateStart = req.query.FosterDateStart
//     var FosterDateEnd = req.query.FosterDateEnd
//     var AdoptState = req.query.AdoptState

//     if (PetName === undefined) {
//         PetName = ''
//     }
//     if (FosterDateStart === undefined) {
//         FosterDateStart = ''
//     }
//     if (FosterDateEnd === undefined) {
//         FosterDateEnd = ''
//     }
//     if (AdoptState === undefined) {
//         AdoptState = ''
//     }

//     pool.query(" select  count(*) as cnt  from postforadopt WHERE (PetName=? OR ?='') AND (AdoptDate>=? OR ?='' ) AND (AdoptDate<=? OR ?='' ) AND (AdoptState=? OR ?='') ",
//         [
//             PetName,
//             PetName,
//             FosterDateStart,
//             FosterDateStart,
//             FosterDateEnd,
//             FosterDateEnd,
//             AdoptState,
//             AdoptState
//         ],
//         function (err, results) {  //讀取資料總筆數
//             if (err) throw err;
//             var LinePage = 5;
//             var TotalLine = results[0].cnt;  //資料總筆數
//             var TotalPage = Math.ceil(TotalLine / LinePage);  //總頁數 補充: Math.ceil 讓多一筆資料直接變成新一頁放置其中
//             var PageNum = parseInt(req.query.PageNum);  //取得傳送的目前頁數 (字串轉成整數如果第一個字串無法被解析為任何數字，parseInt 會回傳 NaN)
//             if (isNaN(PageNum) || PageNum < 1)          //如果沒有傳送參數,設目前頁數為第1頁 || 是 or 的意思
//             {
//                 PageNum = 1;
//             }




//             pool.query(" select * from postforadopt WHERE (PetName=? OR ?='') AND (AdoptDate>=? OR ?='' ) AND (AdoptDate<=? OR ?='' ) AND (AdoptState=? OR ?='' ) order by  AdoptDate , PetId  limit ?, ? ", // 選此資料表 用PetId排序
//                 [
//                     PetName,
//                     PetName,
//                     FosterDateStart,
//                     FosterDateStart,
//                     FosterDateEnd,
//                     FosterDateEnd,
//                     AdoptState,
//                     AdoptState,

//                     (PageNum - 1) * LinePage,
//                     LinePage
//                 ],
//                 function (err, results) {  //根據目前頁數讀取資料  )
//                     if (err) throw err;
//                     res.render('FosterManageList',  //丟到 ejs 模板上
//                         {
//                             data: results,
//                             PageNum: PageNum,
//                             req: req,
//                             TotalLine: TotalLine,
//                             TotalPage: TotalPage,
//                             LinePage: LinePage
//                         });
//                 });
//         })

// });


// 刊登審核後台新增
router.get('/FosterManageAdd', function (req, res) {  //網頁剛進入 走GET路由 "為了顯示空的頁面"

    res.render('FosterManageAdd');

});

router.post('/FosterManageAdd', function (req, res) {

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

            if (err) throw err;

            res.redirect('/BackFosterManage/FosterManageList');
        });
})




// 刊登審核後台編輯

router.get('/FosterManageEdit', function (req, res) {
    var PetId = 0;
    PetId = req.query.PetId;  //取得傳送的資料id
    // var PetId = parseInt(req.query.PetId);
    pool.query('select * from postforadopt where PetId=?',
        [PetId],
        function (err, results) {  //根據PetId讀取資料
            if (err) throw err;
            res.render('FosterManageEdit', { data: results, PetId: PetId });
        });
});

router.post('/FosterManageEdit', function (req, res) {
    // 1. req取得PetId 
    var PetId = req.body.PetId
    var AdoptState = req.body.AdoptState
    // 2. 根據PetId將資料 
    pool.query('UPDATE `postforadopt` SET AdoptState=? WHERE PetId=? ',
        [AdoptState, PetId],
        function (err, results) {
            if (err) throw err;
            // 3. 跳轉到List
            res.redirect('/BackFosterManage/FosterManageList');
        });
});


// 刊登審核後台刪除
router.get('/FosterManageDel', function (req, res) {
    var PetId = 0;
    PetId = req.query.PetId;  //取得傳送的資料id
    // var PetId = parseInt(req.query.PetId);
    pool.query('select * from postforadopt where PetId=?',
        [
            PetId
        ],

        function (err, results) {  //根據PetId讀取資料

            if (err) throw err;
            res.render('ForsterManageDel', { data: results, PetId: PetId });
        });
});

router.post('/FosterManageDel', function (req, res) {
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
            res.redirect('/BackFosterManage/FosterManageList');
        });
});


module.exports = router;