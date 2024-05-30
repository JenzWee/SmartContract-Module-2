import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";
import jsPDF from "jspdf";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [transactions, setTransactions] = useState([]);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts && accounts.length > 0) {
      console.log("Account connected:", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    try {
      const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
      handleAccount(accounts);
      getATMContract();
    } catch (error) {
      console.error("Error connecting account:", error);
    }
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const balance = await atm.getBalance();
      setBalance(balance.toNumber());
    }
  };

  const performTransaction = async (transactionType, transactionFunction) => {
    if (atm) {
      try {
        const tx = await transactionFunction();
        await tx.wait();
        getBalance();
        updateTransactionHistory(transactionType, 2); // Change amount to 2
      } catch (error) {
        console.error(`Error ${transactionType} transaction:`, error);
      }
    }
  };

  const deposit = () => performTransaction("Top-Up Points", () => atm.deposit(2)); // Change amount to 2
  const withdraw = () => performTransaction("RedeemPoints", () => atm.withdraw(2)); // Change amount to 2

  const updateTransactionHistory = (type, amount) => {
    const newTransaction = {
      type: type,
      amount: amount,
      timestamp: new Date().toLocaleString(),
    };
    setTransactions(prevTransactions => [...prevTransactions, newTransaction]);
  };

  const renderTransactions = () => {
    return transactions.map((transaction, index) => (
      <li key={index}>
        {transaction.type}: {transaction.amount} ETH ({transaction.timestamp})
      </li>
    ));
  };

  const saveTransactionHistoryAsPDF = () => {
    const doc = new jsPDF();
    doc.text("Transaction History", 10, 10);
    let yPos = 20;
    transactions.forEach((transaction, index) => {
      doc.text(`${transaction.type}: ${transaction.amount} ETH (${transaction.timestamp})`, 10, yPos);
      yPos += 10;
    });
    doc.save("transaction_history.pdf");
  };

  const deleteTransactions = () => {
    setTransactions([]);
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <button onClick={deposit}>Top-Up Points 2 ETH</button> {/* Change button text */}
        <button onClick={withdraw}>RedeemPoints 2 ETH</button> {/* Change button text */}
        <button onClick={saveTransactionHistoryAsPDF}>Save Transaction History</button>
        <button onClick={deleteTransactions}>Delete All Transactions</button>
        <h2>Transaction History</h2>
        <ul>{renderTransactions()}</ul>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the WeLoyalty!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          background-color: #edc3c6;
          text-align: center;
          margin: 50px auto;
          padding: 20px;
          max-width: 600px;
          border: 1px solid #ccc;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          font-family: Arial, sans-serif;
        }
      `}</style>
    </main>
  );
}
