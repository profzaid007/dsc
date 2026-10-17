import type { Definition, Answers, Population, Result, Score, Rule } from "./types"

const fail = (message: string): never => { throw new Error(message) }
const finite = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n)
const code = (s: unknown): s is string => typeof s === "string" && /^[A-Za-z][A-Za-z0-9_]{0,39}$/.test(s)
const text = (s: unknown, max = 4000) => typeof s === "string" && s.trim().length > 0 && s.length <= max
const methods = ["sum", "mean", "percentage", "weighted_mean", "count", "formula", "standard"]
const variables = ["SUM", "MEAN", "COUNT", "ANSWERED", "TOTAL", "WEIGHTED_SUM", "WEIGHT_SUM", "MIN", "MAX", "POSITIVE_COUNT"]

/** Arithmetic grammar, never JavaScript: no properties, assignments or code execution. */
export function formula(source: string, values: Record<string, number>, unknownAsOne = false): number {
  if (typeof source !== "string" || !source.trim() || source.length > 500) return fail("Invalid formula / المعادلة غير صالحة")
  const tokens = source.match(/(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|[A-Za-z][A-Za-z0-9_]*|[()+\-*/,]/g) || []
  if (tokens.join("") !== source.replace(/\s/g, "")) return fail("Unsupported formula characters")
  let i = 0, depth = 0
  const checked = (n: number) => finite(n) ? n : fail("Undefined formula result (division by zero or overflow) / نتيجة معادلة غير معرّفة")
  function atom(): number {
    if (++depth > 50) return fail("Formula nesting limit")
    const t = tokens[i++]
    let n: number
    if (t === "+" || t === "-") n = (t === "-" ? -1 : 1) * atom()
    else if (t === "(") { n = expression(); if (tokens[i++] !== ")") return fail("Missing closing parenthesis") }
    else if (t && /^(?:\d|\.)/.test(t)) n = Number(t)
    else if (t && code(t)) {
      if (tokens[i] === "(") {
        i++; const args = [expression()]
        while (tokens[i] === ",") { i++; args.push(expression()) }
        if (tokens[i++] !== ")") return fail("Missing function parenthesis")
        if (t === "min" || t === "max") n = t === "min" ? Math.min(...args) : Math.max(...args)
        else if (args.length === 1 && ["abs", "sqrt", "round"].includes(t)) n = t === "abs" ? Math.abs(args[0]) : t === "sqrt" ? Math.sqrt(args[0]) : Math.round(args[0])
        else return fail("Unknown function: " + t)
      } else if (Object.prototype.hasOwnProperty.call(values, t)) n = values[t]
      else if (unknownAsOne) n = 1
      else return fail("Unknown or unavailable score: " + t)
    } else return fail("Expected number or score variable")
    depth--; return checked(n)
  }
  function product(): number { let n = atom(); while (tokens[i] === "*" || tokens[i] === "/") { const op = tokens[i++], rhs = atom(); if (op === "/" && rhs === 0) fail("Division by zero"); n = checked(op === "*" ? n * rhs : n / rhs) } return n }
  function expression(): number { let n = product(); while (tokens[i] === "+" || tokens[i] === "-") { const op = tokens[i++], rhs = product(); n = checked(op === "+" ? n + rhs : n - rhs) } return n }
  const result = expression()
  if (i !== tokens.length) return fail("Unexpected formula token")
  return checked(result)
}
function populationValid(p?: Population) {
  if (!p) return
  if (typeof p !== "object" || Array.isArray(p)) fail("Invalid population")
  for (const n of [p.minAge, p.maxAge]) if (n !== undefined && (!finite(n) || n < 0 || n > 150)) fail("Invalid age range")
  if ((p.minAge ?? 0) > (p.maxAge ?? 150)) fail("Reversed age range")
  for (const v of [p.sex, p.language, p.group]) if (v !== undefined && (typeof v !== "string" || v.length > 100)) fail("Invalid population selector")
}
function match(p: Population | undefined, person: Population & { age?: number }): boolean {
  if (!p) return true
  if ((p.minAge !== undefined || p.maxAge !== undefined) && (!finite(person.age) || person.age < (p.minAge ?? 0) || person.age > (p.maxAge ?? 150))) return false
  return ["sex", "language", "group"].every(k => !p[k as keyof Population] || p[k as keyof Population] === person[k as keyof Population])
}
function specificity(p?: Population) { return p ? Object.values(p).filter(v => v !== undefined && v !== "").length : 0 }
function compare(n: number, op: string, limit: number): boolean { return op === "gt" ? n > limit : op === "gte" ? n >= limit : op === "lt" ? n < limit : op === "lte" ? n <= limit : n === limit }
function validateRule(rule: Rule, names: string[]) {
  if (!rule || !methods.includes(rule.method)) fail("Unknown scoring method")
  if (rule.zeroDenominator !== undefined && (rule.method !== "formula" || rule.zeroDenominator !== "not_applicable" || !text(rule.notApplicableLabel, 500))) fail("Invalid zero-denominator policy")
  if (rule.minAnswered !== undefined && (!Number.isInteger(rule.minAnswered) || rule.minAnswered < 0)) fail("Invalid minimum answers")
  if (rule.method === "formula") {
    const vars = Object.fromEntries([...variables, ...names].map(n => [n, 1]))
    // Validate symbols and grammar independently of sample arithmetic (e.g. SUM/(COUNT-1)).
    try { formula(rule.formula || "", vars) } catch (e) { if (!(e instanceof Error) || !(e.message.startsWith("Undefined formula result") || e.message === "Division by zero")) throw e }
  }
  if (rule.method === "count" && (!finite(rule.threshold) || !["gt", "gte", "lt", "lte", "eq"].includes(rule.operator || ""))) fail("Count requires a condition")
  if (rule.method === "standard") {
    if (!Array.isArray(rule.normTable) || !rule.normTable.length) fail("Standard scores require a normative table")
    for (const r of rule.normTable || []) { if (!finite(r.min) || !finite(r.max) || !finite(r.score) || r.min >= r.max) fail("Invalid normative interval"); populationValid(r.population) }
  }
}
export function validateDefinition(d: Definition): void {
  if (!d || typeof d !== "object" || !text(d.name, 200) || !code(d.code) || !text(d.version, 40)) fail("Name, valid code and version are required / الاسم والرمز والإصدار مطلوبة")
  for (const v of [d.description, d.audience, d.instructions, d.language, d.type]) if (typeof v !== "string" || v.length > 12000) fail("Invalid assessment text")
  for (const v of [d.referencePeriod, d.respondentNotice]) if (v !== undefined && (typeof v !== "string" || v.length > 12000)) fail("Invalid introduction text")
  if (!finite(d.duration) || d.duration < 0 || d.duration > 1440) fail("Invalid duration")
  if (!["reject", "omit", "zero"].includes(d.missingPolicy) || !["higher_problem", "higher_better", "middle"].includes(d.direction)) fail("Invalid missing-answer policy or direction")
  for (const key of ["dimensions", "answerSets", "questions", "indicators", "bands", "alerts"] as const) if (!Array.isArray(d[key]) || d[key].length > (key === "questions" ? 2000 : 500)) fail("Invalid or excessive " + key)
  if (!d.questions.length || !d.answerSets.length) fail("At least one question and answer set are required")
  if (!Number.isInteger(d.minAnswered) || d.minAnswered < 1 || d.minAnswered > d.questions.length) fail("Minimum answers must be between 1 and question count")
  const unique = (items: { id: string }[]) => { const ids = items.map(x => x.id); if (ids.some(x => !code(x)) || new Set(ids).size !== ids.length) fail("Identifiers must be unique letters/numbers with no spaces") }
  unique(d.dimensions); unique(d.answerSets); unique(d.questions); unique(d.indicators); unique(d.bands); unique(d.alerts)
  const scoreNames = ["overall", ...d.dimensions.map(x => x.id), ...d.indicators.map(x => x.id)]
  if (new Set(scoreNames).size !== scoreNames.length || scoreNames.slice(1).some(x => variables.includes(x))) fail("Duplicate or reserved score code")
  for (const set of d.answerSets) {
    if (!text(set.name, 200) || !Array.isArray(set.options) || set.options.length < 2 || set.options.length > 100) fail("Answer sets need a name and 2–100 options")
    unique(set.options)
    if (set.options.some(o => !text(o.label, 500) || !finite(o.score) || Math.abs(o.score) > 1000000)) fail("Invalid option label or score")
    if (new Set(set.options.map(o => o.score)).size < 2) fail("Answer score range must be nonzero")
  }
  for (const dim of d.dimensions) {
    if (!text(dim.name, 200) || typeof dim.includeInTotal !== "boolean") fail("Invalid dimension")
    const seen = new Set([dim.id]); let parent = dim.parent
    while (parent) { const p = d.dimensions.find(x => x.id === parent); if (!p || seen.has(parent)) fail("Invalid/cyclic parent dimension"); seen.add(parent); parent = p!.parent }
    validateRule(dim.rule, scoreNames)
  }
  for (const q of d.questions) {
    if (!text(q.text) || !Number.isInteger(q.order) || q.order < 1 || !finite(q.weight) || q.weight <= 0 || q.weight > 1000 || typeof q.reverse !== "boolean" || typeof q.critical !== "boolean") fail("Invalid question or weight")
    if (!d.answerSets.some(s => s.id === q.answerSet) || !Array.isArray(q.dimensions)) fail("Unknown answer set or dimension list")
    unique(q.dimensions)
    for (const link of q.dimensions) if (!d.dimensions.some(x => x.id === link.id) || !finite(link.weight) || link.weight <= 0 || link.weight > 1000) fail("Unknown dimension or invalid link weight")
  }
  if (new Set(d.questions.map(q => q.order)).size !== d.questions.length) fail("Question ordering must be unique")
  for (const dim of d.dimensions) if (!d.questions.some(q => q.dimensions.some(x => x.id === dim.id))) fail("Dimension has no linked questions: " + dim.id)
  validateRule(d.totalRule, scoreNames)
  for (const x of d.indicators) { if (!text(x.name, 200)) fail("Indicator name required"); validateRule(x.rule, scoreNames) }
  for (const band of d.bands) {
    if (!scoreNames.includes(band.target) || !finite(band.min) || !finite(band.max) || band.min >= band.max || !text(band.label, 500) || (band.includeMax !== undefined && typeof band.includeMax !== "boolean")) fail("Invalid interpretation band")
    populationValid(band.population)
  }
  for (const alert of d.alerts) if (![...scoreNames, ...d.questions.map(q => "question:" + q.id)].includes(alert.target) || !["gt", "gte", "lt", "lte", "eq"].includes(alert.operator) || !finite(alert.threshold) || !text(alert.message, 1000)) fail("Invalid alert rule")
}

export function calculate(d: Definition, answers: Answers, person: Population & { age?: number } = {}): Result {
  validateDefinition(d)
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) fail("Answers must be an object")
  for (const id of Object.keys(answers)) if (!d.questions.some(q => q.id === id)) fail("Unknown question: " + id)
  const steps = d.questions.map(q => {
    const options = d.answerSets.find(s => s.id === q.answerSet)!.options
    const id = answers[q.id]; const option = options.find(o => o.id === id)
    if (id !== undefined && id !== "" && !option) fail("Unknown answer option: " + q.id)
    const raw = option ? option.score : null
    const lo = Math.min(...options.map(o => o.score)), hi = Math.max(...options.map(o => o.score))
    return { question: q.id, raw, adjusted: raw === null ? (d.missingPolicy === "zero" ? 0 : null) : q.reverse ? lo + hi - raw : raw, weight: q.weight, omitted: !option, lo, hi }
  })
  const answered = steps.filter(s => !s.omitted).length
  const complete = answered >= d.minAnswered && (d.missingPolicy !== "reject" || answered === d.questions.length)
  const scores: Score[] = [], pending: { score: Score; rule: Rule }[] = []
  const dimensions = [{ id: "overall", name: d.name, rule: d.totalRule }, ...d.dimensions, ...d.indicators]
  for (const dimension of dimensions) {
    const isDimension = d.dimensions.some(x => x.id === dimension.id)
    const members = steps.filter(s => {
      const q = d.questions.find(q => q.id === s.question)!
      return isDimension ? q.dimensions.some(x => x.id === dimension.id) : !q.dimensions.length || q.dimensions.some(l => d.dimensions.find(x => x.id === l.id)!.includeInTotal)
    })
    const included = members.filter(s => s.adjusted !== null)
    const weight = (s: typeof steps[number]) => s.weight * (isDimension ? d.questions.find(q => q.id === s.question)!.dimensions.find(l => l.id === dimension.id)!.weight : 1)
    const n = members.filter(s => !s.omitted).length
    const sum = included.reduce((n, s) => n + s.adjusted!, 0), weightedSum = included.reduce((n, s) => n + s.adjusted! * weight(s), 0), weightSum = included.reduce((n, s) => n + weight(s), 0)
    const min = included.reduce((n, s) => n + s.lo, 0), max = included.reduce((n, s) => n + s.hi, 0)
    const valid = n >= (dimension.rule.minAnswered ?? 1) && (d.missingPolicy !== "reject" || n === members.length)
    const score: Score = { id: dimension.id, name: dimension.name, value: null, answered: n, total: members.length, sum, weightedSum, weightSum, min, max, positiveCount: included.filter(s => s.adjusted! > 0).length, interpretation: "", recommendation: "", complete: valid }
    if (valid) {
      const method = dimension.rule.method
      if (method === "sum") score.value = sum
      if (method === "mean") score.value = included.length ? sum / included.length : null
      if (method === "percentage") score.value = max > min ? (sum - min) / (max - min) * 100 : null
      if (method === "weighted_mean") score.value = weightSum ? weightedSum / weightSum : null
      if (method === "count") score.value = included.filter(s => compare(s.adjusted!, dimension.rule.operator!, dimension.rule.threshold!)).length
      if (method === "formula" || method === "standard") pending.push({ score, rule: dimension.rule })
    }
    scores.push(score)
  }
  let passes = 0
  while (pending.length) {
    if (++passes > scores.length + 1) fail("Cyclic or unavailable formula score dependency")
    let progress = false
    for (let i = pending.length - 1; i >= 0; i--) {
      const { score: s, rule } = pending[i]
      const vars: Record<string, number> = { SUM: s.sum, MEAN: s.sum / (d.missingPolicy === "zero" ? s.total : s.answered), COUNT: d.missingPolicy === "zero" ? s.total : s.answered, ANSWERED: s.answered, TOTAL: s.total, WEIGHTED_SUM: s.weightedSum, WEIGHT_SUM: s.weightSum, MIN: s.min, MAX: s.max, POSITIVE_COUNT: s.positiveCount }
      for (const other of scores) if (other.id !== s.id && other.value !== null) vars[other.id] = other.value
      try {
        if (rule.method === "formula") s.value = formula(rule.formula!, vars)
        else {
          const matches = (rule.normTable || []).filter(r => match(r.population, person) && s.sum >= r.min && s.sum < r.max).sort((a, b) => specificity(b.population) - specificity(a.population))
          if (matches.length > 1 && specificity(matches[0].population) === specificity(matches[1].population)) fail("Ambiguous normative table")
          s.value = matches[0]?.score ?? null
          if (!matches.length) { s.complete = false; s.recommendation = "No matching normative interval / لا يوجد معيار مطابق" }
        }
        pending.splice(i, 1); progress = true
      } catch (e) {
        if (e instanceof Error && e.message === "Division by zero" && rule.zeroDenominator === "not_applicable") {
          s.value = null; s.notApplicable = true; s.interpretation = rule.notApplicableLabel!
          pending.splice(i, 1); progress = true; continue
        }
        if (!(e instanceof Error) || !e.message.startsWith("Unknown or unavailable score:")) throw e
        const dependency = scores.find(x => x.id === e.message.slice("Unknown or unavailable score: ".length))
        if (dependency && (!dependency.complete || dependency.notApplicable)) {
          s.complete = false
          pending.splice(i, 1); progress = true
        }
      }
    }
    if (!progress) fail("Cyclic or unavailable formula score dependency")
  }
  for (const s of scores) {
    if (s.value !== null && !finite(s.value)) fail("Invalid score result")
    const bands = d.bands.filter(b => b.target === s.id && match(b.population, person) && s.value !== null && s.value >= b.min && (s.value < b.max || !!b.includeMax && s.value === b.max)).sort((a, b) => specificity(b.population) - specificity(a.population))
    if (bands.length > 1 && specificity(bands[0].population) === specificity(bands[1].population)) fail("Overlapping interpretation bands: " + s.id)
    if (bands[0]) { s.interpretation = bands[0].label; s.recommendation = bands[0].recommendation || "" }
  }
  const overallComplete = complete && scores.every(s => s.complete && (s.value !== null || s.notApplicable === true))
  const alerts: Result["alerts"] = []
  if (!overallComplete) alerts.push({ message: "Incomplete assessment / التقييم غير مكتمل", recommendation: "Review required responses and matching norms / راجع الإجابات المطلوبة والمعايير المطابقة" })
  for (const a of d.alerts) {
    const value = a.target.startsWith("question:") ? steps.find(s => s.question === a.target.slice(9))?.adjusted : scores.find(s => s.id === a.target)?.value
    if (value !== null && value !== undefined && compare(value, a.operator, a.threshold)) alerts.push({ message: a.message, recommendation: a.recommendation || "" })
  }
  return { complete: overallComplete, answered, total: d.questions.length, scores, alerts, steps: steps.map(s => ({ question: s.question, raw: s.raw, adjusted: s.adjusted, weight: s.weight, omitted: s.omitted })), version: d.version, direction: d.direction }
}
