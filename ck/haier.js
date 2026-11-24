// haier_sign.js (调试版 - 查看原始返回)
!(async () => {
    let haierData = $prefs.valueForKey("haier_data"); // 确保这里存的是 refreshToken@clientId
    if (!haierData) {
        $notify("海尔智家", "❌ 缺失 CK", "请重新抓取 refreshToken@clientId");
        $done();
        return;
    }
    let parts = haierData.split("@");
    if (parts.length < 2) {
        $notify("海尔智家", "❌ 格式错误", "需要 refreshToken@clientId");
        $done();
        return;
    }
    let refreshToken = parts[0].trim();
    let clientId = parts[1].trim();

    let headers = {
        "Host": "mps.haiersmarthomes.com",
        "Content-Type": "application/json",
        "appId": "MB-UZHSH-0001",
        "accountToken": refreshToken,
        "clientId": clientId,
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.78(0x18004e33) NetType/5G Language/zh_CN",
        "Referer": "https://zjrs.haier.net/"
    };

    try {
        let res = await $task.fetch({
            url: "https://mps.haiersmarthomes.com/api-gw/wisdomHouseActivity/sign/signIn",
            method: "POST",
            headers: headers,
            body: JSON.stringify({ "sourceClient": 1 })
        });
        
        // 直接显示原始返回内容（截取前200字符）
        let rawPreview = (res.body || "空响应").substring(0, 200);
        $notify("海尔调试 - 原始返回", "", rawPreview);
        console.log("【海尔原始返回】: " + res.body);
        
        // 尝试解析，但不再因为失败而中断
        try {
            let data = JSON.parse(res.body);
            console.log("【解析后的JSON】: " + JSON.stringify(data));
        } catch (e) {
            console.log("【解析失败，原始内容非JSON】");
        }
    } catch (e) {
        $notify("海尔调试 - 网络错误", "", String(e).substring(0, 100));
    }
    $done();
})();