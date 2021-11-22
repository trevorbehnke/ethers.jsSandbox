import "./App.css";
import { ethers } from "ethers";
import Greeter from "./artifacts/contracts/Greeter.sol/Greeter.json";
import { useState, useEffect } from "react";
import Pending from "./components/Pending";

const greeterAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer);

function App() {
  const [blockNumber, setBlockNumber] = useState(0);
  const [contractBalance, setContractBalance] = useState(0);
  const [signerBalance, setSignerBalance] = useState(0);
  const [greeting, setGreeting] = useState("");
  const [greetingValue, setGreetingValue] = useState("");
  const [status, setStatus] = useState("Ready to go!");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    getContractData();
  }, [greeting]);

  useEffect(() => {
    const init = async () => {
      const _greeting = await contract.greet();
      setGreeting(_greeting);
    };
    init();
  });

  const getContractData = async () => {
    const blockNumber = await provider.getBlockNumber();
    setBlockNumber(blockNumber);
    const contractBalance = await provider.getBalance(greeterAddress);
    // Need to convert from BigNumber to number in ether
    setContractBalance(ethers.utils.formatEther(contractBalance));
    const signerBalance = await signer.getBalance();
    setSignerBalance(ethers.utils.formatEther(signerBalance));
    console.log("Contract:", contract);
    console.log("Contract Address:", contract.address);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("Initiating transaction...(confirm with MetaMask)");
    setPending(true);
    const tx = await contract.setGreeting(greetingValue);
    await tx.wait();
    setStatus("Transaction complete!");
    console.log("Transaction:", tx);
    setGreetingValue("");
    setPending(false);
    setTimeout(() => {
      setStatus("Ready to go!");
    }, 5000);
  };

  return (
    <div className="App">
      <header className="App-header">
        <Pending />
        <h1>Ethereum Demo</h1>
        <p>Greeter Contract Address: {greeterAddress}</p>
        {signerBalance ? (
          <p>Your Balance (ETH): {signerBalance}</p>
        ) : (
          "Please connect to MetaMask"
        )}
        {blockNumber && <p>Contract Block Number: {blockNumber}</p>}
        {contractBalance && <p>Contract Balance: {contractBalance}</p>}
        {greeting && <p>Greeting: {greeting}</p>}
        <form onSubmit={(e) => handleSubmit(e)}>
          <input
            onChange={(e) => setGreetingValue(e.target.value)}
            placeholder="Set new greeting..."
            value={greetingValue}
          />
          <button type="submit">Send</button>
        </form>
        <p>Status: {status}</p>
        {pending && <p>Pending...</p>}
      </header>
    </div>
  );
}

export default App;
