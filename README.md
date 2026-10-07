# quanx-scripts

自用 Quantumult X 重写脚本集合。

## 脚本列表

### 平安好车主 · 预约名额改写 + 验证码拦截

需抓包确认自己的门店参数（`storefrontSeq` / `businessType` / 时段 ID），见文件顶部配置区。

```
[rewrite_local]
^https?:\/\/newretail\.pingan\.com\.cn/ydt/reserve/store/bookingTime\?.* url script-echo-response https://gh-proxy.com/https://raw.githubusercontent.com/wmy2468/quanx-scripts/main/pahcz.js
^https?:\/\/newretail\.pingan\.com\.cn/ydt/captcha/validate\?.* url script-request-body https://gh-proxy.com/https://raw.githubusercontent.com/wmy2468/quanx-scripts/main/pahcz_validate.js

[mitm]
hostname = newretail.pingan.com.cn, %APPEND%
```

说明：
- `pahcz.js`：把可约日期改成「明天」（周五改下周一）并伪造名额，让 App 提前开放预约入口
- `pahcz_validate.js`：App 提交验证码校验时，把 phone/challenge/validate/seccode/captchaId 推到通知
- 用 `gh-proxy.com` 前缀便于国内手机直连；`%APPEND%` 不可省
- 脚本思路源自 [yiqian987/quanx](https://github.com/yiqian987/quanx)，此为改良自用版（修正原版写死的 bookingDate、参数提到配置区）

### 电信营业厅 · 金豆签到抓包助手

把电信签到 4 个接口（homeInfo / sign / food / activityMsg）的**完整请求头 + 请求体**推到通知，用于填充青龙重放脚本。

```
[rewrite_local]
^https?:\/\/wapside\.189\.cn(:9001)?\/jt-sign\/.* url script-request-body https://gh-proxy.com/https://raw.githubusercontent.com/wmy2468/quanx-scripts/main/telecom_capture.js

[mitm]
hostname = wapside.189.cn, %APPEND%
```

说明：
- `telecom_capture.js`：点一次签到，4 个请求全部落通知（超长自动分片）+ 写入 QX 持久化存储
- `telecom_export.js`：把存储里的抓包结果再捞一遍（通知被截断时用）；把顶部 `MODE` 改成 `clear` 可清空重抓
- 只读不改，`sign`/`timestamp` 原样保留；重放有效期有限，抓完尽快用

