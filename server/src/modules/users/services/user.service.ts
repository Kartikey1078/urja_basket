import { clerkClient } from "@clerk/express";

import { HttpError } from "../../../errors/httpError";
import * as userRepository from "../repositories/user.repository";
import type { UserRow } from "../user.types";
import { mapClerkUserToProfile } from "./clerk-profile";

async function fetchClerkProfile(clerkId: string) {
  try {
    const clerkUser = await clerkClient.users.getUser(clerkId);
    return mapClerkUserToProfile(clerkUser);
  } catch {
    throw new HttpError(502, "Failed to fetch user from Clerk");
  }
}

export async function syncUserFromClerk(clerkId: string): Promise<UserRow> {
  const profile = await fetchClerkProfile(clerkId);
  const existing = await userRepository.findUserByClerkId(clerkId);

  if (existing) {
    const updated = await userRepository.updateUserFromClerk(clerkId, profile);
    return updated ?? existing;
  }

  try {
    return await userRepository.createUserFromClerk(clerkId, profile);
  } catch (err) {
    const duplicate =
      err instanceof Error &&
      "code" in err &&
      (err as { code?: string }).code === "ER_DUP_ENTRY";

    if (duplicate) {
      const raced = await userRepository.findUserByClerkId(clerkId);
      if (raced) {
        const updated = await userRepository.updateUserFromClerk(clerkId, profile);
        return updated ?? raced;
      }
    }

    throw err;
  }
}

/** @deprecated Use syncUserFromClerk */
export const getOrCreateUserByClerkId = syncUserFromClerk;
