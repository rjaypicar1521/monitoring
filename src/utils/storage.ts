import { CCTVProject, CameraEndpoint, TechnicianMember } from '../types';

const STORAGE_KEY = 'cctv_monitoring_projects_v4';

export const DEFAULT_CAMERAS: CameraEndpoint[] = [
  { id: 'CAM-01', name: 'Cashier Dome Camera', zone: 'Ground Floor - Cashier', lens: '2.8mm Wide Angle Dome', ip: '192.168.1.101', port: 'Port 1', status: 'Mounted' },
  { id: 'CAM-02', name: 'Front Desk Reception Camera', zone: 'Ground Floor - Reception', lens: '4.0mm Standard Dome', ip: '192.168.1.102', port: 'Port 2', status: 'Mounted' },
  { id: 'CAM-03', name: 'Backdoor Entrance Camera', zone: 'Perimeter - Backdoor', lens: '3.6mm Outdoor Bullet', ip: '192.168.1.103', port: 'Port 3', status: 'Pending Power' },
  { id: 'CAM-04', name: 'Entrance Door Camera', zone: 'Perimeter - Main Entrance', lens: '4.0mm Outdoor Bullet', ip: '192.168.1.104', port: 'Port 4', status: 'Pending Power' }
];

export const DEFAULT_TECHNICIANS: TechnicianMember[] = [
  { id: 'tech-1', name: 'Rjay Picar', role: 'Lead Systems & CCTV Architect (RMVN Solutions)', status: 'On Site', assigned: 'CCTV Architecture & Live Monitoring', email: 'rjay@rmvn.com' },
  { id: 'tech-2', name: 'UPC Administration', role: 'Client Facility Sponsor & Decision Maker', status: 'On Site', assigned: 'Site Access & Area Clearance', email: 'admin@upcphilippines.org' }
];

