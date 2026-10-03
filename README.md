# TalentFit AI 🚀
> **A Scalable Full-Stack Framework for Real-Time ATS Resume Screening and HR Analytics**

TalentFit AI is an enterprise-grade recruiting platform designed to automate resume parsing, evaluate skill relevancy, and provide instant candidate feedback alongside a real-time HR dashboard.

---

## ✨ Key Features

- 📄 **Deterministic Resume Parsing:** High-precision text extraction from PDF resumes powered by Apache PDFBox (Zero third-party API latency or cost).
- 💡 **Dynamic Skill Gap Analysis:** Instant feedback engine notifying candidates of specific missing skills relative to target Job Descriptions.
- ⚡ **Real-Time HR Analytics:** Interactive leaderboard and candidate ranking dashboard that syncs live data seamlessly.
- 🔒 **Enterprise Architecture:** Robust backend pipeline engineered with Spring Boot, ensuring data privacy and modular scalability.

---

## 🛠️ Tech Stack

| Domain | Technologies Used |
| :--- | :--- |
| **Frontend** | React.js, JavaScript (ES6+), HTML5, CSS3, Axios |
| **Backend** | Java 17, Spring Boot, Spring Data JPA, RESTful APIs |
| **PDF Processing** | Apache PDFBox |
| **Database** | MySQL |
| **Build Tools** | Maven, npm |

---

## 📁 Project Architecture

```text
TalentFit-AI/
├── ats-engine/          # Spring Boot Backend (Parsing & Scoring Service)
│   ├── src/
│   └── pom.xml


1. Backend Setup (ats-engine)
Configure your MySQL database credentials in src/main/resources/application.properties.

Build and run the Spring Boot application:

cd ats-engine
./mvnw spring-boot:run

2. Frontend Setup (talentfit-frontend)

Install the required Node dependencies:

cd talentfit-frontend
npm install

Start the React development server:
npm start
└── talentfit-frontend/  # React.js Frontend (Candidate Portal & HR Dashboard)
    ├── src/
    └── package.json
