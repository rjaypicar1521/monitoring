import { CCTVProject, ExecutiveStatus, HealthScore, AssistantUpdateReport } from '../types';

export function computeExecutiveStatus(project: CCTVProject): ExecutiveStatus {
  const hasBlockers = project.blockers.some(b => !b.resolved);
  const highRisks = project.risks.filter(r => r.impact === 'high' || (r.impact === 'med' && r.likelihood === 'high'));
  const totalTasks = project.tasks.length;
  const doneTasks = project.tasks.filter(t => t.status === 'Done').length;
  const completionRate = totalTasks > 0 ? doneTasks / totalTasks : 0;

  let overall: 'Green' | 'Yellow' | 'Red' = 'Green';
  let reason = 'Everything is progressing well on schedule with no delays.';
  let schedule: 'On track' | 'At risk' | 'Off track' = 'On track';
  let scope: 'Stable' | 'Expanding' | 'Unclear' = 'Stable';
  let resourcing: 'Adequate' | 'Tight' | 'Insufficient' = 'Adequate';
  let keyAsk = 'No urgent help needed right now.';

  if (hasBlockers) {
    overall = 'Yellow';
    schedule = 'At risk';
    const firstBlocker = project.blockers.find(b => !b.resolved);
    reason = `Minor delay: ${firstBlocker?.description || 'Waiting on access approval'}`;
    keyAsk = `Help needed from you: ${firstBlocker?.unblockAction || 'Contact facility management'}`;
  } else if (highRisks.length > 0) {
    overall = 'Yellow';
    schedule = 'At risk';
    reason = `Heads up: ${highRisks[0].description.slice(0, 60)}...`;
    keyAsk = `Action item: ${highRisks[0].mitigation.slice(0, 50)} by ${highRisks[0].dueDate || 'end of week'}.`;
  }

  if (totalTasks === 0) {
    scope = 'Unclear';
    overall = 'Yellow';
    reason = 'No active task milestones configured in system.';
    keyAsk = 'Define primary milestones (Survey, Cabling, Mounting, NVR Config).';
  }

  return {
    overall,
    overallReason: reason,
    schedule,
    scope,
    resourcing,
    keyAsk
  };
}

export function computeHealthScore(project: CCTVProject): HealthScore {
  const activeBlockers = project.blockers.filter(b => !b.resolved);
  const totalTasks = project.tasks.length;
  const doneTasks = project.tasks.filter(t => t.status === 'Done').length;
  const inProgressTasks = project.tasks.filter(t => t.status === 'In progress').length;
  const blockedTasks = project.tasks.filter(t => t.status === 'Blocked').length;

  // Schedule (0-5)
  let schedule = 5;
  if (activeBlockers.length > 0) schedule -= 2;
  if (blockedTasks > 0) schedule -= 1;
  if (project.targetLaunchDate && new Date(project.targetLaunchDate).getTime() < Date.now() && doneTasks < totalTasks) {
    schedule = Math.max(1, schedule - 2);
  }
  schedule = Math.max(1, Math.min(5, schedule));

  // Scope / Delivery (0-5)
  let scope = totalTasks > 0 ? Math.min(5, Math.max(2, Math.round((doneTasks / totalTasks) * 5) + 1)) : 2;

  // Quality (0-5)
  let quality = 4;
  const highWindRisk = project.risks.find(r => r.description.toLowerCase().includes('vibration') || r.description.toLowerCase().includes('quality'));
  if (highWindRisk) quality -= 1;

  // Team / Resourcing (0-5)
  let resourcing = 4;
  if (inProgressTasks > 3 && project.tasks.map(t => t.owner).length < 2) {
    resourcing = 2; // Overloaded owners
  }

  // Risk / Dependencies (0-5)
  let risk = 5;
  if (project.risks.some(r => r.impact === 'high')) risk -= 2;
  if (project.risks.some(r => r.impact === 'med')) risk -= 1;
  if (activeBlockers.length > 0) risk -= 1;
  risk = Math.max(1, Math.min(5, risk));

  const total = schedule + scope + quality + resourcing + risk;

  const facts = [
    `Total CCTV tasks: ${totalTasks} (${doneTasks} Done, ${inProgressTasks} In progress, ${blockedTasks} Blocked).`,
    `Physical camera deployment: ${project.installedCameras}/${project.totalCameras} cameras mounted (${Math.round((project.installedCameras / Math.max(1, project.totalCameras)) * 100)}%).`,
    `Active unresolved blockers: ${activeBlockers.length}. Logged risks: ${project.risks.length}.`
  ];

  const inferences = [
    activeBlockers.length > 0 
      ? 'Inference: Trenching / permit blockages are highest variance threat to schedule.'
      : 'Inference: Current pacing aligns with target deadline if cable terminations stay on schedule.',
    blockedTasks > 0
      ? 'Inference: Dependent commissioning tasks (VMS setup, NVR sync) will slide until infrastructure permits clear.'
      : 'Inference: Low external dependency friction currently observed.'
  ];

  return {
    schedule,
    scope,
    quality,
    resourcing,
    risk,
    total,
    facts,
    inferences
  };
}

