import React, { useState, useEffect } from "react";
import { useAccount, useContract, useNetwork, useSigner } from 'wagmi';
import { formatUnits, parseUnits } from "@ethersproject/units";

import { addresses, abis } from "@project/contracts";
import { ApprovalButton } from "./ApprovalButton";
import { Centered } from "../Styles";
import { GameContainer } from "./GameStyles";
import { DoubleOrNothing } from "./DoubleOrNothing";
import { DropDown } from "../DropDown/DropDown";

export const FlipGame = (() => {
  const tokens = ["BSCF", "BNB"];
  const requiredAllowance = parseUnits("5", 23);

  const toggling = () => setIsOpen(!isOpen);

  const [{ data: signer, error: signerError, loading: loadingSigner }, getSigner] = useSigner();
  const [{ data: network, error: networkError, loading: loadingNetwork }, switchNetwork] = useNetwork();
  const [{ data: account }, disconnect] = useAccount({ fetchEns: false, });

  const [approved, setApproved] = useState(false);
  const [chainId, setChainId] = useState(56);
  const [renderPage, setRenderPage] = useState(false);
  const [wrongChain, setWrongChain] = useState(false);
  const [connected, setConnected] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [selectedTokenAddress, setSelectedTokenAddress] = useState(addresses[chainId].bscF);
  const [isOpen, setIsOpen] = useState(false);

  const bscF = useContract({
    addressOrName: addresses[chainId].bscF,
    contractInterface: abis.bscF,
    signerOrProvider: signer,
  });
  const game = useContract({
      addressOrName: addresses[chainId].bscCoinFlip,
      contractInterface: abis.bscCoinFlip,
      signerOrProvider: signer,
  });

  const onOptionClicked = value => () => {
    setSelectedToken(value);
    setIsOpen(false);
  };

  const approvedListener = async (owner, spender, value) => {
    if (owner === bscF.signer) {
      const allowance = await bscF.allowance(account.address, game.address);
      setApproved(allowance._hex > requiredAllowance._hex);
    }
  };

  useEffect(() => {
    if (bscF && bscF.signer) {
      bscF.on("Approval", approvedListener);
    }

    return () => {
      if (bscF && bscF.signer) {
        bscF.off("Approval", approvedListener);
      }
    }
  }, [bscF]);

  useEffect(() => {
    if (selectedToken === "BNB") {
      setSelectedTokenAddress(addresses[chainId].bnb);
    } else if (selectedToken === "BSCF") {
      setSelectedTokenAddress(addresses[chainId].bscF);
    }
  }, [selectedToken, chainId]);

  useEffect(() => {
    const showAllowances = async () => {
      if (network.chain?.id === 56) {
        setChainId(56);
        setWrongChain(false);
      } else if (network.chain?.id === 97) {
        setChainId(97);
        setWrongChain(false);
      } else {
        setWrongChain(true);
      }

      if(!account) {
        setConnected(false);
      }

      if (game && bscF && account && bscF.signer) {
        try {
          setConnected(true);
          const tokenBalance = await bscF.balanceOf(account.address);
          setTokenBalance(formatUnits(tokenBalance.toString()));
          if (selectedToken !== "BNB") {
            const allowance = await bscF.allowance(account.address, game.address);
            setApproved(allowance._hex > requiredAllowance._hex);
          } else {
            setApproved(true);
          }
          setRenderPage(true);
        } catch (error) {
          console.log(error);
          setRenderPage(false);
        }
      }
    };
    showAllowances();
  }, [network, setTokenBalance]);

  return (
    <GameContainer>
      {!connected ?
      <Centered>CONNECT YOUR ACCOUNT TO START FLIPPING</Centered> :
      <Centered>YOUR $BSCF TOKEN BALANCE: {tokenBalance}</Centered>
      }
      {renderPage && !approved && connected &&
        <ApprovalButton bscF={bscF} game={game} />
      }
      {renderPage && approved && connected &&
        <div>
          <DropDown 
            options={tokens}
            onOptionClicked={onOptionClicked}
            selectedOption={selectedToken} 
            isOpen={isOpen}
            toggling={toggling} />
          <DoubleOrNothing gameToken={selectedTokenAddress} game={game} />
        </div>
      }
      {!renderPage && wrongChain && connected &&
        <Centered>WRONG CHAIN! PLEASE CONNECT TO BSC</Centered>
      }
      {!renderPage && !wrongChain && connected &&
        <Centered>ERROR LOADING GAME</Centered>
      }
    </GameContainer>
  );
});