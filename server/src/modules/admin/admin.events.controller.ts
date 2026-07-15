import type { Request, Response } from "express";

import { registerAdminSseClient } from "../../realtime/admin-notify";

export function adminOrderEvents(_req: Request, res: Response) {
  registerAdminSseClient(res);
}
