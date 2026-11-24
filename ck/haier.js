// haier_sign.js (海尔智家纯净签到版)

!(async () => {
    let notifyMsg = [];
    // 读取你抓包存下的数据：token1@clientId1@token2@clientId2
    let haierData = $prefs.valueForKey("haier_data");
    
    if (!haierData) {
        $notify("海尔智家签到", "", "❌ 缺失 CK，请先抓包");
        $done();
        return;
    }

    let parts = haierData.split("@");
    
    if (parts.length % 2 !== 0) {
        $notify("海尔智家签到", "", "❌ CK格式错误(长度非偶数)，请重新抓包");
        $done();
        return;
    }

    let accountCount = parts.length / 2;
    for (let i = 0; i < accountCount; i++) {
        let accountToken = parts[i * 2].trim();
        let clientId = parts[i * 2 + 1].trim();

        if (!accountToken || !clientId) {
            notifyMsg.push(`账号${i + 1}: ❌ Token或ClientId为空`);
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
        try {
            let signRes = await $task.fetch({
                url: "https://mps.haiersmarthomes.com/api-gw/wisdomHouseActivity/sign/signIn",
                method: "POST",
                headers: haierHeaders,
                body: JSON.stringify({ "sourceClient": 1 })
            });
            
            let signData = JSON.parse(signRes.body);
            
            if (signData?.code === '00000' || signData?.retCode === '00000' || signData?.code === 200) {
                haierSignMsg = "✅ 签到成功";
            } else if (signData?.msg?.includes("已签到") || signData?.retMsg?.includes("已签到") || signData?.data?.includes("已签到")) {
                haierSignMsg = "⚠️ 今日已签到";
            } else {
                haierSignMsg = `❌ 失败: ${signData?.msg || signData?.retMsg || '未知错误'}`;
            }
        } catch (e) {
            haierSignMsg = `❌ 网络异常 (${String(e).substring(0, 30)})`;
        }
        
        notifyMsg.push(`海尔账号${i + 1}: ${haierSignMsg}`);

        if (i < accountCount - 1) {
            await new Promise(r => setTimeout(r, 1500));
        }
    }

    if (notifyMsg.length > 0) {
        $notify("海尔智家签到", "", notifyMsg.join("\n"));
        console.log(`【海尔签到】\n${notifyMsg.join("\n")}`);
    }
    
    $done();
})();