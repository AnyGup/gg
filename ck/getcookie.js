// getcookie.js (影视飓风 & 美的 & 杜蕾斯 综合抓取脚本)
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
    // 抓取辅助参数以防万一
    const tenantId = headers["tenant-id"] || headers["Tenant-Id"] || "1";
    const terminal = headers["terminal"] || "10";

    if (auth) {
        // 持久化存储
        $prefs.setValueForKey(auth, "dls_auth");
        $prefs.setValueForKey(tenantId, "dls_tenant_id");
        $prefs.setValueForKey(terminal, "dls_terminal");
        
        // 弹窗通知
        $notify("杜蕾斯抓取", "Token 抓取成功 ✅", `Auth: ${auth.substring(0, 15)}...`);
        console.log(`【杜蕾斯抓取】\nAuthorization: ${auth}\nTenant-ID: ${tenantId}`);
    }
}

// 结束请求处理
$done({});