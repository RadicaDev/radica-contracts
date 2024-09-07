import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import hre from "hardhat";
import { expect } from "chai";
import { getAddress, keccak256 } from "viem";
import { randomBytes } from "crypto";

describe("RadixProperty", function () {
  async function deployRadixPropertyFixture() {
    const [owner, tag] = await hre.viem.getWalletClients();

    const radixTag = await hre.viem.deployContract("RadixTag");

    const radixProperty = await hre.viem.deployContract("RadixProperty", [
      radixTag.address,
    ]);

    return {
      radixTag,
      radixProperty,
      owner,
      tag,
    };
  }

  describe("Deployment", function () {
    it("Should set the right property address", async function () {
      const { radixTag, radixProperty } = await loadFixture(
        deployRadixPropertyFixture,
      );

      expect(await radixTag.read.radixPropertyAddr()).to.equal(
        getAddress(radixProperty.address),
      );
    });
  });

  describe("Claim Property", function () {
    it("Should mint the property nfc of a tag", async function () {
      const { radixTag, radixProperty, owner, tag } = await loadFixture(
        deployRadixPropertyFixture,
      );

      const ownerAddr = owner.account.address;
      const tagAddr = tag.account.address;
      const uri = "test uri";
      const proof = `0x${randomBytes(32).toString("hex")}` as `0x${string}`;
      const proofHash = keccak256(proof);

      await radixTag.write.createTag([tagAddr, uri, proofHash]);

      const tokenId = await radixTag.read.tokenOfOwnerByIndex([tagAddr, 0n]);
      await radixProperty.write.claimProperty([tokenId, proof, uri]);

      expect(await radixProperty.read.balanceOf([ownerAddr])).to.equal(1n);
      expect(await radixProperty.read.ownerOf([tokenId])).to.equal(
        getAddress(ownerAddr),
      );
    });

    it("Should fail if an invalid proof is provided", async function () {
      const { radixTag, radixProperty, tag } = await loadFixture(
        deployRadixPropertyFixture,
      );

      const tagAddr = tag.account.address;
      const uri = "test uri";
      const proof = `0x${randomBytes(32).toString("hex")}` as `0x${string}`;
      const wrongProof =
        `0x${randomBytes(32).toString("hex")}` as `0x${string}`;
      const proofHash = keccak256(proof);

      await radixTag.write.createTag([tagAddr, uri, proofHash]);

      const tokenId = await radixTag.read.tokenOfOwnerByIndex([tagAddr, 0n]);
      expect(
        radixProperty.write.claimProperty([tokenId, wrongProof, uri]),
      ).to.rejectedWith("Invalid proof");
    });
  });
});
