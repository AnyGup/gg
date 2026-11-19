// ==========================================
// getcookie.js (影视飓风 & 美的会员 综合抓取脚本)
// ==========================================
const url = $request.url;
const headers = $request.headers;

// 1. 影视飓风 Cookie / Token 抓取
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

// 2. 美的会员 Cookie 抓取
if (url.includes("mvip.midea.cn")) {
    const cookie = headers["Cookie"] || headers["cookie"];
    if (cookie) {
        // 持久化存储，键名为 MIDEA_COOKIE
        $prefs.setValueForKey(cookie, "MIDEA_COOKIE");
        $notify("美的会员", "Cookie 抓取成功 ✅", cookie.substring(0, 30) + "...");
    }
}

// 结束请求处理
$done({});