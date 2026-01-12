"""
Claude API service for contract analysis.
"""

import json
import logging
from typing import Dict, Any, Optional
from anthropic import Anthropic, APIError
from app.config import settings
from app.utils.prompts import SYSTEM_PROMPT, build_analysis_prompt

logger = logging.getLogger(__name__)


class ClaudeServiceError(Exception):
    """Custom exception for Claude service errors."""
    pass


class ClaudeAnalysisService:
    """Service for analyzing contracts using Claude AI."""

    def __init__(self):
        """Initialize the Claude client."""
        self.client = Anthropic(api_key=settings.anthropic_api_key)
        self.model = "claude-opus-4-5-20251101"  # Latest Opus model
        logger.info(f"Initialized ClaudeAnalysisService with model: {self.model}")

    async def analyze_contract(self, document_text: str) -> Dict[str, Any]:
        """
        Analyze a contract document and extract structured information.

        Args:
            document_text: Extracted text from the contract

        Returns:
            Dictionary containing:
                - extracted_data: Structured extraction results
                - model: Claude model used
                - prompt_tokens: Input tokens used
                - completion_tokens: Output tokens used

        Raises:
            ClaudeServiceError: If analysis fails
        """
        try:
            logger.info(f"Starting contract analysis, text length: {len(document_text)} characters")

            # Build the analysis prompt
            prompt = build_analysis_prompt(document_text)

            # Call Claude API
            message = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                temperature=0,  # Deterministic for data extraction
                system=SYSTEM_PROMPT,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            # Extract the response text
            response_text = message.content[0].text
            logger.info(f"Received response from Claude: {len(response_text)} characters")

            # Parse JSON response
            try:
                extracted_data = json.loads(response_text)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON response: {e}")
                logger.error(f"Response text: {response_text[:500]}...")
                # Try to extract JSON from markdown code blocks
                if "```json" in response_text:
                    json_start = response_text.find("```json") + 7
                    json_end = response_text.find("```", json_start)
                    json_str = response_text[json_start:json_end].strip()
                    extracted_data = json.loads(json_str)
                else:
                    raise ClaudeServiceError(f"Invalid JSON response from Claude: {str(e)}")

            # Return analysis results
            result = {
                "extracted_data": extracted_data,
                "model": self.model,
                "prompt_tokens": message.usage.input_tokens,
                "completion_tokens": message.usage.output_tokens
            }

            logger.info(
                f"Analysis complete. Tokens used: {message.usage.input_tokens} input, "
                f"{message.usage.output_tokens} output"
            )

            return result

        except APIError as e:
            logger.error(f"Claude API error: {str(e)}")
            raise ClaudeServiceError(f"Claude API error: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error during analysis: {str(e)}")
            raise ClaudeServiceError(f"Analysis failed: {str(e)}")

    async def extract_specific_fields(
        self,
        document_text: str,
        fields: list[str]
    ) -> Dict[str, Any]:
        """
        Extract specific fields from a contract.

        Args:
            document_text: Extracted text from the contract
            fields: List of field names to extract

        Returns:
            Dictionary with extracted field values

        Raises:
            ClaudeServiceError: If extraction fails
        """
        try:
            from app.utils.prompts import build_simple_extraction_prompt

            prompt = build_simple_extraction_prompt(document_text, fields)

            message = self.client.messages.create(
                model=self.model,
                max_tokens=2048,
                temperature=0,
                system=SYSTEM_PROMPT,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            response_text = message.content[0].text
            extracted_data = json.loads(response_text)

            return extracted_data

        except Exception as e:
            logger.error(f"Field extraction failed: {str(e)}")
            raise ClaudeServiceError(f"Field extraction failed: {str(e)}")

    def validate_api_key(self) -> bool:
        """
        Validate that the API key is configured and working.

        Returns:
            True if API key is valid

        Raises:
            ClaudeServiceError: If API key is invalid
        """
        try:
            # Make a minimal API call to test the key
            message = self.client.messages.create(
                model=self.model,
                max_tokens=10,
                messages=[
                    {"role": "user", "content": "Hi"}
                ]
            )
            logger.info("API key validation successful")
            return True
        except APIError as e:
            logger.error(f"API key validation failed: {str(e)}")
            raise ClaudeServiceError(f"Invalid API key: {str(e)}")
