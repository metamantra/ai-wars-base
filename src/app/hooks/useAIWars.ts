"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { ethers } from 'ethers';

// 1. TESTNET CONFIGURATION
const CONTRACT_ADDRESS = "0xB1Ee39E180f76953A0f1781AB86787af8ff911c8"; 
const RPC_URL = "https://sepolia.base.org"; 
const CHAIN_ID_HEX = "0x2105"; // 0x14a34 & 84532 (Base Sepolia) 0x2105 & 8453 (Base Mainnet)
const CHAIN_ID_DEC = BigInt(8453); // Fixed for older TS versions

const ABI = [
  // Writes
  "function register(address referrer) external payable",
  "function buyMiner(uint256 minerIndex, uint256 amount) external payable",
  "function buyDefense() external payable",
  "function buySynRefill() external payable",
  "function launchPremiumAttack() external payable",
  "function launchStandardAttack() external",
  "function buyCoolingBoost() external",
  "function upgradePrestige() external",
  "function cashoutSynToEth() external",
  "function withdrawReferralEth() external",
  "function reinvestReferral(uint256 minerIndex, uint256 amount) external",
  // Reads
  "function getEffectiveHashrate(address user) view returns (uint256)",
  "function getTotalClaimableSyn(address user) view returns (uint256)",
  "function totalGlobalHashrate() view returns (uint256)",
  "function getPlayerCount() view returns (uint256)",
  "function withdrawalsEnabled() view returns (bool)", 
  "function players(address user) view returns (bool isRegistered, address referrer, uint256 baseHashrate, uint256 prestigeLevel, uint256 defenseLevel, uint256 attackDebuffEndTime, bool isPremiumDebuff, uint256 lastAttackedTime, uint256 coolingBoostEndTime, uint256 rewardDebt, uint256 pendingInternalSyn, uint256 pendingReferralEth)"
];

export type ToastMessage = { title: string; msg: string; type: 'success' | 'error' | 'info' } | null;

