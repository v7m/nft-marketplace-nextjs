import { useNotification, Button } from "web3uikit";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import nftMarketplaceAbi from "../constants/NftMarketplaceAbi.json";
import networkMapping from "../constants/networkMapping.json";

export default function Home() {
    const { chainId, account, isWeb3Enabled } = useMoralis();
    const chainString = chainId ? parseInt(chainId).toString() : "31337";
    const nftMarketplaceAddress = networkMapping[chainString]["NftMarketplace"].slice(-1)[0];
    const dispatch = useNotification();
    const { runContractFunction } = useWeb3Contract();
    const [proceeds, setProceeds] = useState("0");

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
    
    async function setupUI() {
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
            setupUI();
        }
    }, [proceeds, account, isWeb3Enabled, chainId]);

    return (
        <div>
            <div className="grid grid-cols-7 gap-4">
                <div className="col-start-2 col-span-4">
                    <h2 className="text-4xl font-extrabold mt-8 mb-6">Withdraw Proceeds</h2>
                    <div className="mb-4">You currently have { ethers.utils.formatUnits(proceeds, "ether") } ETH in proceeds from listing NFTs.</div>
                    {proceeds != "0" ? (
                        <Button
                            onClick={ withdrawProceeds }
                            text="Withdraw"
                            type="button"
                            color="blue"
                            theme="colored"
                            size="large"
                        />
                    ) : (
                        <div>No proceeds available.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
