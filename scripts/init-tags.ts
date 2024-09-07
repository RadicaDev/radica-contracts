import { NFC } from "nfc-pcsc";
import { clearLines, logger } from "./utils";
import { readFileSync } from "fs";
import { createSign } from "crypto";

async function initTags() {
  let sk: string;
  try {
    sk = readFileSync("crypto-keys/ec-secp256k1-sk.pem", "utf-8");
  } catch (error) {
    logger.error("Error reading private key", error);
    process.exit(-1);
  }

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
        logger.info("Initializing the tag", reader);
        // get uid from the tag
        const uid = await reader.read(0, 8);

        // sign the uid
        const sig = createSign("SHA256").update(uid).sign(sk);
        const sigLen = Buffer.allocUnsafe(4);
        sigLen.fill(0);
        sigLen.writeUInt32BE(sig.length);

        // make the signature to be 72 bytes
        const sigBuf = Buffer.allocUnsafe(72).fill(0);
        sig.copy(sigBuf);

        await reader.write(0x4, sigLen);
        await reader.write(0x5, sigBuf);

        // format the next 32 bytes
        const zeroBuf = Buffer.allocUnsafe(32).fill(0);
        await reader.write(0x17, zeroBuf);

        logger.info(`Data write completed`, reader);

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
}

initTags().catch((error) => {
  console.error(error);
  process.exit(1);
});
