import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import hre from "hardhat";
import { expect } from "chai";
import { getAddress, keccak256 } from "viem";
import { randomBytes } from "crypto";

import { exampleMetadata } from "./utils/example-metadata";

describe("RadicaProperty", function () {
  async function deployRadicaPropertyFixture() {
    const [owner, tag] = await hre.viem.getWalletClients();

    const radicaTag = await hre.viem.deployContract("RadicaTag");

    const radicaProperty = await hre.viem.deployContract("RadicaProperty", [
      radicaTag.address,
    ]);

    return {
      radicaTag,
      radicaProperty,
      owner,
      tag,
    };
  }

  describe("Deployment", function () {
    it("Should set the right property address", async function () {
      const { radicaTag, radicaProperty } = await loadFixture(
        deployRadicaPropertyFixture,
      );

      expect(await radicaTag.read.radicaPropertyAddr()).to.equal(
        getAddress(radicaProperty.address),
      );
    });
  });

  describe("Claim Property", function () {
    it("Should mint the property nfc of a tag", async function () {
      const { radicaTag, radicaProperty, owner, tag } = await loadFixture(
        deployRadicaPropertyFixture,
      );

      const ownerAddr = owner.account.address;
      const tagAddr = tag.account.address;
      const proof = `0x${randomBytes(32).toString("hex")}` as `0x${string}`;
      const proofHash = keccak256(proof);

      await radicaTag.write.createTag([tagAddr, exampleMetadata, proofHash]);

      const ownerAddrBigInt = BigInt(ownerAddr);
      const tagAddrBigInt = BigInt(tagAddr);

      const ownerFP = ownerAddrBigInt >> 64n;

      const tokenId = (ownerFP << 160n) | tagAddrBigInt;

      await radicaProperty.write.claimProperty([tokenId, proof]);

      expect(await radicaProperty.read.balanceOf([ownerAddr])).to.equal(1n);
      expect(await radicaProperty.read.ownerOf([tokenId])).to.equal(
        getAddress(ownerAddr),
      );
    });

    it("Should fail if an invalid proof is provided", async function () {
      const { radicaTag, radicaProperty, tag, owner } = await loadFixture(
        deployRadicaPropertyFixture,
      );

      const ownerAddr = owner.account.address;
      const tagAddr = tag.account.address;
      const proof = `0x${randomBytes(32).toString("hex")}` as `0x${string}`;
      const wrongProof =
        `0x${randomBytes(32).toString("hex")}` as `0x${string}`;
      const proofHash = keccak256(proof);

      await radicaTag.write.createTag([tagAddr, exampleMetadata, proofHash]);

      const ownerAddrBigInt = BigInt(ownerAddr);
      const tagAddrBigInt = BigInt(tagAddr);

      const ownerFP = ownerAddrBigInt >> 64n;

      const tokenId = (ownerFP << 160n) | tagAddrBigInt;

      await radicaProperty.write.claimProperty([tokenId, proof]);
      expect(radicaProperty.write.claimProperty([tokenId, wrongProof])).to
        .rejected;
    });
  });
});
