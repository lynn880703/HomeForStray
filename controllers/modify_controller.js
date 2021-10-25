const toRegister = require('../models/register_model');
const Check = require('../service/member_check');
const Swal = require('sweetalert2');

check = new Check();

module.exports = class Member {
    postRegister(req, res, next) {

        // 獲取client端資料
        const memberData = {
            Email: req.body.Email,
            Password: req.body.Password,
            PasswordConfirm: req.body.PasswordConfirm,
            MemberName: req.body.MemberName,
            CellPhone: req.body.CellPhone,
            memberState: 1,
            RegistrationDate: onTime(),
            ModifiedDate: onTime(),
        }

        const checkEmail = check.checkEmail(req.body.Email);
        // 不符合email格式
        if (checkEmail === false) {
            res.json({
                status: "註冊失敗。",
                err: "請輸入正確的Eamil格式。(如 asd@gmail.com)"
            })
            // 若符合email格式
        }
        else if (checkEmail === true) {
            // 將資料寫入資料庫
            toRegister(memberData).then(result => {
                // 若寫入成功則回傳
                // res.json({
                //     result: result
                // })

                res.render('Register', {
                    isLogin: true,
                    memberData: "",
                    notRegister: "",
                    EmailVal: req.body.Email || "",  // 保留輸入的值
                    PasswordVal: req.body.Password || "",  // 保留輸入的值
                    PasswordConfirmVal: req.body.PasswordConfirm || "",  // 保留輸入的值
                    MemberNameVal: req.body.MemberName || "",  // 保留輸入的值
                    CellPhoneVal: req.body.CellPhone || "",  // 保留輸入的值
                    isGuest: true, // footer 刊登送養 會員專區 判斷是否登入
                })
            }, (err) => {
                //若寫入失敗則回傳
                res.render('Register', {
                    notRegister: true,
                    memberData: "",
                    err: err,
                    isLogin: "",
                    EmailVal: req.body.Email || "",  // 保留輸入的值
                    PasswordVal: req.body.Password || "",  // 保留輸入的值
                    PasswordConfirmVal: req.body.PasswordConfirm || "",  // 保留輸入的值
                    MemberNameVal: req.body.MemberName || "",  // 保留輸入的值
                    CellPhoneVal: req.body.CellPhone || "",  // 保留輸入的值
                    isGuest: true, // footer 刊登送養 會員專區 判斷是否登入
                })
            })
        }
        //res.redirect('/member/login')
    }
}

//取得現在時間，並將格式轉成YYYY-MM-DD HH:MM:SS
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
