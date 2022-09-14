import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("VotingSystem", function () {
    async function deployVotingSystemFixture() {
        const [user, vitalik, cz, sbf, anatoly] = await ethers.getSigners();

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
            user,
            anatoly,
            candidateAddresses,
            names,
            imageUrls,
        };
    }

    async function registerNewCandidateFixture() {
        const { votingSystem, anatoly } = await loadFixture(
            deployVotingSystemFixture
        );

        const candidates = await votingSystem.getCandidates();

        const name = "Anatoly Yakovenko";
        const imageUrl =
            "https://ipfs.io/ipfs/QmayVH2eAPBLC6A1aCybkXSnSfRhHS2WBqYMWDCCewM19m";

        await votingSystem.connect(anatoly).registerAsCandidate(name, imageUrl);

        const newCandidates = await votingSystem.getCandidates();

        return {
            votingSystem,
            anatoly,
            name,
            imageUrl,
            candidates,
            newCandidates,
        };
    }

    async function voteFixture() {
        const { votingSystem, user } = await loadFixture(
            deployVotingSystemFixture
        );

        const candidates = await votingSystem.getCandidates();
        const votedFor = candidates[0];

        await votingSystem.vote(votedFor);

        return { votingSystem, user, candidates, votedFor };
    }

    describe("Deployment", function () {
        it("Should set correct candidate addresses", async function () {
            const { votingSystem, candidateAddresses } = await loadFixture(
                deployVotingSystemFixture
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
                deployVotingSystemFixture
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

    describe("Registration", function () {
        it("Should register a new candidate if candidate is not already registered", async function () {
            const {
                votingSystem,
                anatoly,
                candidates,
                newCandidates,
                name,
                imageUrl,
            } = await loadFixture(registerNewCandidateFixture);

            const oldCandidatesLength = candidates.length;

            expect(newCandidates.length).to.equal(oldCandidatesLength + 1);
            expect(newCandidates[newCandidates.length - 1]).to.equal(
                anatoly.address
            );

            const newCandidateDetails = await votingSystem.getCandidateDetails(
                newCandidates[newCandidates.length - 1]
            );

            expect(newCandidateDetails.name).to.equal(name);
            expect(newCandidateDetails.imageUrl).to.equal(imageUrl);
        });

        it("Should not register a candidate if that candidate is already registered", async function () {
            const { votingSystem, anatoly, name, imageUrl } = await loadFixture(
                registerNewCandidateFixture
            );

            await expect(
                votingSystem
                    .connect(anatoly)
                    .registerAsCandidate(name, imageUrl)
            ).to.be.reverted;
        });

        it("Should unregister a candidate if the candidate is registered", async function () {
            const { votingSystem, anatoly, newCandidates } = await loadFixture(
                registerNewCandidateFixture
            );

            await votingSystem.connect(anatoly).unregisterAsCandidate();

            const cnadidates = await votingSystem.getCandidates();

            expect(cnadidates.length).to.equal(newCandidates.length - 1);

            for (
                let candidate = 0;
                candidate < newCandidates.length;
                candidate++
            ) {
                expect(cnadidates[candidate]).to.not.equal(anatoly.address);
            }
        });

        it("Should not unregister a candidate if the candidate is not registered", async function () {
            const { votingSystem, anatoly } = await loadFixture(
                deployVotingSystemFixture
            );

            await expect(votingSystem.connect(anatoly).unregisterAsCandidate())
                .to.be.reverted;
        });
    });

    describe("Vote", function () {
        it("Should vote if not already voted", async function () {
            const { votingSystem, user, votedFor } = await loadFixture(
                voteFixture
            );

            expect(await votingSystem.getVotedFor(user.address)).to.equal(
                votedFor
            );

            const candidateDetails = await votingSystem.getCandidateDetails(
                votedFor
            );

            expect(candidateDetails.votes).to.equal(1);
        });

        it("Should not vote if already voted", async function () {
            const { votingSystem, votedFor } = await loadFixture(voteFixture);

            await expect(votingSystem.vote(votedFor)).to.be.reverted;
        });

        it("Should unvote if voted", async function () {
            const { votingSystem, user, votedFor } = await loadFixture(
                voteFixture
            );

            const votes = (await votingSystem.getCandidateDetails(votedFor))
                .votes;

            await votingSystem.unvote();

            expect(await votingSystem.getVotedFor(user.address)).to.equal(
                ethers.constants.AddressZero
            );
            expect(
                (await votingSystem.getCandidateDetails(votedFor)).votes
            ).to.equal(votes.sub(1));
        });

        it("Should not unvote if not voted", async function () {
            const { votingSystem } = await loadFixture(
                deployVotingSystemFixture
            );

            await expect(votingSystem.unvote()).to.be.reverted;
        });
    });
});
