// ysjf_cookie.js
const url = $request.url;
if (url.includes("access_token")) {
    const tokenMatch = url.match(/access_token=([a-zA-Z0-9]+)/);
    if (tokenMatch) {
        $prefs.setValueForKey(tokenMatch[1], "ysjf_token");
        console.log("影视飓风 Token 更新成功");
    }
    const extraData = $request.headers["Extra-Data"] || $request.headers["extra-data"];
    if (extraData) {
        $prefs.setValueForKey(extraData, "ysjf_extra_data");
    }
}
$done({});
