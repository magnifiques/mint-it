import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { sanityClient, urlFor } from "../sanity";
import { Collection } from "../typing";

interface Props {
  collection: Collection[];
}

const Home = ({ collection }: Props) => {
  return (
    <div className="mx-auto max-w-7xl flex flex-col min-h-screen py-10 px-10 2xl:px-0">
      <Head>
        <title>Mint It</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="mb-10 text-4xl font-extralight">
        <span className="font-extrabold text-purple-500">MINT IT!</span>- The{" "}
        <span className="font-extrabold underline decoration-pink-600/50">
          Official NFT
        </span>{" "}
        Market Place
      </h1>

      <main className="bg-gray-200 p-10 shadow-xl shadow-rose-200">
        <div className="grid space-x-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {collection.map((collection) => (
            <Link key={collection._id} href={`/nft/${collection.slug.current}`}>
              <div
                className="flex flex-col cursor-pointer
            transition-all duration-200 hover:scale-105"
              >
                <img
                  className="h-96 w-96 rounded-2xl object-cover"
                  src={urlFor(collection.mainImage).url()}
                  alt=""
                />{" "}
                <div className="p-2">
                  <h2 className="text-3xl">{collection.title}</h2>
                  <p className="mt-2 text-sm text-gray-500">
                    {collection.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async () => {
  const query = `* [_type == "collection"] {
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

  const collection = await sanityClient.fetch(query);

  return {
    props: {
      collection,
    },
  };
};
