export function getCaptchaToken(widgetId) {
  return new Promise((resolve) => {
    if (!window.grecaptcha) return resolve(null);

    const token = window.grecaptcha.getResponse(widgetId);
    resolve(token || null);
  });
}
