import { CCTVProject, CameraEndpoint, TechnicianMember } from '../types';

export const STORAGE_KEY = 'cctv_monitoring_projects_v9';

export const DEFAULT_CAMERAS: CameraEndpoint[] = [
  { id: 'CAM-01', name: 'Cashier Dome Camera', zone: 'Ground Floor - Cashier Counter', lens: '2.8mm Wide Angle Dome', ip: '192.168.20.101', port: 'Port 1', status: 'Mounted', scope: 'existing' },
  { id: 'CAM-02', name: 'Front Desk Reception Camera', zone: 'Ground Floor - Reception Lobby', lens: '2.8mm Wide Angle Dome', ip: '192.168.20.102', port: 'Port 2', status: 'Mounted', scope: 'existing' },
  { id: 'CAM-03', name: 'Main Entrance Bullet Camera', zone: 'Perimeter - Main Entrance', lens: '4.0mm Standard Bullet', ip: '192.168.20.103', port: 'Port 3', status: 'Mounted', scope: 'existing' },
  { id: 'CAM-04', name: 'North Corridor PTZ Camera', zone: 'Ground Floor - North Corridor', lens: '4.0mm Varifocal Turret', ip: '192.168.20.104', port: 'Port 4', status: 'Mounted', scope: 'existing' },
  { id: 'CAM-05', name: 'South Corridor Turret Camera', zone: 'Ground Floor - South Corridor', lens: '2.8mm Wide Angle Dome', ip: '192.168.20.105', port: 'Port 5', status: 'Mounted', scope: 'existing' },
  { id: 'CAM-06', name: 'Perimeter East Fence Camera', zone: 'Perimeter - East Boundary', lens: '6.0mm Long Range Bullet', ip: '192.168.20.106', port: 'Port 6', status: 'Mounted', scope: 'existing' },
  { id: 'CAM-07', name: 'Perimeter West Fence Camera', zone: 'Perimeter - West Boundary', lens: '6.0mm Long Range Bullet', ip: '192.168.20.107', port: 'Port 7', status: 'Mounted', scope: 'existing' },
  { id: 'CAM-08', name: 'Warehouse Main Bay Camera', zone: 'Logistics - Warehouse Bay', lens: '4.0mm High-Ceiling Turret', ip: '192.168.20.108', port: 'Port 8', status: 'Mounted', scope: 'existing' },
  { id: 'CAM-09', name: 'Warehouse Loading Dock Camera', zone: 'Logistics - Loading Dock', lens: '4.0mm Outdoor Bullet', ip: '192.168.20.109', port: 'Port 9', status: 'Mounted', scope: 'existing' },
  { id: 'CAM-10', name: 'Executive Parking Camera', zone: 'Outdoor - Parking Lot A', lens: '6.0mm Long Range Bullet', ip: '192.168.20.110', port: 'Port 10', status: 'Mounted', scope: 'existing' },
  { id: 'CAM-11', name: 'Visitor Parking Camera', zone: 'Outdoor - Parking Lot B', lens: '6.0mm Long Range Bullet', ip: '192.168.20.111', port: 'Port 11', status: 'Mounted', scope: 'existing' },
  { id: 'CAM-12', name: 'Central Server Room Camera', zone: 'Critical Facility - Server Room', lens: '2.8mm Low-Distortion Dome', ip: '192.168.20.112', port: 'Port 12', status: 'Mounted', scope: 'existing' },
  { id: 'CAM-13', name: 'Backdoor Service Entrance Camera', zone: 'Perimeter - Backdoor', lens: '2.8mm Wide Angle Dome', ip: '192.168.20.113', port: 'Port 13', status: 'Mounted', scope: 'existing' },
  { id: 'CAM-14', name: 'North Emergency Stairwell Camera', zone: 'Internal - North Stairwell', lens: '2.8mm Wide Angle Dome', ip: '192.168.20.114', port: 'Port 14', status: 'Mounted', scope: 'existing' },
  { id: 'CAM-15', name: 'South Emergency Stairwell Camera', zone: 'Internal - South Stairwell', lens: '2.8mm Wide Angle Dome', ip: '192.168.20.115', port: 'Port 15', status: 'Mounted', scope: 'existing' },
  { id: 'CAM-16', name: 'Staff Lounge & Canteen Camera', zone: 'Level 2 - Staff Commons', lens: '4.0mm Standard Dome', ip: '192.168.20.116', port: 'Port 16', status: 'Mounted', scope: 'existing' },
  { id: 'CAM-17', name: 'Telecom & Electrical Room Camera', zone: 'Utility - Telecom Closet', lens: '2.8mm Low-Distortion Dome', ip: '192.168.20.117', port: 'Port 17', status: 'Mounted', scope: 'existing' },
  { id: 'CAM-18', name: 'Rooftop HVAC & Mechanical Yard Camera', zone: 'Rooftop - Mechanical Yard', lens: '6.0mm Weatherproof Bullet', ip: '192.168.20.118', port: 'Port 18', status: 'Mounted', scope: 'existing' }
];

