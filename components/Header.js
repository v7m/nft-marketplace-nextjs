import { ConnectButton } from "web3uikit";
import Link from "next/link";

export default function Header() {
    return (
        <nav className="p-3 border-b-2 flex flex-row justify-between items-center">
            {/* <h1 className="py-4 px-4 font-bold text-3xl">NFT Marketplace</h1> */}
            <h2 className="text-3xl font-bold ml-5"><span className="underline underline-offset-3 decoration-8 decoration-blue-400 dark:decoration-blue-600">NFT</span> Marketplace</h2>
            <div className="flex flex-row items-center">
                <Link href="/">
                    <a className="mr-4 p-6">Gallery</a>
                </Link>
                <Link href="/sell-nft">
                    <a className="mr-4 p-6">Sell NFT</a>
                </Link>
                <ConnectButton moralisAuth={ false } />
            </div>
        </nav>
    );
}
