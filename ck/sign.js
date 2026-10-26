// all_sign.js (影视飓风 & 奇瑞汽车 合并签到脚本 - 错峰版)

// ==========================================
// 🚗 1. 奇瑞汽车签到逻辑封装
// ==========================================
function signChery() {
    return new Promise((resolve) => {
        const cheryToken = $prefs.valueForKey("chery_token");
        
        if (!cheryToken) {
            $notify("奇瑞汽车签到", "失败 ❌", "未获取到 Token，请先打开 App 触发抓包");
            return resolve();
        }

        const encryptParam = ""; 
        const signURL = `https://mobile-consumer-sapp.chery.cn/web/task/record/sign-in/lottery?encryptParam=${encryptParam}`;

        const headers = {
            "Host": "mobile-consumer-sapp.chery.cn",
            "Origin": "https://hybrid-sapp.chery.cn",
            "Content-Type": "application/json",
            "Accept": "*/*",
            "User-Agent": "ios/1.0.0",
            "encryptFlag": "true",
            "Authorization": `Bearer ${cheryToken}`,
            "Referer": "https://hybrid-sapp.chery.cn/",
            "Accept-Language": "zh-CN,zh"
        };

        $task.fetch({
            url: signURL,
            method: "GET",
            headers: headers
        }).then(response => {
            const data = response.body;
            try {
                const result = JSON.parse(data);
                if (result.code === 0 || result.success || (result.msg && result.msg.includes("成功"))) {
                    $notify("奇瑞汽车签到", "成功 ✅", result.msg || "签到完成");
                } else if (result.msg && (result.msg.includes("已签到") || result.msg.includes("重复"))) {
                    $notify("奇瑞汽车签到", "已签到 ⚠️", "今日无需重复签到");
                } else {
                    $notify("奇瑞汽车签到", "失败 ❌", result.msg || data);
                }
            } catch (e) {
                $notify("奇瑞汽车签到", "响应解析", data);
            }
            resolve();
        }, reason => {
            $notify("奇瑞汽车签到", "网络错误 ❌", String(reason.error || reason));
            resolve();
        });
    });
}

// ==========================================
// 📺 2. 影视飓风签到逻辑封装
// ==========================================
function signYsjf() {
    return new Promise((resolve) => {
        const token = $prefs.valueForKey("ysjf_token") || "921dc772df523293ec9221db399ce8"; 
        const kdtId = "149536603";
        const checkinId = "6287727";

        const defaultExtra = '{"is_weapp":1,"sid":"YZ1562791171168223232YZ3dJPc0vh","version":"2.251.7.101","client":"weapp","bizEnv":"wsc","uuid":"tfEGUV3ZozMub8r1792564007210","ftime":1792564007207}';
        const extraData = $prefs.valueForKey("ysjf_extra_data") || defaultExtra;

        const signURL = `https://h5.youzan.com/wscump/checkin/checkinV2.json?checkinId=${checkinId}&app_id=wx92782ef90ebc836d&kdt_id=${kdtId}&access_token=${token}`;

        const headers = {
            "Host": "h5.youzan.com",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.78(0x18004e33) NetType/5G Language/zh_CN",
            "Referer": "https://servicewechat.com/wx92782ef90ebc836d/18/page-frame.html",
            "content-type": "application/json",
            "Accept": "application/json, text/plain, */*",
            "Extra-Data": extraData
        };

        $task.fetch({
            url: signURL,
            method: "GET",
            headers: headers
        }).then(response => {
            try {
                const result = JSON.parse(response.body);
                const msg = result.msg || (result.data && result.data.msg) || response.body;
                
                if (result.code === 0 || result.success || (result.data && result.data.success)) {
                    $notify("影视飓风签到", "签到成功 ✅", msg);
                } else if (
                    result.code === 100001 || 
                    msg.includes("已签到") || 
                    msg.includes("已达最大参与次数") || 
                    msg.includes("重复")
                ) {
                    $notify("影视飓风签到", "今日已签到 ⚠️", "无需重复签到");
                } else {
                    $notify("影视飓风签到", "签到失败 ❌", msg);
                }
            } catch (e) {
                $notify("影视飓风签到", "解析异常 ⚠️", response.body);
            }
            resolve();
        }, reason => {
            $notify("影视飓风签到", "网络错误 ❌", String(reason.error || reason));
            resolve();
        });
    });
}

// ==========================================
// 🚀 3. 根据传入参数执行对应任务
// ==========================================
(async function() {
    // 获取在 QX 任务配置里传入的 argument 参数
    const arg = $environment.params || "";
    
    if (arg === "chery") {
        await signChery();
    } else if (arg === "ysjf") {
        await signYsjf();
    } else {
        // 如果没有传参数，默认都跑一遍（方便你手动点运行测试）
        await Promise.all([signChery(), signYsjf()]);
    }
    $done();
})();