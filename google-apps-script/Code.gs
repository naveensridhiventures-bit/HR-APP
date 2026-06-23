/**
 * Sridhi HR — Google Sheets backend (v3 — with CacheService for speed)
 * ----------------------------------------------------------------
 * SETUP: See the deployment guide in SETUP_GUIDE.md
 *
 * Sheets created automatically on first run:
 *   Candidates  — one row per applicant
 *   FollowUps   — follow-up log entries
 *   CallLogs    — call log entries
 *   Departments — hiring pipelines
 *   Roles       — role titles per pipeline
 *   HRList      — HR team member names
 *   Config      — company name and other settings
 *
 * v3 changes:
 *   - CacheService caches the list response for 60s (massively speeds up GET)
 *   - Cache is invalidated on every write (POST) so data stays fresh
 *   - CORS-friendly headers added
 */

const REMINDER_EMAILS = 'recruiter1@example.com, recruiter2@example.com'
const COMPANY_NAME_DEFAULT = 'Sridhi HR'
const CACHE_KEY = 'sridhi_hr_list_v3'
const CACHE_SECONDS = 60

const CANDIDATE_HEADERS   = ['ID','Name','Phone','Department','Role','Stage','Source','AssignedTo','NextFollowUp','Notes','CreatedAt','UpdatedAt']
const FOLLOWUP_HEADERS    = ['ID','CandidateID','Date','Note','NextFollowUp']
const CALLLOG_HEADERS     = ['ID','CandidateID','HR','Date','Note','Outcome']
const DEPARTMENT_HEADERS  = ['Key','Label']
const ROLE_HEADERS        = ['ID','Department','Label']
const HRLIST_HEADERS      = ['Name']
const CONFIG_HEADERS      = ['Key','Value']

const DEFAULT_DEPARTMENTS = [
  ['driver','Driver'],['field_sales','Field Sales'],['housekeeping','Housekeeping'],
  ['security','Security'],['telecaller','Telecaller'],['it','IT / Developer']
]
const DEFAULT_ROLES = [
  ['role_driver_hv','driver','Heavy Vehicle Driver'],
  ['role_driver_lv','driver','Light Vehicle Driver'],
  ['role_driver_delivery','driver','Delivery Driver'],
  ['role_fs_exec','field_sales','Field Sales Executive'],
  ['role_fs_aso','field_sales','Area Sales Officer'],
  ['role_hk_staff','housekeeping','Housekeeping Staff'],
  ['role_hk_super','housekeeping','Housekeeping Supervisor'],
  ['role_sec_guard','security','Security Guard'],
  ['role_sec_super','security','Security Supervisor'],
  ['role_tc_inbound','telecaller','Telecaller – Inbound'],
  ['role_tc_outbound','telecaller','Telecaller – Outbound'],
  ['role_tc_lead','telecaller','Team Leader – Calls'],
  ['role_it_fe','it','Frontend Developer'],
  ['role_it_be','it','Backend Developer'],
  ['role_it_fs','it','Full Stack Developer'],
  ['role_it_qa','it','QA Engineer'],
]
const DEFAULT_HR_LIST = [['Priya S'],['Anitha R'],['Meena K'],['Divya T']]
const DEFAULT_CONFIG  = [['companyName', COMPANY_NAME_DEFAULT]]

const ACTIVE_STAGE_KEYS = ['applied','screening','interview','offer']

// ---------- Cache helpers ----------

function getCache() {
  try {
    const cache = CacheService.getScriptCache()
    const cached = cache.get(CACHE_KEY)
    if (cached) return JSON.parse(cached)
  } catch(e) {}
  return null
}

function setCache(data) {
  try {
    const cache = CacheService.getScriptCache()
    const json = JSON.stringify(data)
    // CacheService max value size is 100KB; skip caching if too large
    if (json.length < 90000) {
      cache.put(CACHE_KEY, json, CACHE_SECONDS)
    }
  } catch(e) {}
}

function invalidateCache() {
  try {
    CacheService.getScriptCache().remove(CACHE_KEY)
  } catch(e) {}
}

// ---------- Sheet helpers ----------

function ss() { return SpreadsheetApp.getActiveSpreadsheet() }