export function generateUpdateReport(project: CCTVProject): AssistantUpdateReport {
  const execStatus = computeExecutiveStatus(project);
  const health = computeHealthScore(project);

  // Progress Bullets (3-7 bullets)
  const progressBullets: string[] = [];
  const completed = project.tasks.filter(t => t.status === 'Done');
  const inProgress = project.tasks.filter(t => t.status === 'In progress');
  const blocked = project.tasks.filter(t => t.status === 'Blocked');

  completed.forEach(t => {
    progressBullets.push(`✅ Completed - ${t.title} (Owner: ${t.owner}, Date: ${t.completedDate || '(date not provided)'})`);
  });

  inProgress.forEach(t => {
    progressBullets.push(`🟦 In progress - ${t.title} (Owner: ${t.owner}, ETA: ${t.targetDate || '(date not provided)'})`);
  });

  blocked.forEach(t => {
    progressBullets.push(`⛔ Blocked - ${t.title} (Blocker: ${t.blockerReason || 'Unspecified dependency'}, Owner: ${t.owner})`);
  });

  // Next 7 Days Plan
  const next7DaysBullets: string[] = [];
  inProgress.slice(0, 3).forEach(t => {
    next7DaysBullets.push(`• ${t.owner}: Finalize ${t.title} by ${t.targetDate || 'end of week'}`);
  });
  const notStarted = project.tasks.filter(t => t.status === 'Not started');
  notStarted.slice(0, 3).forEach(t => {
    next7DaysBullets.push(`• ${t.owner}: Initiate prerequisite staging for ${t.title}`);
  });
  if (next7DaysBullets.length === 0) {
    next7DaysBullets.push(`• ${project.teamLead}: Conduct weekly QA verification and walkthrough.`);
  }

  // Open Questions (Up to 5)
  const openQuestions: string[] = [];
  if (project.blockers.some(b => !b.resolved)) {
    openQuestions.push('What is the municipal contact timeline for clearing the active permit blocker?');
  }
  if (!project.targetLaunchDate) {
    openQuestions.push('What is the exact target commissioning and sign-off date?');
  }
  openQuestions.push('Has the client security operations center (SOC) approved the camera storage retention spec?');

  const endingPhrase = project.tasks.length > 0 
    ? `Next check-in: ${project.updateCadence.toLowerCase()} (${project.audience.toLowerCase()} update).`
    : `To monitor accurately, I need: [1. Target launch date, 2. Task list with owners, 3. Update cadence].`;

  return {
    executiveStatus: execStatus,
    progressBullets: progressBullets.slice(0, 7),
    next7DaysBullets: next7DaysBullets.slice(0, 7),
    risks: project.risks,
    blockers: project.blockers.filter(b => !b.resolved),
    decisions: project.decisions,
    openQuestions,
    healthScore: health,
    endingPhrase
  };
}
export function generateFriendlyWeeklyCheckin(project: CCTVProject): string {
  const exec = computeExecutiveStatus(project);
  const doneTasks = project.tasks.filter(t => t.status === 'Done');
  const blockers = project.blockers.filter(b => !b.resolved);
  const upcomingTasks = project.tasks.filter(t => t.status !== 'Done');

  let md = `### ${project.name} - Weekly Check-in\n\n`;

  md += `1) AT A GLANCE\n`;
  md += `- Overall status: ${exec.schedule}\n`;
  md += `- One-sentence summary: ${exec.overallReason}\n\n`;

  md += `2) WHAT MOVED FORWARD (WINS)\n`;
  if (doneTasks.length > 0) {
    doneTasks.slice(0, 3).forEach(t => {
      md += `- ✅ ${t.title}\n`;
    });
  } else {
    md += `- ✅ Work kick-off and initial site setup started\n`;
  }
  md += `\n`;

  md += `3) WHAT’S STUCK (GENTLY)\n`;
  if (blockers.length > 0) {
    blockers.slice(0, 3).forEach(b => {
      md += `- ⚠️ ${b.description} - impact: ${b.unblockAction}\n`;
    });
  } else {
    md += `- ⚠️ No blockers right now - smooth sailing\n`;
  }
  md += `\n`;

  md += `4) NEXT 7 DAYS (CLEAR PLAN)\n`;
  upcomingTasks.slice(0, 5).forEach(t => {
    md += `- ${t.title} - owner: ${t.owner} - target: ${t.targetDate || 'This week'}\n`;
  });
  md += `\n`;

  md += `5) DECISIONS NEEDED (ONLY IF ANY)\n`;
  if (project.decisions.length > 0) {
    project.decisions.slice(0, 2).forEach(d => {
      md += `- Decision recorded: ${d.decision} (by ${d.decisionMaker})\n`;
    });
  } else {
    md += `- Do we want 30-day or 60-day recording retention?\n`;
    md += `- Should we add backup battery power for the main recorder now or later?\n`;
  }
  md += `\n`;

  md += `6) HELP I NEED FROM YOU\n`;
  if (blockers.length > 0) {
    blockers.slice(0, 3).forEach(b => {
      md += `- ${b.unblockAction}\n`;
    });
  } else {
    md += `- Sign-off on camera placement angles\n`;
    md += `- Confirm site access badges for field team\n`;
  }
  md += `\n***\n\nWant me to turn this into a simple weekly check-in we can reuse?`;

  return md;
}

