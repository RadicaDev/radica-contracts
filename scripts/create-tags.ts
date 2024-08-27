import { NFC } from "nfc-pcsc";
import { clearLines, getAddressFromUID, logger } from "./utils";
import hre from "hardhat";
import { Metadata } from "./tag-meta";
import { getMetadataFromInput } from "./utils/getMetadataFromInput";

async function createTags() {
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

      console.log("");

      try {
        // Mint NFT Tag
        console.log("");

        logger.info("Minting NFT Tag");
        const chainId = !hre.network.config.chainId
          ? 31337
          : hre.network.config.chainId;

        const radixTagAddr = require(
          `../ignition/deployments/chain-${chainId}/deployed_addresses`,
        )["RadixTagModule#RadixTag"];
        const radixTag = await hre.viem.getContractAt("RadixTag", radixTagAddr);

        // check that tag does not already exist
        const balance = await radixTag.read.balanceOf([tagAddr]);
        if (balance > 0) {
          logger.error("Tag already initialized", reader);
          console.log("Please remove the tag from the reader...");
          return;
        }

        const tx = await radixTag.write.createTag([tagAddr, metadataUri]);

        const publicClinet = await hre.viem.getPublicClient();
        const txReceipt = await publicClinet.waitForTransactionReceipt({
          hash: tx,
        });
        logger.info("Tag Created Successfully", {
          transactionHash: txReceipt.transactionHash,
        });
        console.log("Remove the tag from the reader...");
      } catch (error) {
        logger.error(`error writing data`, reader, error);
        process.exit(-1);
      }
    });

    reader.on("card.off", async () => {
      clearLines(1);
      logger.info(`card removed`, reader);
      console.log("Please scan a NFC tag...");
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

createTags().catch((error) => {
  console.error(error);
  process.exit(-1);
});
