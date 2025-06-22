// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MedicalRecordsRegistry
 * @dev Smart contract for storing verifiable medical record credentials on Base L2
 * Stores IPFS hashes and metadata for medical documents with DID-based identity
 */
contract MedicalRecordsRegistry is Ownable, ReentrancyGuard {
    
    struct MedicalRecord {
        string documentCID;        // IPFS CID of the document
        string userDID;           // Decentralized Identity of the patient
        string recordType;        // Type of medical record (lab_report, prescription, etc.)
        uint256 timestamp;        // When the record was created
        address authorizedBy;     // Who authorized this record (doctor/institution)
        bool isActive;           // Whether this record is active
        string metadataHash;     // Hash of additional metadata
    }
    
    struct ConsentRecord {
        string granterDID;       // Patient's DID
        string granteeDID;       // Doctor's/Institution's DID  
        uint256 expiryTime;      // When consent expires
        bool isActive;           // Whether consent is active
        string[] recordTypes;    // Types of records consented for
    }
    
    // Mapping from record ID to medical record
    mapping(uint256 => MedicalRecord) public medicalRecords;
    
    // Mapping from user DID to their record IDs
    mapping(string => uint256[]) public userRecords;
    
    // Mapping for consent management
    mapping(bytes32 => ConsentRecord) public consentRecords;
    
    // Counter for record IDs
    uint256 public recordCounter;
    
    // Events
    event MedicalRecordCreated(
        uint256 indexed recordId,
        string indexed userDID,
        string documentCID,
        string recordType,
        address authorizedBy
    );
    
    event ConsentGranted(
        string indexed granterDID,
        string indexed granteeDID,
        uint256 expiryTime,
        string[] recordTypes
    );
    
    event ConsentRevoked(
        string indexed granterDID,
        string indexed granteeDID
    );
    
    event RecordDeactivated(uint256 indexed recordId);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Create a new medical record entry
     * @param _documentCID IPFS CID of the medical document
     * @param _userDID Patient's decentralized identity
     * @param _recordType Type of medical record
     * @param _authorizedBy Address that authorized this record
     * @param _metadataHash Hash of additional metadata
     */
    function createMedicalRecord(
        string memory _documentCID,
        string memory _userDID,
        string memory _recordType,
        address _authorizedBy,
        string memory _metadataHash
    ) external nonReentrant returns (uint256) {
        require(bytes(_documentCID).length > 0, "Document CID cannot be empty");
        require(bytes(_userDID).length > 0, "User DID cannot be empty");
        require(bytes(_recordType).length > 0, "Record type cannot be empty");
        require(_authorizedBy != address(0), "Authorized by cannot be zero address");
        
        recordCounter++;
        
        medicalRecords[recordCounter] = MedicalRecord({
            documentCID: _documentCID,
            userDID: _userDID,
            recordType: _recordType,
            timestamp: block.timestamp,
            authorizedBy: _authorizedBy,
            isActive: true,
            metadataHash: _metadataHash
        });
        
        userRecords[_userDID].push(recordCounter);
        
        emit MedicalRecordCreated(
            recordCounter,
            _userDID,
            _documentCID,
            _recordType,
            _authorizedBy
        );
        
        return recordCounter;
    }
    
    /**
     * @dev Grant consent for accessing medical records
     * @param _granterDID Patient's DID granting consent
     * @param _granteeDID Doctor's/Institution's DID receiving consent
     * @param _expiryTime When the consent expires
     * @param _recordTypes Array of record types being consented for
     */
    function grantConsent(
        string memory _granterDID,
        string memory _granteeDID,
        uint256 _expiryTime,
        string[] memory _recordTypes
    ) external {
        require(bytes(_granterDID).length > 0, "Granter DID cannot be empty");
        require(bytes(_granteeDID).length > 0, "Grantee DID cannot be empty");
        require(_expiryTime > block.timestamp, "Expiry time must be in the future");
        require(_recordTypes.length > 0, "Must specify at least one record type");
        
        bytes32 consentKey = keccak256(abi.encodePacked(_granterDID, _granteeDID));
        
        consentRecords[consentKey] = ConsentRecord({
            granterDID: _granterDID,
            granteeDID: _granteeDID,
            expiryTime: _expiryTime,
            isActive: true,
            recordTypes: _recordTypes
        });
        
        emit ConsentGranted(_granterDID, _granteeDID, _expiryTime, _recordTypes);
    }
    
    /**
     * @dev Revoke consent for accessing medical records
     * @param _granterDID Patient's DID revoking consent
     * @param _granteeDID Doctor's/Institution's DID losing consent
     */
    function revokeConsent(
        string memory _granterDID,
        string memory _granteeDID
    ) external {
        bytes32 consentKey = keccak256(abi.encodePacked(_granterDID, _granteeDID));
        
        require(consentRecords[consentKey].isActive, "Consent does not exist or already revoked");
        
        consentRecords[consentKey].isActive = false;
        
        emit ConsentRevoked(_granterDID, _granteeDID);
    }
    
    /**
     * @dev Check if consent exists and is valid
     * @param _granterDID Patient's DID
     * @param _granteeDID Doctor's/Institution's DID
     * @param _recordType Type of record being accessed
     */
    function hasValidConsent(
        string memory _granterDID,
        string memory _granteeDID,
        string memory _recordType
    ) external view returns (bool) {
        bytes32 consentKey = keccak256(abi.encodePacked(_granterDID, _granteeDID));
        ConsentRecord memory consent = consentRecords[consentKey];
        
        if (!consent.isActive || consent.expiryTime <= block.timestamp) {
            return false;
        }
        
        // Check if the record type is in the consented types
        for (uint256 i = 0; i < consent.recordTypes.length; i++) {
            if (keccak256(abi.encodePacked(consent.recordTypes[i])) == keccak256(abi.encodePacked(_recordType))) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * @dev Get medical record by ID
     * @param _recordId ID of the medical record
     */
    function getMedicalRecord(uint256 _recordId) external view returns (MedicalRecord memory) {
        require(_recordId > 0 && _recordId <= recordCounter, "Invalid record ID");
        return medicalRecords[_recordId];
    }
    
    /**
     * @dev Get all record IDs for a user
     * @param _userDID User's DID
     */
    function getUserRecords(string memory _userDID) external view returns (uint256[] memory) {
        return userRecords[_userDID];
    }
    
    /**
     * @dev Deactivate a medical record (only owner or authorized party)
     * @param _recordId ID of the record to deactivate
     */
    function deactivateRecord(uint256 _recordId) external {
        require(_recordId > 0 && _recordId <= recordCounter, "Invalid record ID");
        
        MedicalRecord storage record = medicalRecords[_recordId];
        require(record.isActive, "Record already deactivated");
        require(
            msg.sender == owner() || msg.sender == record.authorizedBy,
            "Not authorized to deactivate this record"
        );
        
        record.isActive = false;
        
        emit RecordDeactivated(_recordId);
    }
    
    /**
     * @dev Get total number of records
     */
    function getTotalRecords() external view returns (uint256) {
        return recordCounter;
    }
}
