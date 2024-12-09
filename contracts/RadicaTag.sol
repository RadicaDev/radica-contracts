// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title Certificate
 * @notice Struct to store the certificate of a tag
 */
struct Metadata {
    string serialNumber;
    string name;
    string description;
    string image;
    string manufacturer;
    string externalUrl;
}

struct TracebilityMetadata {
    string batchId;
    string supplierChainHash;
}

struct Certificate {
    uint256 id;
    Metadata metadata;
    TracebilityMetadata tracebilityMetadata;
}

/**
 * @title RadicaTag
 * @author Francesco Laterza
 * @notice Contract implementation to manage Radica NFC tags
 */
contract RadicaTag is Ownable {
    using Strings for string;

    address public radicaPropertyAddr;
    uint256 private _nextTokenId;

    mapping(address => Certificate) public tagAddrToCert;

    constructor() Ownable(msg.sender) {}

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
        TracebilityMetadata memory tracebilityMetadata = TracebilityMetadata({
            batchId: "",
            supplierChainHash: ""
        });
        createTag(tagAddr, metadata, tracebilityMetadata, proofHash);
    }

    function createTag(
        address tagAddr,
        Metadata memory metadata,
        TracebilityMetadata memory tracebilityMetadata,
        bytes32 proofHash
    ) public onlyOwner {
        require(proofHash != 0, "Proof hash cannot be zero");
        require(tagAddrToCert[tagAddr].id == 0, "Tag already in use");

        uint256 certId = _deriveCertId(msg.sender, tagAddr);

        tagAddrToCert[tagAddr] = Certificate({
            id: certId,
            metadata: metadata,
            tracebilityMetadata: tracebilityMetadata
        });

        (bool success, ) = radicaPropertyAddr.call(
            abi.encodeWithSignature(
                "setProof(uint256,bytes32)",
                certId,
                proofHash
            )
        );
        require(success, "Call to setProof failed");
    }

    function _deriveCertId(
        address issuerAddr,
        address tagAddr
    ) private pure returns (uint256) {
        uint256 issuerAddrUint = uint256(uint160(issuerAddr));
        uint256 tagAddrUint = uint256(uint160(tagAddr));

        uint256 issuerFP = issuerAddrUint >> 64;

        return (issuerFP << 160) | tagAddrUint;
    }
}
