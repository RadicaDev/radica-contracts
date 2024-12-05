import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import hre from "hardhat";
import { expect } from "chai";
import { getAddress } from "viem";

import {
  exampleMetadata,
  exampleTracebilityMetadata,
} from "./utils/example-metadata";

describe("RadicaTag", function () {
  async function deployRadicaTagFixture() {
    const [owner, tag] = await hre.viem.getWalletClients();

    const radicaTag = await hre.viem.deployContract("RadicaTag");

    return {
      radicaTag,
      owner,
      tag,
    };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { radicaTag, owner } = await loadFixture(deployRadicaTagFixture);

      expect(await radicaTag.read.owner()).to.equal(
        getAddress(owner.account.address),
      );
    });
  });

  describe("Tag Creation", function () {
    it("Should create a tag", async function () {
      const { radicaTag, tag } = await loadFixture(deployRadicaTagFixture);

      const tagAddr = tag.account.address;
      const proofHash =
        `0x${Buffer.allocUnsafe(32).fill(1).toString("hex")}` as `0x${string}`;

      await radicaTag.write.createTag([
        tagAddr,
        exampleMetadata,
        exampleTracebilityMetadata,
        proofHash,
      ]);

      const cert = await radicaTag.read.tagAddrToCert([tagAddr]);
      expect(cert[0]).not.to.equal(0n);
    });

    it("Should set the correct certId to the Tag", async function () {
      const { radicaTag, owner, tag } = await loadFixture(
        deployRadicaTagFixture,
      );

      const ownerAddr = owner.account.address;
      const tagAddr = tag.account.address;
      const proofHash =
        `0x${Buffer.allocUnsafe(32).fill(1).toString("hex")}` as `0x${string}`;

      await radicaTag.write.createTag([
        tagAddr,
        exampleMetadata,
        exampleTracebilityMetadata,
        proofHash,
      ]);

      const cert = await radicaTag.read.tagAddrToCert([tagAddr]);
      const certId = cert[0];

      const ownerAddrBigInt = BigInt(ownerAddr);
      const tagAddrBigInt = BigInt(tagAddr);

      const ownerFP = ownerAddrBigInt >> 64n;

      const expectedCertId = (ownerFP << 160n) | tagAddrBigInt;

      expect(certId).to.equal(expectedCertId);
    });

    it("Should set the correct metadata to the Tag", async function () {
      const { radicaTag, tag } = await loadFixture(deployRadicaTagFixture);

      const tagAddr = tag.account.address;
      const proofHash =
        `0x${Buffer.allocUnsafe(32).fill(1).toString("hex")}` as `0x${string}`;

      await radicaTag.write.createTag([
        tagAddr,
        exampleMetadata,
        exampleTracebilityMetadata,
        proofHash,
      ]);

      const cert = await radicaTag.read.tagAddrToCert([tagAddr]);
      const metadataFromContract = cert[1];
      const tracebilityMetadataFromContract = cert[2];

      expect(exampleMetadata.serialNumber).to.equal(
        metadataFromContract.serialNumber,
      );
      expect(exampleMetadata.name).to.equal(metadataFromContract.name);
      expect(exampleMetadata.description).to.equal(
        metadataFromContract.description,
      );
      expect(exampleMetadata.image).to.equal(metadataFromContract.image);
      expect(exampleMetadata.manufacturer).to.equal(
        metadataFromContract.manufacturer,
      );
      expect(exampleMetadata.externalUrl).to.equal(
        metadataFromContract.externalUrl,
      );
      expect(exampleTracebilityMetadata.batchId).to.equal(
        tracebilityMetadataFromContract.batchId,
      );
      expect(exampleTracebilityMetadata.supplierChainHash).to.equal(
        tracebilityMetadataFromContract.supplierChainHash,
      );
    });

    it("Should revert if the tag has already been used", async function () {
      const { radicaTag, tag } = await loadFixture(deployRadicaTagFixture);

      const tagAddr = tag.account.address;
      const proofHash =
        `0x${Buffer.allocUnsafe(32).fill(1).toString("hex")}` as `0x${string}`;

      await radicaTag.write.createTag([tagAddr, exampleMetadata, proofHash]);

      expect(radicaTag.write.createTag([tagAddr, exampleMetadata, proofHash]))
        .to.rejected;
    });
  });
});
