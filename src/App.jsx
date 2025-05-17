import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contract";
import styles from "./App.module.css";

const BASE_CHAIN_ID = 8453; // Base Mainnet Chain ID

export default function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [networkId, setNetworkId] = useState(null);
  const [contract, setContract] = useState(null);

  const [contractBalance, setContractBalance] = useState("0");
  const [timeLeft, setTimeLeft] = useState(0);
  const [owner, setOwner] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  const [beneficiaryInput, setBeneficiaryInput] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Setup wallet
  useEffect(() => {
    if (window.ethereum) {
      const prov = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(prov);

      prov.getNetwork().then((net) => setNetworkId(net.chainId));

      window.ethereum.on("chainChanged", (chainIdHex) => {
        setNetworkId(parseInt(chainIdHex, 16));
      });
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setSigner(prov.getSigner());
        } else {
          setWalletAddress("");
          setSigner(null);
        }
      });
    } else {
      setErrorMsg("No Ethereum wallet detected.");
    }
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    try {
      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setSigner(provider.getSigner());
        setStatusMsg("Wallet connected.");
      }
    } catch {
      setErrorMsg("Wallet connection failed.");
    }
  };

  // Load contract
  useEffect(() => {
    if (signer && networkId === BASE_CHAIN_ID) {
      const c = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(c);
    } else {
      setContract(null);
    }
  }, [signer, networkId]);

  // Load contract data
  const loadContractData = async () => {
    if (!contract) return;
    try {
      const [status, bal, ownerAddr, beneficiaryAddr] = await Promise.all([
        contract.getStatus(),
        provider.getBalance(CONTRACT_ADDRESS),
        contract.owner(),
        contract.beneficiary(),
      ]);
      setTimeLeft(status.timeLeft.toNumber());
      setContractBalance(ethers.utils.formatEther(bal));
      setOwner(ownerAddr);
      setBeneficiary(beneficiaryAddr);
    } catch (error) {
      setErrorMsg("Failed to load contract data.");
    }
  };

  useEffect(() => {
    if (contract) {
      loadContractData();
      const interval = setInterval(() => loadContractData(), 10000);
      return () => clearInterval(interval);
    }
  }, [contract]);

  const formatTimeLeft = (seconds) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  const sendKeepAlive = async () => {
    if (!contract) return;
    try {
      setStatusMsg("Sending keepAlive...");
      const tx = await contract.keepAlive();
      await tx.wait();
      setStatusMsg("keepAlive successful.");
      loadContractData();
    } catch {
      setErrorMsg("keepAlive failed.");
    }
  };

  const setBeneficiaryAddress = async () => {
    if (!contract) return;
    if (!ethers.utils.isAddress(beneficiaryInput)) {
      setErrorMsg("Invalid address.");
      return;
    }
    try {
      setStatusMsg("Setting beneficiary...");
      const tx = await contract.setBeneficiary(beneficiaryInput);
      await tx.wait();
      setStatusMsg("Beneficiary set successfully.");
      loadContractData();
    } catch {
      setErrorMsg("Failed to set beneficiary.");
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Crypto Legacy Box</h1>
        <p>
          A decentralized inheritance vault that automatically transfers your crypto
          to a beneficiary after inactivity.
        </p >
        <button onClick={connectWallet} className={styles.button}>
          {walletAddress ? "Wallet Connected" : "Connect Wallet"}
        </button>
      </header>

      {networkId !== BASE_CHAIN_ID && (
        <div className={styles.alert}>Please switch to Base Mainnet (Chain ID 8453).</div>
      )}

      <section className={styles.statusPanel}>
        <h2>Vault Status</h2>
        <p><strong>Contract Address:</strong> {CONTRACT_ADDRESS}</p >
        <p><strong>Owner Address:</strong> {owner}</p >
        <p><strong>Beneficiary:</strong> {beneficiary || "Not set"}</p >
        <p><strong>Time Left:</strong> {formatTimeLeft(timeLeft)}</p >
        <p><strong>Vault Balance:</strong> {contractBalance} ETH</p >
      </section>

      <section className={styles.actions}>
        <h2>Actions</h2>
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="Enter beneficiary address"
            value={beneficiaryInput}
            onChange={(e) => setBeneficiaryInput(e.target.value)}
          />
          <button onClick={setBeneficiaryAddress}>Set Beneficiary</button>
        </div>
        <button onClick={sendKeepAlive} className={styles.keepAliveBtn}>
          Send KeepAlive Signal
        </button>
      </section>

      <section className={styles.messages}>
        {statusMsg && <div className={styles.success}>{statusMsg}</div>}
        {errorMsg && <div className={styles.error}>{errorMsg}</div>}
      </section>

      <section className={styles.adBanner}>
        <h3>Sponsored</h3>
        <a href=" " target="_blank" rel="noreferrer">
          < img src="https://via.placeholder.com/728x90.png?text=Your+Ad+Here" alt="Ad banner" />
        </a >
      </section>

      <footer className={styles.footer}>
        <p>
          Crypto Legacy Box is a decentralized tool built for secure inheritance on-chain. <br />
          You retain full control until your inactivity triggers the vault's transfer logic.
        </p >
        <p>Base Chain · Open Source · Free to Use</p >
      </footer>
    </div>
  );
}