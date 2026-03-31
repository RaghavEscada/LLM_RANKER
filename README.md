# LLM_Ranker: Generative Engine Optimization (GEO) Analytical Framework

> A data mining project that scores, ranks, and visualizes the LLM-era visibility of 500 AI startups using a weighted multi-dimensional GEO model built in R, with an interactive Next.js leaderboard dashboard.

---

## Team Members

| Roll Number | Name |
|---|---|
| 2023BCS0171 | Raghav Krishna M |
| 2023BCD0003 | Nooh K |
| 2023BCS0099 | Surya Narayana Ghosh |
| 2023BCS0036 | Hariprasath Murugan |

---

## Problem Statement

With the rapid proliferation of Large Language Models (LLMs) and Retrieval-Augmented Generation (RAG) pipelines, the manner in which AI systems discover, reference, and surface companies has fundamentally changed. Traditional Search Engine Optimization (SEO) no longer fully governs a brand's digital visibility — a new paradigm called **Generative Engine Optimization (GEO)** is emerging.

GEO refers to the optimization of an entity's digital presence so that it is accurately, frequently, and positively represented in LLM outputs. Startups operating in the AI space are particularly affected, as LLMs trained on web-scale data may over- or under-represent companies based on measurable signals such as content quality, semantic depth, AI readability, and authoritative backlinking.

**The core problem:** There is no standard, quantitative framework that ranks AI-era startups based on their GEO readiness and LLM-layer visibility. Without such a tool, businesses cannot identify which signals most influence their AI-era discoverability or benchmark themselves against competitors.

This project addresses that gap by building a fully analytical, data-driven GEO scoring engine using R, combined with an interactive Next.js dashboard for visualization and exploration.

---

## Objectives

1. Design and implement a **multi-dimensional weighted scoring model** (GEO Score) that quantifies the LLM-era digital visibility of 500 AI startups.
2. Perform robust **Exploratory Data Analysis (EDA)** to understand feature distributions, correlations, and outliers within the dataset.
3. Apply **Ordinary Least Squares (OLS) Linear Regression** to validate the relationship between input features and the computed GEO score.
4. Classify each startup into a **performance tier** (`High`, `Medium`, `Low`) based on decision-boundary thresholds applied to the GEO score.
5. Generate and export high-fidelity **visualization artifacts** (distribution charts, correlation matrices, feature importance charts) from R.
6. Build and deploy an **interactive Next.js dashboard** that renders the ranked leaderboard, stats, and visual analytics in real-time from the R-generated outputs.

---

## Dataset

| Property | Detail |
|---|---|
| **Dataset Name** | LLM Startup Dataset 500 |
| **Source** | Proprietary — synthetically generated based on the Generative Engine Optimization research framework |
| **Number of Observations** | 500 AI-focused startups |
| **Number of Variables** | 9 (1 identifier + 8 measurable GEO dimensions) |
| **File Location** | `data/llm_startup_dataset_500.csv` |

### Variable Descriptions

| Variable | Weight in Model | Description |
|:---|:---:|:---|
| `company_name` | — | Name of the startup being evaluated |
| `content_quality` | 20% | Measures semantic richness, factual density, and informational completeness of public-facing content |
| `ai_readability` | 20% | Quantifies how easily an LLM can parse, structure, and retrieve meaning from the entity's content |
| `technical_seo` | 15% | Evaluates schema markup, metadata completeness, site crawlability, and structured data signals |
| `brand_mentions` | 15% | Counts frequency of authentic brand citations across high-authority, AI-indexed sources |
| `backlinks` | 10% | Traditional web authority metric — domain trust signals based on inbound linking |
| `semantic_depth` | 10% | Assesses breadth and depth of topical coverage and specialized knowledge areas |
| `faq_presence` | 5% | Tracks availability of machine-readable Q&A structured data that LLMs can directly extract |
| `authority_score` | 5% | Domain-level credibility score derived from historical web trust metrics |

> All feature values are continuous and normalized on a 0–100 scale. Full dataset description is in `data/dataset_description.md`.

---

## Methodology

