/*************************************
项目名称：平安好车主 · 验证码请求拦截（通知版）
来源：yiqian987/quanx 的 pahcz_validate.js
作用：当 App 走到「预约验证码校验」那一步时，把请求体里的关键参数
      （challenge / validate / seccode / captchaId / 手机号）通过通知推给你。

[rewrite_local]
^https?:\/\/newretail\.pingan\.com\.cn/ydt/captcha/validate\?.* url script-request-body script-path=pahcz_validate.js

[mitm]
hostname = newretail.pingan.com.cn
*************************************/

if ($request.method === "POST") {
  const body = $request.body;
  try {
    const json = JSON.parse(body);
    const phone = json.phoneNumber || "未提供";
    const challenge = json.challenge || "";
    const validate = json.validate || "";
    const seccode = json.seccode || "";
    const captchaId = json.captchaId || "";

    $notify(
      "好车主 · 验证码请求拦截",
      "手机号: " + phone,
      `challenge: ${challenge}\nvalidate: ${validate}\nseccode: ${seccode}\ncaptchaId: ${captchaId}`
    );
  } catch (e) {
    $notify("好车主 · 验证码请求拦截", "请求体非 JSON 格式", String(body).slice(0, 500));
  }
}

$done({});
