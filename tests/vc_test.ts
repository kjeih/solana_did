import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { VcTest } from "../target/types/vc_test";
import { Wallet as NodeWallet } from "@project-serum/anchor";
import { didToPDA, fund } from "./utils";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import {
  DidSolIdentifier,
  DidSolService,
  ExtendedCluster,
} from "@identity.com/sol-did-client";
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
const program = anchor.workspace.VcTest as Program<VcTest>;
const authority = Keypair.generate();
export const DID_SOL_PREFIX = "did:sol:devnet";
export const DID_SOL_PROGRAM = new PublicKey(
  "didso1Dpqpm4CsiCjzP766BGY89CAdD6ZBL68cRhFPc"
);

describe("vc_test", () => {
  it("1. Prepare", async () => {
    await fund(authority.publicKey, 10 * LAMPORTS_PER_SOL);
  });
  it("2. Get Credential", async () => {
    const cluster: ExtendedCluster = "localnet";
    const didSolIdentifier = DidSolIdentifier.create(
      authority.publicKey,
      cluster
    );
    const service = await DidSolService.build(didSolIdentifier, {
      wallet: new NodeWallet(authority),
    });

    const didDoc = await service.resolve();
    console.log(JSON.stringify(didDoc, null, 2));
    await service.initialize().rpc();
  });

  it("3. Verify Credential", async () => {
    const did = DID_SOL_PREFIX + ":" + authority.publicKey;
    const didAccount = didToPDA(did);

    await program.methods
      .verify(didAccount[1])
      .accounts({
        authority: authority.publicKey,
        didProgram: DID_SOL_PROGRAM,
        did: didAccount[0],
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([authority])
      .rpc();
  });
});
