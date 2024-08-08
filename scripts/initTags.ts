import { NFC } from "nfc-pcsc";
import { clearLines, logger } from "./utils";

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
        // get a 20 bytes zero array
        const zeroArray = new Uint8Array(20);
        await reader.write(0x4, zeroArray);
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
