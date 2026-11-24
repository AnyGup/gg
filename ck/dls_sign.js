// dls_sign.js (杜蕾斯独立签到脚本)

!(async () => {
    let notifyMsg = [];
    // 兼容你本地存的变量名
    let dlsData = $prefs.valueForKey("dls_data") || $prefs.valueForKey("dls_auth");
    
    if (!dlsData) {
        $notify("杜蕾斯签到", "", "❌ 缺失 CK，请先抓包");
        $done();
        return;
    }

    let dlsTokens = dlsData.split("@");
    for (let i = 0; i < dlsTokens.length; i++) {
        let token = dlsTokens[i].trim();
        if (!token) continue;

        let dlsHeaders = {
            "Host": "vip.ixiliu.cn",
            "content-type": "application/json;charset=utf-8",
            "User-Agent": "Mozilla/5.0 (iPad; CPU OS 16_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.47(0x18002f28) NetType/WIFI Language/zh_CN",
            "sid": "10006",
            "Access-Token": token,
            "Accept": "*/*"
        };

        let dlsSignMsg = "";
        try {
            // 保持之前验证通过的 GET 请求
            let signRes = await $task.fetch({
                url: "https://vip.ixiliu.cn/mp/sign/applyV2",
                method: "GET",
                headers: dlsHeaders
            });
            
            try {
                let signData = JSON.parse(signRes.body);
                if (signData?.code === -1 || signData?.msg?.includes("已签到")) {
                    dlsSignMsg = "⚠️ 今日已签到";
                } else if (signData?.status === 200 || signData?.code === 0) {
                    dlsSignMsg = "✅ 签到成功";
                } else {
                    dlsSignMsg = `❌ 失败: ${signData?.msg || '未知错误'}`;
                }
            } catch (parseError) {
                dlsSignMsg = `❌ 接口异常(非JSON)`;
            }
        } catch (e) {
            dlsSignMsg = `❌ 网络异常 (${String(e).substring(0, 30)})`;
        }
        
        notifyMsg.push(`杜蕾斯账号${i + 1}: ${dlsSignMsg}`);
        
        // 多账号延迟
        if (i < dlsTokens.length - 1) {
            await new Promise(r => setTimeout(r, 1500));
        }
    }

    if (notifyMsg.length > 0) {
        $notify("杜蕾斯签到", "", notifyMsg.join("\n"));
        console.log(`【杜蕾斯签到】\n${notifyMsg.join("\n")}`);
    }
    
    $done();
})();