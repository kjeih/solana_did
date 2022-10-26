import * as anchor from "@project-serum/anchor";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { DidSolIdentifier } from "@identity.com/sol-did-client";

const envProvider = anchor.AnchorProvider.env();

export const fund = async (
  publicKey: PublicKey,
  amount: number = LAMPORTS_PER_SOL
): Promise<void> => {
  await envProvider.connection.requestAirdrop(publicKey, amount).then(confirm);
};

export const confirm = async (txSig: string): Promise<void> => {
  const blockhash = await envProvider.connection.getLatestBlockhash();
  await envProvider.connection.confirmTransaction(
    {
      ...blockhash,
      signature: txSig,
    },
    "confirmed"
  );
};

export const balanceOf = (publicKey: PublicKey): Promise<number> =>
  envProvider.connection
    .getAccountInfo(publicKey)
    .then((a) => (a ? a.lamports : 0));

export const didToPDA = (did: string): [PublicKey, number] =>
  DidSolIdentifier.parse(did).dataAccount();