export const DEFAULT_TECHNICIANS: TechnicianMember[] = [
  { 
    id: 'tech-1', 
    name: 'Rjay Picar', 
    role: 'Lead Systems & CCTV Architect (RMVN Solutions)', 
    status: 'On Site', 
    isTimedIn: true, 
    assigned: 'CCTV Architecture & Live Monitoring', 
    email: 'rjay@rmvn.com', 
    assignedCameras: [
      'CAM-01', 'CAM-02', 'CAM-03', 'CAM-04', 'CAM-05', 'CAM-06', 
      'CAM-07', 'CAM-08', 'CAM-09', 'CAM-10', 'CAM-11', 'CAM-12', 
      'CAM-13', 'CAM-14', 'CAM-15', 'CAM-16', 'CAM-17', 'CAM-18'
    ], 
    zone: 'Full Facility Fleet (All 18 Zones)' 
  },
  { 
    id: 'tech-2', 
    name: 'UPCHQ', 
    role: 'Client Facility Sponsor & Decision Maker', 
    status: 'On Site', 
    assigned: 'Site Access & Monitoring Oversight', 
    email: 'admin@upchq.org', 
    assignedCameras: ['CAM-01', 'CAM-02', 'CAM-03', 'CAM-10', 'CAM-12', 'CAM-13'], 
    zone: 'Reception, Cashier & High-Security Zones' 
  }
];

