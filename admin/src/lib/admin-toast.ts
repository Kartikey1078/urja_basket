import { AdminApiError } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast-store";

export function formatAdminError(e: unknown, fallback = "Request failed"): string {
  if (e instanceof AdminApiError) return e.message;
  if (e instanceof Error) return e.message;
  return fallback;
}

function push(type: "success" | "error" | "info", message: string) {
  useToastStore.getState().push(type, message);
}

export const adminToast = {
  success(message: string) {
    push("success", message);
  },
  error(message: string) {
    push("error", message);
  },
  info(message: string) {
    push("info", message);
  },
  created(label = "Item") {
    push("success", `${label} created successfully.`);
  },
  updated(label = "Item") {
    push("success", `${label} updated successfully.`);
  },
  saved(label = "Changes") {
    push("success", `${label} saved successfully.`);
  },
  deleted(label = "Item") {
    push("success", `${label} deleted successfully.`);
  },
  fromError(e: unknown, fallback = "Something went wrong. Please try again.") {
    push("error", formatAdminError(e, fallback));
  },
};
