import { createHash } from "crypto";
import { privateKeyToAddress } from "viem/accounts";

export async function getAddressFromUID(reader: any) {
  const data = await reader.read(0, 8);
  const tmpPrivateKey = createHash("sha256").update(data).digest("hex");
  return privateKeyToAddress(`0x${tmpPrivateKey}`);
}
