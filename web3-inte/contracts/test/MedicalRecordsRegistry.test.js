const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MedicalRecordsRegistry", function () {
    let medicalRecords;
    let owner;
    let doctor;
    let patient;

    beforeEach(async function () {
        [owner, doctor, patient] = await ethers.getSigners();
        
        const MedicalRecordsRegistry = await ethers.getContractFactory("MedicalRecordsRegistry");
        medicalRecords = await MedicalRecordsRegistry.deploy();
        await medicalRecords.waitForDeployment();
    });

    describe("Medical Record Management", function () {
        it("Should create a medical record", async function () {
            const documentCID = "QmTestCID123";
            const userDID = "did:ethr:base:0x123";
            const recordType = "diagnosis";
            const metadataHash = "0x456";

            await expect(
                medicalRecords.connect(doctor).createMedicalRecord(
                    documentCID,
                    userDID,
                    recordType,
                    doctor.address,
                    metadataHash
                )
            ).to.emit(medicalRecords, "MedicalRecordCreated");
        });

        it("Should retrieve a medical record", async function () {
            const documentCID = "QmTestCID123";
            const userDID = "did:ethr:base:0x123";
            const recordType = "diagnosis";
            const metadataHash = "0x456";

            const tx = await medicalRecords.connect(doctor).createMedicalRecord(
                documentCID,
                userDID,
                recordType,
                doctor.address,
                metadataHash
            );

            const receipt = await tx.wait();
            const recordId = receipt.logs[0].args[0];

            const record = await medicalRecords.getMedicalRecord(recordId);
            expect(record.documentCID).to.equal(documentCID);
            expect(record.userDID).to.equal(userDID);
            expect(record.recordType).to.equal(recordType);
        });

        it("Should get user records", async function () {
            const userDID = "did:ethr:base:0x123";
            
            await medicalRecords.connect(doctor).createMedicalRecord(
                "QmCID1",
                userDID,
                "diagnosis",
                doctor.address,
                "0x111"
            );

            await medicalRecords.connect(doctor).createMedicalRecord(
                "QmCID2",
                userDID,
                "prescription",
                doctor.address,
                "0x222"
            );

            const userRecords = await medicalRecords.getUserRecords(userDID);
            expect(userRecords.length).to.equal(2);
        });
    });

    describe("Consent Management", function () {
        it("Should grant consent", async function () {
            const granterDID = "did:ethr:base:0x123";
            const granteeDID = "did:ethr:base:0x456";
            const expiryTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
            const recordTypes = ["diagnosis", "prescription"];

            await expect(
                medicalRecords.connect(patient).grantConsent(
                    granterDID,
                    granteeDID,
                    expiryTime,
                    recordTypes
                )
            ).to.emit(medicalRecords, "ConsentGranted");
        });

        it("Should check valid consent", async function () {
            const granterDID = "did:ethr:base:0x123";
            const granteeDID = "did:ethr:base:0x456";
            const expiryTime = Math.floor(Date.now() / 1000) + 3600;
            const recordTypes = ["diagnosis"];

            await medicalRecords.connect(patient).grantConsent(
                granterDID,
                granteeDID,
                expiryTime,
                recordTypes
            );

            const hasConsent = await medicalRecords.hasValidConsent(
                granterDID,
                granteeDID,
                "diagnosis"
            );

            expect(hasConsent).to.be.true;
        });

        it("Should revoke consent", async function () {
            const granterDID = "did:ethr:base:0x123";
            const granteeDID = "did:ethr:base:0x456";
            const expiryTime = Math.floor(Date.now() / 1000) + 3600;
            const recordTypes = ["diagnosis"];

            await medicalRecords.connect(patient).grantConsent(
                granterDID,
                granteeDID,
                expiryTime,
                recordTypes
            );

            await expect(
                medicalRecords.connect(patient).revokeConsent(granterDID, granteeDID)
            ).to.emit(medicalRecords, "ConsentRevoked");

            const hasConsent = await medicalRecords.hasValidConsent(
                granterDID,
                granteeDID,
                "diagnosis"
            );

            expect(hasConsent).to.be.false;
        });
    });
});
