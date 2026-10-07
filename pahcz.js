/*************************************
项目名称：平安好车主 · 预约名额改写（改良版）
来源：基于 yiqian987/quanx 的 pahcz.js 思路重写
改良点：
  1. 原版 bookingDate 是写死的旧日期（2025年08月06日），日期算了却没用上 —— 本版接上了真实计算
  2. 门店/业务类型/时段提到顶部配置区，按自己门店改
  3. 增加周末规则开关

[rewrite_local]
^https?:\/\/newretail\.pingan\.com\.cn/ydt/reserve/store/bookingTime\?.* url script-echo-response script-path=pahcz.js

[mitm]
hostname = newretail.pingan.com.cn
*************************************/

// ==================== 配置区（按自己门店改！） ====================
const CFG = {
  storefrontSeq: "10098",   // 门店编号，抓包看自己门店的 bookingTime 请求参数
  businessType: "29",       // 业务类型，同上（不同服务项不同）
  // 想伪造出来的可约时段：startTime/endTime/bookableNum
  slots: [
    { startTime: "9:00",  endTime: "11:00", bookableNum: 2 },
    { startTime: "14:00", endTime: "16:00", bookableNum: 1 },
  ],
  // 提醒：idBookingSurvey 是每个时段的服务端 ID，伪造时可沿用抓包值
  surveyIds: [
    "0f4917554af746dca2603f618926a2d9",
    "ef56e0c90e554d62a83de8aa647b6a33",
  ],
};
// ================================================================

const currentDate = new Date();
const dayOfWeekNumber = currentDate.getDay();

// 原版规则：周一~周四 → 日期 +1 天；周五 → +3 天；周六日不动
if (dayOfWeekNumber >= 1 && dayOfWeekNumber <= 4) {
  currentDate.setDate(currentDate.getDate() + 1);
} else if (dayOfWeekNumber === 5) {
  currentDate.setDate(currentDate.getDate() + 3);
}

const year = currentDate.getFullYear();
const month = currentDate.getMonth() + 1 < 10 ? '0' + (currentDate.getMonth() + 1) : currentDate.getMonth() + 1;
const day = currentDate.getDate() < 10 ? '0' + currentDate.getDate() : currentDate.getDate();
const daysOfWeek = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
const dayOfWeek = daysOfWeek[dayOfWeekNumber];
const formattedDate = `${year}年${month}月${day}日 ${dayOfWeek}`;

const rules = CFG.slots.map((s, i) => ({
  idBookingSurvey: CFG.surveyIds[i] || CFG.surveyIds[0],
  startTime: s.startTime,
  endTime: s.endTime,
  bookableNum: s.bookableNum,
  bookedNum: 0,
}));

const total = rules.reduce((n, r) => n + r.bookableNum, 0);

const myData = JSON.stringify({
  code: 200,
  msg: "OK",
  data: [{
    storefrontSeq: CFG.storefrontSeq,
    bookingDate: formattedDate,          // ✅ 改良：用真实计算出的日期
    businessType: CFG.businessType,
    totalBookableNum: total,
    totalBookable: total,
    totalBooked: 0,
    bookingRules: rules,
  }],
});

$done({
  status: "HTTP/1.1 200 OK",
  headers: { "Server": "loading", "Content-Type": "application/json", "Connection": "keep-alive" },
  body: myData,
});
