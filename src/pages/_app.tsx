import { NextUIProvider } from "@nextui-org/react";
import type { AppProps } from "next/app";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import Layout from "../components/layout";

const { chains, provider } = configureChains(
    [chain.goerli],
    [alchemyProvider({ apiKey: process.env.ALCHEMY_API_KEY }), publicProvider()]
);

const { connectors } = getDefaultWallets({
    appName: "My RainbowKit App",
    chains,
});

const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
});

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <WagmiConfig client={wagmiClient}>
            <RainbowKitProvider chains={chains}>
                <NextUIProvider>
                    <Layout>
                        <Component {...pageProps} />
                    </Layout>
                </NextUIProvider>
            </RainbowKitProvider>
        </WagmiConfig>
    );
}

export default MyApp;