export function generateProjectMonitoringUpdate(project: CCTVProject): string {
  const exec = computeExecutiveStatus(project);
  const doneTasks = project.tasks.filter(t => t.status === 'Done');
  const upcomingTasks = project.tasks.filter(t => t.status !== 'Done');
  const activeBlockers = project.blockers.filter(b => !b.resolved);
  const activeRisks = project.risks;
  const today = new Date().toISOString().split('T')[0];

  let md = `PROJECT MONITORING UPDATE\n\n`;
  md += `Project: ${project.name}\n`;
  md += `Period: Current week (${today})\n`;
  md += `Prepared by: ${project.teamLead || 'Project Monitoring Team'}\n`;
  md += `Last updated: ${today}\n\n`;

  // 1) Status
  md += `1) Status\n`;
  md += `- Overall: ${exec.schedule}\n`;
  md += `- Summary: ${exec.overallReason}\n\n`;

  // 2) Progress (since last update)
  md += `2) Progress (since last update)\n`;
  if (doneTasks.length === 0) {
    md += `None\n\n`;
  } else {
    doneTasks.slice(0, 5).forEach(t => {
      md += `- ${t.title} (Owner: ${t.owner})\n`;
    });
    md += `\n`;
  }

  // 3) Current Focus (next 7 days)
  md += `3) Current Focus (next 7 days)\n`;
  if (upcomingTasks.length === 0) {
    md += `None\n\n`;
  } else {
    upcomingTasks.slice(0, 5).forEach(t => {
      md += `- ${t.title} - Owner: ${t.owner} - Target: ${t.targetDate || 'Within 7 days'}\n`;
    });
    md += `\n`;
  }

  // 4) Risks / Blockers
  md += `4) Risks / Blockers\n`;
  if (activeBlockers.length === 0 && activeRisks.length === 0) {
    md += `None\n\n`;
  } else {
    activeBlockers.forEach(b => {
      md += `- ${b.description}\n`;
      md += `  - Impact: Outside cameras cannot turn on for testing yet\n`;
      md += `  - Needed: ${b.unblockAction}\n`;
      md += `  - Owner: ${b.owner}\n`;
      md += `  - By: Immediate\n`;
    });
    activeRisks.forEach(r => {
      md += `- ${r.description}\n`;
      md += `  - Impact: Could delay final camera checks by a few days\n`;
      md += `  - Needed: ${r.mitigation}\n`;
      md += `  - Owner: ${r.owner}\n`;
      md += `  - By: ${r.dueDate || 'Target launch'}\n`;
    });
    md += `\n`;
  }

  // 5) Timeline / Milestones
  md += `5) Timeline / Milestones\n`;
  if (project.tasks.length === 0) {
    md += `None\n\n`;
  } else {
    project.tasks.slice(0, 5).forEach(t => {
      const st = t.status === 'Done' ? 'On track' : (t.status === 'Blocked' ? 'Off track' : (t.status === 'In progress' ? 'On track' : 'On track'));
      md += `- ${t.title} - Target: ${t.targetDate || t.completedDate || 'Target launch'} - Owner: ${t.owner} - Status: ${st}\n`;
    });
    md += `\n`;
  }

  // 6) Decisions Needed (if any)
  md += `6) Decisions Needed (if any)\n`;
  if (project.decisions.length === 0) {
    md += `- Video storage length confirmation - Needed by: Within 5 days - Owner: ${project.teamLead} - Options: 30 days vs 60 days\n\n`;
  } else {
    project.decisions.forEach(d => {
      md += `- ${d.decision} - Needed by: ${d.date} - Owner: ${d.decisionMaker} - Options: ${d.whatChanged}\n`;
    });
    md += `\n`;
  }

  // 7) Support Needed
  md += `7) Support Needed\n`;
  if (activeBlockers.length === 0) {
    md += `None\n\n`;
  } else {
    activeBlockers.forEach(b => {
      md += `- From Facility Management / Sponsor: ${b.unblockAction} - By: Immediate\n`;
    });
    md += `\n`;
  }

  // 8) Next Check-in
  md += `8) Next Check-in\n`;
  const nextDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  md += `- Date: ${nextDate}\n`;
  md += `- We will confirm:\n`;
  md += `  - Outside power hooked up and security badges issued\n`;
  md += `  - Total cameras mounted (${project.installedCameras}/${project.totalCameras} cameras)\n`;
  md += `  - Video picture check on all installed cameras\n`;

  return md;
}