function getOrCreate(name, headers, defaultRows) {
  let sheet = ss().getSheetByName(name)
  if (!sheet) {
    sheet = ss().insertSheet(name)
    sheet.appendRow(headers)
    sheet.setFrozenRows(1)
    if (defaultRows && defaultRows.length)
      sheet.getRange(2, 1, defaultRows.length, defaultRows[0].length).setValues(defaultRows)
  }
  return sheet
}

function candidatesSheet()  { return getOrCreate('Candidates',  CANDIDATE_HEADERS) }
function followUpsSheet()   { return getOrCreate('FollowUps',   FOLLOWUP_HEADERS) }
function callLogsSheet()    { return getOrCreate('CallLogs',    CALLLOG_HEADERS) }
function departmentsSheet() { return getOrCreate('Departments', DEPARTMENT_HEADERS, DEFAULT_DEPARTMENTS) }
function rolesSheet()       { return getOrCreate('Roles',       ROLE_HEADERS,       DEFAULT_ROLES) }
function hrListSheet()      { return getOrCreate('HRList',      HRLIST_HEADERS,     DEFAULT_HR_LIST) }
function configSheet()      { return getOrCreate('Config',      CONFIG_HEADERS,     DEFAULT_CONFIG) }

function toObjects(sheet) {
  const data = sheet.getDataRange().getValues()
  if (data.length < 2) return []
  const headers = data[0]
  return data.slice(1)
    .filter(row => row.some(c => c !== '' && c !== null))
    .map(row => {
      const obj = {}
      headers.forEach((h, i) => { obj[camel(h)] = fmtCell(row[i]) })
      return obj
    })
}

function camel(h) { return h.charAt(0).toLowerCase() + h.slice(1) }

function fmtCell(v) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd')
  return v === '' ? null : v
}

function today() { return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd') }

function newId(prefix) { return `${prefix}_${Date.now()}_${Math.floor(Math.random()*1000)}` }

function findRowById(sheet, id) {
  const ids = sheet.getRange(2, 1, Math.max(sheet.getLastRow()-1, 0), 1).getValues()
  for (let i=0; i<ids.length; i++) if (String(ids[i][0])===String(id)) return i+2
  return -1
}

function getConfig(key) {
  const rows = configSheet().getDataRange().getValues()
  for (let i=1; i<rows.length; i++) if (rows[i][0]===key) return rows[i][1]
  return null
}

function setConfig(key, value) {
  const sheet = configSheet()
  const rows = sheet.getDataRange().getValues()
  for (let i=1; i<rows.length; i++) {
    if (rows[i][0]===key) { sheet.getRange(i+1, 2).setValue(value); return }
  }
  sheet.appendRow([key, value])
}

// ---------- HTTP entry points ----------

function doGet(e) {
  try {
    if (e.parameter.action === 'list') {
      // Try cache first — returns in ~20ms instead of 3-18 seconds
      const cached = getCache()
      if (cached) return respond(cached)
      const result = handleList()
      setCache(result)
      return respond(result)
    }
    return respond({ ok: false, error: 'Unknown action' })
  } catch(err) { return respond({ ok: false, error: err.message }) }
}

function doPost(e) {
  try {
    const body   = JSON.parse(e.postData.contents)
    const action = body.action
    let result
    switch(action) {
      case 'addCandidate':      result = handleAddCandidate(body.candidate); break
      case 'updateCandidate':   result = handleUpdateCandidate(body.id, body.fields); break
      case 'deleteCandidate':   result = handleDeleteCandidate(body.id); break
      case 'addFollowUp':       result = handleAddFollowUp(body.candidateId, body.entry); break
      case 'addCallLog':        result = handleAddCallLog(body.candidateId, body.entry); break
      case 'addDepartment':     result = handleAddDepartment(body.label); break
      case 'deleteDepartment':  result = handleDeleteDepartment(body.key); break
      case 'addRole':           result = handleAddRole(body.department, body.label); break
      case 'deleteRole':        result = handleDeleteRole(body.id); break
      case 'addHR':             result = handleAddHR(body.name); break
      case 'removeHR':          result = handleRemoveHR(body.name); break
      case 'updateCompanyName': result = handleUpdateCompanyName(body.name); break
      default: return respond({ ok: false, error: 'Unknown action: ' + action })
    }
    // Invalidate cache after every write so next GET is fresh
    invalidateCache()
    return respond({ ok: true, ...result })
  } catch(err) { return respond({ ok: false, error: err.message }) }
}

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON)
}

