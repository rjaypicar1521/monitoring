import { CCTVProject, CameraEndpoint, TechnicianMember } from '../types';

const STORAGE_KEY = 'cctv_monitoring_projects_v3';

export const DEFAULT_CAMERAS: CameraEndpoint[] = [
  { id: 'CAM-01', name: 'Cashier Dome Camera', zone: 'Ground Floor - Cashier', lens: '2.8mm Wide Angle Dome', ip: '192.168.1.101', port: 'Port 1', status: 'Mounted' },
  { id: 'CAM-02', name: 'Front Desk Reception Camera', zone: 'Ground Floor - Reception & Lobby', lens: '4.0mm Standard Dome', ip: '192.168.1.102', port: 'Port 2', status: 'Mounted' },
  { id: 'CAM-03', name: 'Backdoor Entrance Camera', zone: 'Perimeter - Service & Backdoor', lens: '3.6mm Outdoor Bullet', ip: '192.168.1.103', port: 'Port 3', status: 'Mounted' },
  { id: 'CAM-04', name: 'Entrance Door Camera', zone: 'Perimeter - Main Entrance Double Doors', lens: '4.0mm Outdoor Bullet', ip: '192.168.1.104', port: 'Port 4', status: 'Pending Power' }
];

export const DEFAULT_TECHNICIANS: TechnicianMember[] = [
  { id: 'tech-1', name: 'Rjay Picar', role: 'Lead Systems Architect & Installer (RMVN)', status: 'On Site', assigned: 'NVR & Camera Alignment', email: 'rjay@rmvn.com' },
  { id: 'tech-2', name: 'Starnook', role: 'Site Operations & Field Coordinator (RMVN)', status: 'On Site', assigned: 'Entrance Door & AP Relocation', email: 'starnook@rmvn.com' },
  { id: 'tech-3', name: 'Engr. David Santos', role: 'Building Electrician & Power Specialist', status: 'On Site', assigned: 'Entrance Junction Box Power', email: 'electrician@upc.org' },
  { id: 'tech-4', name: 'Elena Rostova', role: 'Network Telemetry & PoE Engineer', status: 'Remote', assigned: 'PoE Injectors & VLAN Switch', email: 'elena.r@rmvn.com' },
  { id: 'tech-5', name: 'UPC Administration', role: 'Client Facility Sponsor', status: 'On Site', assigned: 'Project Turnover & Access', email: 'admin@upcphilippines.org' }
];

