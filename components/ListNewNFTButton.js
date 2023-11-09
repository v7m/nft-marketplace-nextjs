import { Button } from "web3uikit";

const ETHERSCAN_URL_PREFIX = "https://sepolia.etherscan.io/tx/";

export default function ListNewNFTButton({ showProgress, newNftState, pendingTransactionHash, mintNftCallback }) {
    const pendingTransactionUrl = () => {
        return ETHERSCAN_URL_PREFIX + pendingTransactionHash;
    }

    const showSpinner = () => {
        return !["idle", "completed"].some(newNftState.matches);
    }

    const showProgressText = () => {
        return !["idle", "requested"].some(newNftState.matches);
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

    const spinnerElement = () => {
        return (
            <div className="inline-block mx-auto animate-spin spinner-border h-2 w-2 border-b-2 border-blue-400 rounded-full"></div>
        );
    }

    const progressTextElement = () => {
        return (
            <div className="inline-block ml-2">
                { mintAndListStatusUIData()["progressText"] }
            </div>
        );
    }

    const pendingTransactionTextElement = () => {
        return (
            <span>
                &nbsp;Check on&nbsp;
                <a href={ pendingTransactionUrl() } className="font-medium text-blue-600 dark:text-blue-500 hover:underline" target="_blank">Etherscan</a>.
            </span>
        );
    }

    return (
        <div>
            { showProgress ? (
                <div className="mb-6 px-4">
                    <div className="italic text-sm mb-2">
                        { mintAndListStatusUIData()["info"] }
                        { pendingTransactionHash ? pendingTransactionTextElement() : null }
                    </div>
                    <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
                        <div className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={ { width: `${ mintAndListStatusUIData()["progress"] }%` } }>
                            <div>
                                { showSpinner() ? spinnerElement() : null }
                                { showProgressText() ? progressTextElement() : null }
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
                    onClick={ mintNftCallback }
                />
            </div>
        </div>
    );
}