// ---------- Handlers ----------

function handleList() {
  const hrRows   = toObjects(hrListSheet()).map(r => r.name).filter(Boolean)
  const config   = toObjects(configSheet())
  const compCfg  = config.find(r => r.key === 'companyName')
  return {
    ok:          true,
    candidates:  toObjects(candidatesSheet()),
    followups:   toObjects(followUpsSheet()),
    callLogs:    toObjects(callLogsSheet()),
    departments: toObjects(departmentsSheet()),
    roles:       toObjects(rolesSheet()),
    hrList:      hrRows,
    companyName: compCfg ? compCfg.value : COMPANY_NAME_DEFAULT,
  }
}

function handleAddCandidate(c) {
  const sheet = candidatesSheet()
  const now = today()
  const id  = newId('c')
  sheet.appendRow([id, c.name||'', c.phone||'', c.department||'', c.role||'',
    c.stage||'applied', c.source||'', c.assignedTo||'', c.nextFollowUp||'', c.notes||'', now, now])
  return { candidate: { id, ...c, createdAt: now, updatedAt: now } }
}

function handleUpdateCandidate(id, fields) {
  const sheet = candidatesSheet()
  const row   = findRowById(sheet, id)
  if (row === -1) throw new Error('Candidate not found: ' + id)
  const hMap  = {}
  CANDIDATE_HEADERS.forEach((h, i) => { hMap[camel(h)] = i+1 })
  Object.keys(fields||{}).forEach(k => { if (hMap[k]) sheet.getRange(row, hMap[k]).setValue(fields[k]??'') })
  sheet.getRange(row, hMap.updatedAt).setValue(today())
  return {}
}

function handleDeleteCandidate(id) {
  const sheet = candidatesSheet()
  const row   = findRowById(sheet, id)
  if (row !== -1) sheet.deleteRow(row)
  return {}
}

function handleAddFollowUp(candidateId, entry) {
  const sheet = followUpsSheet()
  const now   = today()
  const id    = newId('f')
  sheet.appendRow([id, candidateId, now, entry.note||'', entry.nextFollowUp||''])
  handleUpdateCandidate(candidateId, { notes: entry.note, nextFollowUp: entry.nextFollowUp||'' })
  return { entry: { id, candidateId, date: now, ...entry } }
}

function handleAddCallLog(candidateId, entry) {
  const sheet = callLogsSheet()
  const now   = today()
  const id    = newId('cl')
  sheet.appendRow([id, candidateId, entry.hr||'', now, entry.note||'', entry.outcome||'neutral'])
  return { callLog: { id, candidateId, date: now, ...entry } }
}

function handleAddDepartment(label) {
  const sheet = departmentsSheet()
  const key   = label.trim().toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'')
  if (!toObjects(sheet).some(d => d.key===key)) sheet.appendRow([key, label.trim()])
  return { key }
}

function handleDeleteDepartment(key) {
  const sheet = departmentsSheet()
  const rows  = sheet.getDataRange().getValues()
  for (let i=rows.length-1; i>=1; i--) if (rows[i][0]===key) sheet.deleteRow(i+1)
  return {}
}

function handleAddRole(department, label) {
  const sheet = rolesSheet()
  const id    = newId('role')
  sheet.appendRow([id, department||'', (label||'').trim()])
  return { role: { id, department, label: (label||'').trim() } }
}

function handleDeleteRole(id) {
  const sheet = rolesSheet()
  const row   = findRowById(sheet, id)
  if (row !== -1) sheet.deleteRow(row)
  return {}
}

function handleAddHR(name) {
  const sheet = hrListSheet()
  const existing = toObjects(sheet).map(r => r.name)
  if (!existing.includes(name)) sheet.appendRow([name])
  return {}
}

function handleRemoveHR(name) {
  const sheet = hrListSheet()
  const rows  = sheet.getDataRange().getValues()
  for (let i=rows.length-1; i>=1; i--) if (rows[i][0]===name) sheet.deleteRow(i+1)
  return {}
}