export const INITIAL_PROJECTS: CCTVProject[] = [
  {
    id: 'proj-cctv-upc',
    name: 'United Pentecostal Church Philippines Inc. â€” Headquarters',
    organization: 'RMVN SOLUTIONS - NETWORK & SYSTEMS ARCHITECTS',
    preparedBy: 'Rjay Picar - RMVN',
    goal: 'Project Achievement Report: CCTV Installation Progress & Success Update (50% overall completion, 2 operational cameras verified on monitor).',
    location: 'United Pentecostal Church Philippines Inc. â€” Headquarters',
    startDate: '2026-09-01',
    targetLaunchDate: '2026-09-10',
    teamLead: 'Rjay Picar - RMVN',
    updateCadence: 'Daily',
    audience: 'Client',
    totalCameras: 4,
    installedCameras: 2,
    overallCompletion: 50,
    tasks: [
      {
        id: 't-upc-1',
        title: 'Cashier â€” Dome camera installed, aligned, and working',
        category: 'Camera Mounting',
        status: 'Done',
        owner: 'Rjay Picar',
        area: 'Cashier',
        progressPercent: 100,
        verifiedStatus: 'Installed, tested, and working',
        completedDate: '2026-09-03',
        photoEvidence: '/evidence/image1.jpg',
        photoCaption: 'Cashier 100% â€” Dome camera installed and aligned; feed verified on CCTV monitor'
      },
      {
        id: 't-upc-2',
        title: 'Front Desk â€” Camera installed above reception, tested, and working',
        category: 'Camera Mounting',
        status: 'Done',
        owner: 'Rjay Picar',
        area: 'Front Desk',
        progressPercent: 100,
        verifiedStatus: 'Installed, tested, and working',
        completedDate: '2026-09-03',
        photoEvidence: '/evidence/image2.jpg',
        photoCaption: 'Front Desk 100% â€” Camera installed above reception; feed verified on CCTV monitor'
      },
      {
        id: 't-upc-3',
        title: 'System Verification â€” Live Monitoring Confirmation on NVR Display',
        category: 'Testing & Commissioning',
        status: 'Done',
        owner: 'Rjay Picar',
        area: 'NVR Display & Central Monitor',
        progressPercent: 100,
        verifiedStatus: 'Cashier & Front Desk camera feeds confirmed live on CCTV monitor',
        completedDate: '2026-09-03',
        photoEvidence: '/evidence/image3.jpg',
        photoCaption: 'NVR display, 03 September 2026 â€” Cashier and Front Desk cameras confirmed working on CCTV monitor'
      },
      {
        id: 't-upc-4',
        title: 'Backdoor Entrance â€” Camera mounting & testing',
        category: 'Camera Mounting',
        status: 'Blocked',
        owner: 'Rjay Picar',
        area: 'Backdoor Entrance',
        progressPercent: 0,
        verifiedStatus: 'Deferred - temporary sleeping area (On hold)',
        blockerReason: 'Deferred to protect occupant privacy. The area is currently used by workers as a temporary bedroom; installation proceeds once space is cleared.',
        photoEvidence: '/evidence/image4.jpg',
        photoCaption: 'Backdoor Site Condition â€” Existing cable is prepared at backdoor entrance; camera mounting remains pending'
      },
      {
        id: 't-upc-5',
        title: 'Entrance Door â€” Camera installation, alignment, testing, and monitor verification',
        category: 'Camera Mounting',
        status: 'In progress',
        owner: 'Rjay Picar',
        area: 'Entrance Door',
        progressPercent: 0,
        verifiedStatus: 'Camera installation remaining',
        targetDate: '2026-09-06'
      },
      {
        id: 't-upc-6',
        title: 'Access Point Relocation â€” Move AP to existing CCTV LAN cable',
        category: 'Network & Cabling',
        status: 'Not started',
        owner: 'Rjay Picar',
        area: 'Access Point Relocation',
        progressPercent: 0,
        verifiedStatus: 'Trace and label every PoE injector first, then relocate AP to CCTV cable',
        targetDate: '2026-09-07'
      }
    ],
    risks: [
      {
        id: 'r-upc-1',
        description: 'Backdoor installation on hold until workers vacate temporary bedroom quarters.',
        impact: 'med',
        likelihood: 'high',
        signal: 'Existing cable is prepared; area awaiting clearance.',
        mitigation: 'Coordinate with UPC Administration on worker schedule.',
        owner: 'Rjay Picar',
        dueDate: '2026-09-06'
      }
    ],
    blockers: [
      {
        id: 'b-upc-1',
        description: 'Backdoor Entrance installation deferred to protect occupant privacy (temporary sleeping area).',
        owner: 'Rjay Picar - RMVN',
        since: '2026-09-03',
        unblockAction: 'Confirm when workers have vacated the backdoor area before scheduling mounting.',
        resolved: false
      }
    ],
    decisions: [
      {
        id: 'd-upc-1',
        decision: 'Confirm when workers have vacated the backdoor area.',
        date: '2026-09-03',
        decisionMaker: 'UPC Administration',
        whatChanged: 'Installation proceeds once the space is cleared.'
      },
      {
        id: 'd-upc-2',
        decision: 'Schedule Entrance Door and Backdoor Entrance installation.',
        date: '2026-09-03',
        decisionMaker: 'Rjay Picar - RMVN',
        whatChanged: 'Pending area clearance.'
      },
      {
        id: 'd-upc-3',
        decision: 'Trace all PoE injectors, then relocate the AP to the existing CCTV cable.',
        date: '2026-09-03',
        decisionMaker: 'Rjay Picar - RMVN',
        whatChanged: 'Ensures reconnection remains plug-and-play without network disruption.'
      },
      {
        id: 'd-upc-4',
        decision: 'Reconnect, test, and verify remaining feeds, then conduct client walkthrough and final turnover.',
        date: '2026-09-03',
        decisionMaker: 'Rjay Picar - RMVN & UPC Administration',
        whatChanged: 'Final handover milestone.'
      }
    ],
    cameras: DEFAULT_CAMERAS,
    technicians: DEFAULT_TECHNICIANS,
    notes: [
      {
        id: 'note-1',
        author: 'Rjay Picar - RMVN',
        authorRole: 'installer',
        content: 'Cashier and Front Desk camera feeds confirmed live on CCTV monitor (03 September 2026). Backdoor cable is prepared; awaiting worker clearance.',
        createdAt: 'Sep 3, 5:00 PM'
      },
      {
        id: 'note-2',
        author: 'UPC Administration',
        authorRole: 'client',
        content: 'Acknowledged. We will notify RMVN as soon as workers vacate the backdoor temporary quarters.',
        createdAt: 'Sep 4, 8:30 AM'
      }
    ]
  }
];

export function loadProjects(): CCTVProject[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const validProjects = parsed.filter((p: CCTVProject) => p.id === 'proj-cctv-upc');
        if (validProjects.length > 0) {
          return validProjects.map((p: CCTVProject) => ({
            ...p,
            cameras: p.cameras && p.cameras.length > 0 ? p.cameras : DEFAULT_CAMERAS,
            technicians: p.technicians && p.technicians.length > 0 ? p.technicians : DEFAULT_TECHNICIANS
          }));
        }
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
