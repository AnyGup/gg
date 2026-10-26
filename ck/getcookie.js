// getcookie.js (影视飓风 & 奇瑞汽车 合并抓取脚本)
const url = $request.url;
const headers = $request.headers;

// ==========================================
// 1. 影视飓风 Club 抓取逻辑
// ==========================================
if (url.includes("h5.youzan.com") && url.includes("access_token")) {
    const tokenMatch = url.match(/access_token=([a-zA-Z0-9]+)/);
    if (tokenMatch) {
        $prefs.setValueForKey(tokenMatch[1], "ysjf_token");
    }
    const extraData = headers["Extra-Data"] || headers["extra-data"];
    if (extraData) {
        $prefs.setValueForKey(extraData, "ysjf_extra_data");
    }
    $done({});
} 

// ==========================================
// 2. 奇瑞汽车 App 抓取逻辑
// ==========================================
else if (url.includes("mobile-consumer-sapp.chery.cn")) {
    // 从请求头中提取 Authorization (兼容大小写)
    let authHeader = headers["Authorization"] || headers["authorization"];
    
    if (authHeader) {
        // 通常格式是 "Bearer xxxxx"，我们把 Bearer 后面的内容提取出来
        let token = authHeader;
        if (authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7); 
        }
        
        // 存入 QX 本地
        $prefs.setValueForKey(token, "chery_token");
        $prefs.setValueForKey(authHeader, "chery_auth_full"); // 同时保存完整版备用
        
        // 弹窗提醒你抓到了
        $notify("奇瑞汽车App 🚗", "抓取到 Token 成功 ✅", token.substring(0, 15) + "...");
        console.log("奇瑞 Token 抓到啦: " + token);
    }
    $done({});
} 

// 其他请求直接放行
else {
    $done({});
}