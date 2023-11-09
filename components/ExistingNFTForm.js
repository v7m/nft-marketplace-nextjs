import { ethers } from "ethers";
import ListingProgressBar from "../components/ListingProgressBar";

export default function ExistingNFTForm({
    buttonDisabled,
    nftProcessing,
    newNftState,
    mintingNftStatusUIData,
    pendingTransactionHash,
    svgNftMintFee,
    dynamicSvgNftAddress,
    basicIpfsNftAddress,
    approveAndListNftCallback
}) {

    const showExistingNftProgress = () => {
        return (nftProcessing.matches('form') && !newNftState.matches('idle'));
    }

    const minPriceValue = () => {
        return ethers.utils.formatUnits(svgNftMintFee, "ether");
    }

    const handleFormSubmit = (event) => {
        event.preventDefault();

        const formData = {
            nftAddress: event.target[0].value,
            tokenId: event.target[1].value,
            price: event.target[2].value
        }

        approveAndListNftCallback(formData);
    }

    return (
        <div>
            <ListingProgressBar
                showProgress={ showExistingNftProgress() }
                newNftState={ newNftState }
                pendingTransactionHash={ pendingTransactionHash }
                progressInfo={ mintingNftStatusUIData["progressInfo"] }
                progressBarPercentage={ mintingNftStatusUIData["progressBarPercentage"] }
                progressBarText={ mintingNftStatusUIData["progressBarText"] }
            />
            <form onSubmit={ handleFormSubmit }>
                <div className="mb-6">
                    <label for="nft-address-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">NFT address</label>
                    <select id="nft-address-input" name="nft-address" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        <option value={ basicIpfsNftAddress }>Basic IPFS NFT</option>
                        <option value={ dynamicSvgNftAddress }>Dynamic SVG NFT</option>
                    </select>
                </div>
                <div className="mb-6">
                    <label for="token-id-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Token ID</label>
                    <input required id="token-id-input" name="token-id" min="0" type="number" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                </div>
                <div className="mb-6">
                    <label for="price-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Price (ETH)</label>
                    <input required id="price-input" name="price" min={ minPriceValue() } step={ minPriceValue } type="number" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                </div>
                <button disabled={ buttonDisabled } type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
            </form>
        </div>
    );
}
