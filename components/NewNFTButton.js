import { Button } from "web3uikit";
import ListingProgressBar from "../components/ListingProgressBar";

export default function NewNFTButton({
    showProgress,
    newNftState,
    mintingNftStatusUIData,
    pendingTransactionHash,
    mintNftCallback
}) {
    const buttonDisable = () => {
        return !["idle", "listed"].some(newNftState.matches);
    }

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