export function handleAssistantQuery(query: string, project: CCTVProject): string {
  const q = query.trim().toLowerCase();

  // Intent: Project Monitoring Update (Exact System Prompt Format)
  if (q.includes('monitoring') || q.includes('system prompt') || q.includes('official') || q.includes('update format')) {
    return generateProjectMonitoringUpdate(project);
  }

  // Intent: Friendly Weekly Check-in
  if (q.includes('check-in') || q.includes('checkin') || q.includes('weekly')) {
    return generateFriendlyWeeklyCheckin(project);
  }

  // Intent: What should we do next?
  if (q.includes('what should we do next') || q.includes('next steps') || q.includes('priority')) {
    const blockers = project.blockers.filter(b => !b.resolved);
    const criticalPathTasks = project.tasks.filter(t => t.status === 'In progress' || t.status === 'Blocked');
    
    let out = `### Critical Path & Immediate Actions\n\n`;
    if (blockers.length > 0) {
      out += `**P0 - Immediate Unblocker Required:**\n`;
      blockers.forEach(b => {
        out += `- **${b.description}**: ${b.unblockAction} (Owner: ${b.owner})\n`;
      });
      out += `\n`;
    }
    out += `**P1 - Active Critical Path Execution:**\n`;
    criticalPathTasks.slice(0, 3).forEach(t => {
      out += `- [${t.category}] **${t.title}** (Owner: ${t.owner}, ETA: ${t.targetDate || '(date not provided)'})\n`;
    });
    out += `\n**Schedule Risk Mitigation:** Focus all hands on clearing the fiber connection before scheduling final VMS software config.\n\n`;
    out += `Next check-in: ${project.updateCadence.toLowerCase()}.`;
    return out;
  }

  // Intent: Summarize for exec/client
  if (q.includes('exec') || q.includes('client') || q.includes('executive summary')) {
    const exec = computeExecutiveStatus(project);
    return `### Executive Briefing: ${project.name}
**Audience:** ${project.audience} | **Cadence:** ${project.updateCadence}

- **Overall Health:** ${exec.overall} (${exec.overallReason})
- **Schedule:** ${exec.schedule} | **Scope:** ${exec.scope} | **Cameras Installed:** ${project.installedCameras}/${project.totalCameras}
- **Key Risks / Blockers:** ${project.blockers.length > 0 ? project.blockers[0].description : 'No active showstoppers.'}
- **Key Ask:** ${exec.keyAsk}

Next check-in: ${project.updateCadence.toLowerCase()}.`;
  }

  // Intent: Health Score
  if (q.includes('health') || q.includes('score')) {
    const h = computeHealthScore(project);
    return `### Project Health Score: ${h.total}/25

- **Schedule:** ${h.schedule}/5
- **Delivery/Scope:** ${h.scope}/5
- **Quality:** ${h.quality}/5
- **Team/Resourcing:** ${h.resourcing}/5
- **Risk/Dependencies:** ${h.risk}/5

**Facts:**
${h.facts.map(f => `- ${f}`).join('\n')}

**Inferences:**
${h.inferences.map(i => `- ${i}`).join('\n')}

Next check-in: ${project.updateCadence.toLowerCase()}.`;
  }

  // Intent: Dashboard Spec
  if (q.includes('dashboard spec') || q.includes('spec')) {
    return `### CCTV Monitoring Dashboard Specification

**Key Metrics:**
- Camera Deployment Completion Rate (\`installedCameras / totalCameras\`)
- Milestone Pacing vs Target Launch Date
- Active Blocker Count & Time-in-Blocker (Aging Days)
- Risk Exposure Index (Impact × Likelihood)

**Widgets:**
1. **Executive Status Banner**: 5-line status indicator with color badge.
2. **Camera Installation Progress Bar**: Total vs Mounted vs Stream-Verified.
3. **Task Status Kanban / List**: Grouped by Phase (Survey, Cabling, Mounting, Config, Handover).
4. **Blocker Escalatron**: Direct unblock action items with designated owners.
5. **AI Risk Radar**: Early warning signals before deadlines slide.

Next check-in: ${project.updateCadence.toLowerCase()}.`;
  }

  // Default: Full Standard Update Format (Step 2)
  const report = generateUpdateReport(project);
  return formatFullReportMarkdown(project, report);
}

