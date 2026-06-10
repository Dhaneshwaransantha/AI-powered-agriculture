# 🌾 AgriAssist AI — Full-Stack Agriculture Assistant

> AI-powered soil and crop analysis using **Google Gemini**, **Spring Boot**, and **Angular**

---

## 🏗️ Architecture

```
Angular (4200) → Spring Boot (8080) → MariaDB (3306)
                         ↕
                  Google Gemini API
```

---

## ✅ Prerequisites

| Tool | Version |
|------|---------|
| Java | 17+ |
| Maven | 3.8+ |
| Node.js | 18+ |
| Angular CLI | 17+ |
| MariaDB | 10.6+ |

---

## ⚙️ Setup Instructions

### 1. Database Setup

```sql
-- Run the schema script
mysql -u root -p < database/schema.sql
```

Or open MariaDB console and paste `database/schema.sql`.

### 2. Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy it

### 3. Configure Backend

Open `agri-assistant-backend/src/main/resources/application.properties`:

```properties
# Set your Gemini API key
gemini.api.key=YOUR_API_KEY_HERE

# Set your MariaDB credentials
spring.datasource.username=root
spring.datasource.password=your_password
```

### 4. Run Backend

```bash
cd agri-assistant-backend
mvn spring-boot:run
```

Backend runs at: `http://localhost:8080/api`

### 5. Run Frontend

```bash
cd agri-assistant-frontend
npm install
ng serve
```

Frontend runs at: `http://localhost:4200`

---

## 🔌 REST API Endpoints

### Soil Analysis
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/soil/analyze` | Upload soil image for AI analysis |
| GET | `/api/soil/{id}` | Get soil analysis by ID |
| GET | `/api/soil/all` | Get all soil analyses |

**POST /api/soil/analyze** — multipart/form-data:
- `image` (file) — soil image
- `farmerName` (string) — optional
- `location` (string) — optional
- `language` (string) — default: `en`

### Crop Analysis
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/crop/analyze` | Upload crop image for AI analysis |
| GET | `/api/crop/{id}` | Get crop analysis by ID |
| GET | `/api/crop/all` | Get all crop analyses |

### History & Dashboard
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/history/all` | Full analysis history |
| GET | `/api/history/type/{SOIL\|CROP}` | Filtered history |
| GET | `/api/history/farmer?name=John` | Filter by farmer |
| GET | `/api/history/stats` | Dashboard statistics |

---

## 🌟 Features

- **🤖 Gemini Vision AI** — Multimodal image analysis with structured JSON prompts
- **🪨 Soil Analysis** — Texture, moisture, pH estimate, fertility, suitability score (0–100)
- **🌿 Crop Analysis** — Crop ID, growth stage, harvest prediction, disease detection
- **🦠 Disease Detection** — Pathogen ID, severity, treatment methods, preventive measures
- **⚠️ Deficiency Alerts** — Nutrient deficiency detection and treatment
- **📋 History Module** — Full audit trail with filter and search
- **📊 Dashboard** — Visual charts (CSS donut + bar charts)
- **🌐 Multilingual** — 10 Indian languages supported
- **⚡ Caching** — Caffeine cache for analysis results (30 min TTL)
- **🔒 CORS** — Pre-configured for Angular dev server

---

## 📁 Project Structure

```
AI-powered agriculture assistant/
├── agri-assistant-backend/       ← Spring Boot
│   └── src/main/java/com/agri/assistant/
│       ├── config/               ← Gemini, CORS, Cache
│       ├── controller/           ← REST endpoints
│       ├── model/                ← JPA entities
│       ├── repository/           ← Spring Data JPA
│       ├── service/              ← Business logic
│       └── dto/                  ← Response DTOs
├── agri-assistant-frontend/      ← Angular 17
│   └── src/app/
│       ├── components/           ← home, soil, crop, dashboard, history
│       ├── services/             ← AgriService (HTTP)
│       └── models/               ← TypeScript interfaces
└── database/
    └── schema.sql                ← MariaDB DDL
```
