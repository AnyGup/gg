// ysjf_cookie.js (静默抓取版)
const url = $request.url;

// 只有包含 access_token 的请求才处理
if (url.includes("access_token")) {
    // 1. 抓取 Token
    const tokenMatch = url.match(/access_token=([a-zA-Z0-9]+)/);
    if (tokenMatch) {
        $prefs.setValueForKey(tokenMatch[1], "ysjf_token");
        console.log("✅ 影视飓风 Token 已静默更新");
    }
    
    // 2. 抓取 Extra-Data 风控参数
    const extraData = $request.headers["Extra-Data"] || $request.headers["extra-data"];
    if (extraData) {
        $prefs.setValueForKey(extraData, "ysjf_extra_data");
        console.log("✅ 影视飓风 Extra-Data 已静默更新");
    }
}

// 放行请求，不修改任何内容
$done({});
