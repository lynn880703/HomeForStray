var express = require('express');
var router = express.Router();
var mysql = require('mysql'); //含入mysql套件
var pool = require('./lib/db.js') //含入資料庫連線

router.get('/', function (req, res, next) {

    var id = req.query.id;  //取得傳送的資料id
    var pageNo = parseInt(req.query.pageNo);  //取得傳送的目前頁數

    pool.query('select * from Member where Email=?', [req.session.Email], function (err, results) {
        var memberData = results[0]; // 撈取是否有登入session

        if (!memberData) {
            // 非會員

            pool.query('SELECT * FROM PostForAdopt,CityDatas,PetImgDatas WHERE PostForAdopt.CityId=CityDatas.CityId AND PostForAdopt.PetImgId=PetImgDatas.PetImgId and  PostForAdopt.PetId=?', [id], function (err, results) {  //根據id讀取資料

                if (err) throw err;
                res.render('AdoptContent', {
                    data: results,
                    pageNo: pageNo,
                    memberData: memberData || "",
                    isGuest: true, // footer 刊登送養 會員專區 判斷是否登入
                    UserFollowState: "",
                    isFollow: false, // 追蹤訊息框
                    isUnFollow: false, // 追蹤訊息框
                });  //傳送pageNo給返回首頁使用(回到原來頁面)
            });

            // 是 會員 ，判斷是否有追蹤過的資料
            // 1.撈出 MemberID、寵物id 和 userfollow表，對照是否有一樣的
            // 2.沒有追蹤過的 => 沒有狀態
            // 3.有追蹤過的 => 狀態可能為 0 或 1 (可能取消過追蹤)
        } else {
            var memberDataJSON = JSON.parse(JSON.stringify(memberData));  //解析RowDataPacket
            var MemberID = memberDataJSON.MemberID;  // 撈出會員ID

            pool.query('SELECT * FROM PostForAdopt,CityDatas,PetImgDatas WHERE PostForAdopt.CityId=CityDatas.CityId AND PostForAdopt.PetImgId=PetImgDatas.PetImgId and  PostForAdopt.PetId=?', [id], function (err, results) {  //根據id讀取資料

                if (err) throw err;
                var resPetData = results; // 將原本撈出results設一個變數，可以render到頁面

                pool.query('SELECT * FROM userfollow WHERE PetId=? AND MemberID=?', [id, MemberID], function (err, results) {  //根據id讀取資料
                    var resultUserfollow = results[0]
                    // userfollow 沒有一模一樣的寵物及會員資料 UserFollowState => 狀態為""
                    if (!resultUserfollow) {
                        res.render('AdoptContent', {
                            data: resPetData,
                            pageNo: pageNo,
                            memberData: memberData || "",
                            isGuest: true, // footer 刊登送養 會員專區 判斷是否登入 
                            UserFollowState: "",
                            isFollow: false, // 追蹤訊息框
                            isUnFollow: false, // 追蹤訊息框
                        });
                    } else {
                        var resultUserfollowJSON = JSON.parse(JSON.stringify(resultUserfollow));  //解析RowDataPacket
                        UserFollowState = resultUserfollowJSON.UserFollowState;
                        res.render('AdoptContent', {
                            data: resPetData,
                            pageNo: pageNo,
                            memberData: memberData || "",
                            isGuest: true, // footer 刊登送養 會員專區 判斷是否登入 
                            UserFollowState: UserFollowState,
                            isFollow: false, // 追蹤訊息框
                            isUnFollow: false, // 追蹤訊息框
                        });  //傳送pageNo給返回首頁使用(回到原來頁面)
                    }
                });
            });
        }
    });
});


