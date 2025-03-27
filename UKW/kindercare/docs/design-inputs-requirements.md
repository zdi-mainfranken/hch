# KinderCare Requirements Engineering Input

## 1. Business Context

- **Business Goals:** Improve structured follow-up care for children after intensive care through digital, standardized collection and analysis of Patient Reported Outcome Measures (PROMs). Note: Measures = Messparameter, NICHT Maßnahmen/Interventions
    
- **Stakeholders:**
	- Patients, parents/families
	- Healthcare providers (doctors, caregivers, psychologists, physiotherapists, social workers)
	- Researchers
	- Hospital administration (for controlling and advocacy)
	- Insurance companies
    
- **Regulatory Context:** 
	- Compliance with GDPR 
	- Currently avoiding classification as medical product, but prepared with roadmap for compliance with medical device regulations (MDR, ISO 13485)
		- Clearly specified Design Inputs
		- Documentation of SOUPs (software of unknown provenance)
	- TODO: detailed Product Roadmap with regulatory compliance goals

## 2. Functional Requirements

### Patients, Parents/Families
- As a parent, I want timely screenings to ensure my child’s optimal recovery.
- As a parent, I want timely alerts and interventions if my child's recovery is not progressing as expected.
- As a parent, I want regular feedback and suggestions to help improve my child's recovery.
- As a parent/patient, I want the option to record PROMs to support healthcare improvement and research.

### Healthcare Providers 

(Doctors, Caregivers, psychologists, physiotherapists, social workers)

**Intensivmediziner**
"Die strukturierte Nachsorge ermöglicht ein Feedback zur initialen Behandlung und fortwährenden Qualitätssicherung"

Die Entlassung ist die erste Nachsorgeuntersuchung.

1. Patientenbetreuung / Patientenakte/profil (personenbezogen)
- Bei Aufnahme gleich optimale Nachsorge einplanen und abdecken
- möchte Wiederaufnahmen vermeiden
	- Sowohl unnötige als auch indizierte!
- möchte neue und Folgeerkrankungen vermeiden
	- Beispiel Kind hat Infektion und bekommt dann ein Krampfleider
	- Kind hatte Vorerkrankung der Lunge und hat nach Intensivaufenthalt Verschlechterung / künstliche Beatmung

Ärztliche Auswertung eigener Daten und möglichst vieler vergleichbarer Daten aus anderen Gesundheitszentren 
- wollen dass Patienten möglichst zuverlässigen Nachsorge-intervallen vergleichbare Daten in guter Qualität liefern
	- guter Qualität
		- hat fragen beantwortet (oder nicht)
		- option: "kein Antwort" ist möglich (best practice, aber aktuell nicht immer in Fragebögen)
	- vergleichbare Daten
	- zuverlässigen Nachsorgeintervalle (3-6-12 Monate) gute 
2. für eigenes Feedback (pseudonymisiert)
- möchte multizentrische, generalisierbare Anwendbarkeit insbesondere Auswertung (Benchmarking) und Empfehlungen (bestenfalls D/EU-weite einbeziehung von relevanten Daten)
3. als Basis für Studien 
- standardisierte PROMs werden von Ärzten aus fachlicher Sicht festgelegt und unterschiedlich oft aktualisiert, normalerweise (nach Leitlinie alle 3 Jahre nach neuer Evidenzsynthese)
	- AWMF: organisiert multi-stakeholder Leitliniengruppen für die Leitlinien TODO Link
	- Standardsoftware für PROMs?
	- TODO Christoph: Quellen von Best Practices PROMS?
	- Messparameter können ersetzt (vergleichbarkeit Nachfolgeparameter), gestrichen oder hinzugefügt werden.
PROMs sind standardisiert nach Zentrum, nicht D oder EU weit.


Forschungsgruppen tauschen sich auf Konferenzen und per Sharepoints/OneDrives aus und bewerten gegenseitig Fragebögen
- würden von einer Plattform profitieren
- need sufficient data for research and publication
- need insights into data quality and quality issues
- Adjustment of standardized PROMs?

Hospital Administration
- **Nutzerverwaltung!**
- want dashboards for controlling
	- Welche Patienten hattet ihr letztes jahr - wie kosten-effizient und Vermeidung unnötiger Aufnahmen
- want reports for advocacy


    - 
    - Digital collection of standardized PROM questionnaires (domains: cognition, emotion, general health, family functioning).
        
    - Automated, real-time data analysis and presentation to healthcare providers.
	    - UI / User Journeys
	    - Dashboards
        
    - Pseudonymer Login 
	    - QR-code-based patient pseudonym assignment and login.
        
- **User Interactions:**
    
    - Separate user interfaces for patients/parents and healthcare providers.
        
    - Parents input demographic and clinical follow-up data.
        
    - Providers review outcomes and export reports.
        


Kind wegen Infektion in Klinik nach 3 Monaten Kind hört nicht mehr so gut, Kind sieht nicht richtig. Nach einem Jahr depressiv.

Dalia 15J Schwere Entzündung des Auges. Konnte danach nicht mehr sehen. Ein Auge 20/40% - kassen verweigern Reha und spezielle Hilfsmittel weil sie nicht anerkennen dass es Folge der Entzündung ist. "Ohne Nachsorge wäre es nicht aufgefallen und es gäbe niemanden der jetzt für das Kind kämpft"

Problem aktuell:
Keine Standardisierung der Nachsorge.
Schwierig Patienten dazu zu bringen vor Ort 15 Fragebögen auszufüllen
Auch soziale Situation, Arbeit, Entfernung, Verantwortung für weitere Kinder

Aktuell (Rücklauf schlecht, also) -> iPad während warten, können Ad-hoc ausgewertet werden.

Mögliche alternative, auswege Medizinprodukt: ausdrucken??? Nachvollziehbarkeit und keine Ändern

Link per mail, QR code ausgedruckt?

Verschiedene Profile für Nachsorgen


## screens

### Entlassung / Nachsorge anlegen

Arzt legt bei Entlassung den Nachsorgeplan an:

Stammdaten

- Geburtsdatum (PI)

Auwahlkategorien:
Vorerkrankungen
Diagnosen
Therapeutische Maßnahmen
Status bei Entlassung

häufige diagnoses schnell hinzuzufügen
  

Bekommt direktes feedback darüber welche Fragebögen vom Patienten wann zu beantworten sind (timeline?)
 
## 3. Quality Requirements

- **Performance:** Real-time responsiveness and rapid data processing for clinical decisions.
    
- **Safety & Compliance:** Compliance with GDPR, MDR, and ISO 13485, ensuring patient confidentiality and data security.
    
- **Reliability & Maintenance:** Reliable performance with minimal downtime, regular updates for new questionnaire integration, and ongoing maintenance.
    

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


