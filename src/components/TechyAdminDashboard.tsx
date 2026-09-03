import React, { useState, useEffect } from 'react';
import { CCTVProject, ExecutiveStatus, TaskStatus } from '../types';
import { 
  Terminal, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Server, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Power, 
  ShieldAlert, 
  Sliders, 
  Database, 
  Zap, 
  Radio, 
  ArrowUpRight,
  Filter,
  Check,
  X
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface TechyAdminDashboardProps {
  project: CCTVProject;
  execStatus: ExecutiveStatus;
  onResolveBlocker: (id: string) => void;
  onUpdateCameraCount: (installed: number, total: number) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
}

interface CameraTelemetry {
  id: string;
  name: string;
  ip: string;
  mac: string;
  vlan: number;
  port: number;
  status: 'ONLINE' | 'STANDBY' | 'NO_POWER';
  bitrate: number; // kbps
  fps: number;
  poeWattage: number; // Watts
  ping: number; // ms
  codec: string;
}

export const TechyAdminDashboard: React.FC<TechyAdminDashboardProps> = ({
  project,
  execStatus,
  onResolveBlocker,
  onUpdateCameraCount,
  onUpdateTaskStatus
}) => {
  const [selectedPort, setSelectedPort] = useState<number | null>(1);
  const [terminalFilter, setTerminalFilter] = useState<'ALL' | 'WARN' | 'INFO'>('ALL');
  const [isPinging, setIsPinging] = useState(false);
  const [pingSuccess, setPingSuccess] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    '[00:48:12] [NVR-DAEMON] RTSP stream CAM-12 established (3840x2160@30fps, 4096kbps)',
    '[00:48:10] [POE-SWITCH-G24] Port 12 802.3at power negotiation: 12.4W delivered',
    '[00:48:02] [DHCP-SRV] Assigned 192.168.20.112 to MAC 74:83:C2:59:B1:0C (CAM-12)',
    '[00:47:55] [NOC-MONITOR] Ping probe 192.168.20.101-112 latency avg: 14.2ms (0% loss)',
    '[00:47:30] [SYS-WARN] Ports 13-24: Link DOWN (Waiting on external 220V breaker connection)',
    '[00:46:15] [RAID-CONTROLLER] Array 0 (RAID-6) Verify complete: 8/8 disks SMART OK, 36.5°C'
  ]);

  // Simulated 24 Camera Nodes
  const [cameras, setCameras] = useState<CameraTelemetry[]>(() => {
    return Array.from({ length: 24 }, (_, idx) => {
      const num = idx + 1;
      const isOnline = num <= project.installedCameras;
      return {
        id: `CAM-${String(num).padStart(2, '0')}`,
        name: num <= 12 ? `Indoor Corridor #${num}` : `Exterior Perimeter #${num}`,
        ip: `192.168.20.${100 + num}`,
        mac: `74:83:C2:${String(num * 3).padStart(2, '0')}:${String(num * 7).padStart(2, '0')}:${String(num * 2).padStart(2, '0')}`,
        vlan: 20,
        port: num,
        status: isOnline ? 'ONLINE' : 'NO_POWER',
        bitrate: isOnline ? 4096 + (num % 5) * 120 : 0,
        fps: isOnline ? 30 : 0,
        poeWattage: isOnline ? 11.8 + (num % 4) * 0.4 : 0,
        ping: isOnline ? 12 + (num % 6) : 0,
        codec: 'H.265+'
      };
    });
  });

  const activeCamsCount = cameras.filter(c => c.status === 'ONLINE').length;
  const totalPowerDraw = cameras.reduce((acc, c) => acc + c.poeWattage, 0).toFixed(1);
  const totalThroughput = (cameras.reduce((acc, c) => acc + c.bitrate, 0) / 1024).toFixed(1);

  const handlePingAll = () => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
      setPingSuccess(true);
      setConsoleLogs(prev => [
        `[${new Date().toLocaleTimeString()}] [PING-SWEEP] Scanned 24 hosts on 192.168.20.0/24: 12 responded, 12 timeout`,
        ...prev
      ]);
      setTimeout(() => setPingSuccess(false), 3000);
    }, 1200);
  };

  const handleToggleCamPower = (portNum: number) => {
    setCameras(prev => prev.map(c => {
      if (c.port !== portNum) return c;
      const nextStatus = c.status === 'ONLINE' ? 'NO_POWER' : 'ONLINE';
      return {
        ...c,
        status: nextStatus,
        bitrate: nextStatus === 'ONLINE' ? 4096 : 0,
        fps: nextStatus === 'ONLINE' ? 30 : 0,
        poeWattage: nextStatus === 'ONLINE' ? 12.2 : 0,
        ping: nextStatus === 'ONLINE' ? 14 : 0
      };
    }));

    setConsoleLogs(prev => [
      `[${new Date().toLocaleTimeString()}] [USER-EXEC] Manual PoE toggle on Gigabit Port ${portNum}`,
      ...prev
    ]);
  };

  const selectedCam = cameras.find(c => c.port === selectedPort) || cameras[0];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-200 font-mono p-3 sm:p-6 space-y-5 selection:bg-cyan-500 selection:text-black">
      
      {/* 1. TOP TELEMETRY NOC BAR */}
      <div className="bg-[#0c1017] border border-cyan-950/80 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
        {/* Subtle grid lines background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a15_1px,transparent_1px),linear-gradient(to_bottom,#0f172a15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-bold uppercase tracking-widest">
                  NOC Console v4.8
                </span>
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  TELEMETRY LIVE
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-white tracking-wider mt-0.5">
                {project.name.toUpperCase()} // SYS-ID: CCTV-RMVN-01
              </h1>
            </div>
          </div>

          {/* Real-time Hardware Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase">Active Nodes</div>
              <div className="text-lg font-bold text-cyan-400 font-mono">
                {activeCamsCount} <span className="text-xs text-slate-500">/ 24</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase">PoE Load</div>
              <div className="text-lg font-bold text-amber-400 font-mono">
                {totalPowerDraw}W <span className="text-xs text-slate-500">/ 370W</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase">Network I/O</div>
              <div className="text-lg font-bold text-purple-400 font-mono">
                {totalThroughput} <span className="text-xs text-slate-500">Mbps</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase">Ping Avg</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">
                14.2ms <span className="text-xs text-slate-500">0% Loss</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. GIGABIT 24-PORT POE SWITCH MATRIX */}
      <div className="bg-[#0c1017] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white text-sm tracking-wide uppercase">
              Switch G24 Port Status (802.3at PoE+ Managed)
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> 12 Linked (PoE 1000M)
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> 12 Standby (Breaker Off)
            </span>
            <button
              onClick={handlePingAll}
              disabled={isPinging}
              className="px-3 py-1 rounded bg-cyan-950 border border-cyan-800/80 text-cyan-300 hover:bg-cyan-900/60 font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Radio className={`w-3 h-3 ${isPinging ? 'animate-spin' : ''}`} />
              <span>{isPinging ? 'Sweeping...' : pingSuccess ? 'Sweep OK!' : 'Ping Subnet'}</span>
            </button>
          </div>
        </div>

        {/* 24 Port Interactive Grid (2 rows of 12 ports like a physical switch rack) */}
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 pt-1">
          {cameras.map((cam) => {
            const isSelected = selectedPort === cam.port;
            const isOnline = cam.status === 'ONLINE';

            return (
              <div
                key={cam.port}
                onClick={() => setSelectedPort(cam.port)}
                className={`p-2 rounded-xl border transition cursor-pointer flex flex-col items-center justify-between gap-1 select-none ${
                  isSelected 
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-md ring-1 ring-cyan-400/50' 
                    : isOnline
                      ? 'border-emerald-500/40 bg-emerald-950/15 hover:border-emerald-400'
                      : 'border-slate-800 bg-slate-950/60 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between w-full text-[10px]">
                  <span className="font-bold font-mono">P{cam.port}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-500'}`} />
                </div>
                <div className="text-[11px] font-mono font-bold text-white">
                  {isOnline ? `${cam.poeWattage}W` : 'OFF'}
                </div>
                <div className="text-[9px] text-slate-400 truncate w-full text-center">
                  .{100 + cam.port}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. SELECTED PORT HARDWARE INSPECTOR + LIVE TERMINAL LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Port Node Inspector (5 Cols) */}
        <div className="lg:col-span-5 bg-[#0c1017] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-sm text-white uppercase tracking-wide">
                  Node Inspector: Port {selectedCam.port}
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                selectedCam.status === 'ONLINE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-amber-950 text-amber-300 border border-amber-700'
              }`}>
                {selectedCam.status}
              </span>
            </div>

            <div className="space-y-2.5 text-xs pt-3">
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Node Identifier:</span>
                <span className="font-bold text-white">{selectedCam.id} ({selectedCam.name})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">IPv4 Address:</span>
                <span className="font-bold text-cyan-300">{selectedCam.ip}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Hardware MAC:</span>
                <span className="font-mono text-slate-300">{selectedCam.mac}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">VLAN Isolation:</span>
                <span className="font-bold text-purple-300">VLAN {selectedCam.vlan} (Security Cameras)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Stream Telemetry:</span>
                <span className="text-emerald-300 font-bold">{selectedCam.codec} • {selectedCam.fps} FPS • {selectedCam.bitrate} kbps</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">PoE Power Draw:</span>
                <span className="text-amber-300 font-bold">{selectedCam.poeWattage} Watts (Class 4 PoE+)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">ICMP Latency:</span>
                <span className="text-emerald-400 font-bold">{selectedCam.ping > 0 ? `${selectedCam.ping} ms` : 'Unreachable (No Link)'}</span>
              </div>
            </div>
          </div>

          {/* Quick Hardware Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
            <button
              onClick={() => handleToggleCamPower(selectedCam.port)}
              className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Power className="w-3.5 h-3.5 text-amber-400" />
              <span>{selectedCam.status === 'ONLINE' ? 'Cut PoE Power' : 'Force PoE Power'}</span>
            </button>
            <button
              onClick={() => {
                setConsoleLogs(prev => [
                  `[${new Date().toLocaleTimeString()}] [RTSP-STREAM] Launched VLC RTSP stream test for rtsp://${selectedCam.ip}:554/live`,
                  ...prev
                ]);
              }}
              className="flex-1 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-xs font-bold text-cyan-300 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>Test RTSP Feed</span>
            </button>
          </div>
        </div>

        {/* Real-time System Terminal (7 Cols) */}
        <div className="lg:col-span-7 bg-[#07090e] border border-cyan-950 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-xs text-white uppercase tracking-wider">
                syslog://nvr-server.internal (Live Stream)
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px]">
              {(['ALL', 'WARN', 'INFO'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setTerminalFilter(f)}
                  className={`px-2 py-0.5 rounded border transition ${
                    terminalFilter === f ? 'bg-cyan-950 border-cyan-600 text-cyan-300 font-bold' : 'border-slate-800 text-slate-500'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Terminal Console Box */}
          <div className="bg-black/60 rounded-xl p-3 border border-slate-900 text-[11px] font-mono space-y-1.5 h-56 overflow-y-auto leading-relaxed">
            {consoleLogs.map((log, idx) => {
              const isWarn = log.includes('SYS-WARN') || log.includes('timeout');
              return (
                <div key={idx} className={isWarn ? 'text-amber-400' : 'text-slate-300'}>
                  <span className="text-slate-600">{log.substring(0, 10)}</span>
                  <span className={isWarn ? 'text-rose-400 font-bold' : 'text-cyan-400'}>
                    {log.substring(10, 26)}
                  </span>
                  <span>{log.substring(26)}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
            <span>Daemon PID: 4182 • Mem: 342MB • CPU: 4.8%</span>
            <span className="text-emerald-400 font-bold">● DAEMON OK</span>
          </div>
        </div>

      </div>

      {/* 4. NVR STORAGE RAID6 ARRAY & TECHNICAL BLOCKERS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* NVR RAID Diagnostics (6 Cols) */}
        <div className="lg:col-span-6 bg-[#0c1017] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-sm text-white uppercase tracking-wide">
                NVR Storage Subsystem (RAID-6)
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-700">
              SMART: 100% HEALTHY
            </span>
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Array Capacity (8x 8TB Seagate SkyHawk AI):</span>
                <span className="text-white font-bold font-mono">18.2 TB / 48.0 TB Usable</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full border border-slate-800 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full rounded-full" style={{ width: '38%' }} />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-900">
                <div className="text-[10px] text-slate-500">Disks</div>
                <div className="font-bold text-emerald-400 font-mono">8 / 8 Online</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-900">
                <div className="text-[10px] text-slate-500">Array Temp</div>
                <div className="font-bold text-cyan-400 font-mono">36.5°C</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-900">
                <div className="text-[10px] text-slate-500">Retention</div>
                <div className="font-bold text-purple-400 font-mono">30 Days</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-900">
                <div className="text-[10px] text-slate-500">Bitrate Cap</div>
                <div className="font-bold text-amber-400 font-mono">98.3 Mbps</div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Blocker & Resolution Hub (6 Cols) */}
        <div className="lg:col-span-6 bg-[#0c1017] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span className="font-bold text-sm text-white uppercase tracking-wide">
                Hardware Blocker Escalations ({project.blockers.filter(b => !b.resolved).length})
              </span>
            </div>
            <span className="text-[10px] text-rose-400 font-mono font-bold bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">
              CRITICAL PATH
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            {project.blockers.map((b) => (
              <div key={b.id} className="p-3 rounded-xl bg-slate-950/80 border border-rose-950/80 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-rose-300 text-xs">
                    [HARDWARE_FAULT] {b.description}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Unblock: {b.unblockAction}
                  </div>
                </div>

                {!b.resolved ? (
                  <button
                    onClick={() => onResolveBlocker(b.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition cursor-pointer shrink-0 shadow-xs"
                  >
                    Force Resolve
                  </button>
                ) : (
                  <span className="text-emerald-400 font-bold text-xs">✔ Cleared</span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
