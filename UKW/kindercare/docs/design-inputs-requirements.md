# KinderCare Requirements Engineering Input

## 1. Business Context

**Business Goals:**

Improve structured follow-up care for children after intensive care through digital, standardized collection and analysis of Patient Reported Outcome Measures (PROMs).

**Ein Intensivmediziner sagt**:

```quote
"Die Entlassung eines Patienten ist die erste Nachsorgeuntersuchung. Strukturierte Nachsorge gibt mir hilfreiches Feedback zur initialen Behandlung und garantiert fortwährenden Qualitätssicherung."
```

Note: Measures = Messparameter, NICHT Maßnahmen/Interventions

**Problem:**

Keine Standardisierung der Nachsorge. PROMs sind standardisiert nach Zentrum, nicht D oder EU weit.
Schwierig Patienten dazu zu bringen vor Ort 15 Fragebögen auszufüllen
Auch soziale Situation, Arbeit, Entfernung, Verantwortung für weitere Kinder verhindert oft eine bestmögliche Nachsorge.

Rücklauf von Fragebögen ist schlecht -> Aktuelle alternative: Patienten bekommen iPad im Wartesaal, Fragenbeantwortungen können Ad-hoc ausgewertet werden.

**Stakeholders:**

- Patients, parents/families
- Healthcare providers (doctors, caregivers, psychologists, physiotherapists, social workers)
- Researchers
- Hospital administration (for controlling and advocacy)
- Insurance companies

**Regulatory Context:**

- Compliance with GDPR
- Currently avoiding classification as medical product, but prepared with roadmap for compliance with medical device regulations (MDR, ISO 13485)
  - Clearly specified Design Inputs
  - Documentation of SOUPs (software of unknown provenance)
- TODO: detailed Product Roadmap with regulatory compliance goals

## 2. Functional Requirements

### Patients, Parents/Families

- As a parent, I want timely and accessible screenings to ensure my child’s optimal recovery.
- As a parent, I want timely alerts and interventions if my child's recovery is not progressing as expected.
- As a parent, I want regular feedback and suggestions to help improve my child's recovery.
- As a parent/patient, I want the option to record PROMs to support healthcare improvement and research.

### Healthcare Providers

(Doctors, Caregivers, psychologists, physiotherapists, social workers. Primary users for the initial prototype are intensive care physicians.)

- As a healthcare provider, I want to quickly and easily onboard leaving patients to standardize PROMs in line with professional guidelines for aftercare.
  - Pseudonymous ID and QR-code-based patient pseudonym assignment and login.
  - Verschiedene Profile für Nachsorgen: Digital collection of standardized PROM questionnaires (domains: cognition, emotion, general health, family functioning).
- As an intensive care physician, I want structured follow-up data to evaluate initial treatments and ongoing quality assurance.
  - Mediziner wollen dass Patienten möglichst zuverlässigen Nachsorge-intervallen vergleichbare Daten in guter Qualität liefern.
    Prioritization:
    1. good quality data (all questions answered or marked as "no answer")
    2. comparability of data for studies
    3. high response rate in regular data collection (TODO: define target)
- As a healthcare provider, I want to prevent unnecessary hospital readmissions and readmission due to preventable secondary health issues.
- As a healthcare provider, I want to benchmark patient data across multiple centers for generalized applicability.

### Researchers

- As a researcher, I want access to quality-controlled, standardized data for collaborative research and publication.
- As a researcher, I want the ability to adjust standardized PROMs based on research needs.

Forschungsgruppen tauschen sich auf Konferenzen und per Sharepoints/OneDrives aus und bewerten gegenseitig Fragebögen

- würden von einer Plattform profitieren
- need sufficient data for research and publication
- need insights into data quality and quality issues
- Adjustment of standardized PROMs?

### Hospital Administration

