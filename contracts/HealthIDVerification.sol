// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HealthIDVerification {
    // Mapping to store the Health-IDs
    mapping(string => bool) private healthIDs;

    // Event to log when a Health-ID is stored
    event HealthIDStored(string healthID, address sender);
    
    // Event to log the result of Health-ID verification
    event HealthIDVerified(string healthID, bool isValid);

    // Function to store a Health-ID
    function storeHealthID(string memory healthID) public {
        healthIDs[healthID] = true;
        emit HealthIDStored(healthID, msg.sender);
    }

    // Function to verify the Health-ID signature using ECDSA
    function verifyHealthID(
    string memory healthID,
    bytes32 hash,
    uint8 v,
    bytes32 r,
    bytes32 s
) public returns (bool) {
    // Recover the signer from the signature
    address signer = ecrecover(hash, v, r, s);

    // Check if the Health-ID exists and the signer is valid
    bool isValid = (healthIDs[healthID] && signer != address(0));

    // Emit the verification result
    emit HealthIDVerified(healthID, isValid);
    return isValid;
}

}