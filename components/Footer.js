import Image from 'next/image';

import solidityImage from '../assets/Solidity.png';
import hardhatImage from '../assets/Hardhat.png';
import nextJsImage from '../assets/Next.js.png';
import chainlinkImage from '../assets/Chainlink.png';
import IPFSImage from '../assets/IPFS.png';
import ethersJsImageImage from '../assets/Ethers.js.png';
import openZeppelinImage from '../assets/OpenZeppelin.png';
import tHeGraphImage from '../assets/TheGraph.png';
import moralisImage from '../assets/Moralis.png';



export default function Footer() {
    const images = [
        {
            name: "Solidity",
            src: solidityImage
        },
        {
            name: "OpenZeppelin",
            src: openZeppelinImage
        },
        {
            name: "Chainlink",
            src: chainlinkImage
        },
        {
            name: "Hardhat",
            src: hardhatImage
        },
        {
            name: "Ethers.js",
            src: ethersJsImageImage
        },
        {
            name: "Next.js",
            src: nextJsImage
        },
        {
            name: "Moralis",
            src: moralisImage
        },
        {
            name: "The Graph",
            src: tHeGraphImage
        },
        {
            name: "IPFS",
            src: IPFSImage
        }
    ];

    return (
        <footer className="bottom-0 left-0 z-20 w-full p-3 mt-3 bg-white border-t-2 border-gray-200 shadow md:flex md:items-center md:justify-between md:p-6  dark:border-gray-200">
            <div className="w-full">
                <div className="grid grid-cols-5 gap-4 mb-5">
                    <div className="col-start-2 col-span-3 text-center">
                        <h2 className="text-xl">Built with:</h2>
                    </div>
                </div>
                <div className="grid grid-cols-11 gap-4 whitespace-nowrap">
                    <div className="col-span-1"></div>
                    { images.map(image => {
                        return (
                            <div key={ image.name } className="col-span-1">
                                <div className="text-center hidden lg:block truncate">
                                    <h2>{ image.name }</h2>
                                </div>
                                <div className="flex justify-center items-center">
                                    <Image
                                        src={ image.src }
                                        width={ 50 }
                                        height={ 50 }
                                        loader={ () => value }
                                        unoptimized={ true }
                                    />
                                </div>
                            </div>
                        );
                    }) }
                </div>
            </div>
        </footer>
    );
}
