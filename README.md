# Radica Contracts

Radica is a project that aims to provide authentication for products using NFC and Blockchain technology. This repository contains the smart contracts that will be used to manage the authentication process along with other features.

## Requirements

- Node.js
- NFC Reader (ACR122U)
- NFC Tags (ISO 14443, Type 2, NFC Forum Type 2)

> [!WARNING]
> Node at version 23 has some incompatibilities with the nfc-pcsc library. Please use Node version 22 or lower.

> **_Note:_** If you do not have an NFC Reader or NFC Tags, you can still run the project without them. You will not be able to test the NFC functionality, but you can still test the smart contracts.

## Installation

Clone the repository and install the dependencies.

```bash
git clone https://github.com/RadicaDev/radica-contracts.git

```

Change directory to the project folder.

```bash
cd radica-contracts
```

Install the dependencies.
```bash
npm install 
```

## Usage

### Local Development

#### Deployment

To deploy the smart contracts to a local blockchain, use the following command.

```bash
npx hardhat node --hostname 0.0.0.0
```

> **_Note:_** The `--hostname` flag is used to allow connections from other devices on the network. If you do not want to use the mobile app, you can omit this flag.

In a new terminal, deploy the contracts to the local blockchain.

```bash
npx hardhat ignition deploy ./ignition/modules/RadicaTag.ts --network localhost
```

#### Create a Tag

Before creating a new tag, you need to initialize it. Be sure to have the cryptographic keys in the `./crypto-keys` folder.

Run the following command to create the keys.
```bash
node init-keys.cjs
```

Run the following command to initialize the tags.
```bash
npx hardhat run scripts/init-tags.ts
```
Exit with `Ctrl + C` when you have initialized all the tags.

> **_Note:_** The `init-tags.ts` is needed since we are not using the official NFC tags. In order to make this tool accessible to everyone, we use standard NFC tags and we simulate the signature verification process.

To create a new tag, use the following command.

```bash
npx hardhat run scripts/create-tag.ts --network localhost
```

You can also use the `create-tags.ts` script to create multiple tags at once.

#### Verify a Tag

To verify a tag, use the following command.

```bash
npx hardhat run scripts/verify-tag.ts --network localhost
```

You can also use the `verify-tags.ts` script to verify multiple tags at once.

### Hedera Testnet

To interact with the Hedera Testnet, you need to import your own private key. The private key should be stored in the `.env` file, you can create one from an example template like this:

```bash
cp .env.example .env
```

and then paste your private key in the `.env` file.

> [!NOTE]
> You do not need to deploy the contracts on the Hedera Testnet, they are already deployed.

#### Create a Tag

Before creating a tag you should initialize the NFC tag.

```bash
npx hardhat run scripts/init-tags.ts
```

this script allow you to initialize multimple tags.

To create a new tag, use the following command.

```bash
npx hardhat run scripts/create-tag.ts --network hederaTestnet
```

you can use the `create-tags.ts` script to create multiple tags at once.

#### Verify a Tag

To verify a tag, use the following command.

```bash
npx hardhat run scripts/verify-tag.ts --network hederaTestnet
```

you can use the `verify-tags.ts` script to verify multiple tags at once.

## Testing

To run the tests, use the following command.

```bash
npm test
```

## License

[MIT](./LICENSE)