### 1. Data Preprocessing (`scripts/01_data_preparation.R`)
- Loaded the raw dataset from `data/llm_startup_dataset_500.csv` using `read.csv()`.
- Standardized column names (e.g., `company` → `company_name`) to ensure consistent downstream processing.
- Defined the 8 core GEO dimensions as a named feature vector.
- Validated data integrity by checking for missing values and confirming 500 complete observations.

### 2. Exploratory Data Analysis (`scripts/02_exploratory_analysis.R`)
- Generated **descriptive statistics** (min, max, mean, median, quartiles) for all 8 features.
- Computed a **Pearson correlation matrix** to investigate inter-feature linear dependencies.
- The correlation analysis confirmed near-zero correlations between features, validating the independence assumption required for the OLS model.

### 3. Modeling & Scoring (`scripts/03_modeling.R`)
- Applied a **Weighted Linear Scoring Model** where each feature contributes proportionally to the final `LLM_score`:

```
LLM_score = 0.20 × content_quality
           + 0.20 × ai_readability
           + 0.15 × technical_seo
           + 0.15 × brand_mentions
           + 0.10 × backlinks
           + 0.10 × semantic_depth
           + 0.05 × faq_presence
           + 0.05 × authority_score
```

- All 500 startups were ranked in descending order of their `LLM_score`.
- **Tier Classification** thresholds applied:
  - **High Tier:** `LLM_score > 85`
  - **Medium Tier:** `75 < LLM_score ≤ 85`
  - **Low Tier:** `LLM_score ≤ 75`

### 4. Evaluation (`scripts/04_evaluation.R`)
- **OLS Linear Regression** was run using all 8 features as predictors and `LLM_score` as the dependent variable.
- An `R² = 1.0000` confirms the scoring function is perfectly deterministic — the weighted linear formula is the exact data generation process, and the regression recovers the exact coefficients.
- **Statistical outputs** and **ranked CSV** were exported for frontend consumption and results archiving.
- **6 visualizations** were generated using `ggplot2` and `ggcorrplot` with a high-contrast dark theme.

---

## Results

### Model Performance Summary

| Metric | Value |
|---|---|
| Mean LLM Score | 73.09 |
| Median LLM Score | 73.03 |
| Std. Deviation | ~8.5 |
| Min Score | ~50.0 |
| Max Score | ~99.9 |
| R-squared (OLS) | 1.0000 |
| Adjusted R-squared | 1.0000 |

### Tier Distribution

| Tier | Threshold | Count |
|---|---|---|
| 🟢 High | Score > 85 | 8 startups |
| 🟡 Medium | 75 < Score ≤ 85 | 174 startups |
| 🔴 Low | Score ≤ 75 | 318 startups |

The majority of startups fall in the **Low tier**, indicating that most AI-era companies have significant room to improve their GEO readiness, particularly in high-weight dimensions like `content_quality` and `ai_readability`.

Full ranked output: `results/tables/ranked_companies.csv`
Regression coefficients: `results/tables/model_performance.csv`

---

## Key Visualizations

All charts are generated by `scripts/04_evaluation.R` and stored in `results/figures/`.

| Score Distribution | Feature Importance |
|:---:|:---:|
| ![Score Distribution](results/figures/score_distribution.png) | ![Feature Importance](results/figures/feature_importance.png) |

| Feature Correlation Matrix |
|:---:|
| ![Correlation Matrix](results/figures/correlation_matrix.png) |

> Charts are rendered with a high-contrast dark theme optimized for professional dashboards and report inclusion. Additional charts (tier breakdown, score vs. rank decay, top-20 bar) are stored in `app/public/charts/`.

---

## How to Run the Project

### Prerequisites

