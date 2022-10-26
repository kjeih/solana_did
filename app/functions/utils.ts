import { AnyFn } from "@/utils/types";

export function isFunction(value: unknown): value is AnyFn {
  return typeof value === "function";
}
