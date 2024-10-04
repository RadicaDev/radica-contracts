import { keccak256, verifyMessage } from "viem";
import { privateKeyToAddress } from "viem/accounts";
import addr from "../../crypto-keys/address";

export async function getAddressFromUIDWithProof(reader: any) {
  const uid = await reader.read(0, 8);
  const sig = await reader.read(0x4, 65);
  const proof = await reader.read(0x15, 32);

  const isValid = await verifyMessage({
    address: addr,
    message: { raw: `0x${uid.toString("hex")}` },
    signature: sig,
  });

  if (!isValid) {
    throw new Error("Invalid Signature");
  }

  return [privateKeyToAddress(keccak256(uid)), `0x${proof.toString("hex")}`];
}
