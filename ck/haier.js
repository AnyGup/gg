// haier_sign.js (基于真实抓包最终版)

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

    // 完全照抄你截图里的请求头和真实参数
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
        // 使用真实的 /sign 路径
        let signRes = await $task.fetch({
            url: "https://zj.haier.net/api-gw/zjBaseServer/daily/sign", 
            method: "POST",
            headers: headers,
            body: JSON.stringify({}) // 对应 Content-Length: 2
        });
        
        // 安全解析，防止返回奇怪的非 JSON 格式
        let signData;
        try {
            signData = JSON.parse(signRes.body);
            console.log("【海尔真实签到返回】: " + signRes.body);
        } catch (e) {
            notifyMsg.push(`❌ 解析失败: 返回了非JSON内容`);
            $notify("海尔智家", "", notifyMsg.join("\n"));
            $done(); return;
        }
        
        // 判断返回结果 (兼容海尔可能的几种成功标识)
        if (signData?.code === '00000' || signData?.retCode === '00000' || signData?.code === 200) {
            // 如果能获取到累计天数，就显示出来
            let signDays = signData?.data?.signDays || signData?.data?.totalDays || "";
            let extraMsg = signDays ? ` (累计${signDays}天)` : "";
            notifyMsg.push(`✅ 签到成功${extraMsg}`);
        } else if (signData?.msg?.includes("已签到") || signData?.retMsg?.includes("已签到") || signData?.message?.includes("已签到")) {
            notifyMsg.push(`⚠️ 今日已签到`);
        } else {
            // 失败时打印具体原因
            notifyMsg.push(`❌ 失败: ${signData?.msg || signData?.retMsg || signData?.message || '未知错误'}`);
        }

    } catch (e) {
        notifyMsg.push(`❌ 网络异常: ${String(e).substring(0, 50)}`);
    }
    
    $notify("海尔智家签到", "", notifyMsg.join("\n"));
    $done();
})();