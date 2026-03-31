# 01_data_preparation.R
# Loading Required Packages
library(ggplot2)
library(ggcorrplot)
library(scales)

# ─────────────────────────────────────────────
# 1. LOAD DATA
# ─────────────────────────────────────────────
data <- read.csv("../data/llm_startup_dataset_500.csv")

# Standardizing column name if necessary
if ("company" %in% names(data)) {
  names(data)[names(data) == "company"] <- "company_name"
}

# Define the 8 core features measured by the GEO framework
features <- c("content_quality", "technical_seo", "brand_mentions",
              "ai_readability", "backlinks", "semantic_depth",
              "faq_presence", "authority_score")

cat("✅ Data successfully loaded.\n")
cat(sprintf("   - Total dimensions: %d\n", length(features)))
cat(sprintf("   - Total instances : %d\n", nrow(data)))

# Save environment for next script
save.image("../data/env_01.RData")
