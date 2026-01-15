"""
Claude AI prompt templates for contract analysis.
"""

SYSTEM_PROMPT = """You are an expert contract analyst specializing in Revenue Cycle Management (RCM) contracts for healthcare providers. Your task is to extract structured information from contract documents with high accuracy.

Extract information in the following categories:
1. Vendor Information
2. Financial Terms
3. Service Details
4. Contract Terms and Duration
5. Compliance and Legal Terms
6. RCM-Specific Terms

Return your response as a JSON object with the exact structure provided in the schema. If information is not found, use null for the value. Be precise and quote directly from the document when possible."""


def build_analysis_prompt(document_text: str) -> str:
    """
    Build the user prompt for contract analysis.

    Args:
        document_text: Extracted text from the contract document

    Returns:
        Formatted prompt string
    """
    return f"""Please analyze the following RCM contract and extract key information.

DOCUMENT TEXT:
{document_text}

EXTRACTION SCHEMA:
{{
  "vendor_information": {{
    "vendor_name": "string or null",
    "vendor_contact": "string or null",
    "vendor_address": "string or null",
    "vendor_tax_id": "string or null"
  }},
  "financial_terms": {{
    "contract_value": {{
      "total_value": "number or null - total contract value if a fixed amount exists",
      "monthly_fee": "number or null - monthly minimum or flat fee if applicable",
      "percentage_rate": "number or null - percentage of collections/revenue if applicable",
      "per_encounter_fee": "number or null - per-encounter or per-claim fee if applicable",
      "currency": "string (USD, EUR, etc.)",
      "is_variable": "boolean - true if pricing depends on volume/performance",
      "pricing_summary": "string - human-readable summary of the complete pricing structure"
    }},
    "payment_terms": "string or null",
    "payment_schedule": "string or null",
    "pricing_model": "string (percentage, flat fee, per-encounter, tiered, hybrid, etc.)",
    "percentage_of_collections": "number or null",
    "late_payment_penalties": "string or null"
  }},
  "service_details": {{
    "service_scope": "string or null",
    "services_included": ["array of strings"],
    "services_excluded": ["array of strings"],
    "performance_metrics": ["array of strings"],
    "service_level_agreements": "string or null"
  }},
  "contract_terms": {{
    "start_date": "YYYY-MM-DD or null",
    "end_date": "YYYY-MM-DD or null",
    "contract_duration": "string (e.g., '3 years')",
    "automatic_renewal": "boolean or null",
    "renewal_terms": "string or null",
    "termination_clauses": "string or null",
    "notice_period": "string (e.g., '90 days')"
  }},
  "compliance_and_legal": {{
    "hipaa_compliance_mentioned": "boolean",
    "hipaa_requirements": "string or null",
    "data_security_requirements": "string or null",
    "audit_rights": "string or null",
    "liability_limitations": "string or null",
    "indemnification": "string or null",
    "insurance_requirements": "string or null"
  }},
  "rcm_specific": {{
    "billing_services": ["array of strings"],
    "coding_services": ["array of strings"],
    "denial_management": "string or null",
    "ar_follow_up": "string or null",
    "patient_collections": "string or null",
    "expected_collection_rate": "number or null",
    "reporting_frequency": "string or null",
    "technology_platform": "string or null"
  }},
  "additional_notes": "string - any other important terms not captured above"
}}

IMPORTANT:
- Extract dates in YYYY-MM-DD format
- Extract numbers without currency symbols or formatting
- Be precise and quote directly from the document when possible
- If a field cannot be found, return null
- For contract_value: RCM contracts often have complex pricing (monthly fees, percentage of collections, per-encounter fees). Extract ALL applicable pricing components. The "pricing_summary" should be a clear, human-readable description like "Monthly minimum of $1,295 per provider plus 4.5% of collections"
- In "additional_notes", capture any critical terms not fitting the schema
- Return ONLY valid JSON, no additional text or explanation"""


def build_simple_extraction_prompt(document_text: str, fields: list[str]) -> str:
    """
    Build a simpler prompt for extracting specific fields.

    Args:
        document_text: Extracted text from the contract
        fields: List of specific fields to extract

    Returns:
        Formatted prompt string
    """
    fields_str = ", ".join(fields)
    return f"""Extract the following information from this contract: {fields_str}

DOCUMENT TEXT:
{document_text}

Return the information as a JSON object with the field names as keys. If a field is not found, use null."""
