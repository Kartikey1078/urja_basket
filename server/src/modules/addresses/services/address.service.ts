import { HttpError } from "../../../errors/httpError";
import { findUserByClerkId } from "../../users/repositories/user.repository";
import { composeAddressLines, rowToDto } from "../address.mapper";
import type { AddressDto, AddressInput } from "../address.types";
import * as addressRepo from "../repositories/address.repository";

async function resolveUserId(clerkId: string): Promise<number> {
  const user = await findUserByClerkId(clerkId);
  if (!user) {
    throw new HttpError(401, "User profile not found. Call GET /api/me first.");
  }
  return user.id;
}

export async function listAddresses(clerkId: string): Promise<AddressDto[]> {
  const userId = await resolveUserId(clerkId);
  const rows = await addressRepo.listAddressesByUserId(userId);
  return rows.map(rowToDto);
}

export async function createAddress(
  clerkId: string,
  input: AddressInput
): Promise<AddressDto> {
  const userId = await resolveUserId(clerkId);
  const lines = composeAddressLines(input);

  if (input.isDefault) {
    await addressRepo.clearDefaultForUser(userId);
  } else {
    const existing = await addressRepo.listAddressesByUserId(userId);
    if (existing.length === 0) {
      input = { ...input, isDefault: true };
    }
  }

  const id = await addressRepo.insertAddress(userId, input, lines);
  const row = await addressRepo.findAddressById(id, userId);
  if (!row) {
    throw new HttpError(500, "Failed to create address");
  }
  return rowToDto(row);
}

export async function updateAddress(
  clerkId: string,
  addressId: number,
  input: AddressInput
): Promise<AddressDto> {
  const userId = await resolveUserId(clerkId);
  const existing = await addressRepo.findAddressById(addressId, userId);
  if (!existing) {
    throw new HttpError(404, "Address not found");
  }

  if (input.isDefault) {
    await addressRepo.clearDefaultForUser(userId);
  }

  const lines = composeAddressLines(input);
  await addressRepo.updateAddress(addressId, userId, input, lines);
  const row = await addressRepo.findAddressById(addressId, userId);
  if (!row) {
    throw new HttpError(500, "Failed to update address");
  }
  return rowToDto(row);
}

export async function deleteAddress(clerkId: string, addressId: number): Promise<void> {
  const userId = await resolveUserId(clerkId);
  const existing = await addressRepo.findAddressById(addressId, userId);
  if (!existing) {
    throw new HttpError(404, "Address not found");
  }

  const wasDefault = existing.is_default === 1;
  const deleted = await addressRepo.deleteAddress(addressId, userId);
  if (!deleted) {
    throw new HttpError(404, "Address not found");
  }

  if (wasDefault) {
    const remaining = await addressRepo.listAddressesByUserId(userId);
    if (remaining.length > 0) {
      await addressRepo.setDefaultAddress(remaining[0].id, userId);
    }
  }
}

export async function setDefaultAddress(
  clerkId: string,
  addressId: number
): Promise<AddressDto> {
  const userId = await resolveUserId(clerkId);
  const ok = await addressRepo.setDefaultAddress(addressId, userId);
  if (!ok) {
    throw new HttpError(404, "Address not found");
  }
  const row = await addressRepo.findAddressById(addressId, userId);
  if (!row) {
    throw new HttpError(404, "Address not found");
  }
  return rowToDto(row);
}
