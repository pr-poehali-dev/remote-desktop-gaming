import { useState, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

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
function HomePage({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <div className="flex flex-col h-full grid-bg animate-fade-in-up">
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(0,255,65,0.08) 0%, transparent 70%)" }}
          />
        </div>

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

        <div className="w-32 h-px mb-4" style={{ background: "linear-gradient(90deg, transparent, #00ff41, transparent)" }} />

        <p className="font-rajdhani text-base text-green-300 mb-8 max-w-xs leading-relaxed">
          Управляй компьютером с мобильного.
          <br />
          Мышь. Клавиатура. Тачпад.
        </p>

        <div className="grid grid-cols-3 gap-3 w-full max-w-xs mb-8">
          {[
            { val: "0ms", label: "Задержка" },
            { val: "∞", label: "Устройств" },
            { val: "100%", label: "Контроль" },
          ].map((s) => (
            <div key={s.label} className="dark-card rounded p-3 text-center">
              <div className="font-orbitron text-lg font-black neon-green">{s.val}</div>
              <div className="font-rajdhani text-xs text-green-700 uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setPage("control")}
          className="neon-btn px-8 py-3 text-sm rounded mb-4 w-full max-w-xs"
        >
          Начать управление
        </button>
        <button
          onClick={() => setPage("computers")}
          className="font-rajdhani text-sm text-green-700 hover:text-green-400 transition-colors uppercase tracking-widest"
        >
          Выбрать устройство →
        </button>
      </div>

      <div
        className="flex items-center justify-between px-4 py-2 mx-4 mb-4 rounded"
        style={{ background: "rgba(0,255,65,0.05)", border: "1px solid rgba(0,255,65,0.15)" }}
      >
        <div className="flex items-center gap-2">
          <div className="status-dot" />
          <span className="font-orbitron text-xs text-green-500">ОНЛАЙН</span>
        </div>
        <span className="font-rajdhani text-xs text-green-700">DESKTOP-PRO • 192.168.1.10</span>
        <span className="font-orbitron text-xs text-green-600">WiFi</span>
      </div>
    </div>
  );
}

// ======================== COMPUTERS PAGE ========================
function ComputersPage() {
  const devices = [
    { name: "DESKTOP-PRO", ip: "192.168.1.10", status: "online", type: "Desktop", os: "Windows 11" },
    { name: "GAMING-RIG", ip: "192.168.1.15", status: "online", type: "Gaming PC", os: "Windows 11" },
    { name: "MACBOOK-M3", ip: "192.168.1.22", status: "offline", type: "Laptop", os: "macOS 14" },
    { name: "WORKSTATION", ip: "192.168.1.30", status: "offline", type: "Workstation", os: "Ubuntu 22" },
  ];

  return (
    <div className="flex flex-col h-full p-4 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-orbitron text-lg font-bold neon-green">УСТРОЙСТВА</h2>
        <button className="neon-btn px-3 py-1 text-xs rounded">+ Добавить</button>
      </div>

      <div className="flex flex-col gap-3">
        {devices.map((d) => (
          <div
            key={d.name}
            className="dark-card rounded-lg p-4 flex items-center gap-4 cursor-pointer transition-all"
            style={{ borderColor: d.status === "online" ? "rgba(0,255,65,0.3)" : "rgba(255,255,255,0.05)" }}
          >
            <div
              className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
              style={{
                background: d.status === "online" ? "rgba(0,255,65,0.1)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${d.status === "online" ? "rgba(0,255,65,0.3)" : "rgba(255,255,255,0.08)"}`,
              }}
            >
              <Icon
                name={d.type === "Laptop" ? "Laptop" : "Monitor"}
                size={20}
                className={d.status === "online" ? "text-green-400" : "text-green-900"}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-orbitron text-sm font-bold text-green-300 truncate">{d.name}</div>
              <div className="font-rajdhani text-xs text-green-700">{d.os} • {d.ip}</div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background: d.status === "online" ? "#00ff41" : "#333",
                  boxShadow: d.status === "online" ? "0 0 6px #00ff41" : "none",
                }}
              />
              <span className="font-orbitron text-xs" style={{ color: d.status === "online" ? "#00ff41" : "#444" }}>
                {d.status === "online" ? "ON" : "OFF"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-4 p-3 rounded text-center"
        style={{ background: "rgba(0,255,65,0.03)", border: "1px dashed rgba(0,255,65,0.15)" }}
      >
        <span className="font-rajdhani text-xs text-green-700">Поиск устройств в сети 192.168.1.0/24...</span>
      </div>
    </div>
  );
}

// ======================== GAMES PAGE ========================
function GamesPage() {
  const games = [
    { name: "Cyberpunk 2077", genre: "RPG", time: "128ч", hue: 180 },
    { name: "Counter-Strike 2", genre: "Шутер", time: "340ч", hue: 30 },
    { name: "Elden Ring", genre: "Action RPG", time: "89ч", hue: 270 },
    { name: "GTA V", genre: "Открытый мир", time: "210ч", hue: 60 },
    { name: "Valorant", genre: "Шутер", time: "56ч", hue: 0 },
  ];

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
            className="rounded-lg p-3 flex items-center gap-3 cursor-pointer transition-all"
            style={{ background: "rgba(0,255,65,0.03)", border: "1px solid rgba(0,255,65,0.1)" }}
          >
            <div
              className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0 font-orbitron text-sm font-black"
              style={{
                background: `hsl(${g.hue}, 70%, 10%)`,
                border: `1px solid hsl(${g.hue}, 70%, 25%)`,
                color: `hsl(${g.hue}, 100%, 60%)`,
              }}
            >
              {g.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-rajdhani font-bold text-sm text-green-200 truncate">{g.name}</div>
              <div className="font-rajdhani text-xs text-green-700">{g.genre} • {g.time}</div>
            </div>
            <button
              className="px-3 py-1 rounded text-xs font-orbitron font-bold transition-all"
              style={{
                background: "rgba(0,255,65,0.1)",
                border: "1px solid rgba(0,255,65,0.4)",
                color: "#00ff41",
              }}
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
function ControlPage() {
  const [activeTab, setActiveTab] = useState<"touchpad" | "keyboard" | "mouse">("touchpad");
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [sensitivity, setSensitivity] = useState(5);
  const [moveCount, setMoveCount] = useState(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    lastPos.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!lastPos.current) return;
    const touch = e.touches[0];
    const dx = (touch.clientX - lastPos.current.x) * sensitivity * 0.5;
    const dy = (touch.clientY - lastPos.current.y) * sensitivity * 0.5;
    lastPos.current = { x: touch.clientX, y: touch.clientY };
    setMoveCount(c => c + 1);
    console.log("Mouse delta:", Math.round(dx), Math.round(dy));
  }, [sensitivity]);

  const handleTouchEnd = useCallback(() => {
    lastPos.current = null;
  }, []);

  const pressKey = (key: string) => {
    setPressedKeys(prev => new Set([...prev, key]));
    setTimeout(() => {
      setPressedKeys(prev => { const n = new Set(prev); n.delete(key); return n; });
    }, 150);
  };

  const KEYBOARD_ROWS = [
    ["Esc", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "⌫"],
    ["Tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["Caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", "↵"],
    ["⇧", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "⇧"],
    ["Ctrl", "Win", "Alt", "SPACE", "Alt", "Ctrl"],
  ];

  return (
    <div className="flex flex-col h-full animate-fade-in-up">
      {/* Tab switcher */}
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
              <span className="font-rajdhani text-xs text-green-700">Чувств: {sensitivity}</span>
              <input
                type="range" min={1} max={10} value={sensitivity}
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
              <span className="font-rajdhani text-xs text-green-800 block">Проведи пальцем для управления мышью</span>
              {moveCount > 0 && (
                <span className="font-orbitron text-xs text-green-500 block mt-1">Δ {moveCount} движений</span>
              )}
            </div>
            <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-green-600 opacity-50" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-green-600 opacity-50" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-green-600 opacity-50" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-green-600 opacity-50" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "ЛКМ", key: "lmb", icon: "MousePointerClick" },
              { label: "СКМ", key: "mmb", icon: "Circle" },
              { label: "ПКМ", key: "rmb", icon: "MousePointerClick" },
            ].map((btn) => (
              <button
                key={btn.key}
                onTouchStart={() => pressKey(btn.key)}
                onMouseDown={() => pressKey(btn.key)}
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
            {[
              { key: "su", icon: "ChevronUp", label: "Скролл ↑" },
              { key: "sd", icon: "ChevronDown", label: "Скролл ↓" },
            ].map((b) => (
              <button
                key={b.key}
                onTouchStart={() => pressKey(b.key)}
                onMouseDown={() => pressKey(b.key)}
                className="key-btn rounded py-2 flex items-center justify-center gap-2"
                style={{ background: pressedKeys.has(b.key) ? "rgba(0,255,65,0.2)" : undefined }}
              >
                <Icon name={b.icon} size={16} fallback="ChevronUp" />
                <span className="font-rajdhani text-sm">{b.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "keyboard" && (
        <div className="flex flex-col flex-1 p-3 gap-2">
          <div
            className="px-3 py-2 rounded cursor-blink font-rajdhani text-sm text-green-300"
            style={{ background: "rgba(0,255,65,0.05)", border: "1px solid rgba(0,255,65,0.2)", minHeight: "36px" }}
          >
            Введите текст...
          </div>

          <div className="flex flex-col gap-1">
            {KEYBOARD_ROWS.map((row, ri) => (
              <div key={ri} className="flex gap-1 justify-center">
                {row.map((key) => (
                  <button
                    key={key}
                    onTouchStart={() => pressKey(key)}
                    onMouseDown={() => pressKey(key)}
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
            {["Ctrl+C", "Ctrl+V", "Ctrl+Z", "Ctrl+A", "Alt+F4", "Win+D", "Win+L", "PrtSc"].map((cmd) => (
              <button
                key={cmd}
                onMouseDown={() => pressKey(cmd)}
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
          <div className="font-orbitron text-xs text-green-600">МЫШЬ — СТРЕЛОЧНОЕ УПРАВЛЕНИЕ</div>

          <div className="flex justify-center">
            <div className="relative w-44 h-44">
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,255,65,0.05)", border: "1px solid rgba(0,255,65,0.2)" }}
              >
                <Icon name="Crosshair" size={22} className="text-green-600" />
              </div>
              {[
                { dir: "up", style: { top: 0, left: "50%", transform: "translateX(-50%)" }, icon: "ChevronUp" },
                { dir: "down", style: { bottom: 0, left: "50%", transform: "translateX(-50%)" }, icon: "ChevronDown" },
                { dir: "left", style: { top: "50%", left: 0, transform: "translateY(-50%)" }, icon: "ChevronLeft" },
                { dir: "right", style: { top: "50%", right: 0, transform: "translateY(-50%)" }, icon: "ChevronRight" },
              ].map((d) => (
                <button
                  key={d.dir}
                  onMouseDown={() => pressKey(d.dir)}
                  onTouchStart={() => pressKey(d.dir)}
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
              { key: "lmb", label: "ЛКМ", sub: "Левая кнопка" },
              { key: "rmb", label: "ПКМ", sub: "Правая кнопка" },
            ].map((b) => (
              <button
                key={b.key}
                onMouseDown={() => pressKey(b.key)}
                onTouchStart={() => pressKey(b.key)}
                className="key-btn rounded py-4 flex flex-col items-center gap-2"
                style={{ background: pressedKeys.has(b.key) ? "rgba(0,255,65,0.2)" : undefined }}
              >
                <span className="font-orbitron text-lg">{b.label}</span>
                <span className="font-rajdhani text-xs text-green-700">{b.sub}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 p-3 rounded" style={{ background: "rgba(0,255,65,0.03)", border: "1px solid rgba(0,255,65,0.1)" }}>
            <Icon name="Info" size={14} className="text-green-700 flex-shrink-0" />
            <span className="font-rajdhani text-xs text-green-700">Плавное перемещение — на вкладке Тачпад</span>
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
    showGrid: true,
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
    { key: "autoConnect", label: "Авто-переподключение", desc: "Восстанавливать соединение" },
    { key: "vibration", label: "Вибрация", desc: "При нажатии кнопок" },
    { key: "sounds", label: "Звуки", desc: "Системные уведомления" },
    { key: "showGrid", label: "Сетка фона", desc: "Визуальная сетка" },
  ];

  return (
    <div className="flex flex-col h-full p-4 gap-4 animate-fade-in-up overflow-y-auto">
      <h2 className="font-orbitron text-lg font-bold neon-green">НАСТРОЙКИ</h2>

      <div className="dark-card rounded-lg p-4">
        <div className="font-orbitron text-xs text-green-600 mb-3 tracking-wider">ТЕМА АКЦЕНТА</div>
        <div className="grid grid-cols-4 gap-2">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setSettings((s) => ({ ...s, theme: t.id }))}
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
              <button
                onClick={() => toggle(item.key)}
                className="w-12 h-6 rounded-full relative transition-all flex-shrink-0"
                style={{
                  background: settings[item.key as keyof typeof settings] ? "rgba(0,255,65,0.3)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${settings[item.key as keyof typeof settings] ? "#00ff41" : "rgba(255,255,255,0.1)"}`,
                  boxShadow: settings[item.key as keyof typeof settings] ? "0 0 8px rgba(0,255,65,0.4)" : "none",
                }}
              >
                <span
                  className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
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
          <input
            type="range" min={1} max={10} value={settings.sensitivity}
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
function ProfilePage() {
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
          style={{
            background: "rgba(0,255,65,0.1)",
            border: "2px solid #00ff41",
            boxShadow: "0 0 20px rgba(0,255,65,0.4), 0 0 40px rgba(0,255,65,0.1)",
          }}
        >
          <Icon name="User" size={36} className="text-green-400" />
          <div
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: "#00ff41", boxShadow: "0 0 8px #00ff41" }}
          >
            <Icon name="Check" size={10} className="text-black" />
          </div>
        </div>
        <h3 className="font-orbitron text-lg font-bold neon-green">GHOST_USER</h3>
        <span className="font-rajdhani text-sm text-green-600">ghost@nexus.local</span>
        <div
          className="mt-2 px-3 py-1 rounded-full text-xs font-orbitron font-bold"
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
        <div className="font-orbitron text-xs text-green-600 mb-3 tracking-wider">АКТИВНОСТЬ (35 ДНЕЙ)</div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => {
            const intensity = Math.random();
            return (
              <div
                key={i}
                className="w-full aspect-square rounded-sm"
                style={{
                  background:
                    intensity > 0.7 ? "#00ff41"
                    : intensity > 0.4 ? "rgba(0,255,65,0.4)"
                    : intensity > 0.15 ? "rgba(0,255,65,0.15)"
                    : "rgba(0,255,65,0.04)",
                  boxShadow: intensity > 0.7 ? "0 0 4px #00ff41" : "none",
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button className="neon-btn py-3 rounded text-sm">Редактировать профиль</button>
        <button
          className="py-3 rounded font-orbitron text-xs font-bold uppercase tracking-widest transition-all"
          style={{
            background: "transparent",
            border: "1px solid rgba(255,0,64,0.3)",
            color: "#ff0040",
            boxShadow: "0 0 8px rgba(255,0,64,0.1)",
          }}
        >
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}

// ======================== MAIN ========================
export default function Index() {
  const [page, setPage] = useState<Page>("home");

  const renderPage = () => {
    switch (page) {
      case "home": return <HomePage setPage={setPage} />;
      case "computers": return <ComputersPage />;
      case "games": return <GamesPage />;
      case "control": return <ControlPage />;
      case "settings": return <SettingsPage />;
      case "profile": return <ProfilePage />;
    }
  };

  return (
    <div
      className="flex flex-col min-h-screen max-w-sm mx-auto"
      style={{ background: "var(--dark-bg)", height: "100dvh", overflow: "hidden" }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-2 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(0,255,65,0.1)", background: "rgba(0,0,0,0.6)" }}
      >
        <span className="font-orbitron text-sm font-black" style={{ color: "#00ff41", textShadow: "0 0 8px #00ff41" }}>
          NEXUS
        </span>
        <div className="flex items-center gap-2">
          <div className="status-dot" style={{ width: "6px", height: "6px" }} />
          <span className="font-rajdhani text-xs text-green-600">192.168.1.10</span>
        </div>
        <div className="flex items-center gap-1">
          <Icon name="Wifi" size={14} className="text-green-500" />
          <Icon name="Battery" size={14} className="text-green-500" />
        </div>
      </div>

      {/* Page */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {renderPage()}
      </div>

      {/* Bottom nav */}
      <div
        className="flex-shrink-0 grid grid-cols-6"
        style={{ borderTop: "1px solid rgba(0,255,65,0.15)", background: "rgba(6,8,16,0.97)" }}
      >
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className="nav-tab flex flex-col items-center gap-1"
            style={{
              borderTopColor: page === item.id ? "#00ff41" : "transparent",
              color: page === item.id ? "#00ff41" : "#3a5a3a",
              textShadow: page === item.id ? "0 0 8px rgba(0,255,65,0.6)" : "none",
            }}
          >
            <Icon
              name={item.icon}
              size={16}
              className={page === item.id ? "text-green-400" : "text-green-900"}
              fallback="Home"
            />
            <span style={{ fontSize: "8px" }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