Make sure the following are installed on your system:
- **R** (version 4.0 or higher) — [Download R](https://cran.r-project.org/)
- **Node.js** (v18+) and **npm** — [Download Node.js](https://nodejs.org/)

### Step 1 — Install R Packages

```bash
Rscript requirements.R
```

This installs: `ggplot2`, `ggcorrplot`, `scales`

### Step 2 — Run the Analysis Pipeline

Execute the 4 scripts in order from the `scripts/` directory:

```bash
cd scripts
Rscript 01_data_preparation.R    # Load & validate dataset
Rscript 02_exploratory_analysis.R # EDA & correlation matrix
Rscript 03_modeling.R             # GEO scoring & tier classification
Rscript 04_evaluation.R           # OLS regression, charts & CSV export
```

### Step 3 — (Optional) Launch the Interactive Dashboard

```bash
cd app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to explore the interactive GEO leaderboard.

### Repository Folder Organization

```
LLM_RANKER/
├── README.md                      ← Project report (this file)
├── README.pdf                     ← Compiled PDF version of this report
├── requirements.R                 ← R package installer
│
├── data/
│   ├── llm_startup_dataset_500.csv   ← Input dataset (500 startups)
│   └── dataset_description.md        ← Dataset metadata and description
│
├── scripts/
│   ├── 01_data_preparation.R
│   ├── 02_exploratory_analysis.R
│   ├── 03_modeling.R
│   └── 04_evaluation.R
│
├── results/
│   ├── figures/
│   │   ├── score_distribution.png
│   │   ├── feature_importance.png
│   │   └── correlation_matrix.png
│   └── tables/
│       ├── ranked_companies.csv
│       └── model_performance.csv
│
├── app/                           ← Next.js interactive dashboard
│   ├── app/                       ← React page components
│   └── public/                    ← Charts, ranked CSV, stats JSON
│
└── presentation/
    └── project_presentation.pptx  ← Slides (see Gamma link below)
```

---

## Conclusion

This project successfully demonstrates the application of data mining and statistical modeling techniques to solve a contemporary, real-world problem in the AI industry. By constructing a reproducible, multi-dimensional **Generative Engine Optimization (GEO) scoring engine** in R, we quantified the LLM-era visibility of 500 AI startups across 8 measurable dimensions.

Key findings:
- **Content quality** and **AI readability** are the dominant drivers of GEO score, each contributing 20% of the weighted total — making them the highest-leverage dimensions for any startup seeking LLM discoverability.
- Only **8 out of 500** startups (1.6%) achieved High-tier status (`score > 85`), highlighting how difficult it is to excel across all GEO dimensions simultaneously.
- The near-zero inter-feature correlations confirm that each dimension captures a genuinely independent signal, validating the orthogonality and design integrity of the GEO scoring framework.
- The OLS regression confirmed an `R² = 1.0`, validating the deterministic structure of the model and confirming that the weighted formula precisely defines the scoring surface.

The integrated Next.js dashboard enables non-technical stakeholders to explore the results interactively, reinforcing the project's commitment to reproducibility and accessible data storytelling.

---

## Contribution

| Roll Number | Member | Contribution |
|---|---|---|
| 2023BCS0171 | Raghav Krishna M | Data preprocessing, EDA, OLS regression modeling, tier classification logic, README writing, PDF compilation |
| 2023BCD0003 | Nooh K | Dataset curation, feature engineering, evaluation script (`04_evaluation.R`), model performance analysis |
| 2023BCS0099 | Surya Narayana Ghosh | Visualization generation (all ggplot2 charts), `results/` folder structure, chart export pipeline |
| 2023BCS0036 | Hariprasath Murugan | Next.js dashboard UI development, R-to-frontend data integration, presentation slides |

---

## Presentation

Slides for this project were developed on **Gamma** and are available at the following link:

🔗 [Generative Engine Optimization: Ranking Companies in the LLM Era — Gamma Slides](https://gamma.app/docs/Generative-Engine-OptimizationGEO-Ranking-Companies-in-the-LLM-Er-8e5n7yjtnfvlr3t?mode=present#card-fuc3cz52dshvl50)

---

## References

1. Lewis, P. et al. (2020). *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks.* NeurIPS.
2. Aggarwal, S. et al. (2023). *GEO: Generative Engine Optimization.* arXiv:2311.09735.
3. R Core Team (2023). *R: A Language and Environment for Statistical Computing.* R Foundation.
4. Wickham, H. (2016). *ggplot2: Elegant Graphics for Data Analysis.* Springer-Verlag.
5. Next.js Documentation — [https://nextjs.org/docs](https://nextjs.org/docs)

---

*Repository Name: LLM_RANKER*
*Team Members: 2023BCS0171 | 2023BCD0003 | 2023BCS0099 | 2023BCS0036*
*GitHub Link: [https://github.com/RaghavEscada/LLM_RANKER](https://github.com/RaghavEscada/LLM_RANKER)*
