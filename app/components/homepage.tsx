import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
require("@solana/wallet-adapter-react-ui/styles.css");
import styles from "../styles/Home.module.css";
import {
  DidSolIdentifier,
  DidSolService,
  ExtendedCluster,
} from "@identity.com/sol-did-client";
import { useState } from "react";
import useAsyncEffect from "@/hooks/useAsyncEffect";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { useSnackbar } from "notistack";
import Button from "@/components/Button";
import { ScaleLoader } from "react-spinners";
import * as anchor from "@project-serum/anchor";
import vc_test_idl from "@/idl/vc_test.json";
import { Address } from "@project-serum/anchor";
import { didToPDA } from "@/utils/types";

const Homepage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [service, setService] = useState<DidSolService | null>(null);
  const [id, setID] = useState("");
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const { connected, publicKey, signTransaction, signAllTransactions } =
    useWallet();
  const handleGetCredential = async () => {
    if (publicKey && signTransaction && signAllTransactions && !service) {
      if (requesting) return;
      setRequesting(true);
      enqueueSnackbar("Creating Credential", { variant: "info" });
      const cluster: ExtendedCluster = "devnet";
      const didSolIdentifier = DidSolIdentifier.create(publicKey, cluster);
      const new_service = await DidSolService.build(didSolIdentifier, {
        wallet: {
          publicKey,
          signTransaction,
          signAllTransactions,
        },
      });
      try {
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const tx = await new_service.initialize().rpc();
        await connection.confirmTransaction(tx);
        const result = await new_service.getDidAccount();
        if (result) {
          setService(new_service);
          setID(result.identifier.toString());
        }

        enqueueSnackbar("Transaction confirmed", { variant: "success" });
      } catch (error: any) {
        enqueueSnackbar(error.message, { variant: "error" });
      }
      setRequesting(false);
    }
  };

  const handleRemoveCredential = async () => {
    if (publicKey && service) {
      if (requesting) return;
      setRequesting(true);
      enqueueSnackbar("Removing Credential", { variant: "info" });
      try {
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const tx = await service.close(publicKey).rpc();
        await connection.confirmTransaction(tx);
        enqueueSnackbar("The transaction confirmed", { variant: "success" });
        setService(null);
      } catch (error: any) {
        enqueueSnackbar(error.message, { variant: "error" });
      }
      setRequesting(false);
    }
  };

  const handleVerify = async () => {
    if (publicKey && signTransaction && signAllTransactions && id) {
      if (requesting) return;
      setRequesting(true);
      enqueueSnackbar("Verify....", { variant: "info" });
      try {
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const provider = new anchor.AnchorProvider(
          connection,
          { publicKey, signTransaction, signAllTransactions },
          {
            preflightCommitment: "recent",
            commitment: "confirmed",
          }
        );
        const PROGRAM_ID = "Fmubx1pA65pgiZdqNyGkrN1EwxfmkUpUdeXqouKteP8p";
        const DID_SOL_PROGRAM = "didso1Dpqpm4CsiCjzP766BGY89CAdD6ZBL68cRhFPc";
        const program = new anchor.Program(
          vc_test_idl as any,
          PROGRAM_ID as Address,
          provider
        );
        if (program) {
          const didAccount = didToPDA(id);
          const tx = await program.methods
            .verify(didAccount[1])
            .accounts({
              authority: publicKey,
              didProgram: new PublicKey(DID_SOL_PROGRAM),
              did: didAccount[0],
              systemProgram: anchor.web3.SystemProgram.programId,
            })
            .rpc();
          await connection.confirmTransaction(tx);
          enqueueSnackbar("Verified!", {
            variant: "success",
            autoHideDuration: 4000,
          });
        } else {
          throw new Error("No program!");
        }
      } catch (error: any) {
        console.log(error);
        enqueueSnackbar(error.message, { variant: "error" });
      }
      setRequesting(false);
    }
  };

  useAsyncEffect(async () => {
    if (publicKey && signTransaction && signAllTransactions) {
      setLoading(true);
      const cluster: ExtendedCluster = "devnet";
      const didSolIdentifier = DidSolIdentifier.create(publicKey, cluster);
      const service = await DidSolService.build(didSolIdentifier, {
        wallet: {
          publicKey,
          signTransaction,
          signAllTransactions,
        },
      });
      if (service) {
        const result = await service.getDidAccount();
        if (result) {
          setService(service);
          setID(result.identifier.toString());
        }
      }
      setLoading(false);
    }
  }, [publicKey, signTransaction, signAllTransactions]);
  return (
    <div>
      {!connected && (
        <div>
          <WalletMultiButton />
        </div>
      )}
      {connected && (
        <div className="flex flex-col gap-[30px] justify-center items-center">
          <h1 className={styles.title}>Simple DID</h1>
          <WalletMultiButton />
          {loading ? (
            <ScaleLoader color="#36d7b7" />
          ) : service ? (
            <div className="flex flex-col gap-[15px]">
              <span>Identity: {id}</span>
              <Button
                onClick={() => handleRemoveCredential()}
                loading={requesting}
                disabled={requesting}
              >
                Remove Credential
              </Button>
              <Button
                onClick={() => handleVerify()}
                loading={requesting}
                disabled={requesting}
              >
                Verify
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => handleGetCredential()}
              loading={requesting}
              disabled={requesting}
            >
              Get Credential
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Homepage;