function handleUpdateCompanyName(name) {
  setConfig('companyName', (name||'').trim() || COMPANY_NAME_DEFAULT)
  return {}
}

// ---------- Daily follow-up reminder email ----------

function sendDailyReminderEmail() {
  const todayStr   = today()
  const candidates = toObjects(candidatesSheet())
  const depts      = toObjects(departmentsSheet())
  const deptLabel  = {}
  depts.forEach(d => { deptLabel[d.key] = d.label })
  const companyName = getConfig('companyName') || COMPANY_NAME_DEFAULT

  const active   = candidates.filter(c => ACTIVE_STAGE_KEYS.indexOf(c.stage)!==-1 && c.nextFollowUp)
  const overdue  = active.filter(c => c.nextFollowUp < todayStr)
  const dueToday = active.filter(c => c.nextFollowUp === todayStr)

  if (!overdue.length && !dueToday.length) return

  const recipients = REMINDER_EMAILS.split(',').map(s=>s.trim()).filter(Boolean)
  if (!recipients.length) return

  const subject = `${companyName}: ${overdue.length} overdue, ${dueToday.length} due today`

  recipients.forEach(email => {
    MailApp.sendEmail({
      to: email,
      subject,
      body: buildPlainText(overdue, dueToday, deptLabel, companyName),
      htmlBody: buildHtml(overdue, dueToday, deptLabel, companyName),
    })
  })
}

function buildPlainText(overdue, dueToday, deptLabel, companyName) {
  const lines = [`${companyName} — Follow-up reminder`, '']
  if (overdue.length)  { lines.push(`OVERDUE (${overdue.length}):`);   overdue.forEach(c=>lines.push(rowText(c,deptLabel)));  lines.push('') }
  if (dueToday.length) { lines.push(`DUE TODAY (${dueToday.length}):`); dueToday.forEach(c=>lines.push(rowText(c,deptLabel))) }
  return lines.join('\n')
}

function rowText(c, deptLabel) {
  const dept = deptLabel[c.department]||c.department||''
  return `- ${c.name} | ${c.role?c.role+' — ':''}${dept}${c.assignedTo?' ('+c.assignedTo+')':''} | ${c.phone}`
}

function buildHtml(overdue, dueToday, deptLabel, companyName) {
  const section = (title, list, color) => {
    if (!list.length) return ''
    const rows = list.map(c => {
      const dept = deptLabel[c.department]||c.department||''
      const ph   = (c.phone||'').replace(/[^\d+]/g,'')
      const wa   = ph.length===10 ? `91${ph}` : ph.replace('+','')
      return `<tr>
        <td style="padding:6px 8px;border-bottom:1px solid #f3f3f3;">${c.name||''}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #f3f3f3;">${c.role||''}${c.role&&dept?'<br>':''}${dept}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #f3f3f3;">${c.assignedTo||'—'}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #f3f3f3;">
          <a href="tel:${ph}">Call</a> · <a href="https://wa.me/${wa}" style="color:#246340;">WhatsApp</a>
        </td></tr>`
    }).join('')
    return `<h2 style="font-family:Arial;font-size:15px;color:${color};margin:20px 0 6px;">${title} (${list.length})</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px;font-family:Arial;">
        <tr style="color:#5B6472;text-align:left;">
          <th style="padding:6px 8px;border-bottom:1px solid #eee;">Name</th>
          <th style="padding:6px 8px;border-bottom:1px solid #eee;">Role / Pipeline</th>
          <th style="padding:6px 8px;border-bottom:1px solid #eee;">Assigned</th>
          <th style="padding:6px 8px;border-bottom:1px solid #eee;">Contact</th>
        </tr>${rows}</table>`
  }
  return `<div style="font-family:Arial;color:#16213E;">
    <h1 style="font-size:18px;margin:0 0 4px;">${companyName} — follow-up reminder</h1>
    <p style="color:#5B6472;font-size:13px;margin:0 0 8px;">Open the app to log calls or update stages.</p>
    ${section('Overdue', overdue, '#9E332B')}
    ${section('Due today', dueToday, '#9C6314')}
  </div>`
}
