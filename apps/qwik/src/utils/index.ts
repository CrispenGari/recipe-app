import { Buffer } from "buffer";

export const encodeId = (data: string): string => {
  return Buffer.from(data, "utf-8").toString("base64");
};

export const decodeId = (data: string): string => {
  return Buffer.from(data, "base64").toString("utf-8");
};
