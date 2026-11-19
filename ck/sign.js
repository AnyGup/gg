// sign.js (影视飓风 & 美的 纯净分离版)

const $ = new Env("签到脚本");

// 获取传入的参数 (判断要跑哪个)
// 如果定时任务写了 argument=ysjf，这里就会读到 "ysjf"
let arg = "";
if (typeof $argument !== "undefined") {
    arg = $argument;
} else if (typeof $environment !== "undefined") {
    arg = String($environment); 
}

!(async () => {
    let notifyMsg = [];
    let title = "签到结果";

    try {
        if (arg.includes("ysjf")) {
            title = "影视飓风签到";
            await signYsjf(notifyMsg);
        } else if (arg.includes("midea")) {
            title = "美的会员签到";
            await signMidea(notifyMsg);
        } else {
            // 如果没有传参（比如你手动点运行），默认两个都跑
            title = "综合签到(全部)";
            await signYsjf(notifyMsg);
            await signMidea(notifyMsg);
        }

        if (notifyMsg.length > 0) {
            let body = notifyMsg.join("\n");
            $notify(title, "", body);
            console.log(`【${title}】\n${body}`);
        }
    } catch (e) {
        $notify("脚本运行异常", "", String(e));
    } finally {
        // 无论是成功还是报错，最后一定会执行这句，彻底告别转圈
        $done();
    }
})();

// ==================== 1. 影视飓风签到逻辑 ====================
async function signYsjf(msgArray) {
    const token = $prefs.valueForKey("ysjf_token");
    const extraData = $prefs.valueForKey("ysjf_extra_data");
    const kdtId = "149536603";
    const checkinId = "6287727";

    if (!token || !extraData) {
        msgArray.push("影视飓风: ❌ 缺失 CK，请先抓包");
        return;
    }

    const url = `https://h5.youzan.com/wscump/checkin/checkinV2.json?checkinId=${checkinId}&app_id=wx92782ef90ebc836d&kdt_id=${kdtId}&access_token=${token}`;
    const headers = {
        "Host": "h5.youzan.com",
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.78(0x18004e33) NetType/5G Language/zh_CN",
        "Referer": "https://servicewechat.com/wx92782ef90ebc836d/18/page-frame.html",
        "content-type": "application/json",
        "Accept": "application/json, text/plain, */*",
        "Extra-Data": extraData
    };

    try {
        const response = await $task.fetch({ url, method: "GET", headers });
        const result = JSON.parse(response.body);
        const msg = result.msg || (result.data && result.data.msg) || "";

        if (result.code === 0 || result.success || (result.data && result.data.success)) {
            msgArray.push("影视飓风: ✅ 签到成功");
        } else if (msg.includes("已签到") || msg.includes("重复") || msg.includes("无法参与") || msg.includes("最大参与次数")) {
            msgArray.push("影视飓风: ⚠️ 今日已签到");
        } else {
            msgArray.push(`影视飓风: ❌ ${msg}`);
        }
    } catch (e) {
        msgArray.push("影视飓风: ❌ 网络请求异常");
    }
}

// ==================== 2. 美的会员签到逻辑 ====================
async function signMidea(msgArray) {
    let mideaData = $prefs.valueForKey("midea_data") || $prefs.valueForKey("MIDEA_COOKIE");

    if (!mideaData) {
        msgArray.push("美的会员: ❌ 缺失 CK，请先抓包");
        return;
    }

    let cookies = mideaData.split("@");
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (!cookie) continue;

        let headers = {
            "Host": "mvip.midea.cn",
            "Connection": "keep-alive",
            "charset": "utf-8",
            "cookie": cookie,
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/111.0.5563.116 Mobile Safari/537.36 XWEB/1110005 MMWEBSDK/20230405 MMWEBID/2585 MicroMessenger/8.0.35.2360(0x2800235D) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android",
            "Content-Type": "application/json",
            "Accept-Encoding": "gzip,compress,br,deflate",
            "Referer": "https://servicewechat.com/wx03925a39ca94b161/409/page-frame.html"
        };

        let signMsg = "";
        let ckStatus = true;

        // 签到
        try {
            let signRes = await $task.fetch({
                url: "https://mvip.midea.cn/my/score/create_daily_score",
                method: "GET",
                headers: headers
            });
            let signData = JSON.parse(signRes.body.replace(/\t|\n|\v|\r|\f/g, ''));
            
            if (signData?.errcode == 0) {
                signMsg = "✅ 签到成功";
            } else if (signData?.errcode == 314) {
                signMsg = "⚠️ 今日已签到";
            } else {
                signMsg = `❌ 失败: ${signData?.errMsg || '未知错误'}`;
                ckStatus = false;
            }
        } catch (e) {
            signMsg = "❌ 签到网络异常";
            ckStatus = false;
        }

        // 积分查询
        let pointMsg = "";
        if (ckStatus) {
            try {
                let pointRes = await $task.fetch({
                    url: "https://mvip.midea.cn/next/mucuserinfo/getmucuserinfo",
                    method: "GET",
                    headers: headers
                });
                let pointData = JSON.parse(pointRes.body);
                if (pointData?.errcode == 0) {
                    let grow = pointData?.data?.userinfo?.VipGrow || 0;
                    let score = pointData?.data?.userinfo?.VipScore || 0;
                    pointMsg = ` | 🧩${grow} 🎁${score}`;
                }
            } catch (e) {}
        }

        msgArray.push(`美的账号${i + 1}: ${signMsg}${pointMsg}`);

        if (i < cookies.length - 1) {
            await new Promise(r => setTimeout(r, 1500));
        }
    }
}

// 极简 Env，只为了提供名字
function Env(name) {
    return { name: name };
}