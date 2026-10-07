/*
 * QX 通知链路自检 for Quantumult X
 * ------------------------------------------------------------------
 * 作用：只做一件事 —— 弹一条通知。
 * 意义：用来二分定位问题。
 *   收到 → QX 在运行、通知权限正常 → 问题出在 MITM / rewrite 匹配
 *   没收到 → QX 没在跑，或通知权限被关（先解决这个，别的都白搭）
 * 用法（二选一）：
 *   A. 加进 [task_local] 定时跑：
 *      */5 * * * * https://gh-proxy.com/https://raw.githubusercontent.com/wmy2468/quanx-scripts/main/telecom_selftest.js, tag=QX自检, enabled=true
 *   B. 临时把某条 rewrite 的 script-path 换成这个脚本，随便刷个网页触发
 */

function pad(n) { return (n < 10 ? "0" : "") + n; }
var d = new Date();
var ts = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) +
         " " + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());

$notify("QX 自检 ✅", "通知链路正常", "时间: " + ts + "\n看到这条 = QX 在跑 + 通知能用。\n下一步查 MITM 开关和证书信任。");

$done();
