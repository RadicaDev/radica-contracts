import { NFC } from "nfc-pcsc";
import { clearLines, getAddressFromUIDWithProof, logger } from "./utils";
import hre from "hardhat";

async function claimProperty() {
  console.log("Please connect a NFC reader...");

  const nfc = new NFC();

  nfc.on("reader", (reader: any) => {
    clearLines(1);

    logger.info(`device attached`, reader);

    reader.aid = "F222222222";

    console.log("Please scan a NFC tag...");

    reader.on("card", async () => {
      // 1. verify the tag and retrieve the tag address and the proof
      // 2. get the token ID of the tag NFC
      // 3. claim the property NFC
      clearLines(1);
      logger.info(`card detected`, reader);

      let tagAddr;
      let proof;
      try {
        [tagAddr, proof] = await getAddressFromUIDWithProof(reader);
        logger.info(`Address retrieved`, reader, tagAddr);
        logger.info(`Proof retrieved`, reader, proof);
      } catch (error) {
        logger.error(`error reading data`, reader, error);
        process.exit(-1);
      }

      console.log("");

      try {
        console.log("");

        logger.info("Claiming Property NFT");
        const chainId = !hre.network.config.chainId
          ? 31337
          : hre.network.config.chainId;

        const radicaPropertyAddr = require(
          `../ignition/deployments/chain-${chainId}/deployed_addresses`,
        )["RadicaTagModule#RadicaProperty"];
        const radicaProperty = await hre.viem.getContractAt(
          "RadicaProperty",
          radicaPropertyAddr,
        );

        const [radica] = await hre.viem.getWalletClients();
        const radicaAddr = radica.account.address;

        const radicaAddressBigInt = BigInt(radicaAddr);
        const tagAddressBigInt = BigInt(tagAddr);

        const radicaFP = radicaAddressBigInt >> 64n;

        const tokenId = (radicaFP << 160n) | tagAddressBigInt;

        const tx = await radicaProperty.write.claimProperty([
          tokenId,
          proof as `0x${string}`,
        ]);

        const publicClinet = await hre.viem.getPublicClient();
        const txReceipt = await publicClinet.waitForTransactionReceipt({
          hash: tx,
        });
        logger.info("Property Claimed Successfully", {
          transactionHash: txReceipt.transactionHash,
        });

        process.exit(0);
      } catch (error) {
        logger.error(`error claiming the property`);
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

claimProperty().catch((error) => {
  console.error(error);
  process.exit(-1);
});
