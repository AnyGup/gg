// haier_sign.js (海尔智家 App 专属签到版)

!(async () => {
    let notifyMsg = [];
    // 读取你抓包存下的数据：token1@clientId1
    let haierData = $prefs.valueForKey("haier_data");
    
    if (!haierData) {
        $notify("海尔智家", "❌ 缺失 CK", "请重新抓包");
        $done();
        return;
    }

    let parts = haierData.split("@");
    if (parts.length < 2) {
        $notify("海尔智家", "❌ 格式错误", "需要 accountToken@clientId");
        $done();
        return;
    }

    let accountToken = parts[0].trim();
    let clientId = parts[1].trim();

    // 完全按照你截图中的 App 请求头构造
    let headers = {
        "Host": "zj.haier.net",
        "Content-Type": "application/json",
        "appId": "MB-UZHSH-0001",
        "appKey": "f50c76fbc8271d361e1f6b5973f54585", // 从你截图提取的 App 固定 Key
        "appVersion": "11.0.0",
        "accountToken": accountToken,
        "clientId": clientId,
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Hainer/Haier Simulation/Nebula App/Uplus Nebula mPaaSClient",
        "Origin": "https://zjrs.haier.net",
        "Referer": "https://zjrs.haier.net/"
    };

    let haierSignMsg = "";
    try {
        // 尝试使用 App 端的签到接口
        let signRes = await $task.fetch({
            url: "https://zj.haier.net/api-gw/zjBaseServer/daily/signIn", 
            method: "POST",
            headers: headers,
            body: JSON.stringify({}) // 大多数 App 签到接口 POST 空 JSON 即可
        });
        
        let signData = JSON.parse(signRes.body);
        console.log("【海尔App签到原始返回】: " + signRes.body);
        
        // 解析海尔的返回值
        if (signData?.code === '00000' || signData?.retCode === '00000' || signData?.code === 200) {
            haierSignMsg = "✅ 签到成功";
        } else if (signData?.msg?.includes("已签到") || signData?.retMsg?.includes("已签到") || signData?.data?.msg?.includes("已签到")) {
            haierSignMsg = "⚠️ 今日已签到";
        } else {
            haierSignMsg = `❌ 失败: ${signData?.msg || signData?.retMsg || '未知错误'}`;
        }
    } catch (e) {
        haierSignMsg = `❌ 接口异常: ${String(e).substring(0, 50)}`;
    }
    
    notifyMsg.push(`海尔账号1: ${haierSignMsg}`);
    $notify("海尔智家签到", "", notifyMsg.join("\n"));
    $done();
})();