import { useMoralis } from "react-moralis";
import { useQuery } from "@apollo/client";
import networkMapping from "../constants/networkMapping.json";
import GET_ACTIVE_ITEMS from "../constants/subgraphQueries";
import styles from "../styles/Home.module.css";
import NFTItem from "../components/NFTItem";

export default function Home() {
    const { chainId, isWeb3Enabled } = useMoralis();
    const chainString = chainId ? parseInt(chainId).toString() : null;
    const nftMarketplaceAddress = chainId ? networkMapping[chainString].NftMarketplace[0] : null;

    const { loading, error, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS);

    return (
        <div className="container mx-auto">
            <div className="grid grid-cols-9 gap-4">
                <div className="col-start-2 col-span-7">
                    <h2 className="text-4xl font-extrabold mb-6 mt-8">Recently Listed <span className="underline underline-offset-3 decoration-8 decoration-blue-400 dark:decoration-blue-600">NFT</span></h2>
                    <div className="mb-6 mt-3">Click to buy a listed NFT, or, if you are the owner of the item, click to update or cancel the listing.</div>
                    <div className="flex flex-wrap">
                        {isWeb3Enabled && chainId ? (
                            loading || !listedNfts ? (
                                <div>Loading NFTs...</div>
                            ) : (
                                listedNfts.activeItems.map((nft) => {
                                    const { price, nftAddress, tokenId, seller } = nft
                                    return nftMarketplaceAddress ? (
                                        <NFTItem
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
                            <div>Web3 Currently Not Enabled. Please, connect a wallet.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
