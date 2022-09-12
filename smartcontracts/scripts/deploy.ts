import { ethers } from "hardhat";

async function main() {
    const [vitalik, cz, sbf] = await ethers.getSigners();

    const candidateAddresses = [vitalik.address, cz.address, sbf.address];
    const names = ["Vitalik Buterin", "Changpeng Zhao", "Sam Bankman-Fried"];
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
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
