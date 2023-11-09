import { Form } from "web3uikit";
import { ethers } from "ethers";
import ListingProgressBar from "../components/ListingProgressBar";

export default function ExistingNFTForm({
    showProgress,
    newNftState,
    mintingNftStatusUIData,
    pendingTransactionHash,
    svgNftMintFee,
    approveAndListNftCallback
}) {
    const formInputsData = [
        {
            name: "NFT Address",
            type: "text",
            inputWidth: "100%",
            value: "",
            key: "nftAddress",
            validation: {
                numberMax: 42,
                numberMin: 42,
                required: true,
            },
        },
        {
            name: "Token ID",
            type: "number",
            value: "",
            key: "tokenId",
            validation: {
                required: true,
            },
        },
        {
            name: "Price (ETH)",
            type: "number",
            key: "price",
            validation: {
                required: true,
                numberMin: ethers.utils.formatUnits(svgNftMintFee, "ether"),
            },
            step: ethers.utils.formatUnits(svgNftMintFee, "ether")
        },
    ];

    return (
        <div>
            <ListingProgressBar
                showProgress={ showProgress }
                newNftState={ newNftState }
                pendingTransactionHash={ pendingTransactionHash }
                progressInfo={ mintingNftStatusUIData["progressInfo"] }
                progressBarPercentage={ mintingNftStatusUIData["progressBarPercentage"] }
                progressBarText={ mintingNftStatusUIData["progressBarText"] }
            />
            <Form
                onSubmit={ approveAndListNftCallback }
                data={ formInputsData }
                id="NFT Form"
                buttonConfig={ { theme: 'primary' } }
            />
        </div>
    );
}
