import { env } from "../../config/env";

const TELEGRAM_API = "https://api.telegram.org";

export async function sendTelegramMessage(text: string): Promise<void> {
  const { botToken, adminChatId, enabled } = env.telegram;
  if (!enabled || !botToken || !adminChatId) {
    console.warn("[telegram] skipped — alerts disabled or missing token/chat_id");
    return;
  }

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: adminChatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[telegram] send failed:", res.status, body);
      return;
    }
    const data = (await res.json().catch(() => null)) as { ok?: boolean; description?: string } | null;
    if (data?.ok) {
      console.log("[telegram] message sent");
    }
  } catch (err) {
    console.error("[telegram] send failed:", err);
  }
}
