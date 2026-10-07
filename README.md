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