export function formatFullReportMarkdown(project: CCTVProject, r: AssistantUpdateReport): string {
  let md = `## Project Monitoring Report: ${project.name}\n\n`;

  md += `### A) EXECUTIVE STATUS\n`;
  md += `- **Overall:** ${r.executiveStatus.overall} - ${r.executiveStatus.overallReason}\n`;
  md += `- **Schedule:** ${r.executiveStatus.schedule}\n`;
  md += `- **Scope:** ${r.executiveStatus.scope}\n`;
  md += `- **Resourcing:** ${r.executiveStatus.resourcing}\n`;
  md += `- **Key ask:** ${r.executiveStatus.keyAsk}\n\n`;

  md += `### B) PROGRESS SINCE LAST UPDATE\n`;
  r.progressBullets.forEach(b => {
    md += `${b}\n`;
  });
  md += `\n`;

  md += `### C) NEXT 7 DAYS PLAN\n`;
  r.next7DaysBullets.forEach(b => {
    md += `${b}\n`;
  });
  md += `\n`;

  md += `### D) RISKS & MITIGATIONS\n`;
  if (r.risks.length === 0) {
    md += `No active risks registered.\n`;
  } else {
    r.risks.forEach(risk => {
      md += `- **Risk:** ${risk.description}\n`;
      md += `  - Impact: ${risk.impact} | Likelihood: ${risk.likelihood}\n`;
      md += `  - Signal: ${risk.signal}\n`;
      md += `  - Mitigation: ${risk.mitigation} (Owner: ${risk.owner}, Due: ${risk.dueDate || '(date not provided)'})\n`;
    });
  }
  md += `\n`;

  md += `### E) BLOCKERS\n`;
  if (r.blockers.length === 0) {
    md += `No current blockers.\n`;
  } else {
    r.blockers.forEach(b => {
      md += `- ⛔ **${b.description}** (Owner: ${b.owner}, Since: ${b.since}):\n  *Unblock Action:* ${b.unblockAction}\n`;
    });
  }
  md += `\n`;

  if (r.decisions.length > 0) {
    md += `### F) DECISION LOG\n`;
    r.decisions.forEach(d => {
      md += `- **${d.decision}** (Date: ${d.date}, By: ${d.decisionMaker}) - *What changed:* ${d.whatChanged}\n`;
    });
    md += `\n`;
  }

  md += `### G) OPEN QUESTIONS\n`;
  r.openQuestions.forEach((q, idx) => {
    md += `${idx + 1}. ${q}\n`;
  });
  md += `\n`;

  md += `**${r.endingPhrase}**`;
  return md;
}
