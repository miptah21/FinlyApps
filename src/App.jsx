import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Github, Twitter, Linkedin } from "lucide-react"; // Tambahkan ini di import atas
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Trash2,
  Edit,
  PlusCircle,
  Sparkles,
  X,
  Settings,
  Upload,
  FileCheck2,
  LayoutDashboard,
  List,
  LogOut,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "./supabaseClient"; // Import the Supabase client
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// --- MODAL COMPONENTS (No changes needed) ---
const Modal = ({
  show,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "OK",
  cancelText = "Batal",
  showCancelButton = true,
}) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white/50 border border-white/20 rounded-xl shadow-lg p-6 w-full max-w-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
        <p className="text-slate-800 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          {showCancelButton && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200/70 text-gray-800 rounded-lg hover:bg-gray-300/80 font-semibold transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// GANTI SELURUH KOMPONEN UpdateModal DENGAN INI
const UpdateModal = ({
  show,
  onClose,
  onUpdate,
  transaction,
  accounts,
  incomeCategories,
  expenseCategories,
}) => {
  const [formState, setFormState] = useState({});

  useEffect(() => {
    if (transaction) {
      setFormState({
        ...transaction,
        date: transaction.date || new Date().toISOString().split("T")[0],
        amount: transaction.amount || "",
      });
    }
  }, [transaction]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    const amountValue = parseFloat(formState.amount);
    if (!formState.category_id || isNaN(amountValue) || amountValue <= 0) {
      alert("Mohon isi semua field dengan data yang valid.");
      return;
    }
    onUpdate({ ...formState, amount: amountValue });
  };

  const currentCategories =
    formState.type === "income" ? incomeCategories : expenseCategories;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      {/* Gaya dark: dihapus dari form utama */}
      <form
        onSubmit={handleUpdate}
        className="bg-white border border-white/20 rounded-xl shadow-lg p-6 w-full max-w-md"
      >
        {/* Gaya dark: dihapus dari judul */}
        <h3 className="text-xl font-bold text-slate-900 mb-6">
          Ubah Transaksi
        </h3>
        <div className="space-y-4">
          {/* Gaya dark: dihapus dari semua input, select, dan textarea */}
          <select
            name="type"
            value={formState.type || "expense"}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg bg-white/80"
          >
            <option value="expense">Pengeluaran</option>
            <option value="income">Pemasukan</option>
          </select>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              name="account_id"
              value={formState.account_id || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg bg-white/80"
            >
              <option value="">Pilih Akun</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
            <input
              name="date"
              type="date"
              value={formState.date || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg bg-white/80"
            />

            <select
              name="category_id"
              value={formState.category_id || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg bg-white/80"
            >
              <option value="">Pilih Kategori</option>
              {currentCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <input
              name="amount"
              type="number"
              value={formState.amount || ""}
              onChange={handleChange}
              placeholder="Jumlah (Rp)"
              className="w-full px-3 py-2 border rounded-lg bg-white/80"
            />
            <input
              name="payee"
              value={formState.payee || ""}
              onChange={handleChange}
              placeholder="Penerima / Sumber (Opsional)"
              className="md:col-span-2 w-full px-3 py-2 border rounded-lg bg-white/80"
            />
            <textarea
              name="notes"
              value={formState.notes || ""}
              onChange={handleChange}
              placeholder="Catatan (Opsional)"
              className="w-full px-3 py-2 border rounded-lg md:col-span-2 bg-white/80"
              rows="2"
            ></textarea>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="cleared-update"
              name="cleared"
              checked={formState.cleared || false}
              onChange={handleChange}
              className="transition-shadow cursor-pointer h-4 w-4 rounded"
            />
            {/* Gaya dark: dihapus dari label */}
            <label
              htmlFor="cleared-update"
              className="transition-shadow cursor-pointer ml-2 text-sm text-slate-800"
            >
              Sudah diproses
            </label>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          {/* Gaya dark: dihapus dari tombol */}
          <button
            type="button"
            onClick={onClose}
            className="transition-shadow cursor-pointer px-4 py-2 bg-gray-200/70 text-gray-800 rounded-lg"
          >
            Batal
          </button>
          <button
            type="submit"
            className="transition-shadow cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
};

const AnimatedDots = ({
  speed = 400,
  maxDots = 3,
  onClick,
  className = "",
}) => {
  const [count, setCount] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const mountedRef = React.useRef(true);

  React.useEffect(() => {
    mountedRef.current = true;
    const id = setInterval(() => {
      if (!mountedRef.current) return;
      if (!paused) setCount((c) => (c + 1) % (maxDots + 1));
    }, speed);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [speed, maxDots, paused]);

  const handleClick = (e) => {
    setPaused((p) => !p);
    if (typeof onClick === "function") onClick({ paused: !paused, event: e });
  };

  const dots = ".".repeat(count);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={paused}
      title={paused ? "Resume animation" : "Pause animation — click to toggle"}
      className={`inline-flex items-center space-x-2 text-sm ${className}`}
    >
      <span className="select-none font-bold text-sky-600 text-xl">
        {dots === "" ? "\u00A0" : dots}
      </span>
      <span
        className={`text-xs text-slate-500 transition-opacity ${
          paused ? "opacity-60" : "opacity-100"
        }`}
      >
        {paused ? "paused" : "loading"}
      </span>
    </button>
  );
};

// === Connected Dot Network (Final) ===
const ParticleNetwork = () => {
  const canvasRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const nodesRef = React.useRef([]);
  const linksRef = React.useRef([]); // efek burst klik
  const mouseRef = React.useRef({ x: null, y: null });

  // Konfigurasi
  const nodeCount = 80;
  const maxDistance = 140; // jarak koneksi
  const baseSpeed = 0.4; // kecepatan dasar
  const friction = 0.985; // gesekan
  const repulseRadius = 120;
  const repulseForce = 2.5;

  // --- Init nodes ---
  const initNodes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const arr = [];
    for (let i = 0; i < nodeCount; i++) {
      arr.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * baseSpeed * 2,
        vy: (Math.random() - 0.5) * baseSpeed * 2,
      });
    }
    nodesRef.current = arr;
  };

  // --- Tambah node saat klik ---
  const addNodeAt = (x, y) => {
    // const canvas = canvasRef.current;
    const nodes = nodesRef.current;
    const newNode = {
      x,
      y,
      vx: (Math.random() - 0.5) * baseSpeed * 2,
      vy: (Math.random() - 0.5) * baseSpeed * 2,
    };
    nodes.push(newNode);

    // cari 3 tetangga terdekat
    const withDist = nodes
      .filter((n) => n !== newNode)
      .map((n) => ({
        n,
        d2: (n.x - newNode.x) ** 2 + (n.y - newNode.y) ** 2,
      }))
      .sort((a, b) => a.d2 - b.d2)
      .slice(0, 3);

    const now = performance.now();
    withDist.forEach(({ n }) => {
      linksRef.current.push({ a: newNode, b: n, born: now, ttl: 1500 });
    });
  };

  // --- Render frame ---
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const nodes = nodesRef.current;
    const { x: mx, y: my } = mouseRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // update posisi node + interaksi mouse
    nodes.forEach((n) => {
      n.x += n.vx;
      n.y += n.vy;

      // repulsion dari pointer
      if (mx !== null && my !== null) {
        const dx = n.x - mx;
        const dy = n.y - my;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < repulseRadius * repulseRadius && dist2 > 0.1) {
          const dist = Math.sqrt(dist2);
          const force = repulseForce * (1 - dist / repulseRadius);
          n.vx += (dx / dist) * force * 0.08;
          n.vy += (dy / dist) * force * 0.08;
        }
      }

      // gesekan biar smooth
      n.vx *= friction;
      n.vy *= friction;

      // beri sedikit random nudge supaya tidak diam
      if (Math.abs(n.vx) < 0.05) n.vx += (Math.random() - 0.5) * 0.1;
      if (Math.abs(n.vy) < 0.05) n.vy += (Math.random() - 0.5) * 0.1;

      // bouncing
      if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
      if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
    });

    // gambar koneksi antar node
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d2 = dx * dx + dy * dy;
        if (d2 < maxDistance * maxDistance) {
          const alpha = 1 - Math.sqrt(d2) / maxDistance;
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.8})`; // biru jelas
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // gambar node
    nodes.forEach((n) => {
      ctx.fillStyle = "rgba(56, 189, 248, 1)";
      ctx.beginPath();
      ctx.arc(n.x, n.y, 2.6, 0, Math.PI * 2);
      ctx.fill();
    });

    // gambar link burst hasil klik
    const now = performance.now();
    linksRef.current = linksRef.current.filter((L) => {
      const age = now - L.born;
      if (age > L.ttl) return false;
      const alpha = 1 - age / L.ttl;
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(L.a.x, L.a.y);
      ctx.lineTo(L.b.x, L.b.y);
      ctx.stroke();
      return true;
    });

    rafRef.current = requestAnimationFrame(animate);
  };

  // --- Setup & teardown ---
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    initNodes();
    animate();

    // Resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initNodes();
    };

    // Klik tetap di container (biar tombol login aman)
    const container = canvas.parentElement;
    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      addNodeAt(e.clientX - rect.left, e.clientY - rect.top);
    };

    // Mouse move sekarang dari window
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };

    window.addEventListener("resize", handleResize);
    container.addEventListener("click", handleClick);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("click", handleClick);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 -z-10 pointer-events-none"
      style={{ background: "transparent" }}
    />
  );
};

// --- AUTHENTICATION & HOME PAGE (No changes needed) ---
const HomePage = ({ handleLogin }) => {
  const heroRef = React.useRef(null);

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen bg-slate-50/70 text-center p-6">
      {/* Sambutan */}
      <h2 className="text-6xl font-extrabold mb-6 pb-4 bg-gradient-to-r from-sky-400 to-sky-600 bg-clip-text text-transparent opacity-90">
        Selamat Datang
      </h2>

      {/* Logo */}
      <h1 className="text-5xl font-extrabold text-slate-800 mb-2">
        Fin<span className="text-blue-600">ly</span>
      </h1>

      {/* Jargon */}
      <p className="text-slate-500 text-xl italic mb-6">
        “Every expense tells a story.”
      </p>

      {/* Tambahkan animasi dots */}
      <AnimatedDots className="mt-2" />

      {/* Deskripsi */}
      <p className="text-slate-600 max-w-md">
        Kelola keuangan pribadi Anda dengan mudah. Lacak pemasukan, pengeluaran,
        dan dapatkan analisis cerdas untuk mencapai tujuan finansial Anda.
      </p>

      {/* Tombol Login */}
      <button
        onClick={handleLogin}
        className="transition-shadow cursor-pointer mt-8 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-all flex items-center"
      >
        <svg
          className="w-6 h-6 mr-3"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
        >
          <path
            fill="#FFC107"
            d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
          ></path>
          <path
            fill="#FF3D00"
            d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
          ></path>
          <path
            fill="#4CAF50"
            d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
          ></path>
          <path
            fill="#1976D2"
            d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,36.59,44,31.016,44,24C44,22.659,43.862,21.35,43.611,20.083z"
          ></path>
        </svg>
        Masuk dengan Google
      </button>

      {/* Background Connected Dots */}
      <ParticleNetwork
        containerRef={heroRef}
        // Opsi warna: "56, 189, 248" (sky-blue) agar selaras brand Finly
        color={"56, 189, 248"}
        maxDistance={150}
        speed={0.35}
        connectOnClick={3}
      />
    </div>
  );
};

// --- MAIN APP COMPONENT ---
const PersonalFinanceApp = ({ user, handleLogout }) => {
  const [transactions, setTransactions] = React.useState(() => {
    // ambil data dari cache localStorage
    const cached = localStorage.getItem("transactions");
    return cached ? JSON.parse(cached) : [];
  });

  // simpan data ke cache setiap kali berubah
  React.useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const [accounts, setAccounts] = useState([]); // State baru
  const [incomeCategories, setIncomeCategories] = useState([]); // State baru
  const [expenseCategories, setExpenseCategories] = useState([]); // State baru
  const [isLoading, setIsLoading] = useState(true);

  const initialFormState = {
    account_id: "",
    date: new Date().toISOString().split("T")[0],
    type: "expense",
    category_name: "", // untuk input datalist / penulisan kategori baru
    amount: "",
    payee: "",
    notes: "",
    cleared: false,
  };

  const [formState, setFormState] = useState(initialFormState);
  const [csvPreview, setCsvPreview] = useState([]);
  const [fileName, setFileName] = useState("");

  const [analysis, setAnalysis] = useState("");
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  const [modalState, setModalState] = useState({ show: false });
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState(null);

  const [selectedLlm, setSelectedLlm] = useState("gemini_free");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [groqApiKey, setGroqApiKey] = useState("");

  const [view, setView] = useState("transactions");

  // --- DATA FETCHING & SYNC ---
  const fetchTransactions = useCallback(async () => {
    if (!user) return; // Prevent running if user is null
    setIsLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error);
      showAlert(
        "Gagal Memuat",
        "Tidak bisa memuat data transaksi dari server."
      );
    } else {
      setTransactions(data);
    }
    setIsLoading(false);
  }, [user]); // Add user as a dependency for useCallback

  // --- EFFECTS ---
  // Di dalam komponen PersonalFinanceApp
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setIsLoading(true);

        let { data: accountsData, error: accountsError } = await supabase
          .from("accounts")
          .select("*");
        let { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*");

        // Jika pengguna baru dan belum punya akun, buatkan default
        if (accountsData && accountsData.length === 0) {
          console.log("No accounts found, creating default accounts...");
          const defaultAccounts = [
            { name: "Cash", type: "Uang Tunai", user_id: user.id },
            { name: "Bank BCA", type: "Bank", user_id: user.id },
            { name: "E-Wallet (GoPay/OVO)", type: "Digital", user_id: user.id },
          ];
          const { data, error } = await supabase
            .from("accounts")
            .insert(defaultAccounts)
            .select();
          if (error) console.error("Error creating default accounts:", error);
          else accountsData = data; // Gunakan data yang baru dibuat
        }

        // Jika pengguna baru dan belum punya kategori, buatkan default
        if (categoriesData && categoriesData.length === 0) {
          console.log("No categories found, creating default categories...");
          const defaultCategories = [
            { name: "Makanan & Minuman", type: "expense", user_id: user.id },
            { name: "Transportasi", type: "expense", user_id: user.id },
            { name: "Tagihan", type: "expense", user_id: user.id },
            { name: "Hiburan", type: "expense", user_id: user.id },
            { name: "Gaji", type: "income", user_id: user.id },
            { name: "Bonus", type: "income", user_id: user.id },
          ];
          const { data, error } = await supabase
            .from("categories")
            .insert(defaultCategories)
            .select();
          if (error) console.error("Error creating default categories:", error);
          else categoriesData = data; // Gunakan data yang baru dibuat
        }

        const { data: transactionsData, error: transactionsError } =
          await supabase
            .from("transactions")
            .select("*, accounts(name), categories(name)")
            .order("date", { ascending: false });

        if (accountsError || categoriesError || transactionsError) {
          console.error(accountsError || categoriesError || transactionsError);
        } else {
          setTransactions(transactionsData);
          setAccounts(accountsData);
          setIncomeCategories(
            categoriesData.filter((c) => c.type === "income")
          );
          setExpenseCategories(
            categoriesData.filter((c) => c.type === "expense")
          );
        }
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    const customStyleId = "custom-analysis-styles";
    if (!document.getElementById(customStyleId)) {
      const style = document.createElement("style");
      style.id = customStyleId;
      style.innerHTML = `
            .analysis-output { background-color: #e0f2fe !important; color: #1e3a8a !important; border: 1px solid #93c5fd !important; padding: 1rem; border-radius: 0.75rem; font-family: sans-serif; }
            .analysis-output p { margin-bottom: 0.5rem; }
        `;
      document.head.appendChild(style);
    }
    return () => {
      const style = document.getElementById(customStyleId);
      if (style) document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    setFormState((prev) => ({ ...prev, category: "" }));
  }, [formState.type]);

  // --- HANDLER FUNCTIONS ---
  const showAlert = (title, message) =>
    setModalState({
      show: true,
      title,
      message,
      onConfirm: () => setModalState({ show: false }),
      showCancelButton: false,
    });

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amountValue = parseFloat(formState.amount);
    const categoryName = formState.category_name?.trim();

    // Validasi input
    if (
      !formState.account_id ||
      !categoryName ||
      !formState.amount ||
      isNaN(amountValue) ||
      amountValue <= 0
    ) {
      showAlert(
        "Input Tidak Valid",
        "Mohon isi Akun, Kategori, dan Jumlah dengan benar."
      );
      return;
    }

    // Cari kategori yang ada atau buat yang baru
    let category_id;
    const currentCategories =
      formState.type === "expense" ? expenseCategories : incomeCategories;
    const existingCategory = currentCategories.find(
      (c) => c.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (existingCategory) {
      category_id = existingCategory.id;
    } else {
      // Buat kategori baru jika tidak ditemukan
      const { data, error } = await supabase
        .from("categories")
        .insert({ name: categoryName, type: formState.type, user_id: user.id })
        .select()
        .single();

      if (error) {
        showAlert("Gagal", "Gagal membuat kategori baru.");
        return;
      }
      category_id = data.id;
      // Perbarui state lokal agar kategori baru langsung muncul
      if (data.type === "expense")
        setExpenseCategories((prev) => [...prev, data]);
      else setIncomeCategories((prev) => [...prev, data]);
    }

    // Siapkan data transaksi untuk disimpan
    const transactionData = {
      user_id: user.id,
      account_id: formState.account_id,
      category_id, // hasil lookup kategori atau kategori baru
      date: formState.date,
      type: formState.type,
      amount: amountValue,
      payee: formState.payee || null,
      notes: formState.notes || null,
      cleared: !!formState.cleared,
    };
    delete transactionData.category_name; // Hapus properti sementara

    // Simpan transaksi
    const { data: newTransaction, error } = await supabase
      .from("transactions")
      .insert(transactionData)
      .select("*, accounts(name), categories(name)")
      .single();

    if (error) {
      console.error("Error adding transaction:", error);
      showAlert("Gagal", "Transaksi baru gagal disimpan.");
    } else {
      setTransactions((prev) => [newTransaction, ...prev]);
      setFormState(initialFormState); // Reset form
    }
  };

  const handleEdit = (transaction) => {
    setTransactionToEdit(transaction);
    setIsUpdateModalOpen(true);
  };

  const handleUpdate = async (updatedTransaction) => {
    const { id, ...updateData } = updatedTransaction;

    const { data, error } = await supabase
      .from("transactions")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating transaction:", error);
      showAlert("Gagal", "Gagal memperbarui transaksi.");
    } else {
      setTransactions((prev) => prev.map((t) => (t.id === id ? data[0] : t)));
      setIsUpdateModalOpen(false);
      setTransactionToEdit(null);
    }
  };

  const handleDelete = (id) => {
    setModalState({
      show: true,
      title: "Konfirmasi Hapus",
      message: "Apakah Anda yakin ingin menghapus transaksi ini?",
      onConfirm: async () => {
        const { error } = await supabase
          .from("transactions")
          .delete()
          .eq("id", id);
        if (error) {
          console.error("Error deleting transaction:", error);
          showAlert("Gagal", "Gagal menghapus transaksi.");
        } else {
          setTransactions(transactions.filter((t) => t.id !== id));
        }
        setModalState({ show: false });
      },
      onCancel: () => setModalState({ show: false }),
      confirmText: "Hapus",
      showCancelButton: true,
    });
  };

  const parseCsvLine = (line) => {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      // Memisahkan file menjadi baris-baris, mengabaikan baris kosong
      const lines = text
        .trim()
        .split("\n")
        .filter((line) => line.trim() !== "");
      if (lines.length < 2) {
        showAlert(
          "File Tidak Valid",
          "File CSV harus memiliki setidaknya satu baris header dan satu baris data."
        );
        return;
      }

      // Membaca header dan membersihkannya
      const headers = parseCsvLine(lines[0]).map((h) =>
        h.trim().toLowerCase().replace("_", "")
      );

      const data = lines.slice(1).map((line) => {
        const values = parseCsvLine(line);
        // Membuat objek dari header dan value, lebih fleksibel
        const row = headers.reduce((obj, header, index) => {
          obj[header] = values[index]?.trim() || "";
          return obj;
        }, {});
        return row;
      });
      setCsvPreview(data);
    };
    reader.readAsText(file);
  };

  const handleImportData = async () => {
    const accountMap = new Map(
      accounts.map((acc) => [acc.name.toLowerCase(), acc.id])
    );
    const categoryMap = new Map(
      [...incomeCategories, ...expenseCategories].map((cat) => [
        cat.name.toLowerCase(),
        cat,
      ])
    );

    let newAccounts = [...accounts];
    let newCategories = [...incomeCategories, ...expenseCategories];
    let transactionsToImport = [];
    let skippedRows = [];

    for (const row of csvPreview) {
      const accountName = row.account?.trim();
      const categoryName = row.category?.trim();
      const amountRaw = parseFloat(row.amount) || 0;

      if (!accountName || !categoryName || amountRaw === 0) continue;

      const transactionType = amountRaw >= 0 ? "income" : "expense";
      let account_id = accountMap.get(accountName.toLowerCase());
      let categoryDetails = categoryMap.get(categoryName.toLowerCase());

      if (categoryDetails && categoryDetails.type !== transactionType) {
        skippedRows.push(
          `Baris dilewati: Kategori '${categoryName}' adalah tipe '${categoryDetails.type}', tetapi transaksi ini adalah '${transactionType}'.`
        );
        continue;
      }

      if (!account_id) {
        const { data, error } = await supabase
          .from("accounts")
          .insert({ name: accountName, user_id: user.id })
          .select()
          .single();
        if (error) {
          continue;
        }
        account_id = data.id;
        accountMap.set(accountName.toLowerCase(), account_id);
        newAccounts.push(data);
      }

      if (!categoryDetails) {
        const { data, error } = await supabase
          .from("categories")
          .insert({
            name: categoryName,
            type: transactionType,
            user_id: user.id,
          })
          .select()
          .single();
        if (error) {
          continue;
        }
        categoryDetails = data;
        categoryMap.set(categoryName.toLowerCase(), categoryDetails);
        newCategories.push(data);
      }

      transactionsToImport.push({
        user_id: user.id,
        date: row.date,
        payee: row.payee,
        notes: row.notes,
        // --- PERBAIKAN DI SINI ---
        cleared: row.cleared?.toLowerCase() === "cleared", // Mengubah "Cleared" menjadi true/false
        account_id: account_id,
        category_id: categoryDetails.id,
        type: transactionType,
        amount: Math.abs(amountRaw),
      });
    }

    // ... sisa fungsi handleImportData tetap sama ...
    if (skippedRows.length > 0) {
      showAlert(
        "Beberapa Data Dilewati",
        `Impor selesai, tetapi ${skippedRows.length} baris dilewati karena tipe kategori tidak konsisten. Periksa konsol untuk detail.`
      );
      console.warn("Detail baris yang dilewati:", skippedRows);
    }

    if (transactionsToImport.length > 0) {
      const { error } = await supabase
        .from("transactions")
        .insert(transactionsToImport);
      if (error) {
        showAlert("Impor Gagal", `Terjadi kesalahan: ${error.message}`);
      } else if (skippedRows.length === 0) {
        showAlert(
          "Sukses",
          `${transactionsToImport.length} transaksi berhasil diimpor.`
        );
      }
      fetchTransactions();
    } else if (skippedRows.length === 0) {
      showAlert("Impor Gagal", "Tidak ada data valid yang dapat diimpor.");
    }

    setCsvPreview([]);
    setFileName("");
  };

  const handleGetAnalysis = async () => {
    // (No changes needed in this function's logic)
    if (transactions.length < 3) {
      showAlert(
        "Data Kurang",
        "Mohon tambahkan setidaknya 3 transaksi untuk mendapatkan analisis."
      );
      return;
    }
    const currentApiKey = selectedLlm === "gemini" ? geminiApiKey : groqApiKey;
    if (!currentApiKey && selectedLlm !== "gemini_free") {
      showAlert(
        "Kunci API Diperlukan",
        `Mohon masukkan kunci API untuk ${selectedLlm.toUpperCase()}.`
      );
      return;
    }
    setIsLoadingAnalysis(true);
    setAnalysisError("");
    setAnalysis("");
    const allCategories = [...incomeCategories, ...expenseCategories];

    const formattedTransactions = transactions
      .map((t) => {
        let categoryName;

        // Langkah 1: Coba cara normal (melalui relasi/join)
        if (t.categories && t.categories.name) {
          categoryName = t.categories.name;
        }
        // Langkah 2: Jika gagal, coba cari di state lokal menggunakan category_id
        else {
          const foundCategory = allCategories.find(
            (cat) => cat.id === t.category_id
          );
          if (foundCategory) {
            categoryName = foundCategory.name;
          }
          // Langkah 3: Jika masih gagal, tampilkan ID-nya sebagai fallback
          else {
            categoryName = `Kategori (ID: ${t.category_id})`;
          }
        }

        const amountFormatted = new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(t.amount);

        return `- ${
          t.type === "income" ? "Pemasukan" : "Pengeluaran"
        } kategori ${categoryName}: ${amountFormatted}`;
      })
      .join("\n");
    const prompt = `Berikut adalah data keuanganku:\n${formattedTransactions}\n\nBerdasarkan data ini, berikan analisis singkat kondisi keuanganku (pemasukan vs pengeluaran) dan beberapa saran praktis (dalam format markdown) untuk meningkatkan kesehatan finansialku. Gunakan bahasa Indonesia yang santai dan memotivasi.`;

    let apiUrl, payload, headers;
    if (selectedLlm === "gemini") {
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${currentApiKey}`;
      payload = { contents: [{ parts: [{ text: prompt }] }] };
      headers = { "Content-Type": "application/json" };
    } else if (selectedLlm === "groq") {
      apiUrl = "https://api.groq.com/openai/v1/chat/completions";
      payload = {
        messages: [{ role: "user", content: prompt }],
        model: "llama3-8b-8192",
      };
      headers = {
        Authorization: `Bearer ${currentApiKey}`,
        "Content-Type": "application/json",
      };
    } else {
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=AIzaSyB4va135SIy8Vm7H-PJ7VzYwC188KTN5m8`;
      payload = { contents: [{ parts: [{ text: prompt }] }] };
      headers = { "Content-Type": "application/json" };
    }

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(`API request failed: ${errorBody.error.message}`);
      }
      const result = await response.json();
      let text = "";
      if (selectedLlm === "gemini" || selectedLlm === "gemini_free") {
        text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      } else if (selectedLlm === "groq") {
        text = result.choices?.[0]?.message?.content;
      }
      if (typeof text === "string") {
        setAnalysis(text);
      } else {
        throw new Error("Respons dari API tidak valid.");
      }
    } catch (error) {
      console.error(`Error from ${selectedLlm.toUpperCase()}:`, error);
      setAnalysisError(
        `Gagal meminta analisis dari ${selectedLlm.toUpperCase()}. Detail: ${
          error.message
        }`
      );
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  // --- MEMOIZED CALCULATIONS (No changes needed) ---
  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    return transactions.reduce(
      (acc, t) => {
        if (t.type === "income") acc.totalIncome += t.amount;
        else acc.totalExpenses += t.amount;
        acc.balance = acc.totalIncome - acc.totalExpenses;
        return acc;
      },
      { totalIncome: 0, totalExpenses: 0, balance: 0 }
    );
  }, [transactions]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);

  const dailySpendingData = useMemo(() => {
    const spendingByDay = {};
    transactions
      .filter((t) => t.type === "expense" && t.date)
      .forEach((t) => {
        const date = new Date(t.date).toISOString().split("T")[0];
        if (!spendingByDay[date]) spendingByDay[date] = 0;
        spendingByDay[date] += t.amount;
      });
    return Object.keys(spendingByDay)
      .sort()
      .map((date) => ({
        name: new Date(date).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        }),
        Pengeluaran: spendingByDay[date],
      }));
  }, [transactions]);

  const cashFlowData = useMemo(() => {
    const flowByMonth = {};
    transactions.forEach((t) => {
      const month = new Date(t.date).toLocaleString("id-ID", {
        month: "short",
        year: "numeric",
      });
      if (!flowByMonth[month])
        flowByMonth[month] = { Pemasukan: 0, Pengeluaran: 0 };
      if (t.type === "income") flowByMonth[month].Pemasukan += t.amount;
      else flowByMonth[month].Pengeluaran += t.amount;
    });
    return Object.keys(flowByMonth)
      .map((month) => ({ name: month, ...flowByMonth[month] }))
      .sort((a, b) => new Date("01 " + a) - new Date("01 " + b));
  }, [transactions]);

  const netWorthData = useMemo(() => {
    let cumulativeBalance = 0;
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    const dataByDate = {};
    sortedTransactions.forEach((t) => {
      const date = new Date(t.date).toISOString().split("T")[0];
      if (!dataByDate[date]) dataByDate[date] = 0;
      dataByDate[date] += t.type === "income" ? t.amount : -t.amount;
    });
    return Object.keys(dataByDate)
      .sort()
      .map((date) => {
        cumulativeBalance += dataByDate[date];
        return {
          name: new Date(date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          }),
          "Saldo Kumulatif": cumulativeBalance,
        };
      });
  }, [transactions]);

  const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
      <footer className="mt-12 bg-white text-slate-600 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Branding */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              Fin<span className="text-blue-600">ly</span>
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Kelola keuangan personal Anda dengan cerdas dan mudah.
            </p>
          </div>

          {/* Copyright + Social */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-center sm:text-left">
              &copy; {currentYear} Finly. Crafted with ❤️ by{" "}
              <span className="font-semibold text-blue-600">Miftah</span>
            </p>
            <div className="flex space-x-4 mt-4 sm:mt-0">
              <a href="#" className="hover:text-blue-500 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-blue-500 transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="hover:text-blue-500 transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    );
  };

  // Tambah state filter
  const [filter, setFilter] = useState("all"); // income/expense
  const [dateFilter, setDateFilter] = useState("all"); // tanggal/mingguan/bulanan

  const exportToCSV = (transactions) => {
    if (!transactions || transactions.length === 0) {
      alert("Tidak ada data untuk diexport");
      return;
    }

    const headers = [
      "Tanggal",
      "Akun",
      "Kategori",
      "Tipe",
      "Jumlah",
      "Payee",
      "Catatan",
    ];

    const rows = transactions.map((t) => [
      new Date(t.date).toLocaleDateString("id-ID"),
      t.accounts ? t.accounts.name : "Tanpa Akun",
      t.categories ? t.categories.name : "Tanpa Kategori",
      t.type,
      t.amount,
      t.payee || "",
      t.notes || "",
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = (transactions) => {
    if (!transactions || transactions.length === 0) {
      alert("Tidak ada data untuk diexport");
      return;
    }

    const data = transactions.map((t) => ({
      Tanggal: new Date(t.date).toLocaleDateString("id-ID"),
      Akun: t.accounts ? t.accounts.name : "Tanpa Akun",
      Kategori: t.categories ? t.categories.name : "Tanpa Kategori",
      Tipe: t.type,
      Jumlah: t.amount,
      Payee: t.payee || "",
      Catatan: t.notes || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transaksi");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(blob, "transactions.xlsx");
  };

  self.addEventListener("install", (event) => {
    event.waitUntil(
      caches.open("finly-cache-v1").then((cache) => {
        return cache.addAll(["/", "/index.html"]);
      })
    );
  });

  self.addEventListener("fetch", (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  });

  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return (
    <>
      <Modal {...modalState} />
      <UpdateModal
        show={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onUpdate={handleUpdate}
        transaction={transactionToEdit}
        accounts={accounts}
        incomeCategories={incomeCategories}
        expenseCategories={expenseCategories}
      />
      <div className="bg-slate-50 min-h-screen font-sans text-gray-800 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {!isOnline && (
            <div className="bg-yellow-100 text-yellow-800 p-2 rounded mb-4">
              ⚠️ Anda sedang offline. Data ditampilkan dari cache.
            </div>
          )}

          <header className="mb-8 flex justify-between items-center">
            <div className="text-left">
              <h2 className="text-4xl font-bold text-slate-800">
                Fin<span className="text-blue-600">ly</span> Dashboard
              </h2>
              <p className="text-slate-500 mt-2">
                Satu tempat untuk mengelola semua transaksi keuangan Anda.
              </p>
            </div>
            <div className="flex items-center">
              <span className="text-slate-600 mr-4">
                Halo, {user.user_metadata.full_name || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="transition-shadow cursor-pointer bg-red-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-red-600 transition-all flex items-center"
              >
                <LogOut className="r-2 h-5 w-5" />
                Logout
              </button>
            </div>
          </header>

          <div className="flex justify-center mb-8">
            <div className="flex p-1 bg-slate-200 rounded-full">
              <button
                onClick={() => setView("transactions")}
                className={`transition-shadow cursor-pointer px-6 py-2 rounded-full flex items-center font-semibold ${
                  view === "transactions" ? "bg-white shadow" : ""
                }`}
              >
                <List className="mr-2 h-5 w-5" /> Transaksi
              </button>
              <button
                onClick={() => setView("dashboard")}
                className={`transition-shadow cursor-pointer px-6 py-2 rounded-full flex items-center font-semibold ${
                  view === "dashboard" ? "bg-white shadow" : ""
                }`}
              >
                <LayoutDashboard className="mr-2 h-5 w-5" /> Dashboard
              </button>
            </div>
          </div>

          {view === "transactions" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl shadow-md text-center">
                  <h2 className="text-lg font-semibold text-green-600">
                    Total Pemasukan
                  </h2>
                  <p className="text-2xl font-bold text-green-500 mt-1">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-md text-center">
                  <h2 className="text-lg font-semibold text-red-600">
                    Total Pengeluaran
                  </h2>
                  <p className="text-2xl font-bold text-red-500 mt-1">
                    {formatCurrency(totalExpenses)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-md text-center">
                  <h2 className="text-lg font-semibold text-blue-600">
                    Saldo Saat Ini
                  </h2>
                  <p className="text-2xl font-bold text-blue-500 mt-1">
                    {formatCurrency(balance)}
                  </p>
                </div>
              </div>

              <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                  {/* Add Transaction Form */}
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center">
                      <PlusCircle className="mr-2" />
                      Tambah Transaksi
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <select
                        name="type"
                        value={formState.type}
                        onChange={handleFormChange}
                        className="transition-shadow cursor-pointer w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="expense">Pengeluaran</option>
                        <option value="income">Pemasukan</option>
                      </select>
                      <div className="grid grid-cols-2 gap-4">
                        <select
                          name="account_id"
                          value={formState.account_id || ""}
                          onChange={handleFormChange}
                          className="transition-shadow cursor-pointer col-span-2 px-3 py-2 border rounded-lg"
                        >
                          <option value="">Pilih Akun</option>
                          {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                              {acc.name}
                            </option>
                          ))}
                        </select>
                        <input
                          name="date"
                          type="date"
                          value={formState.date}
                          onChange={handleFormChange}
                          className="transition-shadow cursor-pointer px-3 py-2 border rounded-lg"
                        />
                        <input
                          name="amount"
                          type="number"
                          value={formState.amount}
                          onChange={handleFormChange}
                          placeholder="Jumlah (Rp)"
                          className="px-3 py-2 border rounded-lg"
                        />
                        <input
                          list="category-options"
                          name="category_name" // Gunakan nama baru
                          value={formState.category_name || ""}
                          onChange={handleFormChange}
                          placeholder="Pilih atau ketik kategori baru"
                          className="col-span-2 px-3 py-2 border rounded-lg"
                          required
                        />
                        <datalist id="category-options">
                          {(formState.type === "expense"
                            ? expenseCategories
                            : incomeCategories
                          ).map((cat) => (
                            <option key={cat.id} value={cat.name} />
                          ))}
                        </datalist>
                      </div>
                      <input
                        name="payee"
                        value={formState.payee}
                        onChange={handleFormChange}
                        placeholder="Penerima / Sumber (Opsional)"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                      <textarea
                        name="notes"
                        value={formState.notes}
                        onChange={handleFormChange}
                        placeholder="Catatan (Opsional)"
                        className="w-full px-3 py-2 border rounded-lg"
                        rows="2"
                      ></textarea>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="cleared"
                          name="cleared"
                          checked={formState.cleared}
                          onChange={handleFormChange}
                          className="h-4 w-4 rounded"
                        />
                        <label
                          htmlFor="cleared"
                          className="ml-2 text-sm text-gray-700"
                        >
                          Sudah diproses
                        </label>
                      </div>
                      <button
                        type="submit"
                        className="transition-shadow cursor-pointer w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold"
                      >
                        Simpan Transaksi
                      </button>
                    </form>
                  </div>

                  {/* Import from CSV */}
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center">
                      <Upload className="mr-2" />
                      Impor dari CSV
                    </h2>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="transition-shadow cursor-pointer block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {fileName && (
                      <p className="text-xs text-gray-500 mt-2">
                        File dipilih: {fileName}
                      </p>
                    )}
                    {csvPreview.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-semibold text-center">
                          Pratinjau Data
                        </h3>
                        <div className="max-h-40 overflow-y-auto border rounded-lg mt-2 text-xs p-2 bg-slate-50">
                          <table className="w-full">
                            <thead>
                              <tr className="text-left">
                                <th className="p-1">Akun</th>
                                <th className="p-1">Kategori</th>
                                <th className="p-1">Jumlah</th>
                              </tr>
                            </thead>
                            <tbody>
                              {csvPreview.map((row, index) => (
                                <tr key={index}>
                                  <td className="p-1">{row.account}</td>
                                  <td className="p-1">{row.category}</td>
                                  <td className="p-1">{row.amount}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <button
                          onClick={handleImportData}
                          className="w-full mt-3 bg-green-500 text-white py-2 rounded-lg font-semibold flex items-center justify-center"
                        >
                          <FileCheck2 className="mr-2 h-5 w-5" /> Impor{" "}
                          {csvPreview.length} Baris
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Analysis Settings */}
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center">
                      <Settings className="mr-2" />
                      Pengaturan Analisis
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="llm-select"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Pilih Model LLM
                        </label>
                        <select
                          id="llm-select"
                          value={selectedLlm}
                          onChange={(e) => setSelectedLlm(e.target.value)}
                          className="transition-shadow cursor-pointer w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="gemini_free">Gemini (Gratis)</option>
                          <option value="gemini">Gemini (API Key)</option>
                          <option value="groq">Groq (API Key)</option>
                        </select>
                      </div>
                      {selectedLlm === "gemini" && (
                        <input
                          type="password"
                          value={geminiApiKey}
                          onChange={(e) => setGeminiApiKey(e.target.value)}
                          placeholder="Masukkan kunci API Gemini"
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      )}
                      {selectedLlm === "groq" && (
                        <input
                          type="password"
                          value={groqApiKey}
                          onChange={(e) => setGroqApiKey(e.target.value)}
                          placeholder="Masukkan kunci API Groq"
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      )}
                    </div>
                  </div>

                  {/* Financial Analysis */}
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-2xl font-semibold mb-4 text-center">
                      Analisis Keuangan
                    </h2>
                    <button
                      onClick={handleGetAnalysis}
                      disabled={isLoadingAnalysis}
                      className="transition-shadow cursor-pointer w-full flex justify-center items-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2.5 px-4 rounded-lg font-semibold"
                    >
                      <Sparkles className="mr-2 h-5 w-5" />
                      {isLoadingAnalysis
                        ? `Menganalisis...`
                        : "Dapatkan Analisis & Saran"}
                    </button>
                    {analysis && (
                      <div className="mt-4 shadow-md text-sm analysis-output">
                        <ReactMarkdown>{analysis}</ReactMarkdown>
                      </div>
                    )}
                    {analysisError && (
                      <p className="mt-4 text-sm text-red-600 text-center">
                        {analysisError}
                      </p>
                    )}
                  </div>
                </div>

                {/* Transaction List */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="flex space-x-3 mb-4">
                    <button
                      onClick={() => exportToCSV(transactions)}
                      className="transition-shadow cursor-pointer bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Export CSV
                    </button>

                    <button
                      onClick={() => exportToExcel(transactions)}
                      className="transition-shadow cursor-pointer bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Export Excel
                    </button>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-2xl font-semibold mb-4">
                      Daftar Transaksi
                    </h2>

                    {/* Filter */}
                    <div className="flex flex-wrap items-center space-x-3 mb-4">
                      <label className="text-sm text-gray-600">Jenis:</label>
                      <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">Semua</option>
                        <option value="income">Pemasukan</option>
                        <option value="expense">Pengeluaran</option>
                      </select>

                      <label className="text-sm text-gray-600 ml-4">
                        Tanggal:
                      </label>
                      <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">Semua</option>
                        <option value="today">Hari ini</option>
                        <option value="week">Minggu ini</option>
                        <option value="month">Bulan ini</option>
                      </select>
                    </div>

                    <div className="overflow-y-auto max-h-[600px]">
                      {isLoading ? (
                        <div className="text-center py-10">
                          <p className="text-gray-500">Memuat transaksi...</p>
                        </div>
                      ) : transactions.length > 0 ? (
                        <ul className="space-y-3 pr-2">
                          {transactions
                            .filter((t) => {
                              // Filter tipe (income/expense)
                              if (filter !== "all" && t.type !== filter)
                                return false;

                              // Filter tanggal
                              if (dateFilter !== "all") {
                                const today = new Date();
                                const tDate = new Date(t.date);

                                if (dateFilter === "today") {
                                  return (
                                    tDate.toDateString() ===
                                    today.toDateString()
                                  );
                                }

                                if (dateFilter === "week") {
                                  const startOfWeek = new Date(today);
                                  startOfWeek.setDate(
                                    today.getDate() - today.getDay()
                                  );
                                  const endOfWeek = new Date(startOfWeek);
                                  endOfWeek.setDate(startOfWeek.getDate() + 6);

                                  return (
                                    tDate >= startOfWeek && tDate <= endOfWeek
                                  );
                                }

                                if (dateFilter === "month") {
                                  return (
                                    tDate.getMonth() === today.getMonth() &&
                                    tDate.getFullYear() === today.getFullYear()
                                  );
                                }
                              }

                              return true;
                            })
                            .map((t) => (
                              <li
                                key={t.id}
                                className={`flex items-center justify-between p-3 rounded-lg ${
                                  t.cleared ? "bg-slate-50" : "bg-amber-50"
                                }`}
                              >
                                <div>
                                  <p className="font-bold text-slate-800">
                                    {t.categories
                                      ? t.categories.name
                                      : "Tanpa Kategori"}
                                    <span className="text-sm font-normal text-gray-500">
                                      {" "}
                                      - {t.notes || t.payee}
                                    </span>
                                  </p>

                                  <p
                                    className={`font-semibold ${
                                      t.type === "income"
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {formatCurrency(t.amount)}
                                  </p>

                                  <p className="text-xs text-gray-500">
                                    {new Date(t.date).toLocaleDateString(
                                      "id-ID",
                                      {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      }
                                    )}{" "}
                                    -{" "}
                                    {t.accounts
                                      ? t.accounts.name
                                      : "Tanpa Akun"}
                                  </p>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleEdit(t)}
                                    className="transition-shadow cursor-pointer p-2 text-blue-500 hover:bg-blue-100 rounded-full"
                                  >
                                    <Edit size={18} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(t.id)}
                                    className="transition-shadow cursor-pointer p-2 text-red-500 hover:bg-red-100 rounded-full"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </li>
                            ))}
                        </ul>
                      ) : (
                        <div className="text-center py-10">
                          <p className="text-gray-500">Belum ada transaksi.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </main>
            </>
          )}

          {view === "dashboard" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-2">
                <h2 className="text-2xl font-semibold mb-4 text-center">
                  Arus Kas (Bulanan)
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis
                      tickFormatter={(value) =>
                        new Intl.NumberFormat("id-ID", {
                          notation: "compact",
                        }).format(value)
                      }
                    />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="Pemasukan" fill="#22c55e" />
                    <Bar dataKey="Pengeluaran" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-2xl font-semibold mb-4 text-center">
                  Pengeluaran Harian
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailySpendingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis
                      tickFormatter={(value) =>
                        new Intl.NumberFormat("id-ID", {
                          notation: "compact",
                        }).format(value)
                      }
                    />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="Pengeluaran"
                      stroke="#ef4444"
                      fill="#fecaca"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-2xl font-semibold mb-4 text-center">
                  Pertumbuhan Saldo
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={netWorthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis
                      tickFormatter={(value) =>
                        new Intl.NumberFormat("id-ID", {
                          notation: "compact",
                        }).format(value)
                      }
                    />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Area
                      type="monotone"
                      dataKey="Saldo Kumulatif"
                      stroke="#3b82f6"
                      fill="#bfdbfe"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-sky-50 p-6 rounded-xl shadow-md lg:col-span-2">
                <h2 className="text-2xl font-semibold mb-4 text-center">
                  Analisis Keuangan
                </h2>
                <div className="prose prose-slate max-w-3xl mx-auto text-left leading-relaxed">
                  {isLoadingAnalysis ? (
                    <p className="text-gray-500 italic">
                      Sedang menganalisis datamu...
                    </p>
                  ) : analysisError ? (
                    <p className="text-red-500">{analysisError}</p>
                  ) : analysis ? (
                    <ReactMarkdown>{analysis}</ReactMarkdown>
                  ) : (
                    <p className="text-gray-500">
                      Belum ada analisis.{" "}
                      <button
                        onClick={handleGetAnalysis}
                        className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
                      >
                        Dapatkan Analisis
                      </button>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          <Footer />
        </div>
      </div>
    </>
  );
};

// --- APP WRAPPER FOR AUTHENTICATION ---
const AppWrapper = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for an active session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return user ? (
    <PersonalFinanceApp user={user} handleLogout={handleLogout} />
  ) : (
    <HomePage handleLogin={handleLogin} />
  );
};

export default AppWrapper;
