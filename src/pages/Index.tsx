import { useState, useRef, useCallback, useEffect } from "react";
import Icon from "@/components/ui/icon";

const RELAY_URL = "https://functions.poehali.dev/0df6b14f-c81b-459a-9bbf-6c5ada645260";

async function relayPost(action: string, data: object = {}) {
  const res = await fetch(RELAY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...data }),
  });
  return res.json();
}

async function relayGet(action: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams({ action, ...params }).toString();
  const res = await fetch(`${RELAY_URL}?${qs}`);
  return res.json();
}

async function sendCommand(sessionId: string, command: string, extra: object = {}) {
  return relayPost("command", { session_id: sessionId, command, ...extra });
}

// ======================== CONNECT SCREEN ========================
interface ConnectScreenProps {
  onConnected: (sessionId: string, pcInfo: Record<string, string>) => void;
}

function ConnectScreen({ onConnected }: ConnectScreenProps) {
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"input" | "connecting">("input");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleDigit = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...pin];
    next[idx] = digit;
    setPin(next);
    setError("");
    if (digit && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
    if (next.every(d => d !== "") && digit) {
      doConnect(next.join(""));
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setPin(text.split(""));
      doConnect(text);
    }
  };

  const doConnect = async (pinStr: string) => {
    setLoading(true);
    setStep("connecting");
    setError("");
    try {
      const data = await relayPost("connect", { pin: pinStr });
      if (data.session_id) {
        onConnected(data.session_id, data.pc_info || {});
      } else {
        setError(data.error || "Ошибка подключения");
        setStep("input");
        setPin(["", "", "", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      }
    } catch {
      setError("Нет соединения с сервером");
      setStep("input");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center px-6 grid-bg" style={{ background: "var(--dark-bg)" }}>
      {/* Logo */}
      <div className="flex flex-col items-center mb-10">
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
          style={{
            background: "rgba(0,255,65,0.08)",
            border: "1px solid rgba(0,255,65,0.3)",
            boxShadow: "0 0 30px rgba(0,255,65,0.15)",
          }}
        >
          <Icon name="Wifi" size={32} className="text-green-400" />
        </div>
        <h1 className="font-orbitron text-2xl font-black neon-green mb-1">NEXUS</h1>
        <p className="font-rajdhani text-sm text-green-700 tracking-widest uppercase">Remote Control</p>
      </div>

      {step === "input" ? (
        <div className="w-full max-w-xs animate-fade-in-up">
          <div
            className="rounded-lg p-6"
            style={{ background: "rgba(0,255,65,0.03)", border: "1px solid rgba(0,255,65,0.15)" }}
          >
            <div className="font-orbitron text-xs text-green-600 text-center mb-2 tracking-widest">
              ВВЕДИ PIN-КОД
            </div>
            <p className="font-rajdhani text-xs text-green-700 text-center mb-6">
              PIN отображается в агенте на компьютере
            </p>

            {/* PIN inputs */}
            <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
              {pin.map((d, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleDigit(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className="w-10 h-12 text-center font-orbitron text-xl font-black rounded outline-none transition-all"
                  style={{
                    background: d ? "rgba(0,255,65,0.15)" : "rgba(0,255,65,0.04)",
                    border: `2px solid ${d ? "#00ff41" : "rgba(0,255,65,0.2)"}`,
                    color: d ? "#00ff41" : "#2a4a2a",
                    boxShadow: d ? "0 0 10px rgba(0,255,65,0.3)" : "none",
                    caretColor: "#00ff41",
                  }}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {error && (
              <div
                className="flex items-center gap-2 p-3 rounded mb-4"
                style={{ background: "rgba(255,0,64,0.08)", border: "1px solid rgba(255,0,64,0.3)" }}
              >
                <Icon name="AlertCircle" size={14} className="text-red-500 flex-shrink-0" />
                <span className="font-rajdhani text-sm text-red-400">{error}</span>
              </div>
            )}

            <button
              onClick={() => pin.every(d => d) && doConnect(pin.join(""))}
              disabled={!pin.every(d => d) || loading}
              className="neon-btn w-full py-3 rounded text-sm"
              style={{ opacity: pin.every(d => d) ? 1 : 0.4 }}
            >
              {loading ? "Подключение..." : "Подключиться"}
            </button>
          </div>

          {/* How it works */}
          <div className="mt-6 flex flex-col gap-3">
            <div className="font-orbitron text-xs text-green-800 text-center tracking-widest">КАК ПОДКЛЮЧИТЬСЯ</div>
            {[
              { n: "1", text: "Скачай агент на ПК (ссылка ниже)" },
              { n: "2", text: "Запусти — появится 6-значный PIN" },
              { n: "3", text: "Введи PIN здесь и жми \"Подключиться\"" },
            ].map(s => (
              <div key={s.n} className="flex items-start gap-3">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 font-orbitron text-xs font-black"
                  style={{ background: "rgba(0,255,65,0.1)", border: "1px solid rgba(0,255,65,0.3)", color: "#00ff41" }}
                >
                  {s.n}
                </div>
                <span className="font-rajdhani text-sm text-green-600 leading-tight">{s.text}</span>
              </div>
            ))}
          </div>

          {/* Agent download info */}
          <div
            className="mt-4 p-4 rounded"
            style={{ background: "rgba(0,255,65,0.03)", border: "1px dashed rgba(0,255,65,0.2)" }}
          >
            <div className="font-orbitron text-xs text-green-700 mb-2">АГЕНТ ДЛЯ ПК</div>
            <p className="font-rajdhani text-xs text-green-800 mb-3 leading-relaxed">
              Небольшая программа на Python. Работает в трее. Создаёт защищённый туннель через облако — работает из любой точки мира.
            </p>
            <div
              className="rounded p-2 font-orbitron text-xs overflow-x-auto"
              style={{ background: "rgba(0,0,0,0.4)", color: "#00ff41", fontSize: "10px" }}
            >
              pip install nexus-agent<br />
              nexus-agent --relay {RELAY_URL}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 animate-fade-in-up">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              border: "2px solid #00ff41",
              boxShadow: "0 0 30px rgba(0,255,65,0.4)",
              background: "rgba(0,255,65,0.08)",
            }}
          >
            <Icon name="Loader" size={36} className="text-green-400 animate-spin" />
          </div>
          <div className="font-orbitron text-sm text-green-400">ПОДКЛЮЧЕНИЕ...</div>
          <div className="font-rajdhani text-xs text-green-700">PIN: {pin.join("")}</div>
        </div>
      )}
    </div>
  );
}

// ======================== SESSION STATE ========================
interface Session {
  sessionId: string;
  pcInfo: Record<string, string>;
}

type Page = "home" | "computers" | "games" | "control" | "settings" | "profile";

const NAV_ITEMS: { id: Page; label: string; icon: string }[] = [
  { id: "home", label: "Главная", icon: "Home" },
  { id: "computers", label: "ПК", icon: "Monitor" },
  { id: "games", label: "Игры", icon: "Gamepad2" },
  { id: "control", label: "Пульт", icon: "Crosshair" },
  { id: "settings", label: "Настройки", icon: "Settings" },
  { id: "profile", label: "Профиль", icon: "User" },
];

// ======================== HOME PAGE ========================
function HomePage({
  session,
  pcOnline,
  setPage,
  onDisconnect,
}: {
  session: Session;
  pcOnline: boolean;
  setPage: (p: Page) => void;
  onDisconnect: () => void;
}) {
  const pcName = session.pcInfo?.name || "DESKTOP";
  const pcOs = session.pcInfo?.os || "Windows";

  return (
    <div className="flex flex-col h-full grid-bg animate-fade-in-up">
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-8 text-center relative overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(0,255,65,0.06) 0%, transparent 70%)" }}
        />

        <div className="mb-2 text-xs font-rajdhani tracking-[6px] text-green-700 uppercase">
          NEXUS CONTROL v2.0
        </div>

        <h1
          className="font-orbitron text-4xl font-black mb-2 leading-tight"
          style={{ color: "#00ff41", textShadow: "0 0 20px #00ff41, 0 0 40px rgba(0,255,65,0.5)" }}
        >
          NEXUS
          <br />
          CONTROL
        </h1>

        <div className="w-32 h-px mb-6" style={{ background: "linear-gradient(90deg, transparent, #00ff41, transparent)" }} />

        {/* Connected PC card */}
        <div
          className="w-full max-w-xs rounded-lg p-4 mb-6 text-left"
          style={{
            background: "rgba(0,255,65,0.06)",
            border: `1px solid ${pcOnline ? "rgba(0,255,65,0.35)" : "rgba(255,100,0,0.35)"}`,
            boxShadow: pcOnline ? "0 0 20px rgba(0,255,65,0.1)" : "none",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon name="Monitor" size={16} className={pcOnline ? "text-green-400" : "text-orange-500"} />
              <span className="font-orbitron text-xs font-bold text-green-300">{pcName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background: pcOnline ? "#00ff41" : "#ff6600",
                  boxShadow: pcOnline ? "0 0 6px #00ff41" : "0 0 6px #ff6600",
                  animation: pcOnline ? "pulse-neon 1.5s ease-in-out infinite" : "none",
                }}
              />
              <span className="font-orbitron text-xs" style={{ color: pcOnline ? "#00ff41" : "#ff6600" }}>
                {pcOnline ? "ОНЛАЙН" : "ОФЛАЙН"}
              </span>
            </div>
          </div>
          <div className="font-rajdhani text-xs text-green-700">{pcOs} • Relay-соединение</div>
          <div className="font-rajdhani text-xs text-green-800 mt-1 truncate" style={{ fontSize: "10px" }}>
            Сессия: {session.sessionId.slice(0, 12)}...
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full max-w-xs mb-8">
          {[
            { val: "≤50ms", label: "Задержка" },
            { val: "100%", label: "Шифрование" },
            { val: "∞", label: "Расстояние" },
          ].map((s) => (
            <div key={s.label} className="dark-card rounded p-3 text-center">
              <div className="font-orbitron text-sm font-black neon-green">{s.val}</div>
              <div className="font-rajdhani text-xs text-green-700 uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setPage("control")}
          className="neon-btn px-8 py-3 text-sm rounded mb-3 w-full max-w-xs"
        >
          Открыть пульт управления
        </button>
        <button
          onClick={onDisconnect}
          className="font-rajdhani text-xs text-green-800 hover:text-red-500 transition-colors uppercase tracking-widest"
        >
          Отключиться
        </button>
      </div>
    </div>
  );
}

// ======================== COMPUTERS PAGE ========================
function ComputersPage({ session }: { session: Session }) {
  const pcName = session.pcInfo?.name || "DESKTOP-PRO";
  const pcOs = session.pcInfo?.os || "Windows";

  return (
    <div className="flex flex-col h-full p-4 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-orbitron text-lg font-bold neon-green">УСТРОЙСТВА</h2>
      </div>

      <div className="flex flex-col gap-3">
        {/* Connected device */}
        <div
          className="rounded-lg p-4 flex items-center gap-4"
          style={{ background: "rgba(0,255,65,0.08)", border: "1px solid rgba(0,255,65,0.4)", boxShadow: "0 0 15px rgba(0,255,65,0.1)" }}
        >
          <div
            className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(0,255,65,0.1)", border: "1px solid rgba(0,255,65,0.3)" }}
          >
            <Icon name="Monitor" size={20} className="text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-orbitron text-sm font-bold text-green-300 truncate">{pcName}</span>
              <span className="font-orbitron text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(0,255,65,0.15)", color: "#00ff41", fontSize: "9px" }}>
                АКТИВНО
              </span>
            </div>
            <div className="font-rajdhani text-xs text-green-700">{pcOs} • Relay-туннель</div>
          </div>
          <div className="status-dot" style={{ width: "8px", height: "8px" }} />
        </div>

        {/* Info block */}
        <div
          className="rounded-lg p-4"
          style={{ background: "rgba(0,255,65,0.02)", border: "1px dashed rgba(0,255,65,0.15)" }}
        >
          <div className="font-orbitron text-xs text-green-700 mb-2 tracking-wider">КАК ДОБАВИТЬ ЕЩЁ УСТРОЙСТВО</div>
          <p className="font-rajdhani text-xs text-green-800 leading-relaxed">
            Запусти агент на другом ПК, введи новый PIN в главном меню. Каждое устройство создаёт отдельную сессию.
          </p>
        </div>
      </div>
    </div>
  );
}

// ======================== GAMES PAGE ========================
function GamesPage({ session, sessionId }: { session: Session; sessionId: string }) {
  const games = [
    { name: "Cyberpunk 2077", genre: "RPG", time: "128ч", hue: 180 },
    { name: "Counter-Strike 2", genre: "Шутер", time: "340ч", hue: 30 },
    { name: "Elden Ring", genre: "Action RPG", time: "89ч", hue: 270 },
    { name: "GTA V", genre: "Открытый мир", time: "210ч", hue: 60 },
    { name: "Valorant", genre: "Шутер", time: "56ч", hue: 0 },
  ];

  const launchGame = (name: string) => {
    sendCommand(sessionId, "launch_game", { game: name });
  };

  return (
    <div className="flex flex-col h-full p-4 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-orbitron text-lg font-bold neon-green">БИБЛИОТЕКА</h2>
        <div className="font-rajdhani text-xs text-green-700">5 ИГР</div>
      </div>

      <div
        className="flex items-center gap-2 px-3 py-2 rounded mb-4"
        style={{ background: "rgba(0,255,65,0.05)", border: "1px solid rgba(0,255,65,0.2)" }}
      >
        <Icon name="Search" size={14} className="text-green-600" />
        <span className="font-rajdhani text-sm text-green-700">Поиск игр...</span>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto">
        {games.map((g) => (
          <div
            key={g.name}
            className="rounded-lg p-3 flex items-center gap-3"
            style={{ background: "rgba(0,255,65,0.03)", border: "1px solid rgba(0,255,65,0.1)" }}
          >
            <div
              className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0 font-orbitron text-sm font-black"
              style={{ background: `hsl(${g.hue}, 70%, 10%)`, border: `1px solid hsl(${g.hue}, 70%, 25%)`, color: `hsl(${g.hue}, 100%, 60%)` }}
            >
              {g.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-rajdhani font-bold text-sm text-green-200 truncate">{g.name}</div>
              <div className="font-rajdhani text-xs text-green-700">{g.genre} • {g.time}</div>
            </div>
            <button
              onClick={() => launchGame(g.name)}
              className="px-3 py-1 rounded text-xs font-orbitron font-bold transition-all"
              style={{ background: "rgba(0,255,65,0.1)", border: "1px solid rgba(0,255,65,0.4)", color: "#00ff41" }}
            >
              ▶
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ======================== CONTROL PAGE ========================
function ControlPage({ sessionId }: { sessionId: string }) {
  const [activeTab, setActiveTab] = useState<"touchpad" | "keyboard" | "mouse">("touchpad");
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [sensitivity, setSensitivity] = useState(5);
  const [moveCount, setMoveCount] = useState(0);
  const moveBuffer = useRef<{ dx: number; dy: number }[]>([]);
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushMoves = useCallback(() => {
    if (moveBuffer.current.length === 0) return;
    const totalDx = moveBuffer.current.reduce((s, m) => s + m.dx, 0);
    const totalDy = moveBuffer.current.reduce((s, m) => s + m.dy, 0);
    moveBuffer.current = [];
    sendCommand(sessionId, "mouse_move", { dx: Math.round(totalDx), dy: Math.round(totalDy) });
  }, [sessionId]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    lastPos.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!lastPos.current) return;
    const touch = e.touches[0];
    const dx = (touch.clientX - lastPos.current.x) * sensitivity * 0.6;
    const dy = (touch.clientY - lastPos.current.y) * sensitivity * 0.6;
    lastPos.current = { x: touch.clientX, y: touch.clientY };
    moveBuffer.current.push({ dx, dy });
    setMoveCount(c => c + 1);
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(flushMoves, 50);
  }, [sensitivity, flushMoves]);

  const handleTouchEnd = useCallback(() => {
    lastPos.current = null;
    flushMoves();
  }, [flushMoves]);

  const pressKey = (key: string, cmdKey?: string) => {
    setPressedKeys(prev => new Set([...prev, key]));
    setTimeout(() => {
      setPressedKeys(prev => { const n = new Set(prev); n.delete(key); return n; });
    }, 150);
    if (cmdKey) sendCommand(sessionId, cmdKey, { key });
  };

  const clickMouse = (button: "left" | "right" | "middle") => {
    pressKey(button);
    sendCommand(sessionId, "mouse_click", { button });
  };

  const scroll = (direction: "up" | "down") => {
    pressKey("scroll_" + direction);
    sendCommand(sessionId, "scroll", { direction, amount: 3 });
  };

  const KEYBOARD_ROWS = [
    ["Esc", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "⌫"],
    ["Tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["Caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", "↵"],
    ["⇧", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "⇧"],
    ["Ctrl", "Win", "Alt", "SPACE", "Alt", "Ctrl"],
  ];

  const HOTKEYS = ["Ctrl+C", "Ctrl+V", "Ctrl+Z", "Ctrl+A", "Alt+F4", "Win+D", "Win+L", "PrtSc"];

  return (
    <div className="flex flex-col h-full animate-fade-in-up">
      <div className="flex mx-4 mt-3 rounded overflow-hidden" style={{ border: "1px solid rgba(0,255,65,0.2)" }}>
        {(["touchpad", "keyboard", "mouse"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2 font-orbitron text-xs font-bold uppercase tracking-wider transition-all"
            style={{
              background: activeTab === tab ? "rgba(0,255,65,0.15)" : "transparent",
              color: activeTab === tab ? "#00ff41" : "#3a5a3a",
              borderRight: tab !== "mouse" ? "1px solid rgba(0,255,65,0.2)" : "none",
              textShadow: activeTab === tab ? "0 0 8px #00ff41" : "none",
            }}
          >
            {tab === "touchpad" ? "Тачпад" : tab === "keyboard" ? "Клавиши" : "Мышь"}
          </button>
        ))}
      </div>

      {activeTab === "touchpad" && (
        <div className="flex flex-col flex-1 p-4 gap-3">
          <div className="flex items-center justify-between">
            <span className="font-orbitron text-xs text-green-600">ТРЕКПАД</span>
            <div className="flex items-center gap-2">
              <span className="font-rajdhani text-xs text-green-700">×{sensitivity}</span>
              <input type="range" min={1} max={10} value={sensitivity}
                onChange={(e) => setSensitivity(Number(e.target.value))}
                className="w-16 accent-green-400"
              />
            </div>
          </div>

          <div
            className="touchpad-area rounded-lg flex-1 flex items-center justify-center relative"
            style={{ minHeight: "180px" }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="text-center pointer-events-none">
              <Icon name="Move" size={28} className="text-green-800 mx-auto mb-2" />
              <span className="font-rajdhani text-xs text-green-800 block">Веди пальцем — двигает мышь на ПК</span>
              {moveCount > 0 && (
                <span className="font-orbitron text-xs text-green-600 block mt-1">{moveCount} команд отправлено</span>
              )}
            </div>
            <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-green-600 opacity-40" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-green-600 opacity-40" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-green-600 opacity-40" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-green-600 opacity-40" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "ЛКМ", key: "left", icon: "MousePointerClick" },
              { label: "СКМ", key: "middle", icon: "Circle" },
              { label: "ПКМ", key: "right", icon: "MousePointerClick" },
            ].map((btn) => (
              <button
                key={btn.key}
                onTouchStart={() => clickMouse(btn.key as "left" | "right" | "middle")}
                onMouseDown={() => clickMouse(btn.key as "left" | "right" | "middle")}
                className="key-btn rounded py-3 flex flex-col items-center gap-1 transition-all"
                style={{
                  background: pressedKeys.has(btn.key) ? "rgba(0,255,65,0.2)" : undefined,
                  borderColor: pressedKeys.has(btn.key) ? "#00ff41" : undefined,
                  boxShadow: pressedKeys.has(btn.key) ? "0 0 12px rgba(0,255,65,0.5)" : undefined,
                }}
              >
                <Icon name={btn.icon} size={16} className={pressedKeys.has(btn.key) ? "text-green-400" : "text-green-700"} fallback="MousePointerClick" />
                <span className="font-orbitron text-xs">{btn.label}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onTouchStart={() => scroll("up")} onMouseDown={() => scroll("up")}
              className="key-btn rounded py-2 flex items-center justify-center gap-2"
              style={{ background: pressedKeys.has("scroll_up") ? "rgba(0,255,65,0.2)" : undefined }}
            >
              <Icon name="ChevronUp" size={16} fallback="ChevronUp" />
              <span className="font-rajdhani text-sm">Скролл ↑</span>
            </button>
            <button onTouchStart={() => scroll("down")} onMouseDown={() => scroll("down")}
              className="key-btn rounded py-2 flex items-center justify-center gap-2"
              style={{ background: pressedKeys.has("scroll_down") ? "rgba(0,255,65,0.2)" : undefined }}
            >
              <Icon name="ChevronDown" size={16} fallback="ChevronDown" />
              <span className="font-rajdhani text-sm">Скролл ↓</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === "keyboard" && (
        <div className="flex flex-col flex-1 p-3 gap-2">
          <div
            className="px-3 py-2 rounded cursor-blink font-rajdhani text-sm text-green-300"
            style={{ background: "rgba(0,255,65,0.05)", border: "1px solid rgba(0,255,65,0.2)", minHeight: "36px" }}
          >
            Нажимай клавиши ниже...
          </div>

          <div className="flex flex-col gap-1">
            {KEYBOARD_ROWS.map((row, ri) => (
              <div key={ri} className="flex gap-1 justify-center">
                {row.map((key) => (
                  <button
                    key={key}
                    onTouchStart={() => pressKey(key, "key_press")}
                    onMouseDown={() => pressKey(key, "key_press")}
                    className="key-btn rounded flex items-center justify-center transition-all"
                    style={{
                      minWidth: key === "SPACE" ? "72px" : key.length > 2 ? "38px" : "26px",
                      height: "30px",
                      fontSize: key.length > 2 ? "8px" : "11px",
                      background: pressedKeys.has(key) ? "rgba(0,255,65,0.2)" : undefined,
                      borderColor: pressedKeys.has(key) ? "#00ff41" : undefined,
                      color: pressedKeys.has(key) ? "#00ff41" : undefined,
                      boxShadow: pressedKeys.has(key) ? "0 0 10px rgba(0,255,65,0.4)" : undefined,
                    }}
                  >
                    {key}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-1 mt-1">
            {HOTKEYS.map((cmd) => (
              <button
                key={cmd}
                onMouseDown={() => pressKey(cmd, "hotkey")}
                onTouchStart={() => pressKey(cmd, "hotkey")}
                className="key-btn rounded py-1 px-1 text-center"
                style={{ fontSize: "9px", background: pressedKeys.has(cmd) ? "rgba(0,255,65,0.2)" : undefined }}
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "mouse" && (
        <div className="flex flex-col flex-1 p-4 gap-4">
          <div className="font-orbitron text-xs text-green-600">СТРЕЛОЧНОЕ УПРАВЛЕНИЕ</div>

          <div className="flex justify-center">
            <div className="relative w-44 h-44">
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,255,65,0.05)", border: "1px solid rgba(0,255,65,0.2)" }}
              >
                <Icon name="Crosshair" size={22} className="text-green-600" />
              </div>
              {([
                { dir: "up", style: { top: 0, left: "50%", transform: "translateX(-50%)" }, icon: "ChevronUp" },
                { dir: "down", style: { bottom: 0, left: "50%", transform: "translateX(-50%)" }, icon: "ChevronDown" },
                { dir: "left", style: { top: "50%", left: 0, transform: "translateY(-50%)" }, icon: "ChevronLeft" },
                { dir: "right", style: { top: "50%", right: 0, transform: "translateY(-50%)" }, icon: "ChevronRight" },
              ] as const).map((d) => (
                <button
                  key={d.dir}
                  onMouseDown={() => { pressKey(d.dir); sendCommand(sessionId, "mouse_move", d.dir === "up" ? { dx: 0, dy: -30 } : d.dir === "down" ? { dx: 0, dy: 30 } : d.dir === "left" ? { dx: -30, dy: 0 } : { dx: 30, dy: 0 }); }}
                  onTouchStart={() => { pressKey(d.dir); sendCommand(sessionId, "mouse_move", d.dir === "up" ? { dx: 0, dy: -30 } : d.dir === "down" ? { dx: 0, dy: 30 } : d.dir === "left" ? { dx: -30, dy: 0 } : { dx: 30, dy: 0 }); }}
                  className="absolute key-btn w-12 h-12 rounded flex items-center justify-center"
                  style={{
                    ...d.style,
                    background: pressedKeys.has(d.dir) ? "rgba(0,255,65,0.2)" : undefined,
                    borderColor: pressedKeys.has(d.dir) ? "#00ff41" : undefined,
                  }}
                >
                  <Icon name={d.icon} size={20} fallback="ChevronUp" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "left", label: "ЛКМ", sub: "Левая кнопка" },
              { key: "right", label: "ПКМ", sub: "Правая кнопка" },
            ].map((b) => (
              <button
                key={b.key}
                onMouseDown={() => clickMouse(b.key as "left" | "right")}
                onTouchStart={() => clickMouse(b.key as "left" | "right")}
                className="key-btn rounded py-4 flex flex-col items-center gap-2"
                style={{ background: pressedKeys.has(b.key) ? "rgba(0,255,65,0.2)" : undefined }}
              >
                <span className="font-orbitron text-lg">{b.label}</span>
                <span className="font-rajdhani text-xs text-green-700">{b.sub}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ======================== SETTINGS PAGE ========================
function SettingsPage() {
  const [settings, setSettings] = useState({
    vibration: true,
    sounds: false,
    autoConnect: true,
    sensitivity: 5,
    theme: "green",
  });

  const toggle = (key: string) =>
    setSettings((s) => ({ ...s, [key]: !s[key as keyof typeof s] }));

  const themes = [
    { id: "green", color: "#00ff41", label: "Матрица" },
    { id: "cyan", color: "#00ffff", label: "Киберпанк" },
    { id: "red", color: "#ff0040", label: "Агрессия" },
    { id: "purple", color: "#bf00ff", label: "Неон" },
  ];

  const toggleItems = [
    { key: "autoConnect", label: "Авто-переподключение", desc: "Восстанавливать сессию" },
    { key: "vibration", label: "Вибрация", desc: "При нажатии кнопок" },
    { key: "sounds", label: "Звуки", desc: "Системные уведомления" },
  ];

  return (
    <div className="flex flex-col h-full p-4 gap-4 animate-fade-in-up overflow-y-auto">
      <h2 className="font-orbitron text-lg font-bold neon-green">НАСТРОЙКИ</h2>

      <div className="dark-card rounded-lg p-4">
        <div className="font-orbitron text-xs text-green-600 mb-3 tracking-wider">ТЕМА АКЦЕНТА</div>
        <div className="grid grid-cols-4 gap-2">
          {themes.map((t) => (
            <button key={t.id} onClick={() => setSettings((s) => ({ ...s, theme: t.id }))}
              className="flex flex-col items-center gap-2 p-2 rounded transition-all"
              style={{
                border: `1px solid ${settings.theme === t.id ? t.color : "rgba(255,255,255,0.08)"}`,
                background: settings.theme === t.id ? `${t.color}15` : "transparent",
                boxShadow: settings.theme === t.id ? `0 0 12px ${t.color}40` : "none",
              }}
            >
              <div className="w-4 h-4 rounded-full" style={{ background: t.color, boxShadow: `0 0 8px ${t.color}` }} />
              <span className="font-rajdhani text-xs" style={{ color: t.color }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="dark-card rounded-lg p-4">
        <div className="font-orbitron text-xs text-green-600 mb-3 tracking-wider">ПАРАМЕТРЫ</div>
        <div className="flex flex-col gap-4">
          {toggleItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <div className="font-rajdhani font-semibold text-sm text-green-200">{item.label}</div>
                <div className="font-rajdhani text-xs text-green-700">{item.desc}</div>
              </div>
              <button onClick={() => toggle(item.key)}
                className="w-12 h-6 rounded-full relative transition-all flex-shrink-0"
                style={{
                  background: settings[item.key as keyof typeof settings] ? "rgba(0,255,65,0.3)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${settings[item.key as keyof typeof settings] ? "#00ff41" : "rgba(255,255,255,0.1)"}`,
                  boxShadow: settings[item.key as keyof typeof settings] ? "0 0 8px rgba(0,255,65,0.4)" : "none",
                }}
              >
                <span className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                  style={{
                    left: settings[item.key as keyof typeof settings] ? "26px" : "2px",
                    background: settings[item.key as keyof typeof settings] ? "#00ff41" : "#444",
                    boxShadow: settings[item.key as keyof typeof settings] ? "0 0 6px #00ff41" : "none",
                  }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="dark-card rounded-lg p-4">
        <div className="font-orbitron text-xs text-green-600 mb-3 tracking-wider">ЧУВСТВИТЕЛЬНОСТЬ МЫШИ</div>
        <div className="flex items-center gap-3">
          <span className="font-orbitron text-xs text-green-700">1</span>
          <input type="range" min={1} max={10} value={settings.sensitivity}
            onChange={(e) => setSettings((s) => ({ ...s, sensitivity: Number(e.target.value) }))}
            className="flex-1 accent-green-400"
          />
          <span className="font-orbitron text-sm text-green-400 w-4">{settings.sensitivity}</span>
        </div>
      </div>

      <button className="neon-btn py-3 rounded text-sm">Сохранить настройки</button>
    </div>
  );
}

// ======================== PROFILE PAGE ========================
function ProfilePage({ onDisconnect }: { onDisconnect: () => void }) {
  const stats = [
    { label: "Сессий", val: "247" },
    { label: "Часов", val: "89.4" },
    { label: "Команд", val: "14K" },
    { label: "ПК", val: "3" },
  ];

  return (
    <div className="flex flex-col h-full p-4 gap-4 animate-fade-in-up overflow-y-auto">
      <div className="flex flex-col items-center py-4">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-3 relative"
          style={{ background: "rgba(0,255,65,0.1)", border: "2px solid #00ff41", boxShadow: "0 0 20px rgba(0,255,65,0.4)" }}
        >
          <Icon name="User" size={36} className="text-green-400" />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: "#00ff41", boxShadow: "0 0 8px #00ff41" }}
          >
            <Icon name="Check" size={10} className="text-black" />
          </div>
        </div>
        <h3 className="font-orbitron text-lg font-bold neon-green">GHOST_USER</h3>
        <span className="font-rajdhani text-sm text-green-600">ghost@nexus.local</span>
        <div className="mt-2 px-3 py-1 rounded-full text-xs font-orbitron font-bold"
          style={{ background: "rgba(0,255,65,0.1)", border: "1px solid rgba(0,255,65,0.3)", color: "#00ff41" }}
        >
          PRO ГАМЕР
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="dark-card rounded-lg p-3 text-center">
            <div className="font-orbitron text-base font-black neon-green">{s.val}</div>
            <div className="font-rajdhani text-xs text-green-700 uppercase">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="dark-card rounded-lg p-4">
        <div className="font-orbitron text-xs text-green-600 mb-3 tracking-wider">АКТИВНОСТЬ</div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => {
            const intensity = Math.random();
            return (
              <div key={i} className="w-full aspect-square rounded-sm"
                style={{
                  background: intensity > 0.7 ? "#00ff41" : intensity > 0.4 ? "rgba(0,255,65,0.4)" : intensity > 0.15 ? "rgba(0,255,65,0.15)" : "rgba(0,255,65,0.04)",
                  boxShadow: intensity > 0.7 ? "0 0 4px #00ff41" : "none",
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button className="neon-btn py-3 rounded text-sm">Редактировать профиль</button>
        <button onClick={onDisconnect}
          className="py-3 rounded font-orbitron text-xs font-bold uppercase tracking-widest transition-all"
          style={{ background: "transparent", border: "1px solid rgba(255,0,64,0.3)", color: "#ff0040", boxShadow: "0 0 8px rgba(255,0,64,0.1)" }}
        >
          Отключиться от ПК
        </button>
      </div>
    </div>
  );
}

// ======================== MAIN ========================
export default function Index() {
  const [session, setSession] = useState<Session | null>(() => {
    try {
      const saved = localStorage.getItem("nexus_session");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [page, setPage] = useState<Page>("home");
  const [pcOnline, setPcOnline] = useState(false);

  // Poll PC status every 5s when connected
  useEffect(() => {
    if (!session) return;
    const check = async () => {
      try {
        const data = await relayGet("status", { session_id: session.sessionId });
        setPcOnline(!!data.pc_online);
        if (data.pc_info && Object.keys(data.pc_info).length > 0) {
          setSession(s => s ? { ...s, pcInfo: data.pc_info } : s);
        }
      } catch { setPcOnline(false); }
    };
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, [session?.sessionId]);

  const handleConnected = (sessionId: string, pcInfo: Record<string, string>) => {
    const s = { sessionId, pcInfo };
    setSession(s);
    localStorage.setItem("nexus_session", JSON.stringify(s));
    setPage("home");
  };

  const handleDisconnect = () => {
    if (session) {
      relayPost("disconnect", { session_id: session.sessionId }).catch(() => {});
    }
    localStorage.removeItem("nexus_session");
    setSession(null);
    setPcOnline(false);
  };

  if (!session) {
    return <ConnectScreen onConnected={handleConnected} />;
  }

  const renderPage = () => {
    switch (page) {
      case "home": return <HomePage session={session} pcOnline={pcOnline} setPage={setPage} onDisconnect={handleDisconnect} />;
      case "computers": return <ComputersPage session={session} />;
      case "games": return <GamesPage session={session} sessionId={session.sessionId} />;
      case "control": return <ControlPage sessionId={session.sessionId} />;
      case "settings": return <SettingsPage />;
      case "profile": return <ProfilePage onDisconnect={handleDisconnect} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-sm mx-auto" style={{ background: "var(--dark-bg)", height: "100dvh", overflow: "hidden" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0" style={{ borderBottom: "1px solid rgba(0,255,65,0.1)", background: "rgba(0,0,0,0.6)" }}>
        <span className="font-orbitron text-sm font-black" style={{ color: "#00ff41", textShadow: "0 0 8px #00ff41" }}>
          NEXUS
        </span>
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: pcOnline ? "#00ff41" : "#ff6600",
              boxShadow: pcOnline ? "0 0 6px #00ff41" : "0 0 6px #ff6600",
            }}
          />
          <span className="font-rajdhani text-xs" style={{ color: pcOnline ? "#00ff41" : "#ff6600" }}>
            {pcOnline ? (session.pcInfo?.name || "ПК") : "ОФЛАЙН"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Icon name="Wifi" size={14} className="text-green-500" />
          <Icon name="Globe" size={14} className="text-green-500" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {renderPage()}
      </div>

      <div className="flex-shrink-0 grid grid-cols-6" style={{ borderTop: "1px solid rgba(0,255,65,0.15)", background: "rgba(6,8,16,0.97)" }}>
        {NAV_ITEMS.map((item) => (
          <button key={item.id} onClick={() => setPage(item.id)}
            className="nav-tab flex flex-col items-center gap-1"
            style={{
              borderTopColor: page === item.id ? "#00ff41" : "transparent",
              color: page === item.id ? "#00ff41" : "#3a5a3a",
              textShadow: page === item.id ? "0 0 8px rgba(0,255,65,0.6)" : "none",
            }}
          >
            <Icon name={item.icon} size={16} className={page === item.id ? "text-green-400" : "text-green-900"} fallback="Home" />
            <span style={{ fontSize: "8px" }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
