// sign.js (影视飓风 & 美的 & 杜蕾斯 & 海尔 一键全签纯净版)

!(async () => {
    let notifyMsg = [];
    
    // ==================== 1. 影视飓风签到 ====================
    let ysjfToken = $prefs.valueForKey("ysjf_token");
    let ysjfExtraData = $prefs.valueForKey("ysjf_extra_data");
    
    if (!ysjfToken || !ysjfExtraData) {
        notifyMsg.push("影视飓风: ❌ 缺失 CK，请先抓包");
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
            notifyMsg.push("影视飓风: ❌ 网络请求异常");
        }
    }

    // ==================== 2. 美的会员签到 (含多账号) ====================
    let mideaData = $prefs.valueForKey("midea_data") || $prefs.valueForKey("MIDEA_COOKIE");
    
    if (!mideaData) {
        notifyMsg.push("美的会员: ❌ 缺失 CK，请先抓包");
    } else {
        let cookies = mideaData.split("@");
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (!cookie) continue;

            let mideaHeaders = {
                "Host": "mvip.midea.cn",
                "Connection": "keep-alive",
                "charset": "utf-8",
                "cookie": cookie,
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/111.0.5563.116 Mobile Safari/537.36 XWEB/1110005 MMWEBSDK/20230405 MMWEBID/2585 MicroMessenger/8.0.35.2360(0x2800235D) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android",
                "Content-Type": "application/json",
                "Accept-Encoding": "gzip,compress,br,deflate",
                "Referer": "https://servicewechat.com/wx03925a39ca94b161/409/page-frame.html"
            };

            let ckStatus = true;
            let signMsg = "";
            
            try {
                let signRes = await $task.fetch({
                    url: "https://mvip.midea.cn/my/score/create_daily_score",
                    method: "GET",
                    headers: mideaHeaders
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

            let pointMsg = "";
            if (ckStatus) {
                try {
                    let pointRes = await $task.fetch({
                        url: "https://mvip.midea.cn/next/mucuserinfo/getmucuserinfo",
                        method: "GET",
                        headers: mideaHeaders
                    });
                    let pointData = JSON.parse(pointRes.body);
                    if (pointData?.errcode == 0) {
                        let grow = pointData?.data?.userinfo?.VipGrow || 0;
                        let score = pointData?.data?.userinfo?.VipScore || 0;
                        pointMsg = ` | 🧩${grow} 🎁${score}`;
                    }
                } catch (e) {}
            }

            notifyMsg.push(`美的账号${i + 1}: ${signMsg}${pointMsg}`);
            
            if (i < cookies.length - 1) {
                await new Promise(r => setTimeout(r, 1500));
            }
        }
    }

    // ==================== 3. 杜蕾斯签到 (含多账号) ====================
    let dlsData = $prefs.valueForKey("dls_data") || $prefs.valueForKey("dls_auth");
    
    if (!dlsData) {
        notifyMsg.push("杜蕾斯: ❌ 缺失 CK，请先抓包");
    } else {
        let dlsTokens = dlsData.split("@");
        for (let i = 0; i < dlsTokens.length; i++) {
            let token = dlsTokens[i].trim();
            if (!token) continue;

            let dlsHeaders = {
                "content-type": "application/json;charset=utf-8",
                "User-Agent": "Mozilla/5.0 (iPad; CPU OS 16_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.47(0x18002f28) NetType/WIFI Language/zh_CN",
                "sid": "10006",
                "Access-Token": token
            };

            let dlsSignMsg = "";
            
            try {
                let signRes = await $task.fetch({
                    url: "https://vip.ixiliu.cn/mp/sign/applyV2",
                    method: "POST",
                    headers: dlsHeaders
                });
                let signData = JSON.parse(signRes.body);
                
                if (signData?.code === -1) {
                    dlsSignMsg = "⚠️ 重复签到";
                } else {
                    dlsSignMsg = "✅ 签到成功";
                }
            } catch (e) {
                dlsSignMsg = "❌ 签到网络异常";
                notifyMsg.push(`杜蕾斯账号${i + 1}: ${dlsSignMsg}`);
                continue;
            }

            let dlsPointMsg = "";
            try {
                let pointRes = await $task.fetch({
                    url: "https://vip.ixiliu.cn/mp/sign/infoV2",
                    method: "POST",
                    headers: dlsHeaders
                });
                let pointData = JSON.parse(pointRes.body);
                if (pointData?.status === 200) {
                    let todayPts = pointData?.data?.today_points_val || 0;
                    let totalPts = pointData?.data?.user_points || 0;
                    let days = pointData?.data?.sign_day_num || 0;
                    dlsPointMsg = ` | 🎁今:${todayPts} 总:${totalPts} (签${days}天)`;
                }
            } catch (e) {}

            notifyMsg.push(`杜蕾斯账号${i + 1}: ${dlsSignMsg}${dlsPointMsg}`);

            if (i < dlsTokens.length - 1) {
                await new Promise(r => setTimeout(r, 1500));
            }
        }
    }

    // ==================== 4. 海尔智家签到 (含多账号) ====================
    // 兼容我们之前抓包脚本存的组合变量 haier_data，或分离的变量
    let haierData = $prefs.valueForKey("haier_data") || $prefs.valueForKey("haier_token");
    let haierTokens = [];
    
    if (haierData) {
        haierTokens = haierData.split("@");
    } else {
        // 尝试读取分离的 token 和 clientId
        let accountToken = $prefs.valueForKey("haier_accountToken");
        let clientId = $prefs.valueForKey("haier_clientId");
        if (accountToken && clientId) {
            haierTokens = [`${accountToken}@${clientId}`]; // 统一成一种格式处理
        }
    }
    
    if (haierTokens.length === 0) {
        notifyMsg.push("海尔智家: ❌ 缺失 CK，请先抓包");
    } else {
        for (let i = 0; i < haierTokens.length; i++) {
            let rawToken = haierTokens[i].trim();
            if (!rawToken) continue;

            // 解析 token 和 clientId。支持 "token@clientId" 或 "token&clientId" 格式
            let parts = rawToken.split(/[@&]/);
            let accountToken = parts[0];
            let clientId = parts[1];

            if (!accountToken || !clientId) {
                notifyMsg.push(`海尔账号${i + 1}: ❌ CK格式错误`);
                continue;
            }

            let haierHeaders = {
                "Host": "mps.haiersmarthomes.com",
                "Content-Type": "application/json",
                "appId": "MB-UZHSH-0001",
                "accountToken": accountToken,
                "clientId": clientId,
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.78(0x18004e33) NetType/5G Language/zh_CN",
                "Referer": "https://zjrs.haier.net/"
            };

            let haierSignMsg = "";
            let haierPointMsg = "";

            // 1. 执行签到
            try {
                let signRes = await $task.fetch({
                    url: "https://mps.haiersmarthomes.com/api-gw/wisdomHouseActivity/sign/signIn",
                    method: "POST",
                    headers: haierHeaders,
                    body: JSON.stringify({ "sourceClient": 1 }) // 海尔签到需要传这个 body
                });
                let signData = JSON.parse(signRes.body);
                
                // 海尔成功返回码通常是 '00000'
                if (signData?.code === '00000' || signData?.retCode === '00000') {
                    let signDays = signData?.data?.signDays || "?";
                    haierSignMsg = `✅ 签到成功 (累计${signDays}天)`;
                } else if (signData?.msg?.includes("已签到") || signData?.retMsg?.includes("已签到")) {
                    haierSignMsg = "⚠️ 今日已签到";
                } else {
                    haierSignMsg = `❌ 失败: ${signData?.msg || signData?.retMsg || '未知错误'}`;
                }
            } catch (e) {
                haierSignMsg = "❌ 签到网络异常";
                notifyMsg.push(`海尔账号${i + 1}: ${haierSignMsg}`);
                continue;
            }

            // 2. 查询积分 (尝试调用，若失败不影响主流程)
            try {
                let pointRes = await $task.fetch({
                    url: "https://mps.haiersmarthomes.com/api-gw/wisdomHouseActivity/sign/getSignInfo",
                    method: "GET",
                    headers: haierHeaders
                });
                let pointData = JSON.parse(pointRes.body);
                if (pointData?.code === '00000' || pointData?.retCode === '00000') {
                    let totalPoints = pointData?.data?.totalPoint || pointData?.data?.point || 0;
                    haierPointMsg = ` | 🎁总积分:${totalPoints}`;
                }
            } catch (e) {} // 静默失败

            notifyMsg.push(`海尔账号${i + 1}: ${haierSignMsg}${haierPointMsg}`);

            if (i < haierTokens.length - 1) {
                await new Promise(r => setTimeout(r, 1500));
            }
        }
    }

    // ==================== 5. 发送通知并结束 ====================
    if (notifyMsg.length > 0) {
        let body = notifyMsg.join("\n");
        $notify("综合签到结果", "每天进步一点点", body);
        console.log(`【综合签到结果】\n${body}`);
    }
    
    $done();
})();