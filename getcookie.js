// getcookie.js (影视飓风 & 奇瑞汽车 合并抓取脚本)
const url = $request.url;
const headers = $request.headers;
const body = $response ? $response.body : null;

// ==========================================
// 1. 影视飓风 Club 抓取逻辑 (拦截请求头)
// ==========================================
if (url.includes("h5.youzan.com") && url.includes("access_token")) {
    const tokenMatch = url.match(/access_token=([a-zA-Z0-9]+)/);
    if (tokenMatch) {
        $prefs.setValueForKey(tokenMatch[1], "ysjf_token");
        console.log("✅ 影视飓风 Token 已静默更新: " + tokenMatch[1]);
    }
    
    const extraData = headers["Extra-Data"] || headers["extra-data"];
    if (extraData) {
        $prefs.setValueForKey(extraData, "ysjf_extra_data");
        console.log("✅ 影视飓风 Extra-Data 已静默更新");
    }
    $done({});
} 

// ==========================================
// 2. 奇瑞汽车 App 抓取逻辑 (拦截响应体)
// ==========================================
else if (url.includes("mobile-consumer-sapp.chery.cn") && url.includes("/web/user/current/details?")) {
    // 提取 URL 中的 access_token
    const tokenMatch = url.match(/access_token=([^&]*)/);
    const access_token = tokenMatch ? tokenMatch[1] : "";
    
    if (access_token && body) {
        try {
            let rsp_data = JSON.parse(body);
            if (rsp_data.data && rsp_data.data.accountId) {
                let accountId = rsp_data.data.accountId;
                let avatarUrl = rsp_data.data.avatarUrl;
                let displayName = rsp_data.data.displayName;
                
                // 读取现有缓存（QX 不支持 # 号）
                let cache = $prefs.valueForKey("fmz200_chery_account") || "[]";
                let json_data = JSON.parse(cache);
                
                // 更新或添加账号
                let existingIndex = json_data.findIndex(item => item.accountId === accountId);
                let newObj = { "accountId": accountId, "access_token": access_token, "displayName": displayName, "avatarUrl": avatarUrl };
                
                if (existingIndex > -1) {
                    json_data[existingIndex] = newObj;
                } else {
                    json_data.push(newObj);
                }
                
                // 保存缓存
                $prefs.setValueForKey(JSON.stringify(json_data, null, "\t"), "fmz200_chery_account");
                $notify("奇瑞汽车App", "获取token成功✅", displayName || access_token);
                console.log("✅ 奇瑞汽车账号 [" + accountId + "] 获取成功");
            }
        } catch (e) {
            console.log("❌ 奇瑞汽车数据解析失败：" + e);
        }
    }
    // 因为拦截了响应体，必须返回原数据，否则 App 会白屏
    $done({ body });
} 

// 其他不匹配的请求直接放行
else {
    $done({});
}
