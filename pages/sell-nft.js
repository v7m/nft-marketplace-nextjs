import { Form, useNotification, Button } from "web3uikit";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { createMachine, assign } from "xstate";
import { useMachine } from "@xstate/react";
import { Tabs } from 'flowbite';
import styles from "../styles/Home.module.css";
import nftMarketplaceAbi from "../constants/NftMarketplaceAbi.json";
import dynamicSvgNftAbi from "../constants/DynamicSvgNftAbi.json";
import basicIpfsNftAbi from "../constants/BasicIpfsNftAbi.json";
import networkMapping from "../constants/networkMapping.json";

const ETHERSCAN_URL_PREFIX = "https://sepolia.etherscan.io/tx/";

const mintAndListNftStateMachine = createMachine({
    id: "mint-and-list-nft",
    initial: "idle",
    on: {
        requestInitiated: "requested",
        mintingInitiated: "minting",
        mintingCompleted: "minted",
        approvingInitiated: "approving",
        approvingCompleted: "approved",
        listingInitiated: "listing",
        listingCompleted: "listed",
        requestCompleted: "idle"
    },
    states: {
        idle: {},
        requested: {},
        minting: {},
        minted: {},
        approving: {},
        approved: {},
        listing: {},
        listed: {}
    }
});

const nftProcessingStateMachine = createMachine({
    id: "nft-processing",
    initial: "none",
    on: {
        processNone: "none",
        processBasic: "basic",
        processDynamic: "dynamic",
        processForm: "form"
    },
    states: {
        none: {},
        basic: {},
        dynamic: {},
        form: {}
    }
});

