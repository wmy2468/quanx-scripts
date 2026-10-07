/*
 * 电信抓包 · 诊断版 for Quantumult X
 * ------------------------------------------------------------------
 * 作用：拦截【所有 *.189.cn 的请求】，把「唯一的 URL（去掉 ?query）」推出来。
 * 意义：确认两件事 ——
 *   ① QX 到底有没有拦到电信的流量（一条都没有 = MITM 没生效 / 证书没信任）
 *   ② 你点签到时真实请求的域名和路径，是否和脚本假设的 wapside.189.cn:9001/jt-sign 一致
 * 用法：挂到 rewrite_local，替换 capture 那条：
 *   ^https?:\/\/[a-zA-Z0-9.-]*189\.cn.* url script-request-header https://gh-proxy.com/https://raw.githubusercontent.com/wmy2468/quanx-scripts/main/telecom_diag.js
 *   [mitm] hostname = *.189.cn, %APPEND%
 * 说明：同一个 URL 只推一次（去重），不会刷屏。查完记得换回 telecom_capture.js。
 */

var SEEN_PREFIX = "telecom_diag_seen_";

var url = $request.url || "";
var method = $request.method || "GET";
var base;

try {
  base = url.split("?")[0];
} catch (e) {
  base = url;
}

// 去重 key：把 URL 里的非字母数字换成下划线，只留尾部 120 字符
var key = SEEN_PREFIX + base.replace(/[^a-zA-Z0-9]/g, "_").slice(-120);

if ($persistentStore.read(key)) {
  $done({});          // 见过，静默放行
} else {
  $persistentStore.write("1", key);
  $notify(
    "电信诊断 · 命中 " + method,
    base.slice(0, 120),
    "完整: " + url.slice(0, 500) +
    "\nhost: " + (url.split("/")[2] || "?")
  );
  $done({});          // 不改任何东西，原样放行
}
