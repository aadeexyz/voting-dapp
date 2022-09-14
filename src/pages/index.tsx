import type { NextPage } from "next";
import {
    Card,
    Container,
    Grid,
    Col,
    Row,
    Button,
    Text,
    Image,
} from "@nextui-org/react";
import {
    useAccount,
    useContractRead,
    usePrepareContractWrite,
    useContractWrite,
} from "wagmi";
import { constants } from "ethers";
import votingSystemABI from "../abi/VotingSystem.json";

const Home: NextPage = () => {
    const contractAddress = "0x70f75e2758cFc66Ce48C2EbC045069C9EBd8f16A";

    const { address, isConnected } = useAccount();

    const getVotedForRead = useContractRead({
        addressOrName: contractAddress,
        contractInterface: votingSystemABI,
        functionName: "getVotedFor",
        args: [address],
    });
    const getCandidatesRead = useContractRead({
        addressOrName: contractAddress,
        contractInterface: votingSystemABI,
        functionName: "getCandidates",
    });

    const voted =
        isConnected &&
        getVotedForRead.data?.toString() != constants.AddressZero.toString();

    const candidates = getCandidatesRead.data?.map((candidate) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        let getCandidateDetailsRead = useContractRead({
            addressOrName: contractAddress,
            contractInterface: votingSystemABI,
            functionName: "getCandidateDetails",
            args: [candidate],
        });

        let voteWrite = undefined;

        if (!voted) {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            let votePrepareWrite = usePrepareContractWrite({
                addressOrName: contractAddress,
                contractInterface: votingSystemABI,
                functionName: "vote",
                args: [candidate],
            });

            // eslint-disable-next-line react-hooks/rules-of-hooks
            voteWrite = useContractWrite(votePrepareWrite.config);
        }

        return {
            address: candidate,
            name: getCandidateDetailsRead.data?.name,
            imageUrl: getCandidateDetailsRead.data?.imageUrl,
            votes: getCandidateDetailsRead.data?.votes.toString(),
            write: voteWrite?.write,
        };
    });

    let unvoteWrite: any = undefined;

    if (voted) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const unvotePrepareWrite = usePrepareContractWrite({
            addressOrName: contractAddress,
            contractInterface: votingSystemABI,
            functionName: "unvote",
        });

        // eslint-disable-next-line react-hooks/rules-of-hooks
        unvoteWrite = useContractWrite(unvotePrepareWrite.config).write;
    }

    const unvote = () => {
        unvoteWrite.write?.();
    };

    const votedFor = candidates?.filter(
        (candidate) => candidate.address == getVotedForRead.data?.toString()
    ).length
        ? candidates?.filter(
              (candidate) =>
                  candidate.address == getVotedForRead.data?.toString()
          )[0]
        : { address: "", name: "", imageUrl: "", votes: "" };

    return (
        <Container css={{ m: "20px" }}>
            <Card
                variant="bordered"
                css={{
                    mt: "20px",
                    mb: "20px",
                    p: "20px",
                    alignItems: "center",
                }}
            >
                <Card.Body>
                    {candidates && voted ? (
                        <>
                            <Text h3 css={{ mb: "20px" }}>
                                You Voted For
                            </Text>
                            <Row>
                                <Container
                                    css={{
                                        h: "300px",
                                        w: "400px",
                                        p: "0",
                                    }}
                                >
                                    <Image
                                        height={"300px"}
                                        width={"100%"}
                                        src={votedFor.imageUrl}
                                        alt={`${votedFor.name}'s image`}
                                        objectFit={"cover"}
                                        css={{ borderRadius: "14px" }}
                                    ></Image>
                                </Container>
                                <Container css={{ p: "0", w: "max-content" }}>
                                    <Container
                                        justify={"flex-start"}
                                        css={{
                                            p: "0",
                                            w: "max-content",
                                            m: "0",
                                        }}
                                    >
                                        <Text
                                            h2
                                            css={{ w: "max-content", m: "0" }}
                                        >
                                            {votedFor.name}
                                        </Text>
                                        <Text
                                            css={{
                                                w: "max-content",
                                                m: "0",
                                                color: "$accents7",
                                                fontWeight: "$semibold",
                                                fontSize: "$lg",
                                            }}
                                        >
                                            Votes: {votedFor.votes}
                                        </Text>
                                    </Container>
                                    <Container
                                        css={{
                                            p: "0",
                                            w: "max-content",
                                            ml: "0",
                                            mr: "0",
                                        }}
                                    >
                                        <Button onClick={() => unvoteWrite?.()}>
                                            Unvote
                                        </Button>
                                    </Container>
                                </Container>
                            </Row>
                        </>
                    ) : (
                        <Text h3 css={{ m: "0px" }}>
                            {isConnected
                                ? "You Haven't Voted Yet"
                                : "You Are Not Connected"}
                        </Text>
                    )}
                </Card.Body>
            </Card>

            <Grid.Container gap={2} justify={"center"}>
                {candidates &&
                    candidates.map((candidate, index) => (
                        <Grid xs={6} sm={3} key={index}>
                            <Card>
                                <Card.Body css={{ p: 0 }}>
                                    <Card.Image
                                        src={candidate.imageUrl}
                                        objectFit={"cover"}
                                        width={"100%"}
                                        height={300}
                                        alt={`${candidate.name}'s image`}
                                    />
                                </Card.Body>
                                <Card.Footer
                                    css={{ justifyItems: "flex-start" }}
                                >
                                    <Col>
                                        <Text b>{candidate.name}</Text>
                                        <Text
                                            css={{
                                                color: "$accents7",
                                                fontWeight: "$semibold",
                                                fontSize: "$sm",
                                            }}
                                        >
                                            Votes: {candidate.votes}
                                        </Text>
                                        <Container
                                            css={{
                                                justifyItems: "center",
                                                paddingTop: "10px",
                                                paddingLeft: "0",
                                                paddingRight: "0",
                                            }}
                                        >
                                            <Button
                                                disabled={
                                                    !isConnected ||
                                                    !candidate.write ||
                                                    voted
                                                }
                                                css={{
                                                    width: "100%",
                                                    margin: "0",
                                                }}
                                                onClick={() =>
                                                    candidate.write?.()
                                                }
                                            >
                                                Vote
                                            </Button>
                                        </Container>
                                    </Col>
                                </Card.Footer>
                            </Card>
                        </Grid>
                    ))}
            </Grid.Container>
        </Container>
    );
};

export default Home;