export default function Home() {
    const { chainId, account, isWeb3Enabled } = useMoralis();
    const chainString = chainId ? parseInt(chainId).toString() : "31337";
    const nftMarketplaceAddress = networkMapping[chainString]["NftMarketplace"].slice(-1)[0];
    const dynamicSvgNftAddress = networkMapping[chainString]["DynamicSvgNft"].slice(-1)[0];
    const basicIpfsNftAddress = networkMapping[chainString]["BasicIpfsNft"].slice(-1)[0];
    const dispatch = useNotification();
    const { runContractFunction } = useWeb3Contract();
    const [newNftState, setNewNftState] = useMachine(mintAndListNftStateMachine);
    const [nftProcessing, setNftProcessing] = useMachine(nftProcessingStateMachine);
    const [provider, setProvider] = useState({});
    const [svgNftMintFee, setSvgNftMintFee] = useState("0");
    const [pendingTransactionHash, setPendingTransactionHash] = useState(null);


    // APPROVE AND LIST FUNCTIONS

    async function approveAndListFormNft(data) {
        setNftProcessing('processForm');

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
            onError: (error) => handleTransactionError(error),
        });
    }

    async function approveAndListDynamicSvgNft(tokenId, price = svgNftMintFee) {
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
            onError: (error) => { handleTransactionError(error) },
        });
    }

    // MINT FUNCTIONS

    async function requestDynamicSvgNftMint() {
        setNftProcessing('processDynamic');
        setNewNftState('requestInitiated');

        const dynamicSvgNftContract = new ethers.Contract(dynamicSvgNftAddress, dynamicSvgNftAbi, provider);

        const nftMintedFilter = {
            address: dynamicSvgNftAddress,
            topics: [ethers.utils.id("NftMinted(uint256,address)")]
        }

        dynamicSvgNftContract.once(nftMintedFilter, (tokenId, minter, event) => {
            setNewNftState('mintingCompleted');
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
            onSuccess: (tx) => handleRequestSvgNftMintSuccess(tx),
            onError: (error) => handleTransactionError(error),
        });
    }

    async function mintBasicIpfsNft() {
        setNftProcessing('processBasic');
        setNewNftState('requestInitiated');

        await runContractFunction({
            params: {
                abi: basicIpfsNftAbi,
                contractAddress: basicIpfsNftAddress,
                functionName: "mintNft",
                params: {},
            },
            onSuccess: (tx) => handleMintBasicIpfsNftSuccess(tx),
            onError: (error) => handleTransactionError(error),
        });
    }

    // HANDLE SUCCESS/ERROR FUNCTIONS

    async function handleApproveSuccess(tx, nftAddress, tokenId, price) {
        setNewNftState('approvingInitiated');
        setPendingTransactionHash(tx.hash);
        await tx.wait(1);
        setNewNftState('approvingCompleted');
        setPendingTransactionHash(null);

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
            onSuccess: (tx) => handleListingSuccess(tx),
            onError: (error) => handleTransactionError(error),
        });
    }

    async function handleListingSuccess(tx) {
        setNewNftState('listingInitiated');
        setPendingTransactionHash(tx.hash);
        await tx.wait(1);
        setNftProcessing('processNone');
        setNewNftState('listingCompleted');
        setPendingTransactionHash(null);
        handleListSuccessNotification();
    }

    async function handleMintBasicIpfsNftSuccess(tx) {
        setNewNftState('mintingInitiated');
        setPendingTransactionHash(tx.hash);

        const mintTxReceipt = await tx.wait(1);

        setNewNftState('mintingCompleted');
        setPendingTransactionHash(null);
        handleMintBasicIpfsNftSuccessNotification();

        const tokenId = mintTxReceipt.events[0].args.tokenId;

        approveAndListBasicNft(tokenId);
    }

    async function handleRequestSvgNftMintSuccess(tx) {
        setNewNftState('mintingInitiated');
        setPendingTransactionHash(tx.hash);
        await tx.wait(1);
        setPendingTransactionHash(null);
        handleRequestSvgNftMintSuccessNotification();
    }

    const handleTransactionError = (error) => {
        setNewNftState('requestCompleted');
        setPendingTransactionHash(null);
        console.log(error);
    }

    // NOTIFICATIONS

    const handleListSuccessNotification = () => {
        dispatch({
            type: "success",
            message: "NFT successfully listed",
            title: "NFT listed",
            position: "topR",
        });
    }

    const handleMintBasicIpfsNftSuccessNotification = () => {
        dispatch({
            type: "success",
            message: "You can find it in the gallery",
            title: "Basic IPFS NFT minted",
            position: "topR",
        });
    }

    const handleRequestSvgNftMintSuccessNotification = () => {
        dispatch({
            type: "success",
            message: "SVG NFT mint request sent. Please wait...",
            title: "SVG NFT mint requested",
            position: "topR",
        });
    }

    const handleMintSvgNftSuccessNotification = () => {
        dispatch({
            type: "success",
            message: "You can find it in the gallery",
            title: "Dynamic SVG NFT minted",
            position: "topR",
        });
    }

    // UI FUNCTIONS

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

        setUpTabs();
    }

    const buttonDisable = () => {
        return !["idle", "listed"].some(newNftState.matches);
    }

    const mintAndListStatusUIData = () => {
        const data = {
            idle: {
                info: "",
                progress: 0,
                progressText: "",
                buttonText: "Mint & List NFT",
            },
            requested: {
                info: "Please confirm the NFT mint in your wallet.",
                progress: 4,
                progressText: "",
                buttonText: "NFT Minting...",
            },
            minting: {
                info: "Pending transaction confirmation...",
                progress: 17,
                progressText: "Minting...",
                buttonText: "NFT Minting...",
            },
            minted: {
                info: "NFT successfully minted. Please confirm the NFT approving in your wallet.",
                progress: 34,
                progressText: "Approving...",
                buttonText: "NFT Approving...",
            },
            approving: {
                info: "Pending transaction confirmation...",
                progress: 50,
                progressText: "Approving...",
                buttonText: "NFT Approving...",
            },
            approved: {
                info: "NFT successfully approved. Please confirm the NFT listing in your wallet.",
                progress: 66,
                progressText: "Listing...",
                buttonText: "NFT Listing...",
            },
            listing: {
                info: "Pending transaction confirmation...",
                progress: 84,
                progressText: "Listing...",
                buttonText: "NFT Listing...",
            },
            listed: {
            info: "NFT successfully listed on marketplace!",
                progress: 100,
                progressText: "Completed!",
                buttonText: "Mint & List NFT",
            },
        }

        return data[newNftState.value];
    }

    const setUpTabs = () => {
        const tabsElement = document.getElementById('list-nft');

        const tabElements = [
            {
                id: 'list-new-nft',
                triggerEl: document.querySelector('#list-new-nft-tab'),
                targetEl: document.querySelector('#list-new-nft-form')
            },
            {
                id: 'list-existing-nft',
                triggerEl: document.querySelector('#list-existing-nft-tab'),
                targetEl: document.querySelector('#list-existing-nft-form')
            },
        ];

        const tabsOptions = {
            defaultTabId: 'list-new-nft',
            activeClasses: 'text-blue-600 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400 border-blue-600 dark:border-blue-500',
            inactiveClasses: 'text-gray-500 hover:text-gray-600 dark:text-gray-400 border-gray-100 hover:border-gray-300 dark:border-gray-700 dark:hover:text-gray-300',
        };

        new Tabs(tabsElement, tabElements, tabsOptions);
    }

    const showBasicNftProgress = () => {
        return (nftProcessing.matches('basic') && !newNftState.matches('idle'))
    }

    const showDynamicNftProgress = () => {
        return (nftProcessing.matches('dynamic') && !newNftState.matches('idle'));
    }

    const showSpinner = () => {
        return !["idle", "completed"].some(newNftState.matches);
    }

    const showProgressText = () => {
        return !["idle", "requested"].some(newNftState.matches);
    }

    const pendingTransactionUrl = () => {
        return ETHERSCAN_URL_PREFIX + pendingTransactionHash;
    }

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

    useEffect(() => {
        if (isWeb3Enabled) {
            setProvider(new ethers.providers.Web3Provider(window.ethereum));
            setupUI();
        }
    }, [ account, isWeb3Enabled, chainId]);

    return (
        <div className={ styles.container }>
            <div className="grid grid-cols-7 gap-4">
                <div className="col-start-2 col-span-4">
                    <div className="mb-4 border-b w-fit border-gray-200 dark:border-gray-700">
                        <ul className="flex flex-wrap -mb-px text-lg font-medium text-center text-gray-500 dark:text-gray-400" id="list-nft" role="tablist">
                            <li className="mr-2" role="presentation">
                                <button
                                    className="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                                    id="list-new-nft-tab"
                                    type="button"
                                    role="tab"
                                >
                                    New NFT
                                </button>
                            </li>
                            <li className="mr-2" role="presentation">
                                <button
                                    className="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                                    id="list-existing-nft-tab"
                                    type="button"
                                    role="tab"
                                >
                                    Existing NFT
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div id="list-nft">
                        <div className="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="list-new-nft-form" role="tabpanel" aria-labelledby="list-new-nft-tab">
                            <h2 className="text-4xl font-extrabold mb-6 mt-8">Mint and List new <span className="underline underline-offset-3 decoration-8 decoration-blue-400 dark:decoration-blue-600">NFT</span></h2>
                            <div className="mb-6">
                                <h3 className="text-xl font-bold mb-3">Basic IPFS NFT (free)</h3>
                                <div>
                                    { showBasicNftProgress() ? (
                                        <div className="mb-6 px-4">
                                            <div className="italic text-sm mb-2">
                                                { mintAndListStatusUIData()["info"] }
                                                { pendingTransactionHash ? (
                                                    <span>
                                                        &nbsp;Check on&nbsp;
                                                        <a href={ pendingTransactionUrl() } className="font-medium text-blue-600 dark:text-blue-500 hover:underline" target="_blank">Etherscan</a>.
                                                    </span>
                                                ) : (
                                                    null
                                                ) }
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
                                                <div className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={ { width: `${ mintAndListStatusUIData()["progress"] }%` } }>
                                                    <div>
                                                        { showSpinner() ? <div className="inline-block mx-auto animate-spin spinner-border h-2 w-2 border-b-2 border-blue-400 rounded-full"></div> : null }
                                                        { showProgressText() ? (
                                                            <div className="inline-block ml-2">
                                                                { mintAndListStatusUIData()["progressText"] }
                                                            </div>
                                                        ) : (
                                                            null
                                                        ) }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        ) : (
                                        null
                                    ) }

                                    <div className="pl-4">
                                        <Button
                                            color="blue"
                                            text="Mint & List NFT"
                                            theme="colored"
                                            size="large"
                                            disabled={ buttonDisable() }
                                            onClick={ mintBasicIpfsNft }
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mb-6">
                                <h3 className="text-xl font-bold mb-5">Dynamic on-chain SVG NFT (0.01 ETH)</h3>
                                <div>
                                    { showDynamicNftProgress() ? (
                                        <div className="mb-6 px-4">
                                            <div className="italic text-sm mb-2">
                                                { mintAndListStatusUIData()["info"] }
                                                { pendingTransactionHash ? (
                                                    <span>
                                                        &nbsp;Check on&nbsp;
                                                        <a href={ pendingTransactionUrl() } className="font-medium text-blue-600 dark:text-blue-500 hover:underline" target="_blank">Etherscan</a>.
                                                    </span>
                                                ) : (
                                                    null
                                                ) }
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
                                                <div className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={ { width: `${ mintAndListStatusUIData()["progress"] }%` } }>
                                                    <div>
                                                        { showSpinner() ? <div className="inline-block mx-auto animate-spin spinner-border h-2 w-2 border-b-2 border-blue-400 rounded-full"></div> : null }
                                                        { showProgressText() ? (
                                                            <div className="inline-block ml-2">
                                                                { mintAndListStatusUIData()["progressText"] }
                                                            </div>
                                                        ) : (
                                                            null
                                                        ) }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        null
                                    ) }

                                    <div className="pl-4">
                                        <Button
                                            color="blue"
                                            text="Mint & List NFT"
                                            theme="colored"
                                            size="large"
                                            disabled={ buttonDisable() }
                                            onClick={ requestDynamicSvgNftMint }
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="list-existing-nft-form" role="tabpanel" aria-labelledby="ist-existing-nft-tab">
                            <h2 className="text-4xl font-extrabold mb-6 mt-8">List existed <span className="underline underline-offset-3 decoration-8 decoration-blue-400 dark:decoration-blue-600">NFT</span></h2>
                            <Form
                                onSubmit={ approveAndListFormNft }
                                data={ formInputsData }
                                id="NFT Form"
                                buttonConfig={ { theme: 'primary' } }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
