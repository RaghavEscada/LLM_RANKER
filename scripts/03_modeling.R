# 03_modeling.R
# Loading environment from step 2
if(!file.exists("../data/env_02.RData")) stop("Run 02_exploratory_analysis.R first!")
load("../data/env_02.RData")

# ─────────────────────────────────────────────
# 3. WEIGHTED SCORING & TIER CLASSIFICATION
# ─────────────────────────────────────────────
# 20% + 20% + 15% + 15% + 10% + 10% + 5% + 5%
weights <- c(content_quality  = 0.20,
             technical_seo    = 0.15,
             brand_mentions   = 0.15,
             ai_readability   = 0.20,
             backlinks        = 0.10,
             semantic_depth   = 0.10,
             faq_presence     = 0.05,
             authority_score  = 0.05)

data$LLM_score <- rowSums(mapply(function(col, w) data[[col]] * w,
                                  names(weights), weights))
data$LLM_score <- round(data$LLM_score, 2)

# Ranking
data <- data[order(-data$LLM_score), ]
data$rank <- 1:nrow(data)

# Tiers
data$tier <- ifelse(data$LLM_score > 85, "High",
              ifelse(data$LLM_score > 75, "Medium", "Low"))
data$tier <- factor(data$tier, levels = c("High", "Medium", "Low"))

cat("\n==============================\n")
cat("   GEO PREDICTION SUMMARY\n")
cat("==============================\n")
cat(sprintf("Mean LLM Score    : %.2f\n", mean(data$LLM_score)))
cat(sprintf("Median LLM Score  : %.2f\n", median(data$LLM_score)))
cat("\nTier Distribution:\n")
print(table(data$tier))

# Save environment for next script
save.image("../data/env_03.RData")
