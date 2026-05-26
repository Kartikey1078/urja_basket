import { getAuth } from "@clerk/express";
import type { Request, Response } from "express";

import { HttpError } from "../../../errors/httpError";
import * as userService from "../services/user.service";

export async function getMe(req: Request, res: Response) {
  const clerkId = getAuth(req).userId;
  if (!clerkId) {
    throw new HttpError(401, "Unauthorized");
  }

  const user = await userService.syncUserFromClerk(clerkId);
  res.json({ data: user });
}
