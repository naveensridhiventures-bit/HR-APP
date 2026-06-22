// Status-aware, role-aware WhatsApp message templates.
//
// Each template is plain text with {placeholders} that get filled in from
// the candidate's actual data (name, role, department, assigned recruiter,
// company name). One template — "Other roles open" — is special: it loops
// over every other department/role that currently has active openings, so a
// candidate who isn't right for one role can be pointed at another in one
// tap, instead of being a dead end.

const fill = (text, vars) =>
  text.replace(/\{(\w+)\}/g, (_, key) => (vars[key] ?? '').toString().trim() || `{${key}}`)

// `stage` is the candidate's CURRENT stage (key from STAGES). Templates are
// grouped so the picker can show "recommended for this stage" first, then
// "all templates" below.
export const TEMPLATES = [
  {
    id: 'applied_ack',
    label: 'Acknowledge application',
    stages: ['applied'],
    body: 'Hi {name}, thank you for applying for the {role} position with {company}. We have received your details and our team will call you shortly to discuss the next steps.'
  },
  {
    id: 'schedule_screening',
    label: 'Schedule a screening call',
    stages: ['applied', 'screening'],
    body: 'Hi {name}, this is {recruiter} from {company} regarding your application for {role}. We would like to schedule a quick screening call — please let us know a convenient time today or tomorrow.'
  },
  {
    id: 'interview_invite',
    label: 'Interview scheduled',
    stages: ['screening', 'interview'],
    body: 'Hi {name}, good news — your interview for the {role} position at {company} has been scheduled. Please reply with your preferred time slot and carry a valid ID proof along with your resume.'
  },
  {
    id: 'interview_reminder',
    label: 'Interview reminder',
    stages: ['interview'],
    body: 'Hi {name}, just a reminder about your upcoming interview for {role} at {company}. Please reach a few minutes early and bring your ID proof and any relevant certificates.'
  },
  {
    id: 'offer_sent',
    label: 'Offer extended',
    stages: ['interview', 'offer'],
    body: 'Hi {name}, congratulations! We are pleased to offer you the {role} position at {company}. Please confirm your acceptance and let us know your earliest possible joining date.'
  },
  {
    id: 'offer_followup',
    label: 'Offer follow-up',
    stages: ['offer'],
    body: 'Hi {name}, following up on the offer we shared for {role} at {company}. Please let us know if you have any questions, or confirm your joining date so we can complete the paperwork.'
  },
  {
    id: 'on_hold_checkin',
    label: 'On-hold check-in',
    stages: ['on_hold'],
    body: 'Hi {name}, this is {recruiter} from {company}. We wanted to check in regarding the {role} position — please let us know if you are still interested so we can take this forward.'
  },
  {
    id: 'general_followup',
    label: 'General follow-up',
    stages: ['applied', 'screening', 'interview', 'offer', 'on_hold'],
    body: 'Hi {name}, this is {recruiter} from {company} following up regarding your application for {role}. Please let us know a good time to connect.'
  },
  {
    id: 'other_roles',
    label: 'Other roles open',
    stages: ['on_hold', 'rejected', 'applied', 'screening'],
    special: 'otherRoles',
    body: 'Hi {name}, this is {recruiter} from {company}. We don\'t have an opening in {role} right now, but we are actively hiring for: {openRoles}. Would you be interested in any of these? Let us know and we will set up a call.'
  }
]

export const getRecommendedTemplates = (stage) =>
  TEMPLATES.filter((t) => t.stages.includes(stage))

export const getAllTemplates = () => TEMPLATES

// Builds the list of "other open roles" text for the special template —
// every role, across every department other than the candidate's own, that
// currently has at least one active (non-closed) candidate against it. If
// no roles are configured, falls back to department labels.
export function buildOpenRolesText(candidate, { departments, roles, candidates }) {
  const otherDepts = departments.filter((d) => d.key !== candidate.department)
  const activeRoleLabels = new Set()

  otherDepts.forEach((d) => {
    const deptRoles = (roles || []).filter((r) => r.department === d.key)
    if (deptRoles.length) {
      deptRoles.forEach((r) => activeRoleLabels.add(`${r.label} (${d.label})`))
    } else {
      activeRoleLabels.add(d.label)
    }
  })

  const list = Array.from(activeRoleLabels)
  if (list.length === 0) return 'other roles — ask our team for the latest openings'
  if (list.length === 1) return list[0]
  if (list.length === 2) return `${list[0]} and ${list[1]}`
  return `${list.slice(0, -1).join(', ')}, and ${list[list.length - 1]}`
}

// Renders a template's body into final text ready to drop into a wa.me
// link. `context` carries departments/roles/candidates needed only by the
// "otherRoles" special template; safe to omit for normal templates.
export function renderTemplate(template, candidate, deptLabel, context = {}) {
  const vars = {
    name: candidate.name,
    role: candidate.role || deptLabel || 'this position',
    department: deptLabel || '',
    recruiter: candidate.assignedTo || 'our team',
    company: context.companyName || 'us'
  }
  if (template.special === 'otherRoles') {
    vars.openRoles = buildOpenRolesText(candidate, context)
  }
  return fill(template.body, vars)
}