export const INITIAL_PROJECTS: CCTVProject[] = [
  {
    id: 'proj-cctv-upc',
    name: 'UPCHQ - CCTV Installation & Monitoring',
    organization: 'RMVN SOLUTIONS - NETWORK & SYSTEMS ARCHITECTS',
    preparedBy: 'Rjay Picar - RMVN',
    goal: 'Project Achievement Report: Full CCTV Fleet Deployment & Operational Monitoring Update (18 operational cameras verified live on NVR monitor and streaming telemetry console).',
    location: 'UPCHQ - Headquarters',
    startDate: '2026-09-01',
    targetLaunchDate: '2026-09-10',
    teamLead: 'Rjay Picar - RMVN',
    updateCadence: 'Daily',
    audience: 'Client',
    totalCameras: 18,
    installedCameras: 18,
    overallCompletion: 100,
    tasks: [
      {
        id: 't-upc-1',
        title: 'Cashier - Dome camera installed, aligned, and working',
        category: 'Camera Mounting',
        status: 'Done',
        owner: 'Rjay Picar',
        area: 'Cashier',
        progressPercent: 100,
        verifiedStatus: 'Installed, tested, and working',
        completedDate: '2026-09-03',
        photoEvidence: '/evidence/image1.jpg',
        photoCaption: 'Cashier 100% - Dome camera installed and aligned; feed verified on CCTV monitor'
      },
      {
        id: 't-upc-2',
        title: 'Front Desk - Camera installed above reception, tested, and working',
        category: 'Camera Mounting',
        status: 'Done',
        owner: 'Rjay Picar',
        area: 'Front Desk',
        progressPercent: 100,
        verifiedStatus: 'Installed, tested, and working',
        completedDate: '2026-09-03',
        photoEvidence: '/evidence/image2.jpg',
        photoCaption: 'Front Desk 100% - Camera installed above reception; feed verified on CCTV monitor'
      },
      {
        id: 't-upc-3',
        title: 'System Verification - Live Monitoring Confirmation on NVR Display',
        category: 'Testing & Commissioning',
        status: 'Done',
        owner: 'Rjay Picar',
        area: 'NVR Display & Central Monitor',
        progressPercent: 100,
        verifiedStatus: 'Cashier & Front Desk camera feeds confirmed live on CCTV monitor',
        completedDate: '2026-09-03',
        photoEvidence: '/evidence/image3.jpg',
        photoCaption: 'NVR display, 03 September 2026 - Cashier and Front Desk cameras confirmed working on CCTV monitor'
      },
      {
        id: 't-upc-4',
        title: 'Backdoor Entrance - Camera mounting & testing',
        category: 'Camera Mounting',
        status: 'Done',
        owner: 'Rjay Picar',
        area: 'Backdoor Entrance',
        progressPercent: 100,
        verifiedStatus: 'Temporary sleeping area vacated; camera mounted, focused, and stream live',
        completedDate: '2026-09-05',
        photoEvidence: '/evidence/image4.jpg',
        photoCaption: 'Backdoor Site Condition - Cable terminated, camera mounted and aligned; feed verified on CCTV monitor'
      },
      {
        id: 't-upc-5',
        title: 'Entrance Door - Camera installation, alignment, testing, and monitor verification',
        category: 'Camera Mounting',
        status: 'Done',
        owner: 'Rjay Picar',
        area: 'Entrance Door',
        progressPercent: 100,
        verifiedStatus: 'Outdoor bullet camera mounted, weatherproof seal tested, feed confirmed on monitor',
        completedDate: '2026-09-06'
      },
      {
        id: 't-upc-6',
        title: 'Access Point Relocation - Move AP to existing CCTV LAN cable',
        category: 'Network & Cabling',
        status: 'Done',
        owner: 'Rjay Picar',
        area: 'Access Point Relocation',
        progressPercent: 100,
        verifiedStatus: 'All PoE injectors traced, labeled, and AP relocated without interruption',
        completedDate: '2026-09-07'
      }
    ],
    risks: [
      {
        id: 'r-upc-1',
        description: 'Scheduled quarterly preventive lens cleaning and focus calibration for outdoor perimeter cameras.',
        impact: 'low',
        likelihood: 'low',
        signal: 'All 18 camera feeds passing stream integrity checks.',
        mitigation: 'Include in routine monthly site maintenance agreement.',
        owner: 'Rjay Picar',
        dueDate: '2026-10-01'
      }
    ],
    blockers: [],
    decisions: [
      {
        id: 'd-upc-1',
        decision: 'Workers vacated temporary quarters; Backdoor camera mounted and verified.',
        date: '2026-09-05',
        decisionMaker: 'UPC Administration & Rjay Picar',
        whatChanged: 'Installation completed on CAM-13.'
      },
      {
        id: 'd-upc-2',
        decision: 'Schedule Entrance Door and Perimeter cameras online sign-off.',
        date: '2026-09-06',
        decisionMaker: 'Rjay Picar - RMVN',
        whatChanged: 'All exterior feeds streaming to NVR storage array.'
      },
      {
        id: 'd-upc-3',
        decision: 'Trace all PoE injectors, then relocate the AP to the existing CCTV cable.',
        date: '2026-09-07',
        decisionMaker: 'Rjay Picar - RMVN',
        whatChanged: 'Ensured plug-and-play operation without network disruption.'
      },
      {
        id: 'd-upc-4',
        decision: 'Full 18-camera fleet walkthrough and monitoring console turnover completed with client.',
        date: '2026-09-08',
        decisionMaker: 'Rjay Picar - RMVN & UPC Administration',
        whatChanged: 'Final project handover milestone accomplished.'
      }
    ],
    cameras: DEFAULT_CAMERAS,
    technicians: DEFAULT_TECHNICIANS,
    notes: [
      {
        id: 'note-1',
        author: 'Rjay Picar - RMVN',
        authorRole: 'installer',
        content: 'All 18 camera endpoints installed, aligned, and confirmed streaming live on central monitor and mobile telemetry console. Bandwidth and PoE load nominal.',
        createdAt: 'Sep 7, 5:30 PM'
      },
      {
        id: 'note-2',
        author: 'UPCHQ',
        authorRole: 'client',
        content: 'Live feeds confirmed on all 18 channels. Video resolution and night-vision IR verified across perimeter, cash counter, and server room.',
        createdAt: 'Sep 8, 8:15 AM'
      }
    ]
  },
  {
    id: 'proj-cctv-wh2',
    name: 'Warehouse B - Perimeter & Loading Dock CCTV',
    organization: 'METRO LOGISTICS YARD',
    preparedBy: 'Rjay Picar - RMVN',
    goal: 'Warehouse facility expansion: deploy 8 high-definition perimeter and loading dock turret cameras.',
    location: 'Sector 4 Logistics Hub, Building B',
    startDate: '2026-09-15',
    targetLaunchDate: '2026-09-28',
    teamLead: 'Rjay Picar - RMVN',
    updateCadence: 'Weekly',
    audience: 'Client',
    totalCameras: 8,
    installedCameras: 0,
    overallCompletion: 0,
    tasks: [
      {
        id: 't-wh-1',
        title: 'Site survey & cable run pathways validation',
        category: 'Site Survey',
        status: 'Not started',
        owner: 'Rjay Picar',
        area: 'Perimeter Loading Bay',
        progressPercent: 0
      }
    ],
    risks: [],
    blockers: [],
    decisions: [],
    cameras: [],
    technicians: DEFAULT_TECHNICIANS,
    notes: []
  },
  {
    id: 'proj-cctv-retail',
    name: 'Galleria Commercial Plaza - Level 1 Surveillance',
    organization: 'PLAZA PROPERTIES CORP',
    preparedBy: 'Rjay Picar - RMVN',
    goal: 'Commercial retail floor CCTV setup covering corridors, escalators, and customer service counters.',
    location: 'Downtown Commercial Center',
    startDate: '2026-10-01',
    targetLaunchDate: '2026-10-15',
    teamLead: 'Rjay Picar - RMVN',
    updateCadence: 'Weekly',
    audience: 'Client',
    totalCameras: 12,
    installedCameras: 0,
    overallCompletion: 0,
    tasks: [],
    risks: [],
    blockers: [],
    decisions: [],
    cameras: [],
    technicians: DEFAULT_TECHNICIANS,
    notes: []
  }
];

