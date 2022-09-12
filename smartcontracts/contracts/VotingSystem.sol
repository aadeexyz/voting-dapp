// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

contract VotingSystem {
    struct Candidate {
        string name;
        string imageUrl;
        uint256 votes;
    }

    address[] public candidates;
    mapping(address => Candidate) public addressToCandidate;

    mapping(address => address) public addressToVotedFor;

    constructor(
        address[] memory _candidateAddresses,
        string[] memory _names,
        string[] memory _imageUrls
    ) {
        require(_candidateAddresses.length == _names.length);
        require(_names.length == _imageUrls.length);

        for (
            uint256 candidate = 0;
            candidate < _candidateAddresses.length;
            candidate++
        ) {
            candidates.push(_candidateAddresses[candidate]);
            addressToCandidate[_candidateAddresses[candidate]] = Candidate(
                _names[candidate],
                _imageUrls[candidate],
                0
            );
        }
    }

    function registerAsCandidate(
        string calldata _name,
        string calldata _imageUrl
    ) public {
        require(!candidateRegistered(msg.sender));

        candidates.push(msg.sender);
        addressToCandidate[msg.sender] = Candidate(_name, _imageUrl, 0);
    }

    function unregisterAsCandidate() public {
        require(candidateRegistered(msg.sender));

        address[] memory newCandidates;
        uint256 newCandidateIndex = 0;

        for (
            uint256 candidate = 0;
            candidate < candidates.length;
            candidate++
        ) {
            newCandidates[newCandidateIndex] = candidates[candidate];
            newCandidateIndex++;
        }

        candidates = newCandidates;
    }

    function vote(address _candidate) public {
        require(addressToVotedFor[msg.sender] == address(0));
        require(candidateRegistered(_candidate));

        addressToCandidate[_candidate].votes += 1;
        addressToVotedFor[msg.sender] = _candidate;
    }

    function unvote() public {
        require(addressToVotedFor[msg.sender] != address(0));

        addressToCandidate[addressToVotedFor[msg.sender]].votes -= 1;
        addressToVotedFor[msg.sender] = address(0);
    }

    function candidateRegistered(address _candidateAddress)
        public
        view
        returns (bool)
    {
        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i] == _candidateAddress) {
                return true;
            }
        }
        return false;
    }
}
