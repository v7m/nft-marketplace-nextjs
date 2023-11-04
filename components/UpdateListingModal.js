import { Modal, Input, Button, useNotification } from "web3uikit";
import { useState } from "react";
import { useWeb3Contract } from "react-moralis";
import { ethers } from "ethers";
import nftMarketplaceAbi from "../constants/NftMarketplaceAbi.json";

export default function UpdateListingModal({
    nftAddress,
    tokenId,
    price,
    isVisible,
    nftMarketplaceAddress,
    onClose,
}) {
    const dispatch = useNotification();
    const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState(0);

    const handleUpdateListingSuccess = () => {
        dispatch({
            type: "success",
            message: "Listing updated, please wait",
            title: "NFT listing updated",
            position: "topR",
        });
        onClose && onClose();
        setPriceToUpdateListingWith("0");
    }

    const handleCancelListingSuccess = () => {
        dispatch({
            type: "success",
            message: "Listing canceled, please wait",
            title: "NFT listing canceled",
            position: "topR",
        });
        onClose && onClose();
    }

    const { runContractFunction: updateListing } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: nftMarketplaceAddress,
        functionName: "updateListing",
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
            newPrice: ethers.utils.parseEther(priceToUpdateListingWith || "0"),
        },
    });

    const { runContractFunction: cancelListing } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: nftMarketplaceAddress,
        functionName: "cancelListing",
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
        },
    });

    return (
        <Modal
            isVisible={ isVisible }
            okText="Save"
            width="600px"
            title="Update NFT listing"
            onCloseButtonPressed={ onClose }
            customFooter={
                <Button
                    text="Cancel NFT listing"
                    color="red"
                    theme="colored"
                    onClick={() => {
                        cancelListing({
                            onError: (error) => { console.log(error); },
                            onSuccess: () => handleCancelListingSuccess(),
                        })
                    }}
                />
            }
        >

            <div className="mb-4">
                <Input
                    label="NFT price (ETH)"
                    name="New listing price"
                    type="number"
                    onChange={ (event) => setPriceToUpdateListingWith(event.target.value) }
                    value={ ethers.utils.formatUnits(price, "ether") }
                    step={ 0.1 }
                    validation={{
                        required: true
                    }}
                />
            </div>

            <Button
                text="Update price"
                theme="primary"
                onClick={() => {
                    updateListing({
                        onError: (error) => { console.log(error); },
                        onSuccess: () => handleUpdateListingSuccess(),
                    });
                }}
            />
        </Modal>
    );
}
