import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import hre from "hardhat";
import { expect } from "chai";
import { getAddress } from "viem";

describe("RadixTag", function () {
  async function deployRadixTagFixture() {
    const [owner, tag] = await hre.viem.getWalletClients();

    const radixTag = await hre.viem.deployContract("RadixTag");

    return {
      radixTag,
      owner,
      tag,
    };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { radixTag, owner } = await loadFixture(deployRadixTagFixture);

      expect(await radixTag.read.owner()).to.equal(
        getAddress(owner.account.address),
      );
    });
  });

  describe("Tag Creation", function () {
    it("Should create a tag", async function () {
      const { radixTag, tag } = await loadFixture(deployRadixTagFixture);

      const tagAddr = tag.account.address;
      const uri = "test uri";

      await radixTag.write.createTag([tagAddr, uri]);

      expect(await radixTag.read.balanceOf([tagAddr])).to.equal(1n);
    });

    it("Should set the correct tokenUri to the Tag", async function () {
      const { radixTag, tag } = await loadFixture(deployRadixTagFixture);

      const tagAddr = tag.account.address;
      const uri = "test uri";

      await radixTag.write.createTag([tagAddr, uri]);

      expect(await radixTag.read.tokenURI([0n])).to.equal(uri);
    });
  });
});
