import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import hre from "hardhat";
import { expect } from "chai";
import { getAddress } from "viem";

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
    it.only("Should create a tag", async function () {
      const { radicaTag, tag } = await loadFixture(deployRadicaTagFixture);

      const tagAddr = tag.account.address;
      const metadata = {
        id: "1",
        name: "test",
        description: "test description",
        imageUrl: "ciao",
        externalUrl: "",
      };
      const proofHash =
        `0x${Buffer.allocUnsafe(32).fill(1).toString("hex")}` as `0x${string}`;

      await radicaTag.write.createTag([tagAddr, metadata, proofHash]);

      expect(await radicaTag.read.balanceOf([tagAddr])).to.equal(1n);

      const uri = await radicaTag.read.tokenURI([0n]);
      console.log(uri);
      console.log(
        JSON.parse(Buffer.from(uri.slice(29), "base64").toString("utf-8")),
      );
    });
    it("Should create a tag", async function () {
      const { radicaTag, tag } = await loadFixture(deployRadicaTagFixture);

      const tagAddr = tag.account.address;
      const uri = "test uri";
      const proofHash =
        `0x${Buffer.allocUnsafe(32).fill(1).toString("hex")}` as `0x${string}`;

      await radicaTag.write.createTag([tagAddr, uri, proofHash]);

      expect(await radicaTag.read.balanceOf([tagAddr])).to.equal(1n);
    });

    it("Should set the correct tokenUri to the Tag", async function () {
      const { radicaTag, tag } = await loadFixture(deployRadicaTagFixture);

      const tagAddr = tag.account.address;
      const uri = "test uri";
      const proofHash =
        `0x${Buffer.allocUnsafe(32).fill(1).toString("hex")}` as `0x${string}`;

      await radicaTag.write.createTag([tagAddr, uri, proofHash]);

      expect(await radicaTag.read.tokenURI([0n])).to.equal(uri);
    });

    it("Should revert if the tag has already been used", async function () {
      const { radicaTag, tag } = await loadFixture(deployRadicaTagFixture);

      const tagAddr = tag.account.address;
      const uri = "test uri";
      const proofHash =
        `0x${Buffer.allocUnsafe(32).fill(1).toString("hex")}` as `0x${string}`;

      await radicaTag.write.createTag([tagAddr, uri, proofHash]);

      expect(radicaTag.write.createTag([tagAddr, uri, proofHash])).to.rejected;
    });
  });

  describe("Transfer", function () {
    it("Should revert when transferring a tag", async function () {
      const { radicaTag, owner, tag } = await loadFixture(
        deployRadicaTagFixture,
      );

      const ownerAddr = owner.account.address;
      const tagAddr = tag.account.address;
      const uri = "test uri";
      const proofHash =
        `0x${Buffer.allocUnsafe(32).fill(1).toString("hex")}` as `0x${string}`;

      await radicaTag.write.createTag([ownerAddr, uri, proofHash]);

      expect(radicaTag.write.safeTransferFrom([ownerAddr, tagAddr, 0n])).to
        .rejected;
    });
  });
});
