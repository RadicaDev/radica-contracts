import { NFC } from "nfc-pcsc";
import {
  clearLines,
  logger,
  getMetadataFromInput,
  getAddressFromUID,
} from "./utils";
import { Metadata } from "./tag-meta";
import hre from "hardhat";
import { randomBytes } from "crypto";
import { keccak256 } from "viem";

async function createTag() {
  console.log("Please connect a NFC reader...");

  const nfc = new NFC();

  nfc.on("reader", (reader: any) => {
    clearLines(1);

    logger.info(`device attached`, reader);

    reader.aid = "F222222222";

    console.log("Please scan a NFC tag...");

    reader.on("card", async () => {
      clearLines(1);
      logger.info(`card detected`, reader);

      // read address from tag
      let tagAddr;
      try {
        tagAddr = await getAddressFromUID(reader);
        logger.info(`Address retrieved`, reader, tagAddr);
      } catch (error) {
        logger.error(`error reading data`, reader, error);
        process.exit(-1);
      }

      const metadataFromInput = await getMetadataFromInput();
      clearLines(5);

      const metadata = new Metadata();
      let metadataUri: string;
      try {
        metadataUri = metadata.format(metadataFromInput);
      } catch (error) {
        logger.error("Error generating metadata", error);
        process.exit(-1);
      }

      const proof = randomBytes(32);
      const proofHash = keccak256(proof);

      // check that the memory for the proof is empty
      // and write the proof to the tag
      try {
        const data = await reader.read(0x15, 32);
        if (data.toString("hex") !== "00".repeat(32)) {
          logger.error(`Tag is not formatted`, reader);
          process.exit(-1);
        }
        reader.write(0x15, proof);
        logger.info(`Proof written to the tag`, reader, proof.toString("hex"));
      } catch (error) {
        logger.error(`error writing the proof to the tag`, reader, error);
        process.exit(-1);
      }

      console.log("");

      try {
        // Mint NFT Tag
        console.log("");

        logger.info("Minting NFT Tag");
        const chainId = !hre.network.config.chainId
          ? 31337
          : hre.network.config.chainId;

        const radicaTagAddr = require(
          `../ignition/deployments/chain-${chainId}/deployed_addresses`,
        )["RadicaTagModule#RadicaTag"];
        const radicaTag = await hre.viem.getContractAt("RadicaTag", radicaTagAddr);

        const tx = await radicaTag.write.createTag([
          tagAddr,
          metadataUri,
          proofHash,
        ]);

        const publicClinet = await hre.viem.getPublicClient();
        const txReceipt = await publicClinet.waitForTransactionReceipt({
          hash: tx,
        });
        logger.info("Tag Created Successfully", {
          transactionHash: txReceipt.transactionHash,
        });

        process.exit(0);
      } catch (error) {
        logger.error(`error minting the tag`, reader, error);
        process.exit(-1);
      }
    });

    reader.on("card.off", async () => {
      logger.error(`card removed`, reader);
      process.exit(-1);
    });

    reader.on("error", (err: any) => {
      logger.error(`an error occurred`, reader, err);
      process.exit(-1);
    });

    reader.on("end", () => {
      logger.error(`device removed`, reader);
      process.exit(-1);
    });
  });

  nfc.on("error", (err: any) => {
    console.log("an error occurred", err);
    process.exit(-1);
  });
}

createTag().catch((error) => {
  console.error(error);
  process.exit(-1);
});
