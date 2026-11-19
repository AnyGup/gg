// sign.js (影视飓风 & 美的 综合签到脚本 - 原版逻辑重构)
const $ = new Env("综合签到");
let notifyMsg = [];

// 获取定时任务传入的参数 (例如 argument=ysjf 或 argument=midea)
const arg = typeof $environment !== 'undefined' ? $environment : (typeof $argument !== 'undefined' ? $argument : "");

// ==================== 1. 影视飓风签到 ====================
async function signYsjf() {
    const token = $prefs.valueForKey("ysjf_token");
    const extraData = $prefs.valueForKey("ysjf_extra_data");
    const kdtId = "149536603";
    const checkinId = "6287727";

    if (!token || !extraData) {
        notifyMsg.push("影视飓风: ❌ 缺失 CK，请先抓包");
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
        const msg = result.msg || (result.data && result.data.msg) || "接口无返回信息";

        if (result.code === 0 || result.success || (result.data && result.data.success)) {
            notifyMsg.push(`影视飓风: ✅ 签到成功`);
        } else if (msg.includes("已签到") || msg.includes("重复") || msg.includes("无法参与") || msg.includes("最大参与次数")) {
            notifyMsg.push(`影视飓风: ⚠️ 今日已签到`);
        } else {
            notifyMsg.push(`影视飓风: ❌ ${msg}`);
        }
    } catch (e) {
        notifyMsg.push(`影视飓风: ❌ 网络错误`);
    }
}

// ==================== 2. 美的会员签到 (完美移植原版逻辑) ====================
async function signMidea() {
    // 兼容原版变量名 midea_data 和你之前使用的 MIDEA_COOKIE
    let mideaData = $prefs.valueForKey("midea_data") || $prefs.valueForKey("MIDEA_COOKIE");
    
    if (!mideaData) {
        notifyMsg.push("美的会员: ❌ 缺失 CK，请先抓包");
        return;
    }

    // 原版多账号分隔符
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

        // 1. 执行签到
        let signResMsg = "";
        let ckStatus = true;
        try {
            let signRes = await $task.fetch({
                url: "https://mvip.midea.cn/my/score/create_daily_score",
                method: "GET",
                headers: headers
            });
            let signData = JSON.parse(signRes.body.replace(/\t|\n|\v|\r|\f/g, ''));
            
            if (signData?.errcode == 0) {
                signResMsg = "✅ 签到成功!";
            } else if (signData?.errcode == 314) {
                signResMsg = "⚠️ 今日已签到!";
            } else {
                signResMsg = `❌ 签到失败！${signData?.errMsg || '未知错误'}`;
                ckStatus = false; // CK 可能失效
            }
        } catch (e) {
            notifyMsg.push(`美的账号${i + 1}: ❌ 签到网络异常`);
            continue;
        }

        // 2. 查询积分（如果签到成功或已签到，才去查积分）
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
                    pointMsg = ` | 🧩成长值:${grow} 🎁积分:${score}`;
                }
            } catch (e) {
                pointMsg = " | ⚠️ 积分查询失败";
            }
        }

        notifyMsg.push(`美的账号${i + 1}: ${signResMsg}${pointMsg}`);
        
        // 原版防并发延迟 (1000 - 3000 毫秒)
        let randomDelay = Math.round(Math.random() * 2000 + 1000);
        await $.wait(randomDelay);
    }
}

// ==================== 3. 主函数 (根据参数决定跑哪个) ====================
!(async () => {
    let title = "签到结果";
    
    // 根据传入的参数，决定执行哪部分
    if (arg.includes("ysjf")) {
        title = "影视飓风签到";
        await signYsjf();
    } else if (arg.includes("midea")) {
        title = "美的会员签到";
        await signMidea();
    } else {
        // 如果没有传参（比如你手动运行），就两个都签
        title = "综合签到 (全部)";
        await signYsjf();
        await signMidea();
    }

    if (notifyMsg.length > 0) {
        let body = notifyMsg.join("\n");
        $notify(title, "", body);
        console.log(`【${title}】\n${body}`);
    }

    $done();
})();

// ==================== 基础 Env 简易封装 ====================
function Env(name) {
    return new (class {
        constructor(name) { this.name = name; }
        wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
        notify(title, subtitle = '', body = '') {
            if (typeof $notify !== 'undefined') { $notify(title, subtitle, body); }
            else if (typeof $notification !== 'undefined') { $notification.post(title, subtitle, body); }
        }
        getdata(key) { return $prefs.valueForKey(key); }
    })();
}