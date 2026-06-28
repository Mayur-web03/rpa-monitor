export const COLUMNS = [
  { key: 'project_id',             label: 'Project ID',     width: 100, type: 'string'   },
  { key: 'project_name',           label: 'Project Name',   width: 190, type: 'string'   },
  { key: 'project_status',         label: 'Status',         width: 105, type: 'string'   },
  { key: 'automation_type',        label: 'Type',           width: 170, type: 'string'   },
  { key: 'department',             label: 'Department',     width: 130, type: 'string'   },
  { key: 'industry',               label: 'Industry',       width: 130, type: 'string'   },
  { key: 'roi_percent',            label: 'ROI %',          width: 100, type: 'percent'  },
  { key: 'annual_savings_usd',     label: 'Annual Savings', width: 140, type: 'currency' },
  { key: 'budget_usd',             label: 'Budget',         width: 130, type: 'currency' },
  { key: 'robots_deployed',        label: 'Robots',         width: 80,  type: 'number'   },
  { key: 'country',                label: 'Country',        width: 110, type: 'string'   },
  { key: 'start_date',             label: 'Start Date',     width: 110, type: 'string'   },
  { key: 'completion_date',        label: 'End Date',       width: 110, type: 'string'   },
  { key: 'employee_hours_saved',   label: 'Hours Saved',    width: 110, type: 'number'   },
  { key: 'ai_enabled',             label: 'AI Enabled',     width: 90,  type: 'string'   },
  { key: 'cloud_deployment',       label: 'Cloud',          width: 80,  type: 'string'   },
  { key: 'company_id',             label: 'Company ID',     width: 100, type: 'string'   },
  { key: 'implementation_partner', label: 'Partner',        width: 160, type: 'string'   },
]

export const ROW_HEIGHT = 36
export const HEADER_HEIGHT = 40
export const OVERSCAN = 5