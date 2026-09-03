import { CCTVProject, CameraEndpoint, TechnicianMember } from '../types';

const STORAGE_KEY = 'cctv_monitoring_projects_v1';

export const DEFAULT_CAMERAS: CameraEndpoint[] = [
  { id: 'CAM-01', name: 'Main Lobby Entrance', zone: 'Floor 1', lens: '2.8mm Wide Angle', ip: '192.168.20.101', port: 'Port 1', status: 'Mounted' },
  { id: 'CAM-02', name: 'Reception Desk & Counter', zone: 'Floor 1', lens: '4.0mm Standard', ip: '192.168.20.102', port: 'Port 2', status: 'Mounted' },
  { id: 'CAM-03', name: 'North Hallway A (Offices)', zone: 'Floor 1', lens: '2.8mm Wide Angle', ip: '192.168.20.103', port: 'Port 3', status: 'Mounted' },
  { id: 'CAM-04', name: 'South Hallway B (Restrooms)', zone: 'Floor 1', lens: '2.8mm Wide Angle', ip: '192.168.20.104', port: 'Port 4', status: 'Mounted' },
  { id: 'CAM-05', name: 'Elevator Bank 1', zone: 'Floor 1', lens: '2.8mm Wide Angle', ip: '192.168.20.105', port: 'Port 5', status: 'Mounted' },
  { id: 'CAM-06', name: 'Emergency Exit Stairwell A', zone: 'Floor 1', lens: '2.8mm Wide Angle', ip: '192.168.20.106', port: 'Port 6', status: 'Mounted' },
  { id: 'CAM-07', name: '2nd Floor West Corridor', zone: 'Floor 2', lens: '2.8mm Wide Angle', ip: '192.168.20.107', port: 'Port 7', status: 'Mounted' },
  { id: 'CAM-08', name: '2nd Floor East Corridor', zone: 'Floor 2', lens: '2.8mm Wide Angle', ip: '192.168.20.108', port: 'Port 8', status: 'Mounted' },
  { id: 'CAM-09', name: 'Staff Breakroom & Kitchen', zone: 'Floor 2', lens: '2.8mm Wide Angle', ip: '192.168.20.109', port: 'Port 9', status: 'Mounted' },
  { id: 'CAM-10', name: 'Conference Room 201', zone: 'Floor 2', lens: '4.0mm Standard', ip: '192.168.20.110', port: 'Port 10', status: 'Mounted' },
  { id: 'CAM-11', name: 'Server & IT Telecom Closet', zone: 'Basement', lens: '4.0mm Standard', ip: '192.168.20.111', port: 'Port 11', status: 'Mounted' },
  { id: 'CAM-12', name: 'Loading Dock Interior Bay', zone: 'Ground', lens: '6.0mm Telephoto', ip: '192.168.20.112', port: 'Port 12', status: 'Mounted' },
  { id: 'CAM-13', name: 'Main Parking Lot North Gate', zone: 'Exterior', lens: '6.0mm Telephoto', ip: '192.168.20.113', port: 'Port 13', status: 'Pending Power' },
  { id: 'CAM-14', name: 'Main Parking Lot South Gate', zone: 'Exterior', lens: '6.0mm Telephoto', ip: '192.168.20.114', port: 'Port 14', status: 'Pending Power' },
  { id: 'CAM-15', name: 'Building East Perimeter Alley', zone: 'Exterior', lens: '4.0mm Standard', ip: '192.168.20.115', port: 'Port 15', status: 'Pending Power' },
  { id: 'CAM-16', name: 'Building West Perimeter Wall', zone: 'Exterior', lens: '4.0mm Standard', ip: '192.168.20.116', port: 'Port 16', status: 'Pending Power' },
  { id: 'CAM-17', name: 'Rear Delivery Ramp', zone: 'Exterior', lens: '6.0mm Telephoto', ip: '192.168.20.117', port: 'Port 17', status: 'Pending Power' },
  { id: 'CAM-18', name: 'Visitor Entry Barrier Gate', zone: 'Exterior', lens: '4.0mm Standard', ip: '192.168.20.118', port: 'Port 18', status: 'Pending Power' },
  { id: 'CAM-19', name: 'Waste Disposal Enclosure', zone: 'Exterior', lens: '2.8mm Wide Angle', ip: '192.168.20.119', port: 'Port 19', status: 'Pending Power' },
  { id: 'CAM-20', name: 'Rooftop HVAC & Solar Array', zone: 'Rooftop', lens: '4.0mm Standard', ip: '192.168.20.120', port: 'Port 20', status: 'Pending Power' },
  { id: 'CAM-21', name: 'Basement Mechanical Room', zone: 'Basement', lens: '2.8mm Wide Angle', ip: '192.168.20.121', port: 'Port 21', status: 'Pending Power' },
  { id: 'CAM-22', name: 'Courtyard Seating Area', zone: 'Exterior', lens: '2.8mm Wide Angle', ip: '192.168.20.122', port: 'Port 22', status: 'Pending Power' },
  { id: 'CAM-23', name: 'Emergency Exit Corridor East', zone: 'Floor 1', lens: '2.8mm Wide Angle', ip: '192.168.20.123', port: 'Port 23', status: 'Pending Power' },
  { id: 'CAM-24', name: 'Executive Suite Entry', zone: 'Floor 2', lens: '4.0mm Standard', ip: '192.168.20.124', port: 'Port 24', status: 'Pending Power' }
];

