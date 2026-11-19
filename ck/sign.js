// ysjf_sign.js (纯净版：仅影视飓风自动签到，仅读取QX本地缓存)
const token = $prefs.valueForKey("ysjf_token");
const kdtId = "149536603";
const checkinId = "6287727";
const extraData = $prefs.valueForKey("ysjf_extra_data");

if (!token || !extraData) {
    $notify("影视飓风签到", "配置缺失 ⚠️", "未检测到本地Token或Extra-Data，请先运行抓取脚本获取");
    $done();
    return;
}

const signURL = `https://h5.youzan.com/wscump/checkin/checkinV2.json?checkinId=${checkinId}&app_id=wx92782ef90ebc836d&kdt_id=${kdtId}&access_token=${token}`;

const headers = {
    "Host": "h5.youzan.com",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.78(0x18004e33) NetType/5G Language/zh_CN",
    "Referer": "https://servicewechat.com/wx92782ef90ebc836d/18/page-frame.html",
    "content-type": "application/json",
    "Accept": "application/json, text/plain, */*",
    "Extra-Data": extraData
};

$task.fetch({
    url: signURL,
    method: "GET",
    headers: headers
}).then(response => {
    try {
        const result = JSON.parse(response.body);
        const msg = result.msg || (result.data && result.data.msg) || response.body;
        
        if (result.code === 0 || result.success || (result.data && result.data.success)) {
            $notify("影视飓风签到", "签到成功 ✅", msg);
        } else if (result.code === 100001 || msg.includes("已签到") || msg.includes("重复")) {
            $notify("影视飓风签到", "今日已签到 ⚠️", "无需重复签到");
        } else {
            $notify("影视飓风签到", "签到失败 ❌", msg);
        }
    } catch (e) {
        $notify("影视飓风签到", "解析异常 ⚠️", response.body);
    }
}, reason => {
    $notify("影视飓风签到", "网络错误 ❌", String(reason.error || reason));
}).finally(() => {
    $done();
});