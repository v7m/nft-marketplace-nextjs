# NFT Marketplace Next.js

> *This is an educational project with the purpose of acquiring hands-on experience in web3 application development using smart contracts written in Solidity.*

The NFT Marketplace project consists of 3 parts:

[Hardhat App](https://github.com/v7m/nft-marketplace-hardhat): This component is responsible for managing smart contracts and includes deployment scripts, using the popular development environment for Ethereum smart contracts.

[Next.js App](https://github.com/v7m/nft-marketplace-nextjs): This part serves as the frontend of the application and interacts with on-chain logic within the Ethereum ecosystem.

[The Graph App](https://github.com/v7m/nft-marketplace-graph): This component handles the storage and indexing of blockchain events. The Graph is a widely used indexing and querying protocol for blockchain data.

<p float="left">
    <img src="readme-images/gallery.png" alt="image" width="400" height="auto">
    <img src="readme-images/sell-nft.png" alt="image" width="400" height="auto">
</p>

# Description:

NFT Marketplace is a cutting-edge platform designed for digital asset trading. The main features are:

- **Wallets Integration**: The platform is compatible with various web3 wallets, enabling easy access for a diverse user base.
- **Diverse NFT Support**: Users can trade various NFT types, including Basic (IPFS hosted) and Dynamic SVG (on-chain storage), catering to different preferences and needs.
- **Direct Minting and Listing**: Users can mint and list new NFTs directly within the marketplace, streamlining the process from creation to sale.
- **Flexible Trading Options**: Participants have the option to buy NFT tokens listed by others or set their own price when selling, providing a flexible and user-friendly trading experience.
- **Dynamic Pricing Control**: Easily modify your price or cancel a listing for your tokens at any time, offering sellers increased control over their sales strategy.
- **Revenue Management**: Sellers have full control over their trading earnings, which are withdrawable at any time, ensuring they have immediate access to their profits.

## Built with:
- Solidity
- OpenZeppelin
- Chainlink VRF
- Hardhat
- Ethers.js
- Next.js
- Moralis
- The Graph
- IPFS

# Getting Started

```
git clone https://github.com/v7m/nft-marketplace-nextjs
cd nft-marketplace-nextjs
yarn
```

# Usage

## Deploy subgraph

Follow the instructions of the [README](https://github.com/v7m/nft-marketplace-graph) of The Graph repo.

## Start development server:

Please ensure the following:

1. In the `networkMapping.json` file within the `constants` directory, you have the contract addresses for `NftMarketplace`, `BasicIpfsNft`, and `DynamicSvgNft` on the localhost Sepolia network.

2. In the same directory, make sure you have the contracts' ABIs stored in `NftMarketplaceAbi.json`, `BasicIpfsNftAbi.json`, and `DynamicSvgNftAbi.json` files.

3. Ensure that you have defined a `NEXT_PUBLIC_SUBGRAPH_URL` in your `.env` file, which should be obtained from The Graph app.

```
yarn dev
```
