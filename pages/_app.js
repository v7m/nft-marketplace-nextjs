import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from "web3uikit";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import "../styles/globals.css";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Head from "next/head";

const client = new ApolloClient({
    cache: new InMemoryCache(),
    uri: process.env.NEXT_PUBLIC_SUBGRAPH_URL,
});

export default function MyApp({ Component, pageProps }) {
    return (
        <div>
            <Head>
                <title>NFT Marketplace</title>
                <meta name="description" content="NFT Marketplace" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <MoralisProvider initializeOnMount={false}>
                <ApolloProvider client={client}>
                    <NotificationProvider>
                        <div className="flex flex-col h-screen justify-between">
                            <Header />
                            <div className="mb-auto">
                                <Component {...pageProps} />
                            </div>
                            <Footer />
                        </div>
                    </NotificationProvider>
                </ApolloProvider>
            </MoralisProvider>
        </div>
    );
}
