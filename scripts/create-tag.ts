import { NFC } from "nfc-pcsc";
import { generatePrivateKey, privateKeyToAddress } from "viem/accounts";
import { clearLines, logger } from "./utils";
import hre from "hardhat";
import { Metadata } from "./tag-meta";
import { getMetadataFromInput } from "./utils/getMetadataFromInput";

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

      // Generate Random Ethereum Account
      console.log("");

      const testPrivateKey = generatePrivateKey();
      logger.info("Generating Private Key", testPrivateKey);

      const testAddress = privateKeyToAddress(testPrivateKey);
      logger.info("Generating Address", testAddress);

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
        logger.info("Writing data on the tag", reader);
        await reader.write(0x4, Buffer.from(testAddress.substring(2), "hex"));
        logger.info(`Data write completed`, reader);

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

        const tx = await radixTag.write.createTag([testAddress, metadataUri]);

        const publicClinet = await hre.viem.getPublicClient();
        const txReceipt = await publicClinet.waitForTransactionReceipt({
          hash: tx,
        });
        // logger.info("Tag Created Successfully", txReceipt);
        logger.info("Tag Created Successfully", {
          transactionHash: txReceipt.transactionHash,
        });

        process.exit(0);
      } catch (error) {
        logger.error(`error writing data`, reader, error);
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
