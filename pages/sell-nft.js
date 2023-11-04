import { Form, useNotification, Button } from "web3uikit";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import nftMarketplaceAbi from "../constants/NftMarketplaceAbi.json";
import dynamicSvgNftAbi from "../constants/DynamicSvgNftAbi.json";
import basicIpfsNftAbi from "../constants/BasicIpfsNftAbi.json";
import networkMapping from "../constants/networkMapping.json";

export default function Home() {
    const { chainId, account, isWeb3Enabled } = useMoralis();
    const chainString = chainId ? parseInt(chainId).toString() : "31337";
    const nftMarketplaceAddress = networkMapping[chainString]["NftMarketplace"].slice(-1)[0];
    const dynamicSvgNftAddress = networkMapping[chainString]["DynamicSvgNft"].slice(-1)[0];
    const basicIpfsNftAddress = networkMapping[chainString]["BasicIpfsNft"].slice(-1)[0];

    const dispatch = useNotification();
    const { runContractFunction } = useWeb3Contract();
    const [provider, setProvider] = useState({});
    const [proceeds, setProceeds] = useState("0");
    const [svgNftMintFee, setSvgNftMintFee] = useState("0");

    async function approveAndListFormNft(data) {
        console.log("Approving NFT from form...");

        const nftAddress = data.data[0].inputResult;
        const tokenId = data.data[1].inputResult;
        const price = ethers.utils.parseUnits(data.data[2].inputResult, "ether").toString();

        switch (nftAddress) {
            case dynamicSvgNftAddress:
                await approveAndListDynamicSvgNft(tokenId, price);
                break;
            case basicIpfsNftAddress:
                await approveAndListBasicNft(tokenId, price);
                break;
            default:
                console.log(`NFT with address ${nftAddress} not supported`);
        }
    }

    async function approveAndListBasicNft(tokenId, price = svgNftMintFee) {
        console.log("Approving Basic IPFS  NFT...");
        await runContractFunction({
            params: {
                abi: basicIpfsNftAbi,
                contractAddress: basicIpfsNftAddress,
                functionName: "approve",
                params: {
                    to: nftMarketplaceAddress,
                    tokenId: tokenId,
                },
            },
            onSuccess: (tx) => handleApproveSuccess(tx, basicIpfsNftAddress, tokenId, price),
            onError: (error) => { console.log(error) },
        });
    }

    async function approveAndListDynamicSvgNft(tokenId, price = svgNftMintFee) {
        console.log("Approving minted SVG NFT...");

        await runContractFunction({
            params: {
                abi: dynamicSvgNftAbi,
                contractAddress: dynamicSvgNftAddress,
                functionName: "approve",
                params: {
                    to: nftMarketplaceAddress,
                    tokenId: tokenId,
                },
            },
            onSuccess: (tx) => handleApproveSuccess(tx, dynamicSvgNftAddress, tokenId, price),
            onError: (error) => { console.log(error) },
        });
    }

    async function requestSvgNftMint() {
        const dynamicSvgNftContract = new ethers.Contract(dynamicSvgNftAddress, dynamicSvgNftAbi, provider);

        const nftMintedFilter = {
            address: dynamicSvgNftAddress,
            topics: [ethers.utils.id("NftMinted(uint256,address)")]
        }

        dynamicSvgNftContract.once(nftMintedFilter, (tokenId, minter, event) => {
            handleMintSvgNftSuccessNotification();
            approveAndListDynamicSvgNft(tokenId);
        });

        await runContractFunction({
            params: {
                abi: dynamicSvgNftAbi,
                contractAddress: dynamicSvgNftAddress,
                functionName: "requestNftMint",
                msgValue: svgNftMintFee,
                params: {},
            },
            onError: (error) => console.log(error),
            onSuccess: handleRequestSvgNftMintSuccessNotification,
        });
    }

    async function mintBasicIpfsNft() {
        console.log("Minting Basic IPFS  NFT...");
        await runContractFunction({
            params: {
                abi: basicIpfsNftAbi,
                contractAddress: basicIpfsNftAddress,
                functionName: "mintNft",
                params: {},
            },
            onError: (error) => console.log(error),
            onSuccess: (tx) => handleMintBasicIpfsNftSuccess(tx),
        });
    }

    async function withdrawProceeds() {
        await runContractFunction({
            params: {
                abi: nftMarketplaceAbi,
                contractAddress: nftMarketplaceAddress,
                functionName: "withdrawProceeds",
                params: {},
            },
            onError: (error) => console.log(error),
            onSuccess: () => handleWithdrawSuccessNotification,
        })
    }

    async function handleApproveSuccess(tx, nftAddress, tokenId, price) {
        console.log("Listing NFT...");
        await tx.wait(1);

        await runContractFunction({
            params: {
                abi: nftMarketplaceAbi,
                contractAddress: nftMarketplaceAddress,
                functionName: "listItem",
                params: {
                    nftAddress: nftAddress,
                    tokenId: tokenId,
                    price: price,
                },
            },
            onSuccess: handleListSuccessNotification,
            onError: (error) => console.log(error),
        });
    }

    async function handleMintBasicIpfsNftSuccess(tx) {
        handleMintBasicIpfsNftSuccessNotification();
        const mintTxReceipt = await tx.wait(1);
        const tokenId = mintTxReceipt.events[0].args.tokenId;

        await approveAndListBasicNft(tokenId);
    }

    async function handleListSuccessNotification() {
        console.log("NFT listed!");
        dispatch({
            type: "success",
            message: "NFT successfully listed",
            title: "NFT listed",
            position: "topR",
        });
    }

    const handleWithdrawSuccessNotification = () => {
        dispatch({
            type: "success",
            message: "Proceeds withdrawn",
            title: "Proceeds withdrawn",
            position: "topR",
        });
    }

    const handleMintBasicIpfsNftSuccessNotification = () => {
        console.log("Basic IPFS NFT minted");
        dispatch({
            type: "success",
            message: "You can find it in the gallery",
            title: "Basic IPFS NFT mintedd",
            position: "topR",
        });
    }

    const handleRequestSvgNftMintSuccessNotification = () => {
        console.log("Mint Dynamic SVG NFT requested");
        dispatch({
            type: "success",
            message: "SVG NFT mint request sent. Please wait...",
            title: "SVG NFT mint requested",
            position: "topR",
        });
    }

    const handleMintSvgNftSuccessNotification = () => {
        console.log("Dynamic SVG NFT minted");
        dispatch({
            type: "success",
            message: "You can find it in the gallery",
            title: "Dynamic SVG NFT minted",
            position: "topR",
        });
    }

    async function setupUI() {
        const svgNftMintFee = await runContractFunction({
            params: {
                abi: dynamicSvgNftAbi,
                contractAddress: dynamicSvgNftAddress,
                functionName: "getMintFee",
                params: {},
            },
            onError: (error) => console.log(error),
        });

        if (svgNftMintFee) {
            setSvgNftMintFee(svgNftMintFee);
        }

        const returnedProceeds = await runContractFunction({
            params: {
                abi: nftMarketplaceAbi,
                contractAddress: nftMarketplaceAddress,
                functionName: "getProceeds",
                params: {
                    seller: account,
                },
            },
            onError: (error) => console.log(error),
        })
        if (returnedProceeds) {
            setProceeds(returnedProceeds.toString());
        }
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            setProvider(new ethers.providers.Web3Provider(window.ethereum));
            setupUI();
        }
    }, [proceeds, account, isWeb3Enabled, chainId]);

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
            step: 0.1,
        },
    ];

    return (
        <div className={ styles.container }>
            <div className="grid grid-cols-7 gap-4">
                <div className="col-start-2 col-span-4">
                    <h2 className="text-4xl font-extrabold mt-12">Mint and list new <span className="underline underline-offset-3 decoration-8 decoration-blue-400 dark:decoration-blue-600">NFT</span></h2>
                    <p className="mb-6 mt-3"><em>It will require several transactions and will take a while.</em></p>
                    <div className="mb-6 pl-4">
                        <Button
                            color="blue"
                            text="Mint Basic IPFS NFT"
                            theme="colored"
                            size="large"
                            onClick={ mintBasicIpfsNft }
                        />
                    </div>
                    <div className="mb-9 pl-4">
                        <Button
                            color="blue"
                            text="Mint random on-chain SVG NFT"
                            theme="colored"
                            size="large"
                            onClick={ requestSvgNftMint }
                        />
                    </div>
                    <h2 className="text-4xl font-extrabold mb-6">List existed <span className="underline underline-offset-3 decoration-8 decoration-blue-400 dark:decoration-blue-600">NFT</span></h2>
                    <Form
                        onSubmit={ approveAndListFormNft }
                        data={ formInputsData }
                        id="NFT Form"
                        buttonConfig={ { theme: 'primary' } }
                    />

                    <div>Withdraw { proceeds } proceeds</div>
                    {proceeds != "0" ? (
                        <Button
                            onClick={ withdrawProceeds }
                            text="Withdraw"
                            type="button"
                        />
                    ) : (
                        <div>No proceeds available</div>
                    )}
                </div>
            </div>
        </div>
    );
}
