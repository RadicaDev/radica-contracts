// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RadixTag
 * @author Francesco Laterza
 * @notice Contract implementation to manage Radix NFC tags (Demo)
 */
contract RadixTag is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    address public _radixPropertyAddr;

    uint256 private _nextTokenId;

    constructor() ERC721("RadixTag", "RTAG") Ownable(msg.sender) {}

    function setRadixPropertyAddr(address radixPropertyAddr) public {
        require(
            _radixPropertyAddr == address(0),
            "RadixProperty address cannot be modified"
        );
        _radixPropertyAddr = radixPropertyAddr;
    }

    /**
     * @notice Creates a new NFC for a tag
     *
     * @dev The tagAddr should be deriverd fromm the tag's public key
     *
     * @param tagAddr The address of the tag
     * @param uri The URI to be associated with the tag
     */
    function createTag(
        address tagAddr,
        string memory uri,
        bytes32 proofHash
    ) public onlyOwner {
        require(proofHash != 0, "Proof hash cannot be zero");

        uint256 tokenId = _nextTokenId++;
        _safeMint(tagAddr, tokenId);
        _setTokenURI(tokenId, uri);

        (bool success, ) = _radixPropertyAddr.call(
            abi.encodeWithSignature(
                "setProof(uint256,bytes32)",
                tokenId,
                proofHash
            )
        );
        require(success, "Call to setProof failed");
    }

    // The following functions are overrides required by Solidity.

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
