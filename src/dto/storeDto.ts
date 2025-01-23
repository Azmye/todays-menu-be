import { z } from "zod";

export const StoreDtoSchema = z.object({
  storeName: z.string(),
  storeAddress: z.string(),
  storePhone: z.string(),
});

const operatingHour = z.object({
  day: z.string(),
  open: z.string(),
  closed: z.boolean(),
  close: z.string(),
});

export const StoreUpdateDtoSchema = StoreDtoSchema.partial().extend({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  profileImageUrl: z.string().optional(),
  bannerImageUrl: z.string().optional(),
  operatingHours: z.array(operatingHour).optional(),
  storeUrlName: z.string().optional(),
});

export const StoreVerifyDtoSchema = z.object({
  verify: z.boolean(),
});

export type StoreVerifyDto = z.infer<typeof StoreVerifyDtoSchema>;
export type StoreUpdateDto = z.infer<typeof StoreUpdateDtoSchema>;
export type StoreDto = z.infer<typeof StoreDtoSchema>;
