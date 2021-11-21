import "./App.css";
import { ethers } from "ethers";
import Greeter from "./artifacts/contracts/Greeter.sol/Greeter.json";
import { useState, useEffect } from "react";

const greeterAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer);

function App() {
  const [blockNumber, setBlockNumber] = useState(0);
  const [contractBalance, setContractBalance] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [signerBalance, setSignerBalance] = useState(0);
  const [greeting, setGreeting] = useState("");
  const [greetingValue, setGreetingValue] = useState("");

  useEffect(() => {
    getContractData();
    fetchGreeting();
  }, []);

  const getContractData = async () => {
    const blockNumber = await provider.getBlockNumber();
    setBlockNumber(blockNumber);
    const contractBalance = await provider.getBalance(greeterAddress);
    // Need to convert from BigNumber to number in ether
    setContractBalance(ethers.utils.formatEther(contractBalance));
    const transactionCount = await provider.getTransactionCount(greeterAddress);
    setTransactionCount(transactionCount);
    const signerBalance = await signer.getBalance();
    setSignerBalance(ethers.utils.formatEther(signerBalance));
    console.log("Contract:", contract);
    console.log("Contract Address:", contract.address);
  };

  const fetchGreeting = async () => {
    const greeting = await contract.greet();
    setGreeting(greeting);
  };

  const sendGreeting = async () => {
    const tx = await contract.setGreeting(greetingValue);
    console.log("Transaction:", tx);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    sendGreeting();
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Ethereum Demo</h1>
        <p>Greeter Contract Address: {greeterAddress}</p>
        {blockNumber && <p>Contract Block Number: {blockNumber}</p>}
        {contractBalance && <p>Contract Balance: {contractBalance}</p>}
        {transactionCount ? (
          <p>Contract Transaction Count: {transactionCount}</p>
        ) : null}
        {signerBalance ? <p>Signer Balance: {signerBalance}</p> : null}
        {greeting && <p>Greeting: {greeting}</p>}
        <form onSubmit={(e) => handleSubmit(e)}>
          <input
            type="text"
            onChange={(e) => setGreetingValue(e.target.value)}
            placeholder="Set new greeting..."
          />
          <button type="submit">Send</button>
        </form>
      </header>
    </div>
  );
}

export default App;
