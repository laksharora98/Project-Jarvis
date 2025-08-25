# Customer Data Platform (CDP)

# Customer Data Platform (CDP)

## Project Overview

This project is a partnership with **Quantiphi** to build a Customer Data Platform (CDP) on the Google Cloud Platform (GCP). The primary goal is to create a unified, 360-degree view of the customer by consolidating data from various sources. The platform will be used to power advanced analytics, including lead scoring and personalized marketing recommendations.

## Key Deliverables

1.  **Unified Customer Data Platform:** A central data warehouse in BigQuery containing cleansed and unified customer profiles with a "Golden ID" for each customer.
2.  **Lead Scoring Model:** An ML model built on Vertex AI to score leads based on their probability to convert.
3.  **Next Best Action (NBA) Model:** An ML model to provide personalized recommendations for engaging with leads.
4.  **REST APIs:** To expose the outputs of the ML models (e.g., lead scores) for consumption by other Aakash systems.

## High-Level Architecture (GCP)

*   **Data Lake:** Google Cloud Storage (GCS)
*   **ETL/ELT:** Cloud Dataflow and Cloud Dataprep
*   **Data Warehouse:** BigQuery
*   **ML Platform:** Vertex AI
*   **Orchestration:** Cloud Composer

## Data Sources & Phasing

The project is divided into two phases with the following data sources:

### Phase 1 (~12 Weeks | $130,000)
*   Google Analytics
*   Google Ads
*   WebEngage (incl. SMS)
*   Salesforce CRM

### Phase 2 (~8 Weeks | $65,000)
*   Meta Ads (incl. WhatsApp)
*   Ameyo (Call Recordings for transcription via Gemini)
*   Airtel IQ (IVR/Chat)

## Total Estimated Cost: $195,000

## Current Focus

*   **Task**: Finalize the project proposal with Quantiphi.
*   **Status**: The proposal from Quantiphi has been received and reviewed.
*   **Next Step**: Proceed with internal approvals and data discovery sessions with the vendor.

