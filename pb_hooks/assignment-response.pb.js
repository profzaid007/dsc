// Native list/view/create/update and expanded records all pass enrichment.
// Custom assignment endpoints return identifiers/summary data, never raw config.
onRecordEnrich((e) => require(__hooks + "/lib/assignment-response.js").enrich(e), "case_tools")
