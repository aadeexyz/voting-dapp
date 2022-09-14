import { FC } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Navbar } from "@nextui-org/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

type Props = {
    children: JSX.Element;
};

const Layout: FC<Props> = ({ children }) => {
    const router = useRouter();

    return (
        <>
            <Navbar variant={"sticky"}>
                <Navbar.Content
                    enableCursorHighlight
                    activeColor={"secondary"}
                    variant={"highlight"}
                >
                    <Link href={"/"} passHref>
                        <Navbar.Link isActive={router.pathname == "/"}>
                            Vote
                        </Navbar.Link>
                    </Link>
                    <Link href={"/register"} passHref>
                        <Navbar.Link isActive={router.pathname == "/register"}>
                            Register
                        </Navbar.Link>
                    </Link>
                </Navbar.Content>
                <Navbar.Content>
                    <ConnectButton showBalance={false} />
                </Navbar.Content>
            </Navbar>
            <main>{children}</main>
        </>
    );
};

export default Layout;
