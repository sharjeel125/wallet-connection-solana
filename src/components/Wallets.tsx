import { Button, Image, Text, VStack, Box, Divider } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, LAMPORTS_PER_SOL, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { useEffect, useState } from "react";


const connection = new Connection(clusterApiUrl("devnet"))

const Wallets = () => {
  const { select, wallets, publicKey, disconnect } = useWallet();

  const [solBalance, setSolBalance] = useState<number>(0);
  const [userSPLTokenAccounts, setUserSPLTokenAccounts] = useState([]);

  const getUsersTokenAccounts = async (MY_WALLET_ADDRESS: any) => {
    const tempArr: any = []
    const accounts = await connection.getParsedProgramAccounts(
      new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      {
        filters: [
          {
            dataSize: 165,
          },
          {
            memcmp: {
              offset: 32,
              bytes: MY_WALLET_ADDRESS,

            },
          },
        ],
      }
    );
    accounts.forEach((account, i) => {
      //Parse the account data
      const parsedAccountInfo: any = account.account.data;
      const mintAddress = parsedAccountInfo["parsed"]["info"]["mint"];
      const tokenBalance = parsedAccountInfo["parsed"]["info"]["tokenAmount"]["uiAmount"];
      tempArr.push({
        tokenAccount: account.pubkey.toString(),
        tokenMint: mintAddress,
        tokenBalance: tokenBalance
      })
    });
    setUserSPLTokenAccounts(tempArr)
  };

  const getSolBalance = async (publicKey: PublicKey) => {
    const balanceInLamports = await connection.getBalance(publicKey)
    setSolBalance(balanceInLamports / LAMPORTS_PER_SOL)
    getUsersTokenAccounts(publicKey)
  };

  useEffect(() => {
    if (publicKey) {
      getSolBalance(publicKey)
    }
  }, [publicKey])


  return (
    <VStack align="stretch" spacing={6} p={6}>
      {!publicKey ? (
        wallets.filter((wallet) => wallet.readyState === "Installed").length > 0 ? (
          wallets
            .filter((wallet) => wallet.readyState === "Installed")
            .map((wallet) => (
              <Button
                key={wallet.adapter.name}
                onClick={() => select(wallet.adapter.name)}
                w="100%"
                size="lg"
                fontSize="md"
                leftIcon={
                  <Image
                    src={wallet.adapter.icon}
                    alt={wallet.adapter.name}
                    h={6}
                    w={6}
                  />
                }
              >
                {wallet.adapter.name}
              </Button>
            ))
        ) : (
          
          <Text fontSize="lg">
          No wallet found. Please download a supported Solana wallet.
          <Box as="a" href="https://phantom.app/" color="blue.500" ml={1}>
            Download from here.
          </Box>
        </Text>
        )
      ) : (
        <VStack align="stretch" spacing={4}>
          <Text fontSize="lg">Connected Wallets </Text>
          <Box borderWidth="1px" borderRadius="lg" p={4}>
            <Text>Public Key: {publicKey.toBase58()}</Text>
            <Button onClick={disconnect} colorScheme="red" m={2}>
              Disconnect Wallet
            </Button>
            <Text mt={2}>Solana Balance: {solBalance} SOL</Text>
            <Text mt={2}>Other Tokens:</Text>
            <Divider mt={2} />
            {userSPLTokenAccounts.map((e: any, index: number) => (
              <Box key={index} borderWidth="1px" borderRadius="md" p={2} mt={5}>
                <Text>Token Account: {e.tokenAccount}</Text>
                <Text>Token Balance: {e.tokenBalance}</Text>
                <Text>Mint Address: {e.tokenMint}</Text>
              </Box>
            ))}
          </Box>
        </VStack>
      )}
    </VStack>
  );
};

export default Wallets;
