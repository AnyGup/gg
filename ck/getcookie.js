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