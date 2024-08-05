// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RadixTag
 * @author Francesco Laterza
 * @notice Contract implementation to manage Radix NFC tags
 */
contract RadixTag is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    constructor() ERC721("RadixTag", "RTAG") Ownable(msg.sender) {}

    /**
     * @notice Creates a new NFC for a tag
     *
     * @dev The tagAddr should be deriverd fromm the tag's public key
     *
     * @param tagAddr The address of the tag
     * @param uri The URI to be associated with the tag
     */
    function createTag(address tagAddr, string memory uri) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(tagAddr, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity.

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
