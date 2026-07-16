/**
 * Quick Telegram connectivity test. Run from server/:
 *   npx tsx scripts/test-telegram.ts
 */
import { env } from "../src/config/env";
import { sendTelegramMessage } from "../src/modules/notifications/telegram.service";

async function main() {
  const { enabled, botToken, adminChatId } = env.telegram;
  console.log("TELEGRAM_ALERTS_ENABLED:", enabled);
  console.log("TELEGRAM_BOT_TOKEN set:", Boolean(botToken));
  console.log("TELEGRAM_ADMIN_CHAT_ID:", adminChatId || "(missing)");

  if (!enabled || !botToken || !adminChatId) {
    console.error("Telegram alerts not configured — check server/.env");
    process.exit(1);
  }

  const stamp = new Date().toLocaleTimeString("en-IN");
  console.log("Sending test message...");
  await sendTelegramMessage(`Urja Basket test ✅ ${stamp}`);
  console.log("Done — check Telegram chat with your bot.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
