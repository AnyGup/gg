// sign.js (影视飓风 & 美的 纯净双签版)

!(async () => {
    let notifyMsg = [];
    
    // ==================== 1. 影视飓风签到 ====================
    let ysjfToken = $prefs.valueForKey("ysjf_token");
    let ysjfExtraData = $prefs.valueForKey("ysjf_extra_data");
    
    if (!ysjfToken || !ysjfExtraData) {
        notifyMsg.push("影视飓风: ❌ 缺失 CK");
    } else {
        let ysjfUrl = `https://h5.youzan.com/wscump/checkin/checkinV2.json?checkinId=6287727&app_id=wx92782ef90ebc836d&kdt_id=149536603&access_token=${ysjfToken}`;
        let ysjfHeaders = {
            "Host": "h5.youzan.com",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.78(0x18004e33) NetType/5G Language/zh_CN",
            "Referer": "https://servicewechat.com/wx92782ef90ebc836d/18/page-frame.html",
            "content-type": "application/json",
            "Accept": "application/json, text/plain, */*",
            "Extra-Data": ysjfExtraData
        };

        try {
            let response = await $task.fetch({ url: ysjfUrl, method: "GET", headers: ysjfHeaders });
            let result = JSON.parse(response.body);
            let msg = result.msg || (result.data && result.data.msg) || "";
            
            if (result.code === 0 || result.success || (result.data && result.data.success)) {
                notifyMsg.push("影视飓风: ✅ 签到成功");
            } else if (msg.includes("已签到") || msg.includes("重复") || msg.includes("无法参与") || msg.includes("最大参与次数")) {
                notifyMsg.push("影视飓风: ⚠️ 今日已签到");
            } else {
                notifyMsg.push(`影视飓风: ❌ ${msg}`);
            }
        } catch (e) {
            notifyMsg.push("影视飓风: ❌ 网络异常");
        }
    }

    // ==================== 2. 美的会员签到 ====================
    let mideaData = $prefs.valueForKey("midea_data") || $prefs.valueForKey("MIDEA_COOKIE");
    
    if (!mideaData) {
        notifyMsg.push("美的会员: ❌ 缺失 CK");
    } else {
        let cookies = mideaData.split("@");
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (!cookie) continue;

            let mideaHeaders = {
                "Host": "mvip.midea.cn",
                "Connection": "keep-alive",
                "cookie": cookie,
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; MI 8 Lite) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/111.0.5563.116 Mobile Safari/537.36 MicroMessenger/8.0.35.2360",
                "Content-Type": "application/json",
                "Referer": "https://servicewechat.com/wx03925a39ca94b161/409/page-frame.html"
            };

            let signMsg = "";
            try {
                let signRes = await $task.fetch({ url: "https://mvip.midea.cn/my/score/create_daily_score", method: "GET", headers: mideaHeaders });
                let signData = JSON.parse(signRes.body.replace(/\t|\n|\v|\r|\f/g, ''));
                if (signData?.errcode == 0) signMsg = "✅ 签到成功";
                else if (signData?.errcode == 314) signMsg = "⚠️ 今日已签到";
                else signMsg = `❌ 失败: ${signData?.errMsg || '未知'}`;
            } catch (e) {
                signMsg = "❌ 网络异常";
            }
            notifyMsg.push(`美的账号${i + 1}: ${signMsg}`);
            
            if (i < cookies.length - 1) await new Promise(r => setTimeout(r, 1500));
        }
    }

    // ==================== 3. 发送通知 ====================
    if (notifyMsg.length > 0) {
        let body = notifyMsg.join("\n");
        $notify("影视飓风 & 美的 签到结果", "", body);
        console.log(`【综合签到结果】\n${body}`);
    }
    
    $done();
})();