export const INITIAL_PROJECTS: CCTVProject[] = [
  {
    id: 'proj-cctv-upc',
    name: 'United Pentecostal Church Philippines Inc. — Headquarters',
    organization: 'RMVN SOLUTIONS - NETWORK & SYSTEMS ARCHITECTS',
    preparedBy: 'Rjay Picar - RMVN & Starnook',
    goal: 'CCTV Installation Progress & Success Update: 3 areas installed & working, 1 rough-in underway, 1 AP relocation pending.',
    location: 'United Pentecostal Church Philippines Inc. — Headquarters',
    startDate: '2026-09-01',
    targetLaunchDate: '2026-09-08',
    teamLead: 'Rjay Picar - RMVN',
    updateCadence: 'Daily',
    audience: 'Client',
    totalCameras: 4,
    installedCameras: 3,
    overallCompletion: 80,
    tasks: [
      {
        id: 't-upc-1',
        title: 'Cashier — Dome camera aligned, tested, and working',
        category: 'Camera Mounting',
        status: 'Done',
        owner: 'Rjay Picar',
        area: 'Cashier',
        progressPercent: 100,
        verifiedStatus: 'Installed, tested, and working',
        completedDate: '2026-09-03',
        photoEvidence: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80',
        photoCaption: 'Cashier 100% — Dome camera aligned & feed verified on CCTV monitor'
      },
      {
        id: 't-upc-2',
        title: 'Front Desk — Camera above reception installed, tested, and working',
        category: 'Camera Mounting',
        status: 'Done',
        owner: 'Rjay Picar',
        area: 'Front Desk',
        progressPercent: 100,
        verifiedStatus: 'Installed, tested, and working',
        completedDate: '2026-09-03',
        photoEvidence: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
        photoCaption: 'Front Desk 100% — Camera above reception signage aligned'
      },
      {
        id: 't-upc-3',
        title: 'Backdoor Entrance — Camera installed and mounted',
        category: 'Camera Mounting',
        status: 'Done',
        owner: 'Rjay Picar',
        area: 'Backdoor Entrance',
        progressPercent: 100,
        verifiedStatus: 'Installed and mounted — completed',
        completedDate: '2026-09-04',
        photoEvidence: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80',
        photoCaption: 'Backdoor 100% — Camera mounted at door'
      },
      {
        id: 't-upc-4',
        title: 'Entrance Door — Junction box installed & electrical line rough-in',
        category: 'Network & Cabling',
        status: 'In progress',
        owner: 'Starnook',
        area: 'Entrance Door',
        progressPercent: 50,
        verifiedStatus: 'Junction box installed — electrical rough-in ongoing',
        targetDate: '2026-09-06',
        blockerReason: 'Waiting on electrical line energisation to entrance door junction box before camera mounting.',
        photoEvidence: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
        photoCaption: 'Entrance Door 50% — Junction box mounted above entrance door; electrical line installation in progress'
      },
      {
        id: 't-upc-5',
        title: 'Access Point Relocation — Move AP to existing CCTV LAN cable',
        category: 'Network & Cabling',
        status: 'Not started',
        owner: 'Starnook',
        area: 'Access Point Relocation',
        progressPercent: 0,
        verifiedStatus: 'Move AP to the existing CCTV LAN cable',
        targetDate: '2026-09-07'
      },
      {
        id: 't-upc-6',
        title: 'System Verification — Live Monitoring Confirmation on NVR Display',
        category: 'Testing & Commissioning',
        status: 'In progress',
        owner: 'Rjay Picar',
        area: 'NVR Display & Central Monitor',
        progressPercent: 75,
        verifiedStatus: 'Camera feeds confirmed live (Cashier and Front Desk verified)',
        targetDate: '2026-09-05',
        photoEvidence: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=800&q=80',
        photoCaption: 'Live Monitoring Confirmation — Cashier and Front Desk feeds confirmed live on CCTV monitor'
      }
    ],
    risks: [
      {
        id: 'r-upc-1',
        description: 'Entrance Door electrical line rough-in delay may postpone final camera alignment & turnover.',
        impact: 'med',
        likelihood: 'low',
        signal: 'Junction box mounted; power connection awaiting electrician hookup.',
        mitigation: 'Coordinate directly with UPC facility manager for electrician priority.',
        owner: 'Starnook',
        dueDate: '2026-09-06'
      }
    ],
    blockers: [
      {
        id: 'b-upc-1',
        description: 'Waiting on electrical line energisation to entrance door junction box to complete camera mounting & alignment.',
        owner: 'Starnook / Building Electrician',
        since: '2026-09-03',
        unblockAction: 'Complete electrical line to entrance door junction box and energise power.',
        resolved: false
      }
    ],
    decisions: [
      {
        id: 'd-upc-1',
        decision: 'Confirmed live feeds for Cashier & Front Desk; Backdoor camera queued next for monitor verification.',
        date: '2026-09-03',
        decisionMaker: 'Rjay Picar (RMVN) & UPC Administration',
        whatChanged: 'Verified clear wide-angle coverage over cashier and front desk reception counter.'
      }
    ],
    cameras: DEFAULT_CAMERAS,
    technicians: DEFAULT_TECHNICIANS,
    notes: [
      {
        id: 'note-1',
        author: 'Rjay Picar - RMVN',
        authorRole: 'installer',
        content: 'Camera feeds confirmed live on CCTV monitor for Cashier and Front Desk. Backdoor Entrance camera is installed and mounted and is next for monitor verification.',
        createdAt: 'Sep 3, 4:30 PM'
      },
      {
        id: 'note-2',
        author: 'United Pentecostal Church Philippines Inc.',
        authorRole: 'client',
        content: 'Report received. Please ensure the Access Point PoE injectors are clearly traced and labeled before relocation to prevent network downtime.',
        createdAt: 'Sep 4, 9:15 AM'
      }
    ]
  },
  {
    id: 'proj-cctv-1',
    name: 'Metro Logistics Hub - 64 IP Camera Deployment',
    goal: 'Deploy perimeter & warehouse surveillance system with AI motion detection before facility audit.',
    location: 'Building B & Warehouse Yards, Sector 4',
    startDate: '2026-08-15',
    targetLaunchDate: '2026-09-30',
    teamLead: 'Marcus Vance (Lead Tech)',
    updateCadence: 'Weekly',
    audience: 'Exec',
    totalCameras: 64,
    installedCameras: 42,
    tasks: [
      {
        id: 't-101',
        title: 'Site survey & blind-spot CAD mapping',
        category: 'Site Survey',
        status: 'Done',
        owner: 'Marcus Vance',
        completedDate: '2026-08-20'
      },
      {
        id: 't-102',
        title: 'Core Cat6 cabling & PoE switch deployment (Racks 1-3)',
        category: 'Network & Cabling',
        status: 'Done',
        owner: 'Alex Kim',
        completedDate: '2026-08-28'
      },
      {
        id: 't-103',
        title: 'Mounting & aiming 42 interior dome cameras',
        category: 'Camera Mounting',
        status: 'Done',
        owner: 'Alex Kim',
        completedDate: '2026-09-01'
      },
      {
        id: 't-104',
        title: 'Mounting 22 perimeter PTZ cameras with weather-rated conduit',
        category: 'Camera Mounting',
        status: 'In progress',
        owner: 'Dave Miller',
        targetDate: '2026-09-12'
      },
      {
        id: 't-105',
        title: '64-Channel NVR RAID6 array configuration & storage testing',
        category: 'NVR & Server Setup',
        status: 'In progress',
        owner: 'Elena Rostova',
        targetDate: '2026-09-15'
      },
      {
        id: 't-106',
        title: 'Optical fiber uplink to Guardhouse Sub-station',
        category: 'Network & Cabling',
        status: 'Blocked',
        owner: 'Dave Miller',
        blockerReason: 'Awaiting trenching permit sign-off from Municipal Dept of Public Works.'
      },
      {
        id: 't-107',
        title: 'VMS video analytics fine-tuning & license activation',
        category: 'Testing & Commissioning',
        status: 'Not started',
        owner: 'Elena Rostova',
        targetDate: '2026-09-22'
      },
      {
        id: 't-108',
        title: 'Security team operator training & handover sign-off',
        category: 'Client Handover',
        status: 'Not started',
        owner: 'Marcus Vance',
        targetDate: '2026-09-29'
      }
    ],
    risks: [
      {
        id: 'r-1',
        description: 'Trenching delay could push fiber link installation past target launch date.',
        impact: 'high',
        likelihood: 'med',
        signal: 'Municipal permit pending 10 business days past estimated turnaround.',
        mitigation: 'Escalate to client liaison for expedited city permit review; prep wireless backup bridge.',
        owner: 'Dave Miller',
        dueDate: '2026-09-08'
      },
      {
        id: 'r-2',
        description: 'Perimeter PTZ high-wind vibration affecting AI object recognition.',
        impact: 'med',
        likelihood: 'low',
        signal: 'Initial test showed 1.5° pole sway in 35 knot gusts.',
        mitigation: 'Install dual strut reinforcement collars on 4 corner poles.',
        owner: 'Alex Kim',
        dueDate: '2026-09-14'
      }
    ],
    blockers: [
      {
        id: 'b-1',
        description: 'Municipal trenching permit for guardhouse fiber crossing.',
        owner: 'Dave Miller',
        since: '2026-08-27',
        unblockAction: 'Requires client facility sponsor to contact municipal inspector directly.',
        resolved: false
      }
    ],
    decisions: [
      {
        id: 'd-1',
        decision: 'Upgraded NVR storage from 30-day to 60-day retention with H.265+ smart codec.',
        date: '2026-08-22',
        decisionMaker: 'Facility Director + Marcus Vance',
        whatChanged: 'Added 4x 16TB enterprise surveillance HDDs to procurement order.'
      }
    ]
  },
  {
    id: 'proj-cctv-2',
    name: 'Downtown Commercial Plaza - Access & CCTV Integration',
    goal: 'Upgrade 32 aging analog cameras to 4K IP with facial recognition door interlocks.',
    location: 'Retail Arcade & Underground Parking',
    startDate: '2026-09-01',
    targetLaunchDate: '2026-10-15',
    teamLead: 'Sarah Chen (Senior Integrator)',
    updateCadence: 'Weekly',
    audience: 'Client',
    totalCameras: 32,
    installedCameras: 8,
    tasks: [
      {
        id: 't-201',
        title: 'Decommissioning and safe removal of legacy coax cables',
        category: 'Site Survey',
        status: 'Done',
        owner: 'Sarah Chen',
        completedDate: '2026-09-02'
      },
      {
        id: 't-202',
        title: 'Pulling plenum-rated Cat6A through underground conduits',
        category: 'Network & Cabling',
        status: 'In progress',
        owner: 'Tom Briggs',
        targetDate: '2026-09-10'
      },
      {
        id: 't-203',
        title: 'Installing vandal-proof dome cameras in parking decks P1 & P2',
        category: 'Camera Mounting',
        status: 'In progress',
        owner: 'Tom Briggs',
        targetDate: '2026-09-18'
      },
      {
        id: 't-204',
        title: 'Access control Wiegand/OSDP integration with main security gateway',
        category: 'Testing & Commissioning',
        status: 'Not started',
        owner: 'Sarah Chen',
        targetDate: '2026-10-02'
      }
    ],
    risks: [
      {
        id: 'r-201',
        description: 'Underground conduit moisture ingress may degrade unshielded patch runs.',
        impact: 'med',
        likelihood: 'med',
        signal: 'P2 sump pump minor overflow noted during inspection.',
        mitigation: 'Use outdoor-rated gel-filled CMX cable for lower basement runs.',
        owner: 'Tom Briggs',
        dueDate: '2026-09-07'
      }
    ],
    blockers: [],
    decisions: []
  }
];

export function loadProjects(): CCTVProject[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        const missingInitial = INITIAL_PROJECTS.filter(ip => !parsed.some((p: CCTVProject) => p.id === ip.id));
        const combined = [...missingInitial, ...parsed].map((p: CCTVProject) => ({
          ...p,
          cameras: p.cameras && p.cameras.length > 0 ? p.cameras : DEFAULT_CAMERAS,
          technicians: p.technicians && p.technicians.length > 0 ? p.technicians : DEFAULT_TECHNICIANS
        }));
        return combined;
      }
    }
  } catch (err) {
    console.error('Failed to load projects from localStorage:', err);
  }
  return INITIAL_PROJECTS.map(p => ({
    ...p,
    cameras: p.cameras || DEFAULT_CAMERAS,
    technicians: p.technicians || DEFAULT_TECHNICIANS
  }));
}

export function saveProjects(projects: CCTVProject[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save projects to localStorage:', err);
  }
}
