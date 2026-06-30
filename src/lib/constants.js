export const DEFAULT_DEPARTMENTS = [
  { key: 'driver',      label: 'Driver' },
  { key: 'field_sales', label: 'Field Sales' },
  { key: 'housekeeping',label: 'Housekeeping' },
  { key: 'security',    label: 'Security' },
  { key: 'telecaller',  label: 'Telecaller' },
  { key: 'it',          label: 'IT / Developer' },
]

export const DEFAULT_ROLES = [
  { id: 'role_driver_hv',       department: 'driver',       label: 'Heavy Vehicle Driver' },
  { id: 'role_driver_lv',       department: 'driver',       label: 'Light Vehicle Driver' },
  { id: 'role_driver_delivery', department: 'driver',       label: 'Delivery Driver' },
  { id: 'role_fs_exec',         department: 'field_sales',  label: 'Field Sales Executive' },
  { id: 'role_fs_aso',          department: 'field_sales',  label: 'Area Sales Officer' },
  { id: 'role_hk_staff',        department: 'housekeeping', label: 'Housekeeping Staff' },
  { id: 'role_hk_super',        department: 'housekeeping', label: 'Housekeeping Supervisor' },
  { id: 'role_sec_guard',       department: 'security',     label: 'Security Guard' },
  { id: 'role_sec_super',       department: 'security',     label: 'Security Supervisor' },
  { id: 'role_tc_inbound',      department: 'telecaller',   label: 'Telecaller – Inbound' },
  { id: 'role_tc_outbound',     department: 'telecaller',   label: 'Telecaller – Outbound' },
  { id: 'role_tc_lead',         department: 'telecaller',   label: 'Team Leader – Calls' },
  { id: 'role_it_fe',           department: 'it',           label: 'Frontend Developer' },
  { id: 'role_it_be',           department: 'it',           label: 'Backend Developer' },
  { id: 'role_it_fs',           department: 'it',           label: 'Full Stack Developer' },
  { id: 'role_it_qa',           department: 'it',           label: 'QA Engineer' },
]

export const DEFAULT_HR_LIST = ['Priya S', 'Anitha R', 'Meena K', 'Divya T']

export const STAGES = [
  { key: 'applied',    label: 'Applied',        dot: 'bg-slate' },
  { key: 'screening',  label: 'Screening Call', dot: 'bg-ink-400' },
  { key: 'interview',  label: 'Interview',      dot: 'bg-saffron' },
  { key: 'offer',      label: 'Offer Sent',     dot: 'bg-stamp-600' },
  { key: 'hired',      label: 'Hired',          dot: 'bg-stamp' },
  { key: 'on_hold',    label: 'On Hold',        dot: 'bg-slate' },
  { key: 'rejected',   label: 'Rejected',       dot: 'bg-rust' },
  { key: 'terminated', label: 'Terminated',     dot: 'bg-rust-600' },
]

export const ACTIVE_STAGE_KEYS = ['applied', 'screening', 'interview', 'offer']
export const CLOSED_STAGE_KEYS = ['hired', 'on_hold', 'rejected', 'terminated']
export const STAGE_MAP = Object.fromEntries(STAGES.map(s => [s.key, s]))

export const SOURCES = [
  'Walk-in', 'Referral', 'WhatsApp', 'JustDial', 'Naukri', 'Agency', 'Newspaper', 'Other',
]

// Call-status colour scheme (confirmed with HR team):
//   spoken / positive  -> GREEN
//   RNR (no answer)    -> YELLOW
//   follow-up needed   -> BLUE
//   rejected           -> RED
export const CALL_STATUSES = [
  { key: 'positive', label: '✅ Spoken — Positive', dot: 'bg-stamp',   text: 'text-stamp-600',  badge: 'bg-stamp-50 text-stamp-600 border-stamp/30' },
  { key: 'rnr',       label: '📵 RNR (No Answer)',   dot: 'bg-amber',  text: 'text-amber-700',  badge: 'bg-amber-50 text-amber-700 border-amber/40' },
  { key: 'followup',  label: '🔄 Follow-up',         dot: 'bg-sky',    text: 'text-sky-700',    badge: 'bg-sky-50 text-sky-700 border-sky/30' },
  { key: 'rejected',  label: '❌ Rejected',           dot: 'bg-rust',   text: 'text-rust-600',   badge: 'bg-rust-50 text-rust-600 border-rust/30' },
]
export const CALL_STATUS_MAP = Object.fromEntries(CALL_STATUSES.map(s => [s.key, s]))

// Card border/background tint by call status — so the colour is visible
// on the pipeline board without opening the candidate.
export const callStatusCardClasses = (status) => {
  switch (status) {
    case 'positive': return 'border-l-4 border-l-stamp bg-stamp-50/40'
    case 'rnr':       return 'border-l-4 border-l-amber bg-amber-50/40'
    case 'followup':  return 'border-l-4 border-l-sky bg-sky-50/40'
    case 'rejected':  return 'border-l-4 border-l-rust bg-rust-50/40'
    default:          return 'border-l-4 border-l-ink-100'
  }
}

export const stageBadgeClasses = (key) => {
  switch (key) {
    case 'hired':      return 'bg-stamp-50 text-stamp-600 border-stamp/30'
    case 'rejected':   return 'bg-rust-50 text-rust-600 border-rust/30'
    case 'terminated': return 'bg-rust-50 text-rust-700 border-rust/40'
    case 'on_hold':    return 'bg-ink-50 text-slate border-ink-100'
    case 'offer':      return 'bg-stamp-50 text-stamp-600 border-stamp/20'
    case 'interview':  return 'bg-saffron-50 text-saffron-700 border-saffron/30'
    case 'screening':  return 'bg-ink-50 text-ink-600 border-ink-100'
    default:           return 'bg-ink-50 text-ink-600 border-ink-100'
  }
}
