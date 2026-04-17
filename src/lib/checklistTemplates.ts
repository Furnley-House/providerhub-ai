// Checklist field templates per plan type — sourced from the Furnley House
// Ceding Checklist v4 spreadsheet. Each plan type only renders its relevant fields.

export type FieldType = "text" | "number" | "currency" | "percent" | "yesno" | "date" | "select";

export interface ChecklistFieldDef {
  key: string;
  label: string;
  type: FieldType;
  section: string;
  options?: string[];
  required?: boolean;
  /** Optional condition: only show when another field equals one of these values */
  showIf?: { key: string; in: string[] };
  hint?: string;
}

const COMMON_NOTES: ChecklistFieldDef = {
  key: "notes",
  label: "Notes",
  type: "text",
  section: "Notes",
};

export const CHECKLIST_TEMPLATES: Record<string, ChecklistFieldDef[]> = {
  ISA: [
    { key: "isa_type", label: "ISA Type", type: "select", section: "Plan Details", options: ["Stocks & Shares", "Cash"], required: true },
    { key: "current_provider", label: "Current Provider", type: "text", section: "Plan Details", required: true },
    { key: "current_value", label: "Current Value", type: "currency", section: "Valuation", required: true },
    { key: "amc", label: "Annual Management Charge", type: "percent", section: "Charges" },
    { key: "platform_charge", label: "Platform Charge", type: "percent", section: "Charges" },
    { key: "ongoing_charge", label: "Total Annual Ongoing Charge", type: "percent", section: "Charges" },
    { key: "funds_held", label: "Fund(s) Held", type: "text", section: "Holdings" },
    { key: "subscription_ytd", label: "Subscription Year-to-Date", type: "currency", section: "Allowances" },
    { key: "annual_allowance_remaining", label: "Annual Allowance Remaining", type: "currency", section: "Allowances" },
    { key: "nominee_beneficiary", label: "Nomination of Beneficiary", type: "yesno", section: "Other" },
    { key: "transfer_restrictions", label: "Transfer-in Restrictions", type: "text", section: "Other" },
    COMMON_NOTES,
  ],

  GIA: [
    { key: "current_provider", label: "Current Provider", type: "text", section: "Plan Details", required: true },
    { key: "current_value", label: "Current Value", type: "currency", section: "Valuation", required: true },
    { key: "amc", label: "Annual Management Charge", type: "percent", section: "Charges" },
    { key: "platform_charge", label: "Platform Charge", type: "percent", section: "Charges" },
    { key: "ongoing_charge", label: "Total Annual Ongoing Charge", type: "percent", section: "Charges" },
    { key: "funds_held", label: "Fund(s) Held", type: "text", section: "Holdings" },
    { key: "cost_basis", label: "Cost Basis / Book Value", type: "currency", section: "Tax" },
    { key: "unrealised_gain_loss", label: "Unrealised Gain/Loss", type: "currency", section: "Tax" },
    COMMON_NOTES,
  ],

  "Personal Pension": [
    {
      key: "pension_subtype",
      label: "Pension Sub-type",
      type: "select",
      section: "Plan Details",
      options: ["Personal Pension", "SIPP", "Stakeholder", "Workplace", "Group"],
      required: true,
    },
    { key: "current_provider", label: "Current Provider", type: "text", section: "Plan Details", required: true },
    { key: "current_value", label: "Current Value", type: "currency", section: "Valuation", required: true },
    { key: "transfer_value", label: "Transfer Value", type: "currency", section: "Valuation" },
    { key: "protected_tfc_pct", label: "Protected Tax-Free Cash %", type: "percent", section: "Benefits" },
    { key: "enhanced_tfc_amount", label: "Enhanced Tax-Free Cash Amount", type: "currency", section: "Benefits" },
    {
      key: "employer_contribution",
      label: "Employer Contribution",
      type: "text",
      section: "Contributions",
      showIf: { key: "pension_subtype", in: ["Workplace", "Group"] },
      hint: "£ or % per period",
    },
    { key: "employee_contribution", label: "Employee Contribution", type: "text", section: "Contributions" },
    { key: "amc", label: "Annual Management Charge", type: "percent", section: "Charges" },
    { key: "platform_charge", label: "Platform Charge", type: "percent", section: "Charges" },
    { key: "ongoing_charge", label: "Total Annual Ongoing Charge", type: "percent", section: "Charges" },
    { key: "funds_held", label: "Fund(s) Held", type: "text", section: "Holdings" },
    { key: "expression_of_wishes", label: "Expression of Wishes / Beneficiary Nomination", type: "yesno", section: "Beneficiaries" },
    { key: "selected_retirement_age", label: "Selected Retirement Age / Date", type: "text", section: "Benefits" },
    { key: "safeguarded_benefits", label: "Safeguarded / Guaranteed Benefits", type: "yesno", section: "Benefits" },
    { key: "waiver_of_premium", label: "Waiver of Premium", type: "yesno", section: "Other" },
    COMMON_NOTES,
  ],

  Bond: [
    {
      key: "bond_type",
      label: "Bond Type",
      type: "select",
      section: "Plan Details",
      options: ["Investment Bond", "Offshore Bond"],
      required: true,
    },
    { key: "current_provider", label: "Current Provider", type: "text", section: "Plan Details", required: true },
    { key: "current_value", label: "Current Value", type: "currency", section: "Valuation", required: true },
    { key: "original_investment", label: "Original Investment Amount", type: "currency", section: "Valuation" },
    { key: "chargeable_gain", label: "Gain / Chargeable Gain", type: "currency", section: "Tax" },
    { key: "number_of_segments", label: "Number of Segments", type: "number", section: "Segments" },
    { key: "surrender_value", label: "Surrender Value", type: "currency", section: "Segments" },
    { key: "segment_surrender_value", label: "Segment Surrender Value", type: "currency", section: "Segments" },
    { key: "amc", label: "Annual Management Charge", type: "percent", section: "Charges" },
    { key: "ongoing_charge", label: "Total Annual Ongoing Charge", type: "percent", section: "Charges" },
    { key: "funds_held", label: "Fund(s) Held", type: "text", section: "Holdings" },
    { key: "nominee_beneficiary", label: "Nomination of Beneficiary", type: "yesno", section: "Other" },
    { key: "assignment_trust", label: "Assignment / Trust", type: "text", section: "Other" },
    COMMON_NOTES,
  ],

  "Final Salary": [
    { key: "scheme_name", label: "Scheme Name", type: "text", section: "Scheme", required: true },
    { key: "scheme_administrator", label: "Scheme Administrator / Provider", type: "text", section: "Scheme", required: true },
    { key: "normal_retirement_date", label: "Normal Retirement Date", type: "date", section: "Scheme" },
    { key: "accrued_pension", label: "Accrued Pension (£/year at NRD)", type: "currency", section: "Benefits" },
    { key: "transfer_value", label: "Transfer Value (CETV)", type: "currency", section: "Benefits", required: true },
    { key: "cetv_valid_until", label: "CETV Valid Until", type: "date", section: "Benefits" },
    { key: "revaluation_rate", label: "Revaluation Rate", type: "percent", section: "Benefits" },
    { key: "spouse_pension_pct", label: "Spouse / Dependant Pension %", type: "percent", section: "Death Benefits" },
    { key: "death_in_service_lump_sum", label: "Lump Sum on Death in Service", type: "text", section: "Death Benefits", hint: "£ amount or x salary" },
    { key: "pcls_option", label: "Pension Commencement Lump Sum Option", type: "yesno", section: "Benefits" },
    {
      key: "indexation_in_payment",
      label: "Indexation in Payment",
      type: "select",
      section: "Benefits",
      options: ["CPI", "RPI", "Fixed", "None"],
    },
    { key: "safeguarded_benefits", label: "Safeguarded Benefits Flag", type: "yesno", section: "Benefits", hint: "Always Yes for DB" },
    COMMON_NOTES,
  ],

  Protection: [
    {
      key: "protection_subtype",
      label: "Plan Type",
      type: "select",
      section: "Plan Details",
      options: ["Term", "Whole of Life", "Critical Illness", "Income Protection"],
      required: true,
    },
    { key: "current_provider", label: "Current Provider", type: "text", section: "Plan Details", required: true },
    { key: "sum_assured", label: "Sum Assured", type: "currency", section: "Cover" },
    { key: "monthly_premium", label: "Monthly Premium", type: "currency", section: "Premium" },
    { key: "policy_term", label: "Policy Term (years / to age)", type: "text", section: "Cover" },
    { key: "expiry_date", label: "Expiry Date", type: "date", section: "Cover" },
    { key: "waiver_of_premium", label: "Waiver of Premium", type: "yesno", section: "Premium" },
    { key: "in_trust", label: "In Trust", type: "yesno", section: "Other" },
    { key: "nominee_beneficiary", label: "Nomination of Beneficiary", type: "yesno", section: "Other" },
    {
      key: "premium_basis",
      label: "Guaranteed / Reviewable Premiums",
      type: "select",
      section: "Premium",
      options: ["Guaranteed", "Reviewable"],
    },
    COMMON_NOTES,
  ],
};

export function getTemplate(planType: string): ChecklistFieldDef[] {
  return CHECKLIST_TEMPLATES[planType] ?? CHECKLIST_TEMPLATES["Personal Pension"];
}

/** Section ordering preserved as encountered in the template */
export function groupBySection(fields: ChecklistFieldDef[]): { section: string; fields: ChecklistFieldDef[] }[] {
  const order: string[] = [];
  const map: Record<string, ChecklistFieldDef[]> = {};
  for (const f of fields) {
    if (!map[f.section]) {
      map[f.section] = [];
      order.push(f.section);
    }
    map[f.section].push(f);
  }
  return order.map((s) => ({ section: s, fields: map[s] }));
}
