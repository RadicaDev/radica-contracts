import { NFC } from "nfc-pcsc";
import { clearLines, logger } from "./utils";
import { privateKeyToAccount } from "viem/accounts";
import sk from "../crypto-keys/privateKey";

async function initTags() {
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
        const signer = privateKeyToAccount(sk);
        const sigHex = await signer.signMessage({
          message: { raw: uid },
        });
        let sig = Buffer.from(sigHex.slice(2), "hex");

        // pad the signature to be 68 bytes
        const padding = Buffer.allocUnsafe(68 - sig.length).fill(0);
        sig = Buffer.concat([sig, padding]);

        await reader.write(0x4, sig);

        // format the next 32 bytes
        const zeroBuf = Buffer.allocUnsafe(32).fill(0);
        await reader.write(0x15, zeroBuf);

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
