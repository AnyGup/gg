// haier_sign.js (海尔智家 App 正确签到接口版)

!(async () => {
    let haierData = $prefs.valueForKey("haier_data");
    if (!haierData) {
        $notify("海尔智家", "❌ 缺失 CK", "请重新抓包");
        $done(); return;
    }

    let parts = haierData.split("@");
    if (parts.length < 2) {
        $notify("海尔智家", "❌ 格式错误", "需要 accountToken@clientId");
        $done(); return;
    }

    let accountToken = parts[0].trim();
    let clientId = parts[1].trim();

    // 使用 mps 域名和正确的 appId (0000)
    let headers = {
        "Host": "mps.haiersmarthomes.com",
        "Content-Type": "application/json;charset=UTF-8",
        "appId": "MB-UZHSH-0000",
        "appKey": "f50c76fbc8271d361e1f6b5973f54585",
        "appVersion": "7.19.0",
        "accountToken": accountToken,
        "clientId": clientId,
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; MI 8 Lite) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/69.0.3497.100 Mobile Safari/537.36",
        "Origin": "https://zjrs.haier.net",
        "Referer": "https://zjrs.haier.net/haierActivitys/intelligentHouse/index.html?container_type=3&needLogin=1"
    };

    try {
        let signRes = await $task.fetch({
            url: "https://mps.haiersmarthomes.com/api-gw/wisdomHouseActivity/sign/signIn",
            method: "POST",
            headers: headers,
            body: JSON.stringify({ "sourceClient": 1 })
        });
        
        let signData = JSON.parse(signRes.body);
        
        if (signData?.retCode === '00000' || signData?.code === '00000') {
            let signDays = signData?.data?.signDays || "?";
            $notify("海尔智家", "✅ 签到成功", `累计签到 ${signDays} 天`);
        } else if (signData?.msg?.includes("已签到") || signData?.retMsg?.includes("已签到")) {
            $notify("海尔智家", "⚠️ 今日已签到", "");
        } else {
            $notify("海尔智家", "❌ 签到失败", signData?.msg || signData?.retMsg || "未知错误");
        }
    } catch (e) {
        $notify("海尔智家", "❌ 网络异常", String(e).substring(0, 60));
    }
    $done();
})();