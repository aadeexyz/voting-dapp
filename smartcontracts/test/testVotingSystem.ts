import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("VotingSystem", function () {
    async function deployVotingSystem() {
        const [vitalik, cz, sbf] = await ethers.getSigners();

        const candidateAddresses = [vitalik.address, cz.address, sbf.address];
        const names = [
            "Vitalik Buterin",
            "Changpeng Zhao",
            "Sam Bankman-Fried",
        ];
        const imageUrls = [
            "https://ipfs.io/ipfs/Qmcoz6u3SZQgHFQKQL9h7LiTC8MBJ2UFsSE4Sg67yb7qiT",
            "https://ipfs.io/ipfs/QmRKTLWZmRxE9QDv6CZR5NaA8vy8CdnRUovoQuUgntzk7i",
            "https://ipfs.io/ipfs/Qmcq7cfK6y6aKPMjHmmQm9ms6D4JJq6qzUg7hy91ko5VPw",
        ];

        const VotingSystem = await ethers.getContractFactory("VotingSystem");
        const votingSystem = await VotingSystem.deploy(
            candidateAddresses,
            names,
            imageUrls
        );

        return {
            votingSystem,
            candidateAddresses,
            names,
            imageUrls,
        };
    }

    describe("Deployment", function () {
        it("Should set correct candidate addresses", async function () {
            const { votingSystem, candidateAddresses } = await loadFixture(
                deployVotingSystem
            );

            const returnedCandidates = await votingSystem.getCandidates();

            expect(returnedCandidates.length).to.equal(
                candidateAddresses.length
            );

            for (let i = 0; i < returnedCandidates.length; i++) {
                expect(returnedCandidates[i]).to.equal(candidateAddresses[i]);
            }
        });

        it("Should set correct candidate names and images", async function () {
            const { votingSystem, names, imageUrls } = await loadFixture(
                deployVotingSystem
            );

            const candidates = await votingSystem.getCandidates();

            for (let i = 0; i < candidates.length; i++) {
                expect(
                    (await votingSystem.getCandidateDetails(candidates[i])).name
                ).to.equal(names[i]);
                expect(
                    (await votingSystem.getCandidateDetails(candidates[i]))
                        .imageUrl
                ).to.equal(imageUrls[i]);
            }
        });
    });
});
