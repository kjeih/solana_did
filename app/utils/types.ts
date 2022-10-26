import { PublicKey } from "@solana/web3.js";
import { DidSolIdentifier } from "@identity.com/sol-did-client";

/**
 * New Type
 * By: Alex
 */
export type AnyFn = (...args: any[]) => any;
export type AnyObj = { [key: string]: any };
export type MayFunction<T, Params extends any[] = []> =
  | T
  | ((...params: Params) => T);
export const isArray = Array.isArray;
export type MayArray<T> = T | T[];
export type Primitive = boolean | number | string | bigint;
export type NotFunctionValue = Exclude<any, AnyFn>;
export type ObjectNotArray = { [key: string]: any };
export function isValidePublicKey(val: string | undefined): val is string;
export function isValidePublicKey(val: PublicKey | undefined): val is PublicKey;
export function isValidePublicKey(
  val: string | PublicKey | undefined
): val is string {
  if (!val) return false;
  if (val instanceof PublicKey) return true;
  try {
    new PublicKey(val);
  } catch (err) {
    return false;
  }
  return true;
}

export const didToPDA = (did: string): [PublicKey, number] =>
  DidSolIdentifier.parse(did).dataAccount();
