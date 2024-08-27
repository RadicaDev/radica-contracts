import { createHash, createVerify } from "crypto";
import { readFileSync } from "fs";
import { privateKeyToAddress } from "viem/accounts";

export async function getAddressFromUID(reader: any) {
  const pk = readFileSync("crypto-keys/ec-secp256k1-pk.pem", "utf-8");

  const uid = await reader.read(0, 8);
  const sigLen = (await reader.read(0x4, 4)).readUInt32BE();
  const sig = await reader.read(0x5, 72);

  const sigSliced = sig.slice(0, sigLen);
  const isValid = createVerify("SHA256").update(uid).verify(pk, sigSliced);

  if (!isValid) {
    throw new Error("Invalid Signature");
  }

  const tmpPrivateKey = createHash("sha256").update(uid).digest("hex");
  return privateKeyToAddress(`0x${tmpPrivateKey}`);
}
