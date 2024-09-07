import { logger } from "./utils";
import hre from "hardhat";
import { getAddress } from "viem";
import { Metadata } from "./tag-meta";

async function getOwned() {
  logger.info("Getting owned NFC");

  const [owner] = await hre.viem.getWalletClients();

  const chainId = !hre.network.config.chainId
    ? 31337
    : hre.network.config.chainId;

  const radixTagAddr = require(
    `../ignition/deployments/chain-${chainId}/deployed_addresses`,
  )["RadixTagModule#RadixTag"];
  const radixTag = await hre.viem.getContractAt("RadixTag", radixTagAddr);

  const radixPropertyAddr = require(
    `../ignition/deployments/chain-${chainId}/deployed_addresses`,
  )["RadixTagModule#RadixProperty"];
  const radixProperty = await hre.viem.getContractAt(
    "RadixProperty",
    radixPropertyAddr,
  );

  const ownedTokenIds = [];
  let ownerSupply = await radixProperty.read.balanceOf([owner.account.address]);
  let index = 0n;

  while (ownerSupply > 0) {
    const _owner = await radixProperty.read.ownerOf([index]);
    if (_owner === getAddress(owner.account.address)) {
      ownedTokenIds.push(index);
      ownerSupply -= 1n;
    }

    index += 1n;
  }

  const metadata = new Metadata();

  for (const tokenId of ownedTokenIds) {
    const tokenURI = await radixTag.read.tokenURI([tokenId]);
    const metadataJson = metadata.parse(tokenURI);
    logger.info(`Token ID: ${tokenId}`, metadataJson);
  }
}

getOwned().catch((error) => {
  console.error(error);
  process.exit(-1);
});
