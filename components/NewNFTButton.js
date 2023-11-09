import { Button } from "web3uikit";
import ListingProgressBar from "../components/ListingProgressBar";

export default function NewNFTButton({
    buttonDisabled,
    showProgress,
    newNftState,
    mintingNftStatusUIData,
    pendingTransactionHash,
    mintNftCallback
}) {

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

            <Button
                color="blue"
                text="Mint & List NFT"
                theme="colored"
                size="large"
                disabled={ buttonDisabled }
                onClick={ mintNftCallback }
            />
        </div>
    );
}
