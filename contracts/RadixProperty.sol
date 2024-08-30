// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RadixProperty
 * @author Francesco Laterza
 * @notice Contract implementation to manage Radix Property NFTs
 */
contract RadixProperty is ERC721, ERC721URIStorage, Ownable {
    mapping(uint256 => bytes32) private _tokenIdToProofHash;

    /**
     * @notice Constructor
     *
     * @param radixTagAddr The address of the RadixTag contract
     */
    constructor(
        address radixTagAddr
    ) ERC721("RadixProperty", "RPRP") Ownable(radixTagAddr) {
        (bool success, ) = radixTagAddr.call(
            abi.encodeWithSignature(
                "setRadixPropertyAddr(address)",
                address(this)
            )
        );
        require(success, "Call to setRadixPropertyAddr failed");
    }

    /**
     * @notice Sets the proof for the token
     *
     * @param tokenId The ID of the token to be set
     * @param proofHash The hash of the proof to be associated with the token
     */
    function setProof(uint256 tokenId, bytes32 proofHash) public onlyOwner {
        require(_tokenIdToProofHash[tokenId] == 0, "Proof already set");
        _tokenIdToProofHash[tokenId] = proofHash;
    }

    /**
     * @notice Claims the property for the tag
     *
     * @param tokenId The ID of the token to be claimed
     * @param uri The URI to be associated with the tag
     */
    function claimProperty(
        uint256 tokenId,
        bytes32 proof,
        string memory uri
    ) public {
        // check proof is valid
        require(
            _tokenIdToProofHash[tokenId] == keccak256(abi.encode(proof)),
            "Invalid proof"
        );

        _safeMint(msg.sender, tokenId);
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
