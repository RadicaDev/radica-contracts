import { logger } from "./utils";
import hre from "hardhat";

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
  let ownerSupply = await radicaProperty.read.balanceOf([
    owner.account.address,
  ]);
  let index = 0n;
  for (let i = 0; i < ownerSupply; i++) {
    const tokenId = await radicaProperty.read.tokenOfOwnerByIndex([
      owner.account.address,
      index,
    ]);
    ownedTokenIds.push(tokenId);
    index++;
  }

  for (const tokenId of ownedTokenIds) {
    const tagAddr: `0x${string}` = `0x${(tokenId % 2n ** 160n).toString(16)}`;
    const cert = await radicaTag.read.tagAddrToCert([tagAddr]);
    logger.info(`Token ID: ${tokenId}`, cert[1]);
  }
}

getOwned().catch((error) => {
  console.error(error);
  process.exit(-1);
});