export const DEFAULT_PROJECT: CCTVProject = INITIAL_PROJECTS[0];

export function cleanMojibake(text: string): string {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/â€”/g, '-')
    .replace(/\u00e2\u20ac\u201d/g, '-')
    .replace(/\u00e2\u20ac\u2014/g, '-')
    .replace(/\u2014/g, '-')
    .replace(/\u2013/g, '-');
}

export function upgradeProject(p: CCTVProject): CCTVProject {
  const currentTechs = p.technicians && p.technicians.length > 0 ? p.technicians : DEFAULT_TECHNICIANS;
  const updatedTechs = currentTechs.map(t => {
    if (t.name === 'Marcus Vance' || t.id === 'tech-1') {
      return { 
        ...t, 
        name: 'Rjay Picar',
        assignedCameras: t.assignedCameras && t.assignedCameras.length >= 18 
          ? t.assignedCameras 
          : DEFAULT_TECHNICIANS[0].assignedCameras
      };
    }
    if (t.name === 'UPC Administration' || t.id === 'tech-2') {
      return { ...t, name: 'UPCHQ' };
    }
    return t;
  });

  // Preserve upcoming unstarted template projects if they have 0 cameras
  if ((p.id === 'proj-cctv-wh2' || p.id === 'proj-cctv-retail') && (!p.cameras || p.cameras.length === 0)) {
    return {
      ...p,
      technicians: updatedTechs
    };
  }

  // Active / default / imported projects:
  // Upgrade ANY project where cameras < 18 or existing cameras count < 18 or old IPs
  const existingCount = (p.cameras || []).filter(c => (c.scope || 'existing') === 'existing').length;
  const needsCameraUpgrade = !p.cameras || p.cameras.length < 18 || existingCount < 18 || p.cameras.some(c => c.ip?.startsWith('192.168.1.'));

  if (!needsCameraUpgrade) {
    const currentCameras = p.cameras || [];
    const mountedCount = currentCameras.filter(c => c.status === 'Mounted').length;
    return {
      ...p,
      name: (p.id === 'proj-cctv-upc' && !p.name.includes('UPCHQ')) ? 'UPCHQ - CCTV Installation & Monitoring' : p.name,
      location: (p.id === 'proj-cctv-upc' && !p.location.includes('UPCHQ')) ? 'UPCHQ - Headquarters' : p.location,
      teamLead: p.teamLead === 'Marcus Vance' ? 'Rjay Picar' : (p.teamLead || 'Rjay Picar'),
      totalCameras: Math.max(18, currentCameras.length, p.totalCameras || 0),
      installedCameras: mountedCount,
      cameras: currentCameras,
      technicians: updatedTechs
    };
  }

  // Retain project-scope cameras and any custom non-default cameras alongside the 18 default existing cameras
  const defaultCamIds = new Set(DEFAULT_CAMERAS.map(c => c.id));
  const retainedProjectCameras = (p.cameras || []).filter(c => 
    !defaultCamIds.has(c.id) && 
    !DEFAULT_CAMERAS.some(dc => dc.zone.toLowerCase() === c.zone.toLowerCase() || dc.name.toLowerCase() === c.name.toLowerCase())
  ).map(c => ({
    ...c,
    scope: (c.scope || 'project') as 'existing' | 'project'
  }));

  const cameras: CameraEndpoint[] = [
    ...DEFAULT_CAMERAS.map(c => ({
      ...c,
      scope: 'existing' as const,
      status: 'Mounted' as const
    })),
    ...retainedProjectCameras
  ];

  const mountedCount = cameras.filter(c => c.status === 'Mounted').length;

  return {
    ...p,
    name: (p.id === 'proj-cctv-upc' && !p.name.includes('UPCHQ')) ? 'UPCHQ - CCTV Installation & Monitoring' : p.name,
    location: (p.id === 'proj-cctv-upc' && !p.location.includes('UPCHQ')) ? 'UPCHQ - Headquarters' : p.location,
    teamLead: p.teamLead === 'Marcus Vance' ? 'Rjay Picar' : (p.teamLead || 'Rjay Picar'),
    totalCameras: Math.max(18, cameras.length),
    installedCameras: mountedCount,
    overallCompletion: Math.max(p.overallCompletion || 0, 100),
    cameras,
    technicians: updatedTechs
  };
}

