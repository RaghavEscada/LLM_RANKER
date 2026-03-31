# 02_exploratory_analysis.R
# Loading environment from step 1
if(!file.exists("../data/env_01.RData")) stop("Run 01_data_preparation.R first!")
load("../data/env_01.RData")

# ─────────────────────────────────────────────
# 2. STATISTICAL SUMMARY (EDA)
# ─────────────────────────────────────────────
cat("\n==============================\n")
cat("   GEO EXPLORATORY DATA ANALYSIS\n")
cat("==============================\n")

cat(sprintf("Total Companies Analyzed: %d\n", nrow(data)))

# Summarize the features
summary_stats <- summary(data[, features])
print(summary_stats)

# Generate a correlation matrix for EDA
cor_matrix <- round(cor(data[, features]), 2)
cat("\nCorrelation Matrix (Pearson):\n")
print(cor_matrix)

cat("✅ Exploratory Analysis complete.\n")

# Save environment for next script
save.image("../data/env_02.RData")
