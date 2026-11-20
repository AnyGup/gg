// getcookie.js (影视飓风 & 美的 & 杜蕾斯 & 海尔 综合抓取脚本)
const url = $request.url;
const headers = $request.headers;

// ==================== 1. 影视飓风 Cookie / Token 抓取 ====================
if (url.includes("access_token")) {
    const tokenMatch = url.match(/access_token=([a-zA-Z0-9]+)/);
    if (tokenMatch) {
        $prefs.setValueForKey(tokenMatch[1], "ysjf_token");
        $notify("影视飓风抓取", "Token 抓取成功 ✅", tokenMatch[1]);
    }
    const extraData = $request.headers["Extra-Data"] || $request.headers["extra-data"];
    if (extraData) {
        $prefs.setValueForKey(extraData, "ysjf_extra_data");
    }
}

// ==================== 2. 美的会员 Cookie 抓取 ====================
if (url.includes("mvip.midea.cn")) {
    const cookie = headers["Cookie"] || headers["cookie"];
    if (cookie) {
        $prefs.setValueForKey(cookie, "MIDEA_COOKIE");
        $prefs.setValueForKey(cookie, "midea_data"); // 兼容原版脚本的变量名
        $notify("美的会员", "Cookie 抓取成功 ✅", cookie.substring(0, 30) + "...");
    }
}

// ==================== 3. 杜蕾斯小程序 Token 抓取 ====================
if (url.includes("ixiliu.cn")) {
    const auth = headers["Authorization"] || headers["authorization"];
    // 有赞接口有时也用 access-token
    const accessToken = headers["Access-Token"] || headers["access-token"];
    const finalToken = auth || accessToken;
    
    if (finalToken) {
        $prefs.setValueForKey(finalToken, "dls_auth");
        $prefs.setValueForKey(finalToken, "dls_data"); // 兼容原版 Levi 脚本
        $notify("杜蕾斯抓取", "Token 抓取成功 ✅", `Auth: ${finalToken.substring(0, 15)}...`);
    }
}

// ==================== 4. 海尔智家 Token 抓取 ====================
if (url.includes("zj.haier.net")) {
    // 优先获取 accountToken，如果没有则尝试 accessToken
    const haierToken = headers["accountToken"] || headers["accounttoken"] || headers["accessToken"];
    const clientId = headers["clientId"] || headers["clientid"];

    if (haierToken && clientId) {
        // 分别存储
        $prefs.setValueForKey(haierToken, "haier_accountToken");
        $prefs.setValueForKey(clientId, "haier_clientId");
        
        // 组合存储，方便部分只认单一变量的脚本直接读取 (格式: accountToken@clientId)
        const combinedData = `${haierToken}@${clientId}`;
        $prefs.setValueForKey(combinedData, "haier_data");
        $prefs.setValueForKey(combinedData, "haier_token");

        $notify("海尔智家", "CK 抓取成功 ✅", `Token: ${haierToken.substring(0, 10)}...`);
        console.log(`【海尔智家抓取】\nAccountToken: ${haierToken}\nClientId: ${clientId}`);
    }
}

// 结束请求处理
$done({});