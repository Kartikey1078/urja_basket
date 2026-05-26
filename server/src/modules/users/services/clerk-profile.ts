import type { User } from "@clerk/backend";

import type { UserProfile } from "../user.types";

export function mapClerkUserToProfile(clerkUser: User): UserProfile {
  const primaryEmail =
    clerkUser.emailAddresses.find((entry) => entry.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    null;

  const primaryPhone =
    clerkUser.phoneNumbers.find((entry) => entry.id === clerkUser.primaryPhoneNumberId)
      ?.phoneNumber ??
    clerkUser.phoneNumbers[0]?.phoneNumber ??
    null;

  const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim();
  const name = fullName || clerkUser.username || null;

  return {
    name,
    email: primaryEmail,
    phone: primaryPhone,
    image: clerkUser.imageUrl ?? null,
  };
}
