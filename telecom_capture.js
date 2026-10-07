/*
 * 电信营业厅 · 金豆签到【抓包助手】 for Quantumult X
 * ------------------------------------------------------------------
 * 作用：拦截电信签到相关的 4 个请求，把「完整请求头 + 请求体」推送到通知，
 *       同时写入 QX 持久化存储（掉通知了也能补捞）。
 * 用法：
 *   1. QX 里挂 rewrite_local（script-request-body）+ mitm hostname
 *   2. 打开「电信营业厅」App → 金豆乐园 → 手动点一次签到 / 喂食
 *   3. 通知会分片弹出，把内容复制给巴蒂即可
 * 注意：sign / timestamp 一个字都不能改，改了验签失败，本脚本只读不改。
 */

// ==== 要抓的接口（路径 → 配置名，改成电信脚本 telecom_replay.py 里的 key）====
var CAP_PATHS = {
  "/jt-sign/api/home/homeInfo":  "homeInfo",     // 查金豆余额
  "/jt-sign/api/home/sign":      "sign",         // 每日签到
  "/jt-sign/paradise/food":      "food",         // 喂食
  "/jt-sign/reward/activityMsg": "activityMsg",  // 连签信息
};

// 这些头在重放时会自动生成，不推（避免噪音 / 也防止长度爆掉）
var DROP_HEADERS = [
  "host", "content-length", "connection", "accept-encoding",
  "content-encoding", "transfer-encoding", "keep-alive",
  ":authority", ":method", ":path", ":scheme",
];

var CHUNK = 900;          // 单条通知最大字符数（超长自动分片）
var STORE_KEY = "telecom_cap_";   // 单接口 key 前缀
var STORE_ALL = "telecom_cap_all"; // 累积全量 key

function cleanHeaders(h) {
  var o = {};
  for (var k in h) {
    if (DROP_HEADERS.indexOf(String(k).toLowerCase()) < 0) o[k] = h[k];
  }
  return o;
}

function chunk(str, size) {
  var out = [];
  for (var i = 0; i < str.length; i += size) out.push(str.slice(i, i + size));
  return out;
}

function nowStr() {
  var d = new Date();
  function p(n) { return (n < 10 ? "0" : "") + n; }
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) +
         " " + p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
}

var name = null;
for (var p in CAP_PATHS) {
  if ($request.url.indexOf(p) >= 0) { name = CAP_PATHS[p]; break; }
}

if (!name) {
  $done({});   // 不是目标接口，原样放行
} else {
  var headers = cleanHeaders($request.headers || {});
  var bodyRaw = $request.body || "";

  // 1) 单接口存一份（重抓即覆盖）
  $persistentStore.write(
    JSON.stringify({ url: $request.url, headers: headers, body: bodyRaw }),
    STORE_KEY + name
  );

  // 2) 累积全量（方便一次捞全部）
  var all = {};
  try { var raw = $persistentStore.read(STORE_ALL); if (raw) all = JSON.parse(raw); } catch (e) { all = {}; }
  all[name] = { url: $request.url, headers: headers, body: bodyRaw };
  all._updated = nowStr();
  $persistentStore.write(JSON.stringify(all), STORE_ALL);

  // 3) 推通知（自动分片，保证不被截断）
  var txt =
    "URL: " + $request.url + "\n" +
    "--- HEADERS ---\n" + JSON.stringify(headers, null, 1) + "\n" +
    "--- BODY ---\n" + (bodyRaw ? bodyRaw : "(空)");
  var parts = chunk(txt, CHUNK);
  for (var i = 0; i < parts.length; i++) {
    $notify(
      "电信抓包[" + name + "]" + (parts.length > 1 ? " " + (i + 1) + "/" + parts.length : ""),
      parts.length > 1 ? "第 " + (i + 1) + " 段，共 " + parts.length + " 段" : "点长按可复制",
      parts[i]
    );
  }

  $done({});
}