export function loadProjects(): CCTVProject[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY) || 
                 localStorage.getItem('cctv_monitoring_projects_v8') ||
                 localStorage.getItem('cctv_monitoring_projects_v7') ||
                 localStorage.getItem('cctv_monitoring_projects_v6') ||
                 localStorage.getItem('cctv_monitoring_projects_v5');
    if (data) {
      const sanitizedData = cleanMojibake(data);
      const parsed = JSON.parse(sanitizedData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const migrated = parsed.map(upgradeProject);
        // Save migrated data back to current STORAGE_KEY
        saveProjects(migrated);
        return migrated;
      }
    }
  } catch (err) {
    console.error('Failed to load projects from localStorage:', err);
  }
  const initial = INITIAL_PROJECTS.map(upgradeProject);
  saveProjects(initial);
  return initial;
}

export function saveProjects(projects: CCTVProject[]): void {
  try {
    const serialized = JSON.stringify(projects);
    const sanitized = cleanMojibake(serialized);
    localStorage.setItem(STORAGE_KEY, sanitized);
  } catch (err) {
    console.error('Failed to save projects to localStorage:', err);
  }
}

export function resetProjectsStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('cctv_monitoring_projects_v8');
    localStorage.removeItem('cctv_monitoring_projects_v7');
    localStorage.removeItem('cctv_monitoring_projects_v6');
    localStorage.removeItem('cctv_monitoring_projects_v5');
    localStorage.removeItem('cctv_monitoring_projects_v4');
    localStorage.removeItem('cctv_monitoring_projects_v3');
    localStorage.removeItem('cctv_monitoring_projects_v2');
    localStorage.removeItem('cctv_monitoring_projects_v1');
    localStorage.removeItem('cctv_monitoring_projects');
  } catch (err) {
    console.error('Failed to reset project storage:', err);
  }
}
