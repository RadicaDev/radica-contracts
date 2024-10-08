import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import hre from "hardhat";
import { expect } from "chai";
import { getAddress, keccak256 } from "viem";
import { randomBytes } from "crypto";

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
      const uri = "test uri";
      const proof = `0x${randomBytes(32).toString("hex")}` as `0x${string}`;
      const proofHash = keccak256(proof);

      await radicaTag.write.createTag([tagAddr, uri, proofHash]);

      const tokenId = await radicaTag.read.tokenOfOwnerByIndex([tagAddr, 0n]);
      await radicaProperty.write.claimProperty([tokenId, proof, uri]);

      expect(await radicaProperty.read.balanceOf([ownerAddr])).to.equal(1n);
      expect(await radicaProperty.read.ownerOf([tokenId])).to.equal(
        getAddress(ownerAddr),
      );
    });

    it("Should fail if an invalid proof is provided", async function () {
      const { radicaTag, radicaProperty, tag } = await loadFixture(
        deployRadicaPropertyFixture,
      );

      const tagAddr = tag.account.address;
      const uri = "test uri";
      const proof = `0x${randomBytes(32).toString("hex")}` as `0x${string}`;
      const wrongProof =
        `0x${randomBytes(32).toString("hex")}` as `0x${string}`;
      const proofHash = keccak256(proof);

      await radicaTag.write.createTag([tagAddr, uri, proofHash]);

      const tokenId = await radicaTag.read.tokenOfOwnerByIndex([tagAddr, 0n]);
      expect(radicaProperty.write.claimProperty([tokenId, wrongProof, uri])).to
        .rejected;
    });
  });
});
