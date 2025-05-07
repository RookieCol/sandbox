"use client";

import {
  ConnectButton,
  MediaRenderer,
  TransactionButton,
  useActiveAccount,
} from "thirdweb/react";
import { client } from "./client";
import { defineChain, getContract, type NFT } from "thirdweb";
import { claimTo } from "thirdweb/extensions/erc721";
import { getOwnedNFTs } from "thirdweb/extensions/erc721";
import { useReadContract } from "thirdweb/react";
import { Router } from "next/router";

export default function Home() {
  const account = useActiveAccount();

  const collection_contract = getContract({
    client,
    address: "0xd013E82A3EE8882B011631F3C86c279559ab53bf",
    chain: defineChain(31),
  });

  const { data, isLoading, refetch } = useReadContract(getOwnedNFTs, {
    contract: collection_contract,
    owner: account?.address || "",
    queryOptions: {
      enabled: !!account?.address,
      refetchInterval: 1000, // optional, for polling
      retry: 2
    },
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-orange-900 to-gray-800 text-white flex items-center justify-center px-4">
      <div className="bg-[#121212] border border-neutral-800 rounded-2xl p-6 w-full max-w-md space-y-6 shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-white">Claim ur NFT :)</h1>
          <p className="text-sm text-neutral-400 mt-2">Connect your wallet to claim your NFT.</p>
        </div>

        <div className="flex flex-col gap-4">
          {/* Connect Button */}
          <ConnectButton client={client}  />

          {/* Only show Claim button if user owns less than 1 NFT */}
          {account && (!data || data.length === 0) && (
            <TransactionButton
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-lg border border-blue-500 transition-all"
              transaction={() =>
                claimTo({
                  contract: collection_contract,
                  to: account.address,
                  quantity: 1n,
                })
              }
              onTransactionSent={(result) => {
                console.log("Transaction submitted", result.transactionHash);
              }}
              onTransactionConfirmed={(receipt) => {
                console.log("Transaction confirmed", receipt.transactionHash);
                window.location.reload();
              }}
              onError={(error) => {
                console.error("Transaction error", error);
              }}
            >
              Claim NFT
            </TransactionButton>
          )}
        </div>

        {/* Display owned NFTs */}
        {data && data.length > 0 && (
          <div className="grid grid-cols-1 gap-6 mt-6">
            {data.map((nft: NFT, index) => (
              <div key={index} className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="flex justify-center">
                  <p className="text-lg font-semibold text-white text-center">{nft.metadata.name}</p>
                </div>
                <div className="relative w-full h-64 overflow-hidden rounded mt-2">
                  <MediaRenderer
                    client={client}
                    src={nft.metadata.image}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
