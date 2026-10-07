/*
 * 电信抓包 · 导出 / 清空 for Quantumult X
 * ------------------------------------------------------------------
 * 用途：把 telecom_capture.js 存进 QX 持久化存储的抓包结果捞出来（补看/被通知截断时用）。
 * 用法（二选一）：
 *   A. 手动：QX → 首页「脚本」→ 找到本脚本 → 点运行
 *   B. 定时：加进 [task_local]，例如  0 22 * * * telecom-export.js, tag=电信抓包导出
 * 切换动作：改下面 MODE = "export" 或 "clear"
 */

var MODE = "export";        // "export" = 推送全部抓包内容；"clear" = 清空存储
var STORE_ALL = "telecom_cap_all";
var CHUNK = 900;

function chunk(str, size) {
  var out = [];
  for (var i = 0; i < str.length; i += size) out.push(str.slice(i, i + size));
  return out;
}

var raw = $persistentStore.read(STORE_ALL);

if (MODE === "clear") {
  $persistentStore.write("", STORE_ALL);
  ["homeInfo", "sign", "food", "activityMsg"].forEach(function (n) {
    $persistentStore.write("", "telecom_cap_" + n);
  });
  $notify("电信抓包", "已清空", "存储里的抓包数据已清空，可以重新抓了");
  $done();
} else {
  if (!raw) {
    $notify("电信抓包", "没有数据", "还没抓到任何请求，先在 QX 里挂好抓包脚本再点一次签到");
    $done();
  } else {
    var obj;
    try { obj = JSON.parse(raw); } catch (e) { obj = null; }
    if (!obj) {
      $notify("电信抓包", "解析失败", "存储内容不是合法 JSON，可能已损坏");
      $done();
    } else {
      var keys = ["homeInfo", "sign", "food", "activityMsg"].filter(function (k) { return obj[k]; });
      if (!keys.length) {
        $notify("电信抓包", "没有数据", "存储里没有有效接口记录");
        $done();
      } else {
        var txt = "抓包时间: " + (obj._updated || "未知") + "\n抓到接口: " + keys.join(", ");
        keys.forEach(function (k) {
          txt += "\n\n========== " + k + " ==========\n";
          txt += "URL: " + obj[k].url + "\n";
          txt += "HEADERS:\n" + JSON.stringify(obj[k].headers, null, 1) + "\n";
          txt += "BODY:\n" + (obj[k].body || "(空)");
        });
        var parts = chunk(txt, CHUNK);
        for (var i = 0; i < parts.length; i++) {
          $notify("电信抓包导出 " + (i + 1) + "/" + parts.length, "共 " + parts.length + " 段", parts[i]);
        }
        $done();
      }
    }
  }
}
