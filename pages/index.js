import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";
import Chart from 'chart.js/auto';

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [portfolioData, setPortfolioData] = useState({
    labels: ["Solana", "Bitcoin", "Polygon", "Avax", "Ethereum", "Cardano", "Binance Coin", "Tether", "XRP"],
    data: [10, 20, 5, 10, 15, 8, 7, 12, 13], // Add corresponding data values for each currency
    backgroundColor: [
      "rgba(0, 0, 255, 0.2)",   // Blue (Solana)
      "rgba(255, 255, 0, 0.2)",   // Yellow (Bitcoin)
      "rgba(128, 0, 128, 0.2)",  // Dark Purple (Polygon)
      "rgba(255, 0, 0, 0.2)",   // Red (Avax)
      "rgba(165, 42, 42, 0.2)",    // Brown (Ethereum)
      "rgba(255, 192, 203, 0.2)",  // Pink (Cardano)
      "rgba(255, 165, 0, 0.2)",    // Orange (Binance Coin)
      "rgba(0, 0, 0, 0.2)",        // Black (Tether)
      "rgba(0, 255, 255, 0.2)"     // Cyan (XRP)
    ],
    borderColor: [
      "rgba(0, 0, 255, 1)",
      "rgba(255, 255, 0, 1)",
      "rgba(128, 0, 128, 1)",
      "rgba(255, 0, 0, 1)",
      "rgba(165, 42, 42, 1)",
      "rgba(255, 192, 203, 1)",
      "rgba(255, 165, 0, 1)",
      "rgba(0, 0, 0, 1)",
      "rgba(0, 255, 255, 1)"
    ]
  });

  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [adjustedPercentage, setAdjustedPercentage] = useState('');

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

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm && depositAmount) {
      let tx = await atm.deposit(depositAmount);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm && withdrawAmount) {
      let tx = await atm.withdraw(withdrawAmount);
      await tx.wait();
      getBalance();
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
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
        <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="Enter deposit amount" />
        <button onClick={deposit}>Deposit</button>
        <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="Enter withdrawal amount" />
        <button onClick={withdraw}>Withdraw</button>
      </div>
    );
  };

  const adjustPercentage = () => {
    const index = portfolioData.labels.indexOf(selectedCurrency);
    if (index === -1) return;

    const newData = [...portfolioData.data];
    const total = newData.reduce((acc, curr) => acc + curr, 0);
    const currentPercentage = (portfolioData.data[index] / total) * 100;

    if (adjustedPercentage === '' || isNaN(adjustedPercentage)) {
      alert('Please enter a valid percentage.');
      return;
    }

    const newPercentage = parseFloat(adjustedPercentage);
    if (newPercentage < 0 || newPercentage > 100) {
      alert('Percentage must be between 0 and 100.');
      return;
    }

    const diff = newPercentage - currentPercentage;
    if (total + diff > 100) {
      alert('Total percentage cannot exceed 100%.');
      return;
    }

    newData[index] += diff;
    setPortfolioData(prevData => ({
      ...prevData,
      data: newData
    }));
  };

  useEffect(() => {
    getWallet();
  }, []);

  useEffect(() => {
    if (!selectedCurrency || !adjustedPercentage) return;

    adjustPercentage();
    setAdjustedPercentage('');
  }, [selectedCurrency, adjustedPercentage]);

  useEffect(() => {
    const ctx = document.getElementById("portfolio-chart");
    if (ctx) {
      if (ctx.chart) {
        ctx.chart.destroy();
      }
      const newChart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: portfolioData.labels,
          datasets: [{
            data: portfolioData.data,
            backgroundColor: portfolioData.backgroundColor,
            borderColor: portfolioData.borderColor,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true
        }
      });
      return () => newChart.destroy();
    }
  }, [portfolioData]);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      <div>{initUser()}</div>
      <div>
        <p>Portfolio Tracking</p>
        <canvas id="portfolio-chart" width="400" height="400"></canvas>
        <div>
          <select value={selectedCurrency} onChange={(e) => setSelectedCurrency(e.target.value)}>
            <option value="">Select Currency</option>
            {portfolioData.labels.map((currency, index) => (
              <option key={index} value={currency}>{currency}</option>
            ))}
          </select>
          <input type="number" value={adjustedPercentage} onChange={(e) => setAdjustedPercentage(e.target.value)} placeholder="Enter new percentage" />
          <button onClick={adjustPercentage}>Adjust Percentage</button>
        </div>
      </div>
      <style jsx>{`
        .container {
          text-align: center;
        }
        #portfolio-chart {
          margin-top: 10px;
        }
      `}</style>
    </main>
  );
}
