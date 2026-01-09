import { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  Wallet,
  LogOut,
  Hand,
  Fingerprint,
  ExternalLink,
  Shield
} from "lucide-react";

import { getReadContract, getWriteContract } from "./blockchain/contract";
import TicketForm from "./components/TicketForm";
import TicketList from "./components/TicketList";
import TicketStat from "./components/TicketStat";

export default function App() {
  /* ================= STATE ================= */
  const [tickets, setTickets] = useState([]);
  const [account, setAccount] = useState(null);
  const [owner, setOwner] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  /* ================= CONFIG ================= */
  const TOTAL_QUOTA = 20;

  /* ================= DERIVED ================= */
  const isOwner =
    account && owner && account.toLowerCase() === owner.toLowerCase();

  /* ================= LOAD DATA ================= */
  const loadTickets = async () => {
    try {
      const contract = getReadContract();
      const data = await contract.getAllTickets();
      setTickets(data);
    } catch (err) {
      console.error("LOAD TICKETS ERROR:", err);
      setError("Gagal memuat data dari blockchain");
    }
  };

  const loadOwner = async () => {
    try {
      const contract = getReadContract();
      const ownerAddr = await contract.owner();
      setOwner(ownerAddr);
    } catch (err) {
      console.error("LOAD OWNER ERROR:", err);
    }
  };

  /* ================= WALLET ================= */
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Wallet tidak ditemukan. Gunakan MetaMask / Wallet Browser");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
  };

  const disconnectWallet = () => {
    setAccount(null);
  };

  /* ================= WRITE ================= */
  const mintTicket = async (name) => {
    try {
      const contract = await getWriteContract();
      const tx = await contract.issueTicket(name);
      await tx.wait();
      loadTickets();
    } catch (err) {
      console.error("MINT ERROR:", err);
      alert("Mint ticket gagal");
    }
  };

  /* ================= INIT ================= */
  useEffect(() => {
    loadTickets();
    loadOwner();
  }, []);

  /* ================= UI ================= */
  return (
    <div className="container">
      {/* ================= HEADER CARD BARU ================= */}
      <div className="header-card">
        <div className="header-card-left">
          {/* JUDUL */}
          <div className="header-title-section">
            <h2>🎟 Ticket InnoView Academy</h2>
            <p className="subtitle">
              Materi: Basic Programmer – Mengenal Teknologi Web
            </p>

            <p className="scarcity">
              Scarcity Ticket: Sistem blockchain untuk tiket yang terbatas, data tetap, dan tidak dapat diubah.
              <br />
            </p>
          </div>
        </div>

        <div className="header-card-right">
          {/* KANAN: WALLET SECTION */}
          <div className="wallet-section">
            {!account ? (
              <button onClick={connectWallet} className="btn-wallet-connect">
                <Wallet size={18} />
                <div className="wallet-text">
                  <span className="wallet-title">Connect Wallet</span>
                  <span className="wallet-desc">Metamask / Browser Wallet</span>
                </div>
              </button>
            ) : (
              <div className="account-connected">
                <div className="account-status">
                  <Shield size={16} />
                  <span className={isOwner ? "owner" : "guest"}>
                    {isOwner ? "Owner" : "Account Tamu"}
                  </span>
                </div>
                <div className="account-address">
                  <small>{account.slice(0, 6)}...{account.slice(-4)}</small>
                </div>
                <button onClick={disconnectWallet} className="btn-disconnect">
                  <LogOut size={14} /> Disconnect
                </button>
              </div>
            )}
          </div>
          
          {/* KIRI: VIEW BLOCKCHAIN LINK - Dipindah ke kiri bawah */}
          <a
            className="blockchain-link-card"
            href="https://eth-sepolia.blockscout.com/address/0x92228f213CCE1b317f112bd09C70E03e73c77095"
            target="_blank"
            rel="noreferrer"
          >
            <div className="blockchain-link-content">
              <Hand size={18} />
              <span>View Blockchain</span>
              <Fingerprint size={18} />
              <ExternalLink size={16} />
            </div>
            <div className="blockchain-link-desc">
              Lihat transaksi di blockchain explorer
            </div>
          </a>
        </div>
      </div>

      {/* ================= AREA DI BAWAH HEADER (TETAP SAMA) ================= */}
      {/* ================= STAT ================= */}
      <TicketStat
        quota={TOTAL_QUOTA}
        issued={tickets.length}
      />

      {/* ================= OWNER FORM ================= */}
      {isOwner && <TicketForm onMint={mintTicket} />}

      {/* ================= SEARCH ================= */}
      <div className="list-header">
        <input
          className="search"
          placeholder="Cari nama peserta..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ================= LIST ================= */}
      {error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <TicketList tickets={tickets} search={search} />
      )}
    </div>
  );
}