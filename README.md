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

#### 收不到通知时的排查三件套

按顺序做，能快速定位是哪一环断了。

**① 通知链路自检** —— 加进 `[task_local]`，5 分钟后看有没有通知：

```
[task_local]
*/5 * * * * https://gh-proxy.com/https://raw.githubusercontent.com/wmy2468/quanx-scripts/main/telecom_selftest.js, tag=QX自检, enabled=true
```

- 收到 → QX 在跑、通知正常 → 往下查 ②③
- 没收到 → QX 没在运行（首页 VPN 开关没开）或通知权限被关，先修这个

**② MITM 自检** —— QX 首页确认 MITM 开关是打开的；设置 → 通用 → 关于本机 → 证书信任设置 → 打开 QX 证书的完全信任。MITM 没生效的话，所有重写脚本都不会触发。

**③ 流量诊断** —— 换成诊断脚本，看电信流量到底有没有经过 QX：

```
[rewrite_local]
^https?:\/\/[a-zA-Z0-9.-]*189\.cn.* url script-request-header https://gh-proxy.com/https://raw.githubusercontent.com/wmy2468/quanx-scripts/main/telecom_diag.js

[mitm]
hostname = *.189.cn, %APPEND%
```

点一次签到：只要弹了通知，就说明 MITM 正常、且能看出真实域名/路径（再据此修正 capture 的匹配规则）；一条都不弹 → 回到 ② 继续查。