- As hospital administration, I want effective user management tools.
  - OOS: As hospital administration, I want dashboards to track cost efficiency and patient outcomes.
    - Welche Patienten hattet ihr letztes jahr - wie kosten-effizient und Vermeidung unnötiger Aufnahmen
  - OOS: As hospital administration, I want reports that support advocacy and decision-making.

## User Journeys

### 1. Doctor Creating a New Aftercare Plan

- Doctor logs into the system.
- Doctor enters patient core data (birthdate, pre-existing conditions, diagnoses, therapeutic measures, discharge status).
- Doctor receives automated suggestions for relevant questionnaires and timelines.
- Doctor finalizes the follow-up plan and generates a QR code for patient/parent login.

### 2. Patient Receiving Reminder and Filling Out Surveys

- Patient/parent receives notification (email/SMS) about a due survey.
- Patient/parent logs in using provided QR code.
- Patient/parent completes questionnaires and submits data.
- Patient/parent receives immediate feedback or acknowledgment of submission.

### 3. Doctor Reviewing Patient Data During Follow-Up

- Doctor logs into the system.
- Doctor uses the pseudonymous ID to retrieve patient-specific data.
- Doctor reviews patient's PROM responses, demographic information, and historical outcomes.
- Doctor documents findings and actions within the patient's profile.

### 4. Doctor Aggregated Overview with Filtering

- Doctor logs into the aggregated dashboard.
- Doctor filters data by criteria (e.g., own patients, specific diagnoses, therapeutic measures).
- Doctor reviews comparative, pseudonymous outcomes to identify trends, improvements, or concerns.
- Doctor exports reports for analysis or internal meetings.

Examples:
Kind wegen Infektion in Klinik nach 3 Monaten Kind hört nicht mehr so gut, Kind sieht nicht richtig. Nach einem Jahr depressiv.

Dalia 15J Schwere Entzündung des Auges. Konnte danach nicht mehr sehen. Ein Auge 20/40% - kassen verweigern Reha und spezielle Hilfsmittel weil sie nicht anerkennen dass es Folge der Entzündung ist. "Ohne Nachsorge wäre es nicht aufgefallen und es gäbe niemanden der jetzt für das Kind kämpft"

## 3. Quality Requirements

- **Performance:** Real-time responsiveness, rapid data processing
- **Safety & Compliance:** GDPR compliance, data security
- **Reliability & Maintenance:** Minimal downtime, regular updates, ongoing maintenance

## 4. Constraints

- **Technical Constraints:**
  - Interoperable formats (PDF, CSV)
  - QR-code-based pseudonym management
  - Multicenter management complexity

- **Regulatory Constraints:** GDPR-compliant data handling and pseudonymization

- **Organizational Constraints:** Hackathon resource limitations, clarity required on ownership, hosting, and funding

## 5. Solution Strategy (Arc42 Compatible)

- **Architectural Decisions:**
  - Centralized relational database linking patient core data and questionnaire datasets
  - Open Source Prototype
  - Quick and easy to use doctors UI

- **Technology Stack:**
  - LimeSurvey integration for mobile-friendly web/app platform patients

- **Risk Management:**
  - Robust pseudonymization, secure login, and interoperability standards

## 6. Technical Challenges & Risks

- **Known Challenges:**
  - Complex multicenter pseudonym management
  - Real-time analytics and scalable reporting
  - Longitudinal data linkage

- **Risk Assessment:**
  - High risk in data privacy/security (mitigation via robust pseudonymization and GDPR compliance)
  - delayed rollout from classification as medical product. Mitigation: focus on pseudonymous data collection for studies. Doctor Feedback pseudonymous and aggregated (and potentially unavoidable). Only static notes, recommendations and feedback for patients, no diagnosis support or individualized feedback.

## 7. Next Steps

- Define and agree on data governance (ownership, hosting, and funding).
- Develop initial prototype interfaces for stakeholders (patients/parents, healthcare providers, admin).
- Establish testing scenarios for usability and compliance validation.
