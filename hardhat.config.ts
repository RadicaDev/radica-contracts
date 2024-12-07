import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "dotenv/config";

const HEDERA_PRIVATE_KEY = process.env.HEDERA_PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    oracle: {
      url: "https://hardhat.radica.dev",
    },
    hederaTestnet: {
      url: "https://testnet.hashio.io",
      accounts: [HEDERA_PRIVATE_KEY],
      chainId: 296,
    },
  },
};

export default config;
