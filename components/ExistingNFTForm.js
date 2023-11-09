import { Form } from "web3uikit";
import { ethers } from "ethers";

export default function ExistingNFTForm({ approveAndListNftCallback, svgNftMintFee }) {
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
        <Form
            onSubmit={ approveAndListNftCallback }
            data={ formInputsData }
            id="NFT Form"
            buttonConfig={ { theme: 'primary' } }
        />
    );
}
