const db = require('./connection_db');
const crypto = require('crypto');

module.exports = function register(memberData) {

    let result = {};
    return new Promise((resolve, reject) => {
        // 尋找是否有重複的email
        db.query('SELECT Email FROM member WHERE Email = ?', memberData.Email, function (err, rows) {
            // 若資料庫部分出現問題，則回傳給client端「伺服器錯誤，請稍後再試！」的結果。
            if (err) {
                result.status = "註冊失敗。"
                result.err = "伺服器錯誤，請稍後在試！"
                reject(result);
                return;
            }
            // 如果有重複的email
            if (rows.length >= 1) {
                result.status = "註冊失敗。"
                result.err = "已有重複的Email。"
                reject(result);
            } else if (memberData.Password.length < 6 || memberData.Password.length > 12) {
                console.log(memberData.Password.length)
                result.status = "註冊失敗。"
                result.err = "請輸入6~12為密碼"
                reject(result);
                return;
            } else if (memberData.Password !== memberData.PasswordConfirm) {
                result.status = "註冊失敗。"
                result.err = "密碼不一致。"
                console.log(result)
                reject(result);
                return;
            } else if (memberData.CellPhone.length < 10 ) {
                result.status = "註冊失敗。"
                result.err = "請輸入正確格式的手機號碼"
                reject(result);
                return;
            }else {
                let hashPassword = crypto.createHash('sha1');
                hashPassword.update(memberData.Password);
                const rePassword = hashPassword.digest('hex');
                // 將資料寫入資料庫
                db.query('INSERT INTO member SET ?;',
                    {
                        Email: memberData.Email,
                        Password: rePassword,
                        MemberName: memberData.MemberName,
                        CellPhone: memberData.CellPhone,
                        RegistrationDate: memberData.RegistrationDate,
                        memberState: memberData.memberState,
                        ModifiedDate: memberData.ModifiedDate,
                    }, function (err, rows) {
                        // 若資料庫部分出現問題，則回傳給client端「伺服器錯誤，請稍後再試！」的結果。
                        if (err) {
                            result.status = "註冊失敗。";
                            result.err = "伺服器錯誤，請稍後在試！";
                            reject(result);
                            return;
                        }
                        // 若寫入資料庫成功，則回傳給clinet端下：
                        result.status = "註冊成功。"
                        result.registerMember = memberData;
                        resolve(result);
                        // 註冊成功通知訊息寫入資料庫
                        db.query(`INSERT INTO usermsg (MemberID,MsgDate,Msg) VALUES (LAST_INSERT_ID(),'${onTime()}','【系統通知】註冊完成通知，歡迎您加入「浪浪有窩」。' )`, [], function (err, rows) {
                            if (err) {
                                console.log(err);
                                return;
                            }
                        })
                    })
            }
        })
    })
}
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