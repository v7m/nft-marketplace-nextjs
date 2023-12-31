import { useState, useEffect } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import { ethers } from "ethers";
import truncateString from "../utils/truncateString.js";
import nftMarketplaceAbi from "../constants/NftMarketplaceAbi.json";
import basicIpfsNftAbi from "../constants/BasicIpfsNftAbi.json";
import { Card, useNotification } from "web3uikit";
import UpdateListingModal from "./UpdateListingModal";

export default function NFTItem({ price, nftAddress, tokenId, nftMarketplaceAddress, seller }) {
    const { isWeb3Enabled, account } = useMoralis();
    const [imageURI, setImageURI] = useState("");
    const [svgImage, setSvgImage] = useState("");
    const [tokenName, setTokenName] = useState("");
    const [tokenDescription, setTokenDescription] = useState("");
    const [showModal, setShowModal] = useState(false);
    const hideModal = () => setShowModal(false);
    const dispatch = useNotification();

    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: basicIpfsNftAbi,
        contractAddress: nftAddress,
        functionName: "tokenURI",
        params: {
            tokenId: tokenId,
        },
    });

    const { runContractFunction: buyItem } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: nftMarketplaceAddress,
        functionName: "buyItem",
        msgValue: price,
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
        },
    });

    const handleIpfsUri = (uri) => {
        return uri.replace("ipfs://", "https://ipfs.io/ipfs/");
    }

    const parseBase64 = (base64Uri) => {
        const base64UriWithoutHeader = base64Uri.split(',')[1]; // remove Base64 header

        return window.atob(base64UriWithoutHeader);
    }

    async function updateUI() {
        const tokenURI = await getTokenURI();
        console.log(`The TokenURI is ${tokenURI}`);

        if (tokenURI) {
            let tokenURIData;

            if (tokenURI.startsWith("ipfs://")) {
                const requestURL = handleIpfsUri(tokenURI);
                tokenURIData = await (await fetch(requestURL)).json();
            } else if (tokenURI.startsWith("data:application/json;base64,")) {
                tokenURIData = JSON.parse(parseBase64(tokenURI));
            }

            setTokenName(tokenURIData.name);
            setTokenDescription(tokenURIData.description);

            const imageData = tokenURIData.image;

            if (imageData.startsWith("ipfs://")) {
                const imageURIURL = handleIpfsUri(imageData);
                setImageURI(imageURIURL);
            } else if (imageData.startsWith("data:image/svg+xml;base64")) {
                setSvgImage(imageData);
            } else {
                setImageURI(imageData);
            }
        }
    }

    const handleCardClick = () => {
        if (isOwnedByUser) {
            setShowModal(true);
        } else {
            buyItem({
                onError: (error) => console.log(error),
                onSuccess: () => handleBuyItemSuccess(),
            });
        }
    }

    const handleBuyItemSuccess = () => {
        dispatch({
            type: "success",
            message: "NFT successfully bought",
            title: "NFT bought",
            position: "topR",
        });
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI();
        }
    }, [isWeb3Enabled]);

    const isOwnedByUser = seller === account || seller === undefined;
    const formattedSellerAddress = isOwnedByUser ? "you" : truncateString(seller || "", 15);
    const nftImageSrc = (imageURI || svgImage);

    return (
        <div>
            {nftImageSrc ? (
                <div>
                    <UpdateListingModal
                        isVisible={ showModal }
                        tokenId={ tokenId }
                        price={ price }
                        nftMarketplaceAddress={ nftMarketplaceAddress }
                        nftAddress={ nftAddress }
                        onClose={ hideModal }
                    />
                    <div className="w-[250px] m-0.5">
                        <Card
                            title={ tokenName }
                            description={ tokenDescription }
                            checkMarkPosition="right"
                            tooltipText={ <span className="whitespace-nowrap">NFT address: { nftAddress } </span> }
                            onClick={ handleCardClick }
                        >
                            <div className="p-2">
                                <div className="flex flex-col items-end gap-2">
                                    <div className="mt-5 text-sm">
                                        tokenId: { tokenId }</div>
                                    <div className="italic text-sm">
                                        Owner: { formattedSellerAddress }
                                    </div>
                                    <img src={ nftImageSrc } width={ 200 } height={ 200 } />
                                    <div className="font-bold">
                                        { ethers.utils.formatUnits(price, "ether") } ETH
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            ) : (
                <div>Loading NFT...</div>
            )}
        </div>
    );
}
