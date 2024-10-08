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

  const radicaTagAddr = require(
    `../ignition/deployments/chain-${chainId}/deployed_addresses`,
  )["RadicaTagModule#RadicaTag"];
  const radicaTag = await hre.viem.getContractAt("RadicaTag", radicaTagAddr);

  const radicaPropertyAddr = require(
    `../ignition/deployments/chain-${chainId}/deployed_addresses`,
  )["RadicaTagModule#RadicaProperty"];
  const radicaProperty = await hre.viem.getContractAt(
    "RadicaProperty",
    radicaPropertyAddr,
  );

  const ownedTokenIds = [];
  let ownerSupply = await radicaProperty.read.balanceOf([owner.account.address]);
  let index = 0n;

  while (ownerSupply > 0) {
    const _owner = await radicaProperty.read.ownerOf([index]);
    if (_owner === getAddress(owner.account.address)) {
      ownedTokenIds.push(index);
      ownerSupply -= 1n;
    }

    index += 1n;
  }

  const metadata = new Metadata();

  for (const tokenId of ownedTokenIds) {
    const tokenURI = await radicaTag.read.tokenURI([tokenId]);
    const metadataJson = metadata.parse(tokenURI);
    logger.info(`Token ID: ${tokenId}`, metadataJson);
  }
}

getOwned().catch((error) => {
  console.error(error);
  process.exit(-1);
});
