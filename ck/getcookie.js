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
else if (url.includes("mobile-consumer-sapp.chery.cn") && url.includes("/web/user/current/details")) {
    
    if (typeof $response === "undefined" || !$response.body) {
        $notify("奇瑞抓取 ❌", "未拦截到Body", "请确保规则写了 require-body=true");
        $done({});
    } else {
        const body = $response.body;
        const tokenMatch = url.match(/access_token=([^&]*)/);
        const access_token = tokenMatch ? tokenMatch[1] : "";
        
        try {
            let rsp_data = JSON.parse(body);
            if (rsp_data.data && rsp_data.data.accountId) {
                let accountId = rsp_data.data.accountId;
                let avatarUrl = rsp_data.data.avatarUrl;
                let displayName = rsp_data.data.displayName;
                
                let cache = $prefs.valueForKey("fmz200_chery_account") || "[]";
                let json_data = JSON.parse(cache);
                
                let existingIndex = json_data.findIndex(item => item.accountId === accountId);
                let newObj = { "accountId": accountId, "access_token": access_token, "displayName": displayName, "avatarUrl": avatarUrl };
                
                if (existingIndex > -1) {
                    json_data[existingIndex] = newObj;
                } else {
                    json_data.push(newObj);
                }
                
                $prefs.setValueForKey(JSON.stringify(json_data, null, "\t"), "fmz200_chery_account");
                $notify("奇瑞汽车App", "获取token成功 ✅", displayName || access_token);
            } else {
                // 成功拦截，但没拿到数据（可能接口格式变了，或者抓错了接口）
                $notify("奇瑞抓取 ⚠️", "拦截成功但未找到数据", "可能是接口格式变了");
            }
        } catch (e) {
            // JSON解析失败
            $notify("奇瑞抓取 ❌", "解析异常", String(e));
        }
        $done({ body });
    }
} 

// 其他请求直接放行
else {
    $done({});
}
