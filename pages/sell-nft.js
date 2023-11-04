import { Form, useNotification, Button } from "web3uikit";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import basicIpfsNftAbi from "../constants/BasicIpfsNftAbi.json";
import nftMarketplaceAbi from "../constants/NftMarketplaceAbi.json";
import dynamicSvgNftAbi from "../constants/DynamicSvgNftAbi.json";
import networkMapping from "../constants/networkMapping.json";

export default function Home() {
    const { chainId, account, isWeb3Enabled } = useMoralis();
    const chainString = chainId ? parseInt(chainId).toString() : "31337";
    const nftMarketplaceAddress = networkMapping[chainString]["NftMarketplace"].slice(-1)[0];
    const dynamicSvgNftAddress = networkMapping[chainString]["DynamicSvgNft"].slice(-1)[0];
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

        await runContractFunction({
            params: {
                abi: basicIpfsNftAbi,
                contractAddress: nftAddress,
                functionName: "approve",
                params: {
                    to: nftMarketplaceAddress,
                    tokenId: tokenId,
                },
            },
            onSuccess: (tx) => handleApproveSuccess(tx, nftAddress, tokenId, price),
            onError: (error) => { console.log(error) },
        });
    }

    async function approveAndListMintedSvgNft(tokenId) {
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
            onSuccess: (tx) => handleApproveSuccess(tx, dynamicSvgNftAddress, tokenId, svgNftMintFee),
            onError: (error) => { console.log(error) },
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
            onSuccess: () => handleWithdrawSuccess,
        })
    }

    async function requestSvgNftMint() {
        const dynamicSvgNftContract = new ethers.Contract(dynamicSvgNftAddress, dynamicSvgNftAbi, provider);

        const nftMintedFilter = {
            address: dynamicSvgNftAddress,
            topics: [ethers.utils.id("NftMinted(uint256,address)")]
        }

        dynamicSvgNftContract.once(nftMintedFilter, (tokenId, minter, event) => {
            console.log("MINTED!!!");
            approveAndListMintedSvgNft(tokenId);
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
            onSuccess: handleRequestSvgNftMintSuccess,
        });
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
            onSuccess: handleListSuccess,
            onError: (error) => console.log(error),
        });
    }

    async function handleListSuccess() {
        console.log("NFT listed!");
        dispatch({
            type: "success",
            message: "NFT successfully listed",
            title: "NFT listed",
            position: "topR",
        });
    }

    const handleWithdrawSuccess = () => {
        dispatch({
            type: "success",
            message: "Proceeds withdrawn",
            title: "Proceeds withdrawn",
            position: "topR",
        });
    }

    const handleRequestSvgNftMintSuccess = () => {
        console.log("Mint requested");
        dispatch({
            type: "success",
            message: "Dynamic SVG NFT mint requested",
            title: "SVG NFT mint requested",
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
                    <h2 className="text-4xl font-extrabold mb-8 mt-12">Mint new <span className="underline underline-offset-3 decoration-8 decoration-blue-400 dark:decoration-blue-600">NFT</span></h2>
                    <div className="mb-9 pl-4">
                        <Button
                            color="blue"
                            text="Request Dynamic SVG NFT Mint"
                            theme="colored"
                            onClick={ requestSvgNftMint }
                        />
                    </div>
                    <h2 className="text-4xl font-extrabold mb-6">Import your <span className="underline underline-offset-3 decoration-8 decoration-blue-400 dark:decoration-blue-600">NFT</span></h2>
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
