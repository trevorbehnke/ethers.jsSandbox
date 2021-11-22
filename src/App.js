import "./App.css";
import { ethers } from "ethers";
import Greeter from "./artifacts/contracts/Greeter.sol/Greeter.json";
import { useState, useEffect } from "react";
import Fox from "./assets/metaMaskFox.png";
import Pending from "./components/Pending";

const greeterAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [connected, setConnected] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [greetingValue, setGreetingValue] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [status, setStatus] = useState("Ready to go!");
  const [pending, setPending] = useState(false);

  // fetch the greeting from the contract
  async function fetchGreeting() {
    if (typeof window.ethereum !== "undefined") {
      setConnected(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        greeterAddress,
        Greeter.abi,
        provider
      );
      try {
        const data = await contract.greet();
        console.log("data: ", data);
        setGreeting(data);
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  useEffect(() => {
    fetchGreeting();
  }, []);

  // update the greeting in the contract
  async function updateGreeting() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer);
      try {
        setStatus("Initiating transaction...(confirm with MetaMask)");
        setPending(true);
        const tx = await contract.setGreeting(greetingValue);
        await tx.wait();
        setGreetingValue("");
        setStatus("Transaction complete!");
        setPending(false);
        setTimeout(() => {
          setStatus("Ready to go!");
        }, 5000);
        fetchGreeting();
      } catch (err) {
        console.log("Error: ", err);
        setError(true);
        setErrorMessage("Transaction Rejected...");
        setPending(false);
        setStatus("Ready to go!");
        setTimeout(() => {
          setError(false);
        }, 5000);
      }
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    updateGreeting();
  };

  function connectedTrue() {
    return (
      <div>
        {pending && <Pending />}
        <p>Success: Web3 Injected</p>
        <p>Greeting: {greeting}</p>
        <form onSubmit={(e) => handleSubmit(e)}>
          <input
            onChange={(e) => setGreetingValue(e.target.value)}
            placeholder="Set new greeting..."
            value={greetingValue}
          />
          <button type="submit">Send</button>
        </form>
        {error && <p style={{ color: "red" }}>{errorMessage}</p>}
        <p>Status: {status}</p>
        {pending && <p>Pending...</p>}
      </div>
    );
  }

  function connectedFalse() {
    return (
      <div>
        <p>Please Connect to MetaMask</p>
        <img src={Fox} alt="metamask fox" style={{ width: "200px" }} />
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Ethereum Demo</h1>
        {connected ? connectedTrue() : connectedFalse()}
      </header>
    </div>
  );
}

export default App;
