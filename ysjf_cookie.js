// ysjf_cookie.js (带弹窗提示版)
const url = $request.url;
if (url.includes("access_token")) {
    const tokenMatch = url.match(/access_token=([a-zA-Z0-9]+)/);
    if (tokenMatch) {
        $prefs.setValueForKey(tokenMatch[1], "ysjf_token");
        // 添加了下面这行弹窗
        $notify("影视飓风抓取", "Token 抓取成功 ✅", tokenMatch[1]); 
    }
    const extraData = $request.headers["Extra-Data"] || $request.headers["extra-data"];
    if (extraData) {
        $prefs.setValueForKey(extraData, "ysjf_extra_data");
    }
}
$done({});
