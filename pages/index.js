import { useMoralis } from "react-moralis";
import { useQuery } from "@apollo/client";
import networkMapping from "../constants/networkMapping.json";
import GET_ACTIVE_ITEMS from "../constants/subgraphQueries";
import styles from "../styles/Home.module.css";
import NFTBox from "../components/NFTBox";

export default function Home() {
    const { chainId, isWeb3Enabled } = useMoralis();
    const chainString = chainId ? parseInt(chainId).toString() : null;
    const nftMarketplaceAddress = chainId ? networkMapping[chainString].NftMarketplace[0] : null;

    const { loading, error, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS);

    return (
        <div className="container mx-auto">
            <h1 className="py-4 px-4 font-bold text-2xl">Recently Listed</h1>
            <div className="flex flex-wrap">
                {isWeb3Enabled && chainId ? (
                    loading || !listedNfts ? (
                        <div>Loading NFTs...</div>
                    ) : (
                        listedNfts.activeItems.map((nft) => {
                            const { price, nftAddress, tokenId, seller } = nft
                            return nftMarketplaceAddress ? (
                                <NFTBox
                                    price={ price }
                                    nftAddress={ nftAddress }
                                    tokenId={ tokenId }
                                    nftMarketplaceAddress={ nftMarketplaceAddress }
                                    seller={ seller }
                                    key={ `${nftAddress}${tokenId}` }
                                />
                            ) : (
                                <div>Network error, please switch to a supported network (Sepolia). </div>
                            );
                        })
                    )
                ) : (
                    <div>Web3 Currently Not Enabled</div>
                )}
            </div>
        </div>
    );
}
