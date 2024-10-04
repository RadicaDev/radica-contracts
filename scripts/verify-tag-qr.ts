import { NFC } from "nfc-pcsc";
import { clearLines, getAddressFromUID, logger } from "./utils";
import hre from "hardhat";
import { Metadata } from "./tag-meta";
import qrcode from "qrcode-terminal";

async function verifyTag() {
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

      try {
        const tagAddr = await getAddressFromUID(reader);
        logger.info(`Address retrieved`, reader, tagAddr);
        qrcode.generate(tagAddr, { small: true });

        try {
          console.log("");

          const chainId = !hre.network.config.chainId
            ? 31337
            : hre.network.config.chainId;

          const radixTagAddr = require(
            `../ignition/deployments/chain-${chainId}/deployed_addresses`,
          )["RadixTagModule#RadixTag"];
          const radixTag = await hre.viem.getContractAt(
            "RadixTag",
            radixTagAddr,
          );

          const balance = await radixTag.read.balanceOf([tagAddr]);
          if (balance === 0n) {
            logger.error(`Tag NOT verified`);
            process.exit(-1);
          }

          const tokenId = await radixTag.read.tokenOfOwnerByIndex([
            tagAddr,
            0n,
          ]);

          const tokenURI = await radixTag.read.tokenURI([tokenId]);

          const metadata = new Metadata();
          const metadataJson = metadata.parse(tokenURI);

          logger.info("Tag Verified!", metadataJson);

          process.exit(0);
        } catch (error) {
          logger.error(`error verifying the tag`);
          process.exit(-1);
        }
      } catch (error) {
        logger.error(`error reading data`, reader, error);
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

verifyTag().catch((error) => {
  console.error(error);
  process.exit(-1);
});