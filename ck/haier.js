// haier_sign.js (完美展示积分版)

!(async () => {
    let notifyMsg = [];
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

    let headers = {
        "Host": "zj.haier.net",
        "Content-Type": "application/json",
        "accountToken": accountToken,
        "appId": "MB-UZHSH-0001",
        "clientId": clientId,
        "appVersion": "11.0.0",
        "Origin": "https://zjrs.haier.net",
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Hainer/Haier Simulation /Nebula App/Uplus Nebula mPaaSClient",
        "Referer": "https://zjrs.haier.net/",
        "appKey": "f50c76fbc8271d361e1f6b5973f54585"
    };

    try {
        let signRes = await $task.fetch({
            url: "https://zj.haier.net/api-gw/zjBaseServer/daily/sign", 
            method: "POST",
            headers: headers,
            body: JSON.stringify({})
        });
        
        let signData;
        try {
            signData = JSON.parse(signRes.body);
        } catch (e) {
            notifyMsg.push(`❌ 解析失败: 返回了非JSON内容`);
            $notify("海尔智家", "", notifyMsg.join("\n"));
            $done(); return;
        }
        
        if (signData?.retCode === '00000') {
            // 提取真实的返回字段：累计天数 totalSignDay，获得海贝 haibeiCount
            let totalDays = signData?.data?.totalSignDay || 0;
            let haibei = signData?.data?.haibeiCount || 0;
            notifyMsg.push(`✅ 签到成功\n累计签到: ${totalDays}天\n获得海贝: ${haibei}个`);
        } else if (signData?.msg?.includes("已签到") || signData?.retInfo?.includes("已签到") || signData?.retInfo?.includes("重复")) {
            notifyMsg.push(`⚠️ 今日已签到\n${signData?.retInfo || ''}`);
        } else {
            notifyMsg.push(`❌ 失败: ${signData?.retInfo || signData?.msg || '未知错误'}`);
        }

    } catch (e) {
        notifyMsg.push(`❌ 网络异常: ${String(e).substring(0, 50)}`);
    }
    
    $notify("海尔智家签到", "", notifyMsg.join("\n"));
    $done();
})();