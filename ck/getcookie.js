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
    const extraData = headers["Extra-Data"] || headers["extra-data"];
    if (extraData) {
        $prefs.setValueForKey(extraData, "ysjf_extra_data");
    }
}

// ==================== 2. 美的会员 Cookie 抓取 ====================
if (url.includes("mvip.midea.cn")) {
    const cookie = headers["Cookie"] || headers["cookie"];
    if (cookie) {
        $prefs.setValueForKey(cookie, "MIDEA_COOKIE");
        $prefs.setValueForKey(cookie, "midea_data");
        $notify("美的会员", "Cookie 抓取成功 ✅", cookie.substring(0, 30) + "...");
    }
}

// ==================== 3. 杜蕾斯小程序 Token 抓取 (升级版) ====================
// 精准匹配新的 mall-api 域名
if (url.includes("mall-api.ixiliu.cn")) {
    const auth = headers["Authorization"] || headers["authorization"];
    
    if (auth) {
        // 核心 Authorization
        $prefs.setValueForKey(auth, "dls_auth");
        $prefs.setValueForKey(auth, "dls_data"); // 兼容原版变量名
        
        // 顺手把辅助参数也存下来
        const tenantId = headers["tenant-id"] || headers["Tenant-Id"] || "1";
        const terminal = headers["terminal"] || "10";
        $prefs.setValueForKey(tenantId, "dls_tenant_id");
        $prefs.setValueForKey(terminal, "dls_terminal");

        $notify("杜蕾斯抓取", "Token 抓取成功 ✅", `Auth: ${auth.substring(0, 15)}...`);
        console.log(`【杜蕾斯抓取】\nAuthorization: ${auth}\nTenant-ID: ${tenantId}\nTerminal: ${terminal}`);
    }
}

// ==================== 4. 海尔智家 Token 抓取 ====================
if (url.includes("zj.haier.net")) {
    const haierToken = headers["accountToken"] || headers["accounttoken"] || headers["accessToken"];
    const clientId = headers["clientId"] || headers["clientid"];

    if (haierToken && clientId) {
        // 组合存储，格式: accountToken@clientId
        const combinedData = `${haierToken}@${clientId}`;
        $prefs.setValueForKey(combinedData, "haier_data");
        
        $notify("海尔智家", "CK 抓取成功 ✅", `Token: ${haierToken.substring(0, 10)}...`);
        console.log(`【海尔智家抓取】\nAccountToken: ${haierToken}\nClientId: ${clientId}`);
    }
}

// 结束请求处理
$done({});