export const useAIWars = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [toast, setToast] = useState<ToastMessage>(null);

  const [stats, setStats] = useState({
    hashrate: "0",
    synBalance: "0.00",
    ethPendingRef: "0.00",
    isRegistered: false,
    defenseLevel: 0,
    prestigeLevel: 0,
    globalHash: "0",
    globalPlayers: "0",
    vaultBalance: "0.00",
    isVaultOpen: false,
    refLink: "",
    debuffEnd: 0,
    immunityEnd: 0,
    coolingEnd: 0,
    isPremiumDebuff: false
  });

  const [liveBalance, setLiveBalance] = useState("0.00");
  const balanceRef = useRef(0);
  const hashrateRef = useRef(0);
  const globalHashRef = useRef(1);

  // --- REFERRAL TRACKING: CAPTURE ON LOAD ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const refParam = params.get('ref');
        
        // If URL has a valid ref address, save it to persistent storage
        if (refParam && ethers.isAddress(refParam)) {
            localStorage.setItem('aiwars_referrer', refParam);
            console.log("Referral Uplink Locked:", refParam);
        }
    }
  }, []);

  // --- DATA FETCHING ENGINE ---
  const fetchData = useCallback(async (userAddr: string, c: ethers.Contract, p: any) => {
    try {
        const [gHash, gPlayers, vaultBal, vaultStatus] = await Promise.all([
            c.totalGlobalHashrate(),
            c.getPlayerCount(),
            p.getBalance(CONTRACT_ADDRESS),
            c.withdrawalsEnabled()
        ]);

        const [pData, effHash, claimable] = await Promise.all([
            c.players(userAddr),
            c.getEffectiveHashrate(userAddr),
            c.getTotalClaimableSyn(userAddr)
        ]);

        const balance = parseFloat(ethers.formatEther(claimable));
        
        // FIX: Treat hashrate as a raw Integer (Number), NOT Ether (decimals)
        const hRate = Number(effHash); 
        const gHashNum = Number(gHash);
        
        balanceRef.current = balance;
        hashrateRef.current = hRate;
        globalHashRef.current = gHashNum; 
        setLiveBalance(balance.toFixed(4));

        setStats(prev => ({
            ...prev,
            // FIX: Convert directly to string (No formatEther)
            hashrate: effHash.toString(), 
            synBalance: ethers.formatEther(claimable),
            ethPendingRef: ethers.formatEther(pData.pendingReferralEth),
            isRegistered: pData.isRegistered,
            defenseLevel: Number(pData.defenseLevel),
            prestigeLevel: Number(pData.prestigeLevel),
            // FIX: Convert directly to string
            globalHash: gHash.toString(),
            globalPlayers: gPlayers.toString(),
            vaultBalance: ethers.formatEther(vaultBal),
            isVaultOpen: vaultStatus,
            debuffEnd: Number(pData.attackDebuffEndTime),
            immunityEnd: Number(pData.lastAttackedTime) + (12 * 3600),
            coolingEnd: Number(pData.coolingBoostEndTime),
            isPremiumDebuff: pData.isPremiumDebuff
        }));

    } catch (e) { console.error("Fetch Error:", e); }
  }, []);

  // --- INITIAL SETUP ---
  useEffect(() => {
    const init = async () => {
      try {
          const rProvider = new ethers.JsonRpcProvider(RPC_URL);
          const rContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, rProvider);
          const [gHash, gPlayers, vaultBal, vaultStatus] = await Promise.all([
            rContract.totalGlobalHashrate(),
            rContract.getPlayerCount(),
            rProvider.getBalance(CONTRACT_ADDRESS),
            rContract.withdrawalsEnabled()
          ]);
          setStats(prev => ({
             ...prev, 
             globalHash: gHash.toString(), // Fixed
             globalPlayers: gPlayers.toString(),
             vaultBalance: ethers.formatEther(vaultBal),
             isVaultOpen: vaultStatus
          }));
          globalHashRef.current = Number(gHash); // Fixed
      } catch(e) {}

      if ((window as any).ethereum) {
        const bp = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await bp.listAccounts();
        if (accounts.length > 0) connect();
      }
    };
    init();
  }, [fetchData]);

  // --- LIVE TICKER ---
  useEffect(() => {
    const interval = setInterval(() => {
      if (hashrateRef.current > 0) {
        const share = hashrateRef.current / (globalHashRef.current || 1);
        const emissionPerSec = 10000; 
        const earnedPerTick = (share * emissionPerSec) / 10; 
        balanceRef.current += earnedPerTick;
        setLiveBalance(balanceRef.current.toFixed(4));
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // --- HELPER: TOASTS ---
  const notify = (title: string, msg: string, type: 'success' | 'error' | 'info') => {
      setToast({ title, msg, type });
      setTimeout(() => setToast(null), 5000);
  };

  // --- CONNECT ---
  const connect = async () => {
    if (!(window as any).ethereum) return notify("Wallet Error", "No Web3 Wallet Detected", "error");
    
    try {
        const chainId = await (window as any).ethereum.request({ method: 'eth_chainId' });
        if (chainId !== CHAIN_ID_HEX) {
            await (window as any).ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: CHAIN_ID_HEX }],
            });
        }
    } catch(switchError: any) {
        if(switchError.code === 4902) {
             await (window as any).ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                  chainId: CHAIN_ID_HEX,
                  chainName: 'Base Sepolia',
                  rpcUrls: [RPC_URL],
                  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                  blockExplorerUrls: ['https://sepolia.basescan.org'],
                }],
            });
        }
    }

    const p = new ethers.BrowserProvider((window as any).ethereum);
    const s = await p.getSigner();
    const addr = await s.getAddress();
    const c = new ethers.Contract(CONTRACT_ADDRESS, ABI, s);
    
    setAccount(addr);
    setProvider(p);
    setContract(c);
    
    const origin = window.location.origin;
    setStats(prev => ({...prev, refLink: `${origin}?ref=${addr}`}));

    await fetchData(addr, c, p);
  };

  const execute = async (fn: () => Promise<any>, successMsg: string) => {
    if(!contract || !account || !provider) { connect(); return false; }
    try {
        const tx = await fn();
        notify("Broadcasting", "Transaction sent to Base...", "info");
        await tx.wait();
        notify("Success", successMsg, "success");
        setTimeout(() => fetchData(account, contract, provider), 2000);
        return true;
    } catch (e: any) {
        console.error(e);
        let msg = "Transaction Failed";
        
        const errString = e.toString();
        if (errString.includes("0xf82ce6ee") || errString.includes("NoPlayersToAttack")) msg = "Grid Empty: Need at least 2 players to launch attacks.";
        if (errString.includes("InsufficientPayment")) msg = "Insufficient ETH Sent.";
        if (errString.includes("InsufficientInternalSYN")) msg = "Insufficient SYN Balance.";
        if (errString.includes("TargetIsImmune")) msg = "Target Shielded: Enemy has active immunity.";
        if (errString.includes("user rejected")) msg = "User cancelled transaction.";
        
        notify("Error", msg, "error");
        return false;
    }
  };

  // --- EXPOSED ACTIONS ---
  // Updated Register to check LocalStorage
  const register = async () => execute(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    let referrer = urlParams.get('ref');
    
    // Fallback to memory
    if (!referrer) {
        referrer = localStorage.getItem('aiwars_referrer');
    }

    // Default to Zero
    if (!referrer || !ethers.isAddress(referrer)) {
        referrer = ethers.ZeroAddress;
    }

    return contract!.register(referrer, { value: ethers.parseEther("0.01") });
  }, "Node Registered Successfully");

  const buyMiner = async (id: number, price: string) => execute(
    () => contract!.buyMiner(id, 1, { value: ethers.parseEther(price) }), "Hardware Acquired"
  );
  
  const reinvestMiner = async (id: number) => execute(
    () => contract!.reinvestReferral(id, 1), "Reinvestment Complete"
  );

  const withdrawReferral = async () => execute(() => contract!.withdrawReferralEth(), "Referral ETH Withdrawn");
  const cashout = async () => execute(() => contract!.cashoutSynToEth(), "Cashout Processed");
  
  const attack = async (premium: boolean) => execute(
    () => premium 
        ? contract!.launchPremiumAttack({ value: ethers.parseEther("0.005") }) 
        : contract!.launchStandardAttack(), 
    premium ? "Neural Shock Delivered" : "Data Breach Successful"
  );

  const buyRefill = async () => execute(
    () => contract!.buySynRefill({ value: ethers.parseEther("0.0025") }), "SYN Stores Refilled"
  );

  const activateCooling = async () => execute(
    () => contract!.buyCoolingBoost(), "Cooling Protocols Active"
  );

  const upgradePrestige = async () => execute(
    () => contract!.upgradePrestige(), "System Evolution Complete"
  );

  const upgradeDefense = async () => {
    const cost = 0.00025 * (stats.defenseLevel + 1);
    return execute(
        () => contract!.buyDefense({ value: ethers.parseEther(cost.toString()) }), 
        "Firewall Upgraded"
    );
  }

  return { 
    account, connect, stats, liveBalance, toast, notify, // Export notify for page usage
    register, buyMiner, reinvestMiner, withdrawReferral, 
    attack, cashout, buyRefill, activateCooling, upgradePrestige, upgradeDefense 
  };
};