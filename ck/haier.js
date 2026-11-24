// ==================== 4. 海尔智家签到 ====================
    let haierData = $prefs.valueForKey("haier_data");
    
    if (!haierData) {
        notifyMsg.push("海尔智家: ❌ 缺失 CK");
    } else {
        let parts = haierData.split("@");
        
        if (parts.length % 2 !== 0) {
            notifyMsg.push("海尔: ❌ CK数据不完整");
        } else {
            let accountCount = parts.length / 2;
            for (let i = 0; i < accountCount; i++) {
                let accountToken = parts[i * 2].trim();
                let clientId = parts[i * 2 + 1].trim();

                if (!accountToken || !clientId) {
                    notifyMsg.push(`海尔账号${i + 1}: ❌ Token或ClientId为空`);
                    continue;
                }

                let haierHeaders = {
                    "Host": "mps.haiersmarthomes.com",
                    "Content-Type": "application/json",
                    "appId": "MB-UZHSH-0001",
                    "accountToken": accountToken,
                    "clientId": clientId,
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.78(0x18004e33) NetType/5G Language/zh_CN",
                    "Referer": "https://zjrs.haier.net/"
                };

                let haierSignMsg = "";
                try {
                    // 关键修改：使用 mps.haiersmarthomes.com 域名和新路径
                    let signRes = await $task.fetch({
                        url: "https://mps.haiersmarthomes.com/api-gw/wisdomHouseActivity/sign/signIn",
                        method: "POST",
                        headers: haierHeaders,
                        body: JSON.stringify({ "sourceClient": 1 })
                    });
                    let signData = JSON.parse(signRes.body);
                    
                    if (signData?.code === '00000' || signData?.retCode === '00000' || signData?.code === 200) {
                        haierSignMsg = "✅ 签到成功";
                    } else if (signData?.msg?.includes("已签到") || signData?.retMsg?.includes("已签到")) {
                        haierSignMsg = "⚠️ 今日已签到";
                    } else {
                        haierSignMsg = `❌ 失败: ${signData?.msg || signData?.retMsg || '未知错误'}`;
                    }
                } catch (e) {
                    haierSignMsg = `❌ 网络异常 (${String(e).substring(0, 50)})`;
                }
                
                notifyMsg.push(`海尔账号${i + 1}: ${haierSignMsg}`);

                if (i < accountCount - 1) {
                    await new Promise(r => setTimeout(r, 1500));
                }
            }
        }
    }