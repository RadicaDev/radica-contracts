import { NFC } from "nfc-pcsc";
import { clearLines, logger } from "./utils";
import hre from "hardhat";
import { getAddress } from "viem";

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
        const data = await reader.read(0x4, 20);
        if (data.toString("hex") === "0".repeat(data.length * 2)) {
          logger.error(`NFC tag is initialized.`, reader);
          process.exit(-1);
        }

        const tagAddr = getAddress(`0x${data.toString("hex")}`);
        logger.info(`Address retrieved`, reader, tagAddr);

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

          logger.info("Tag Verified!", tokenURI);

          process.exit(0);
        } catch (error) {
          logger.error(`error verifying the tag`, error);
        }
      } catch (error) {
        logger.error(`error reading data`, reader, error);
      }
    });

    reader.on("card.off", async () => {
      logger.error(`card removed`, reader);
      process.exit(-1);
    });

    reader.on("error", (err: any) => {
      logger.error(`an error occurred`, reader, err);
    });

    reader.on("end", () => {
      logger.error(`device removed`, reader);
      process.exit(-1);
    });
  });
}

verifyTag().catch((error) => {
  console.error(error);
  process.exit(-1);
});
