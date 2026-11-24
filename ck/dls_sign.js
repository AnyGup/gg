// dls_sign.js (基于 mall-api 新接口完美版)

!(async () => {
    let notifyMsg = [];
    // 优先读取我们之前抓取的 Authorization
    let dlsData = $prefs.valueForKey("dls_auth") || $prefs.valueForKey("dls_data");
    
    if (!dlsData) {
        $notify("杜蕾斯签到", "", "❌ 缺失 CK，请先抓包");
        $done(); return;
    }

    let dlsTokens = dlsData.split("@");
    for (let i = 0; i < dlsTokens.length; i++) {
        let token = dlsTokens[i].trim();
        if (!token) continue;

        // 完全按照你截图里的域名和请求头构造
        let dlsHeaders = {
            "Host": "mall-api.ixiliu.cn",
            "content-type": "application/json;charset=utf-8",
            "Authorization": token, // 你之前抓取到的那个 32 位字符串
            "tenant-id": "1",       // 之前抓包看到有这个
            "terminal": "10",       // 之前抓包看到有这个
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.47(0x18002f28) NetType/WIFI Language/zh_CN",
            "Accept": "*/*"
        };

        let dlsSignMsg = "";
        try {
            // 使用第 572 条抓包的真实接口
            let signRes = await $task.fetch({
                url: "https://mall-api.ixiliu.cn/app-api/member/sign-in/record/create",
                method: "POST",
                headers: dlsHeaders,
                body: JSON.stringify({}) // 通常 create 接口发空 JSON 即可
            });

            // 安全解析
            let signData;
            try {
                signData = JSON.parse(signRes.body);
            } catch (parseError) {
                let preview = (signRes.body || "").substring(0, 30).replace(/\n/g, ' ');
                dlsSignMsg = `❌ 返回非JSON: ${preview}...`;
                notifyMsg.push(`杜蕾斯账号${i + 1}: ${dlsSignMsg}`);
                continue;
            }

            // 解析返回结果（微服务通常 code 为 0 或 200 表示成功）
            let code = signData?.code ?? signData?.status ?? signData?.errCode;
            let msg = signData?.msg || signData?.message || signData?.errMsg || "";

            if (code === 0 || code === 200 || String(code) === '0') {
                dlsSignMsg = "✅ 签到成功";
            } else if (msg.includes("已签到") || msg.includes("重复")) {
                dlsSignMsg = "⚠️ 今日已签到";
            } else {
                // 打印具体的错误提示，方便排查
                dlsSignMsg = `❌ 失败: ${msg || '未知错误'}`;
            }
        } catch (e) {
            // 彻底解决 [object Object] 报错，提取真实的错误信息
            let errStr = "";
            if (e.error) errStr = e.error;
            else if (e.message) errStr = e.message;
            else errStr = JSON.stringify(e);
            dlsSignMsg = `❌ 网络异常: ${errStr.substring(0, 50)}`;
        }
        
        notifyMsg.push(`杜蕾斯账号${i + 1}: ${dlsSignMsg}`);
        if (i < dlsTokens.length - 1) await new Promise(r => setTimeout(r, 1500));
    }

    if (notifyMsg.length > 0) {
        $notify("杜蕾斯签到", "", notifyMsg.join("\n"));
        console.log(`【杜蕾斯签到】\n${notifyMsg.join("\n")}`);
    }
    $done();
})();