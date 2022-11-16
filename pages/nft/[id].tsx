import React, { useEffect, useState } from "react";
import {
  useMetamask,
  useAddress,
  useDisconnect,
  useContract,
  useClaimedNFTSupply,
  useClaimConditions,
  useClaimNFT,
  useTotalCount,
} from "@thirdweb-dev/react";
import { GetServerSideProps } from "next";
import { sanityClient, urlFor } from "../../sanity";
import { Collection } from "../../typing";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";

interface Props {
  collection: Collection;
}

const NFTDropPage = ({ collection }: Props) => {
  const router = useRouter();
  const connectWithMetaMask = useMetamask();
  const address = useAddress();
  const disconnect = useDisconnect();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const reDirect = () => {
    router.push("/");
  };

  const [claimedSupply, setClaimedSupply] = useState<number | undefined>();
  const [totalSupply, setTotalSupply] = useState<number | undefined>();
  const [price, setPrice] = useState<string>();

  const { contract: nftDrops } = useContract(collection.address);

  //NFT METADATA
  const { data: claimedNFTs } = useClaimedNFTSupply(nftDrops);
  const { data: totalNFTs } = useTotalCount(nftDrops);

  const { data: claimConditions } = useClaimConditions(nftDrops);

  const {
    mutate: claimNFT,
    isLoading: isClaimLoading,
    error: claimError,
  } = useClaimNFT(nftDrops);

  useEffect(() => {
    if (!nftDrops) return;

    const fetchNFTData = async () => {
      setLoading(true);

      setClaimedSupply(claimedNFTs?.toNumber());
      setTotalSupply(totalNFTs?.toNumber());
      setPrice(claimConditions?.[0].currencyMetadata.displayValue);
      setLoading(false);
    };
    fetchNFTData();
  }, [nftDrops, claimedNFTs, totalNFTs, claimConditions]);

  const claimTheNFT = () => {
    const notification = toast.loading("Minting, Please Wait...", {
      style: {
        background: "white",
        color: "green",
        fontWeight: "bolder",
        fontSize: "17px",
        padding: "20px",
      },
    });
    claimNFT(
      { to: address, quantity: 1 },
      {
        onSuccess() {
          toast.dismiss(notification);
          toast(
            "You've successfully minted the NFT!, redirecting to Home Page..",
            {
              duration: 5000,
              style: {
                background: "green",
                color: "white",
                fontWeight: "bolder",
                fontSize: "17px",
                padding: "20px",
              },
            }
          );
          setTimeout(reDirect, 6000);
        },
        onError() {
          toast.dismiss(notification);
          toast("Woah! something went wrong!", {
            duration: 5000,
            style: {
              background: "red",
              color: "white",
              fontWeight: "bolder",
              fontSize: "15px",
              padding: "20px",
            },
          });
        },
      }
    );
  };

  return (
    <div className="flex h-screen flex-col lg:grid lg:grid-cols-10">
      <Toaster position="top-center" />
      {error && <p className="po"></p>}
      {/* LEFT */}
      <div className="bg-gradient-to-br from-pink-500 to-purple-600 lg:col-span-4">
        <div className="flex flex-col items-center justify-center py-2 lg:min-h-screen">
          <div className="bg-gradient-to-br from-black  p-2 rounded-3xl">
            <img
              className="w-44 object-cover rounded-xl lg:h-96 lg:w-96"
              src={urlFor(collection.previewImage).url()}
              alt="nft"
            />
          </div>

          <div className="space-y-3 p-5 text-center">
            <h1 className="text-4xl font-bold text-white">Mint IT!</h1>
            <h2 className="text-xl text-gray-300">
              Grab some fresh NFTs and mint em for completely free!
            </h2>

            <h3 className="text-xl text-white py-4">
              You can checkout your claimed NFTs on{" "}
              <a
                target="__blank"
                href="https://testnets.opensea.io/"
                className="text-yellow-500 hover:text-black"
              >
                Opensea testnet!
              </a>{" "}
            </h3>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex flex-col p-12 lg:col-span-6">
        {/* HEADER */}
        <header className="flex items-center justify-between">
          <Link href={"/"}>
            <h1 className="w-52 cursor-pointer text-xl font-extralight sm:w-80">
              The{" "}
              <span className="font-extrabold underline decoration-pink-600/50">
                Official NFT
              </span>{" "}
              Market Place
            </h1>
          </Link>

          <button
            className="rounded-2xl bg-rose-400 text-sm px-3 py-2
          font-bold text-white lg:rounded-full lg:px-5 lg:py-3 lg:text-base"
            onClick={() => {
              address ? disconnect() : connectWithMetaMask();
            }}
          >
            {address ? "Sign Out" : "Sign In"}
          </button>
        </header>

        <hr className="my-2 border" />

        {address && (
          <p className="text-center text-sm text-rose-500">
            You've logged in with wallet {address.substring(0, 5)}...
            {address.substring(address.length - 5)}
          </p>
        )}
        {/* CONTENTS */}

        <div
          className="mt-10 flex flex-1 flex-col items-center space-y-6 
        text-center lg:space-y-0 lg:justify-center"
        >
          <img
            className="w-80 object-cover pb-10 lg:h-40"
            src={urlFor(collection.mainImage).url()}
          />
          <h1 className="text-3xl line-h-2 font-bold lg:text-5xl lg:text-extrabold">
            {collection.title} | NFT Drops
          </h1>

          <h2 className="text-2xl line-h-2 py-3 font-bold lg:text-3xl lg:text-extrabold">
            {collection.description}
          </h2>

          {loading ||
          totalSupply === undefined ||
          claimedSupply === undefined ? (
            <img
              className="h-40 w-80 object-cover"
              src={`https://cdn.hackernoon.com/images/0*4Gzjgh9Y7Gu8KEtZ.gif`}
            />
          ) : (
            <p className="pt-5 text-xl text-green-500">
              {claimedSupply}/{totalSupply} NFTs are claimed!
            </p>
          )}
        </div>
        {/* MINT BUTTON */}

        <button
          disabled={
            loading ||
            totalSupply === undefined ||
            claimedSupply === undefined ||
            price === undefined ||
            !address ||
            totalSupply === claimedSupply
          }
          className="h-16 w-full rounded-full bg-orange-500 
        text-white mt-10 font-bold disabled:bg-gray-500"
          onClick={claimTheNFT}
        >
          {loading ||
          totalSupply === undefined ||
          claimedSupply === undefined ||
          price === undefined ? (
            <>Loading</>
          ) : claimedSupply === totalSupply ? (
            <>SOLD OUT!</>
          ) : !address ? (
            <>Sign In To Mint</>
          ) : (
            <span className="font-bold">Mint NFT ({price} MATIC)</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default NFTDropPage;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const query = `* [_type == "collection" && slug.current == $id][0] {
    _id,
    title,
    address,
    description,
    nftCollectionName,
    mainImage {
      asset
    },
    previewImage {
      asset
    },
    slug {
      current
    },
    creator-> {
      _id,
      name,
      address,
      slug {
        current
      }
    }
  }`;

  const collection = await sanityClient.fetch(query, {
    id: params?.id,
  });

  if (!collection) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      collection,
    },
  };
};
