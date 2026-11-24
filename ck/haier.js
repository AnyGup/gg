// haier_sign.js (海尔智家签到 - 增强调试版)

!(async () => {
    let notifyMsg = [];
    let haierData = $prefs.valueForKey("haier_data"); // 格式应为 refreshToken@clientId
    
    if (!haierData) {
        $notify("海尔智家签到", "", "❌ 缺失 CK，请重新抓包获取 refreshToken");
        $done();
        return;
    }

    let parts = haierData.split("@");
    if (parts.length < 2) {
        $notify("海尔智家签到", "", "❌ CK格式错误，需要 refreshToken@clientId");
        $done();
        return;
    }

    let refreshToken = parts[0].trim();
    let clientId = parts[1].trim();

    // 优先尝试使用 refreshToken 作为 accountToken
    let haierHeaders = {
        "Host": "mps.haiersmarthomes.com",
        "Content-Type": "application/json",
        "appId": "MB-UZHSH-0001",
        "accountToken": refreshToken, // 关键：尝试将 refreshToken 填入 accountToken
        "clientId": clientId,
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.78(0x18004e33) NetType/5G Language/zh_CN",
        "Referer": "https://zjrs.haier.net/"
    };

    let haierSignMsg = "";
    try {
        let signRes = await $task.fetch({
            url: "https://mps.haiersmarthomes.com/api-gw/wisdomHouseActivity/sign/signIn",
            method: "POST",
            headers: haierHeaders,
            body: JSON.stringify({ "sourceClient": 1 })
        });
        
        // 先尝试解析 JSON，如果服务器返回 HTML 或空内容会抛出异常
        let signData = JSON.parse(signRes.body);
        
        if (signData?.code === '00000' || signData?.retCode === '00000' || signData?.code === 200) {
            haierSignMsg = "✅ 签到成功";
        } else if (signData?.msg?.includes("已签到") || signData?.retMsg?.includes("已签到")) {
            haierSignMsg = "⚠️ 今日已签到";
        } else {
            // 关键：如果业务报错，打印出服务器返回的原始信息
            haierSignMsg = `❌ 业务失败: ${signData?.msg || signData?.retMsg || JSON.stringify(signData).substring(0, 80)}`;
        }
    } catch (e) {
        // 关键：如果网络或解析出错，打印出具体的错误对象
        haierSignMsg = `❌ 网络/解析异常: ${String(e).substring(0, 80)}`;
    }
    
    notifyMsg.push(`海尔账号1: ${haierSignMsg}`);

    if (notifyMsg.length > 0) {
        $notify("海尔智家签到", "", notifyMsg.join("\n"));
        console.log(`【海尔签到】\n${notifyMsg.join("\n")}`);
    }
    
    $done();
})();