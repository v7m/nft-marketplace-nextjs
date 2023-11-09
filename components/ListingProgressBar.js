const ETHERSCAN_URL_PREFIX = "https://sepolia.etherscan.io/tx/";

export default function ListingProgressBar({
    showProgress,
    newNftState,
    pendingTransactionHash,
    progressInfo,
    progressBarPercentage,
    progressBarText
}) {
    const pendingTransactionUrl = () => {
        return ETHERSCAN_URL_PREFIX + pendingTransactionHash;
    }

    const showSpinner = () => {
        return !["idle", "completed"].some(newNftState.matches);
    }

    const showProgressText = () => {
        return !["idle", "requested"].some(newNftState.matches);
    }

    const spinnerElement = () => {
        return (
            <div className="inline-block mx-auto animate-spin spinner-border h-2 w-2 border-b-2 border-blue-400 rounded-full"></div>
        );
    }

    const progressTextElement = () => {
        return (
            <div className="inline-block ml-2">
                { progressBarText }
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
                        { progressInfo }
                        { pendingTransactionHash ? pendingTransactionTextElement() : null }
                    </div>
                    <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
                        <div className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={ { width: `${ progressBarPercentage }%` } }>
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
        </div>
    );
}