router.post('/', function (req, res, next) {
    var id = req.query.id;  //取得傳送的資料id
    var pageNo = parseInt(req.query.pageNo);  //取得傳送的目前頁數

    pool.query('select * from Member where Email=?', [req.session.Email], function (err, results) {
        var memberData = results[0]; // 撈取是否有登入session
        var memberDataJSON = JSON.parse(JSON.stringify(memberData));  //解析RowDataPacket
        var MemberID = memberDataJSON.MemberID;  // 撈出會員ID

        pool.query('SELECT * FROM PostForAdopt,CityDatas,PetImgDatas WHERE PostForAdopt.CityId=CityDatas.CityId AND PostForAdopt.PetImgId=PetImgDatas.PetImgId and  PostForAdopt.PetId=?', [id], function (err, results) {  //根據id讀取資料
            if (err) throw err;
            var resPetData = results; // 將原本撈出results設一個變數，可以render到頁面
            var PetData = results[0];
            var PetDataJSON = JSON.parse(JSON.stringify(PetData));  //解析RowDataPacket
            var PetName = PetDataJSON.PetName;  // 撈出寵物名字
            console.log(resPetData)
            pool.query('SELECT * FROM userfollow WHERE PetId=? AND MemberID=?', [id, MemberID], function (err, results) {  //根據id讀取資料
                var resultUserfollow = results[0] // 撈出是否有追蹤結果

                // userfollow 沒有一模一樣的寵物及會員資料
                if (!resultUserfollow) {
                    // 1.userfollow資料表沒有一模一樣的PetId MemberID
                    // 2.將資訊插入 userfollow 的資料表
                    var PetId = id;
                    var FollowDate = onTime();         // 取當下時間
                    var UserFollowState = 1;            // 追蹤狀態
                    pool.query('insert into userfollow set ?', [{
                        MemberID,
                        PetId,
                        FollowDate,
                        UserFollowState,
                    }], function (err, results) {
                        res.render('AdoptContent', {
                            data: resPetData,
                            pageNo: pageNo,
                            memberData: memberData || "",
                            isGuest: true, // footer 刊登送養 會員專區 判斷是否登入 
                            UserFollowState: UserFollowState,
                            isFollow: true, // 追蹤訊息框
                            isUnFollow: false, // 追蹤訊息框
                        });
                        // 寫入 通知訊息
                        pool.query(`INSERT INTO usermsg (MemberID,MsgDate,Msg) VALUES ('${MemberID}' , '${onTime()}','【系統通知】寵物${PetName}，已成功追蹤~~' )`, [], function (err, results) {
                            if (err) {
                                console.log(err);
                                return;
                            }
                        });
                    });
                    // userfollow 有一模一樣的寵物及會員資料
                } else {
                    // 1.判斷狀態後，將資訊插入 userfollow 的資料表
                    // 2.狀態為1 =>0
                    // 3.狀態為0 =>1
                    var userfollowJSON = JSON.parse(JSON.stringify(resultUserfollow));  //解析RowDataPacket
                    var FollowID = userfollowJSON.FollowID;
                    var UserFollowState = userfollowJSON.UserFollowState;

                    if (UserFollowState == 1) {
                        // 狀態為1
                        var PetId = id;
                        var FollowDate = onTime();         // 取當下時間
                        var UserFollowState = 0;           // 設定狀態為 0
                        pool.query('UPDATE userfollow set ? where FollowID=?',
                            [{
                                MemberID,
                                PetId,
                                FollowDate,
                                UserFollowState,
                            }, FollowID],
                            function (err, results) {
                                res.render('AdoptContent', {
                                    data: resPetData,// 寵物資訊
                                    pageNo: pageNo,  //傳送pageNo給返回首頁使用(回到原來頁面)
                                    memberData: memberData || "", // 是否會員
                                    isGuest: true, // footer 刊登送養 會員專區 判斷是否登入
                                    UserFollowState: UserFollowState, // 是否追蹤的狀態
                                    isFollow: false, // 追蹤訊息框
                                    isUnFollow: true, // 追蹤訊息框
                                });
                                // 寫入 通知訊息
                                pool.query(`INSERT INTO usermsg (MemberID,MsgDate,Msg) VALUES ('${MemberID}' , '${onTime()}','【系統通知】寵物${PetName}，已取消追蹤!' )`, [], function (err, results) {
                                    if (err) {
                                        console.log(err);
                                        return;
                                    }
                                });
                            });
                    } else {
                        // 狀態為0
                        var PetId = id;
                        var FollowDate = onTime();         // 取當下時間
                        var UserFollowState = 1;           // 設定狀態為 1
                        pool.query('UPDATE userfollow set ? where FollowID=?',
                            [{
                                MemberID,
                                PetId,
                                FollowDate,
                                UserFollowState,
                            }, FollowID],
                            function (err, results) {
                                res.render('AdoptContent', {
                                    data: resPetData,// 寵物資訊
                                    pageNo: pageNo,  //傳送pageNo給返回首頁使用(回到原來頁面)
                                    memberData: memberData || "", // 是否會員
                                    isGuest: true, // footer 刊登送養 會員專區 判斷是否登入
                                    UserFollowState: UserFollowState, // 是否追蹤的狀態
                                    isFollow: true, // 追蹤訊息框
                                    isUnFollow: false, // 追蹤訊息框
                                });
                                pool.query(`INSERT INTO usermsg (MemberID,MsgDate,Msg) VALUES ('${MemberID}' , '${onTime()}','【系統通知】寵物${PetName}，已成功追蹤~~' )`, [], function (err, results) {
                                    if (err) {
                                        console.log(err);
                                        return;
                                    }
                                });
                            });
                    }
                }
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