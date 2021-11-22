import "./App.css";
import { ethers } from "ethers";
import Greeter from "./artifacts/contracts/Greeter.sol/Greeter.json";
import { useState, useEffect } from "react";
import Fox from "./assets/metaMaskFox.png";
import Pending from "./components/Pending";

const greeterAddress = "0xC370Af02213Ac277bE1e0EA29E53Af4b1107E51D";

function App() {
  const [connected, setConnected] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [greetingValue, setGreetingValue] = useState("");
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
        setStatus("Initiating Transaction...");
        setPending(true);
        const tx = await contract.setGreeting(greetingValue);
        setStatus("Transaction Processing...");
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
        setPending(false);
        setStatus("Transaction Rejected...");
        setTimeout(() => {
          setStatus("Ready to go!");
        }, 3000);
      }
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (greetingValue.length > 0) {
      updateGreeting();
    } else {
      alert("Please add text to the input field...");
    }
  };

  function connectedTrue() {
    return (
      <div>
        <p
          style={
            status === "Transaction Rejected..."
              ? { color: "red" }
              : { color: "lime" }
          }
        >
          Status: {status}
        </p>
        {pending ? <Pending /> : <h3>Message: {greeting}</h3>}
        <form onSubmit={(e) => handleSubmit(e)}>
          <input
            onChange={(e) => setGreetingValue(e.target.value)}
            placeholder="Set new message..."
            value={greetingValue}
            maxLength="30"
          />
          <button type="submit">Send</button>
        </form>
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
