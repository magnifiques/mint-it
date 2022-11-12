import { useClaimedNFTs } from "@thirdweb-dev/react";

async function getNFTData({ nftDrops }) {
  const { data: claimedNFTs } = await useClaimedNFTs(nftDrops);
  //   const {data: totalNFTs} =
}

export default getNFTData;