export const DEFAULT_TECHNICIANS: TechnicianMember[] = [
  { id: 'tech-1', name: 'Marcus Vance', role: 'Lead CCTV Technician & Admin', status: 'On Site', assigned: 'NVR & Server Rack', email: 'marcus@rmvn.com' },
  { id: 'tech-2', name: 'Alex Kim', role: 'Field Electrician & Cabling Specialist', status: 'On Site', assigned: 'Exterior Breaker Hookup', email: 'alex.k@rmvn.com' },
  { id: 'tech-3', name: 'Dave Miller', role: 'Mounting & Angle Calibration Tech', status: 'On Site', assigned: 'Hallway Cams 01–12', email: 'dave.m@rmvn.com' },
  { id: 'tech-4', name: 'Elena Rostova', role: 'Network Telemetry & PoE Engineer', status: 'Remote', assigned: 'Switch Config & VLAN 20', email: 'elena.r@rmvn.com' },
  { id: 'tech-5', name: 'Alex Morgan', role: 'Client Facility Sponsor', status: 'Remote', assigned: 'Decisions & Access Badges', email: 'alex.morgan@client.org' }
];

export const INITIAL_PROJECTS: CCTVProject[] = [
  {
    id: 'proj-cctv-rmvn',
    name: 'RMVN Project - CCTV Installation',
    goal: 'Install complete security camera coverage with clear picture and 60 days of saved recording history.',
    location: 'RMVN Main Facility & Grounds',
    startDate: '2026-08-25',
    targetLaunchDate: '2026-09-25',
    teamLead: 'Marcus & Alex (Lead Techs)',
    updateCadence: 'Weekly',
    audience: 'Client',
    totalCameras: 24,
    installedCameras: 12,
    tasks: [
      {
        id: 't-rmvn-1',
        title: 'Walkthrough of building to confirm best camera spots',
        category: 'Site Survey',
        status: 'Done',
        owner: 'Project Lead',
        completedDate: '2026-08-28'
      },
      {
        id: 't-rmvn-2',
        title: 'Run neat wiring through main hallways and ceilings',
        category: 'Network & Cabling',
        status: 'Done',
        owner: 'Field Tech',
        completedDate: '2026-09-01'
      },
      {
        id: 't-rmvn-3',
        title: 'Mount and aim first 12 indoor cameras',
        category: 'Camera Mounting',
        status: 'Done',
        owner: 'Lead Installer',
        completedDate: '2026-09-02'
      },
      {
        id: 't-rmvn-4',
        title: 'Mount remaining 12 cameras indoors and outside',
        category: 'Camera Mounting',
        status: 'In progress',
        owner: 'Lead Installer',
        targetDate: '2026-09-08'
      },
      {
        id: 't-rmvn-5',
        title: 'Connect electrical power for outside cameras',
        category: 'Network & Cabling',
        status: 'Blocked',
        owner: 'Site Coordinator',
        blockerReason: 'Waiting on building electrician to approve outside power connection.'
      },
      {
        id: 't-rmvn-6',
        title: 'Set up central video recording box and hard drives',
        category: 'NVR & Server Setup',
        status: 'In progress',
        owner: 'Equipment Lead',
        targetDate: '2026-09-09'
      },
      {
        id: 't-rmvn-7',
        title: 'Test video screen and signal on all installed cameras',
        category: 'Testing & Commissioning',
        status: 'Not started',
        owner: 'Field Tech',
        targetDate: '2026-09-12'
      },
      {
        id: 't-rmvn-8',
        title: 'Adjust viewing angles and train your staff on the app',
        category: 'Client Handover',
        status: 'Not started',
        owner: 'Project Lead',
        targetDate: '2026-09-15'
      }
    ],
    risks: [
      {
        id: 'r-rmvn-1',
        description: 'Outside power hookup delay could push final testing back a few days.',
        impact: 'med',
        likelihood: 'med',
        signal: 'Waiting on building maintenance to schedule the electrician.',
        mitigation: 'Coordinate directly with facility manager for priority electrician visit.',
        owner: 'Site Coordinator',
        dueDate: '2026-09-07'
      }
    ],
    blockers: [
      {
        id: 'b-rmvn-1',
        description: 'Waiting on building electrician for outside power hookup.',
        owner: 'Site Coordinator',
        since: '2026-09-01',
        unblockAction: 'Building electrician sign-off needed to connect power.',
        resolved: false
      },
      {
        id: 'b-rmvn-2',
        description: 'Security entry badges needed for two team members.',
        owner: 'Lead Installer',
        since: '2026-09-02',
        unblockAction: 'Security office badge approval needed.',
        resolved: false
      }
    ],
    decisions: [
      {
        id: 'd-rmvn-1',
        decision: 'Chose 60 days of saved video recordings instead of 30 days.',
        date: '2026-08-30',
        decisionMaker: 'Project Sponsor & Lead Tech',
        whatChanged: 'Added larger storage hard drives to recording box.'
      }
    ],
    cameras: DEFAULT_CAMERAS,
    technicians: DEFAULT_TECHNICIANS,
    notes: [
      {
        id: 'note-1',
        author: 'Sarah Chen (Client Sponsor)',
        authorRole: 'client',
        content: 'Please ensure camera #4 is angled towards the visitor parking gates for optimal vehicle coverage.',
        createdAt: 'Sep 2, 2:15 PM'
      },
      {
        id: 'note-2',
        author: 'Dave Miller (Lead Installer)',
        authorRole: 'installer',
        content: 'Confirmed. Bracket readjusted on Zone 1 and field of view validated on live test monitor.',
        createdAt: 'Sep 3, 10:40 AM'
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
