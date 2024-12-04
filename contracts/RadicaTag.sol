// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title Metadata
 * @notice Struct to store metadata for a tag
 */
struct Metadata {
    string id;
    string name;
    string description;
    string imageUrl;
    string externalUrl;
}

/**
 * @title RadicaTag
 * @author Francesco Laterza
 * @notice Contract implementation to manage Radica NFC tags
 */
contract RadicaTag is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    using Strings for string;
    using Base64 for bytes;

    address public radicaPropertyAddr;

    uint256 private _nextTokenId;

    constructor() ERC721("RadicaTag", "RTAG") Ownable(msg.sender) {}

    /**
     * @notice Sets the RadicaProperty contract address
     * @dev This function can be called only once and will be called by
     * the RadicaProperty contract
     *
     * @param _radicaPropertyAddr The address of the RadicaProperty contract
     */
    function setRadicaPropertyAddr(address _radicaPropertyAddr) public {
        require(
            radicaPropertyAddr == address(0),
            "RadicaProperty address cannot be modified"
        );
        radicaPropertyAddr = _radicaPropertyAddr;
    }

    /**
     * @notice Creates a new NFT for a tag
     *
     * @dev The tagAddr should be deriverd fromm the tag's public key
     *
     * @param tagAddr The address of the tag
     * @param metadata The metadata to be associated with the tag
     */
    function createTag(
        address tagAddr,
        Metadata memory metadata,
        bytes32 proofHash
    ) public onlyOwner {
        require(proofHash != 0, "Proof hash cannot be zero");
        require(balanceOf(tagAddr) == 0, "Tag already in use");

        string memory metadataStr = _serializaMetadata(metadata);
        string memory uri = _formatURI(metadataStr);

        uint256 tokenId = _nextTokenId++;
        _safeMint(tagAddr, tokenId);
        _setTokenURI(tokenId, uri);

        (bool success, ) = radicaPropertyAddr.call(
            abi.encodeWithSignature(
                "setProof(uint256,bytes32)",
                tokenId,
                proofHash
            )
        );
        require(success, "Call to setProof failed");
    }

    function _serializaMetadata(
        Metadata memory metadata
    ) private pure returns (string memory metadataStr) {
        require(!_isEmptyStr(metadata.id), "ID cannot be empty");

        metadataStr = "{";

        if (!_isEmptyStr(metadata.name)) {
            metadataStr = string(
                abi.encodePacked(metadataStr, '"name":"', metadata.name, '",')
            );
        }

        if (!_isEmptyStr(metadata.description)) {
            metadataStr = string(
                abi.encodePacked(
                    metadataStr,
                    '"description":"',
                    metadata.description,
                    '",'
                )
            );
        }

        if (!_isEmptyStr(metadata.imageUrl)) {
            metadataStr = string(
                abi.encodePacked(
                    metadataStr,
                    '"image":"',
                    metadata.imageUrl,
                    '",'
                )
            );
        }

        if (!_isEmptyStr(metadata.externalUrl)) {
            metadataStr = string(
                abi.encodePacked(
                    metadataStr,
                    '"external_url":"',
                    metadata.externalUrl,
                    '",'
                )
            );
        }

        metadataStr = string(
            abi.encodePacked(
                metadataStr,
                '"attributes":[{"trait_type":"ID","value":"',
                metadata.id,
                '"}]}'
            )
        );
    }

    function _formatURI(
        string memory metadata
    ) private pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(bytes(metadata))
                )
            );
    }

    function _isEmptyStr(string memory str) private pure returns (bool) {
        return bytes(str).length == 0;
    }

    // The following functions are overrides required by Solidity.

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        require(_ownerOf(tokenId) == address(0), "Non transferable token"); // Only mint is allowed
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
