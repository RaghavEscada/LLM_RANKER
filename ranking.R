library(ggplot2)
library(ggcorrplot)
library(scales)

# ─────────────────────────────────────────────
# 1. LOAD DATA
# ─────────────────────────────────────────────
data <- read.csv("llm_startup_dataset_500.csv")
if ("company" %in% names(data)) {
  names(data)[names(data) == "company"] <- "company_name"
}

features <- c("content_quality", "technical_seo", "brand_mentions",
              "ai_readability", "backlinks", "semantic_depth",
              "faq_presence", "authority_score")

# ─────────────────────────────────────────────
# 2. WEIGHTED LINEAR SCORING MODEL
# ─────────────────────────────────────────────
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

# ─────────────────────────────────────────────
# 3. RANKING & TIER CLASSIFICATION
# ─────────────────────────────────────────────
data <- data[order(-data$LLM_score), ]
data$rank <- 1:nrow(data)

data$tier <- ifelse(data$LLM_score > 85, "High",
              ifelse(data$LLM_score > 75, "Medium", "Low"))
data$tier <- factor(data$tier, levels = c("High", "Medium", "Low"))

# ─────────────────────────────────────────────
# 4. STATISTICAL SUMMARY
# ─────────────────────────────────────────────
cat("\n==============================\n")
cat("   GEO STATISTICAL SUMMARY\n")
cat("==============================\n")
cat(sprintf("Total Companies   : %d\n", nrow(data)))
cat(sprintf("Mean LLM Score    : %.2f\n", mean(data$LLM_score)))
cat(sprintf("Median LLM Score  : %.2f\n", median(data$LLM_score)))
cat(sprintf("Std Deviation     : %.2f\n", sd(data$LLM_score)))
cat(sprintf("Min Score         : %.2f\n", min(data$LLM_score)))
cat(sprintf("Max Score         : %.2f\n", max(data$LLM_score)))
cat("\nTier Distribution:\n")
print(table(data$tier))

# ─────────────────────────────────────────────
# 5. REGRESSION ANALYSIS
# ─────────────────────────────────────────────
cat("\n==============================\n")
cat("   LINEAR REGRESSION MODEL\n")
cat("==============================\n")
lm_formula <- as.formula(paste("LLM_score ~", paste(features, collapse = " + ")))
lm_model <- lm(lm_formula, data = data)
lm_summary <- summary(lm_model)
cat(sprintf("R-squared         : %.4f\n", lm_summary$r.squared))
cat(sprintf("Adj. R-squared    : %.4f\n", lm_summary$adj.r.squared))
cat("\nCoefficients:\n")
print(round(lm_summary$coefficients, 4))

# Save regression stats as JSON for the frontend
stats_json <- sprintf(
  '{"mean":%.2f,"median":%.2f,"sd":%.2f,"min":%.2f,"max":%.2f,"r_squared":%.4f,"tier_high":%d,"tier_medium":%d,"tier_low":%d}',
  mean(data$LLM_score), median(data$LLM_score), sd(data$LLM_score),
  min(data$LLM_score), max(data$LLM_score), lm_summary$r.squared,
  sum(data$tier == "High"), sum(data$tier == "Medium"), sum(data$tier == "Low")
)
writeLines(stats_json, "frontend/public/stats.json")

# ─────────────────────────────────────────────
# 6. OUTPUT CSV
# ─────────────────────────────────────────────
write.csv(data, "frontend/public/ranked_companies.csv", row.names = FALSE)

# ─────────────────────────────────────────────
# 7. CHART GENERATION
# ─────────────────────────────────────────────
chart_dir <- "frontend/public/charts"
if (!dir.exists(chart_dir)) dir.create(chart_dir, recursive = TRUE)

DARK_BG    <- "#0a0a0a"
DARK_PANEL <- "#111111"
TEXT_COL   <- "#a0a0a0"
TITLE_COL  <- "#ffffff"
TIER_COLS  <- c("High" = "#22c55e", "Medium" = "#eab308", "Low" = "#ef4444")

dark_theme <- theme(
  plot.background   = element_rect(fill = DARK_BG,    color = NA),
  panel.background  = element_rect(fill = DARK_PANEL, color = NA),
  panel.grid.major  = element_line(color = "#222222", linewidth = 0.4),
  panel.grid.minor  = element_blank(),
  axis.text         = element_text(color = TEXT_COL,  size = 8),
  axis.title        = element_text(color = TEXT_COL,  size = 10),
  plot.title        = element_text(color = TITLE_COL, size = 13, face = "bold", margin = margin(b = 6)),
  plot.subtitle     = element_text(color = TEXT_COL,  size = 9,  margin = margin(b = 10)),
  legend.background = element_rect(fill = DARK_PANEL, color = NA),
  legend.text       = element_text(color = TEXT_COL),
  legend.title      = element_text(color = TITLE_COL),
  strip.background  = element_rect(fill = "#1a1a1a", color = NA),
  strip.text        = element_text(color = TEXT_COL),
  plot.margin       = margin(16, 16, 16, 16)
)

# ── CHART 1: Score Distribution Histogram ──────────────────────────
p1 <- ggplot(data, aes(x = LLM_score)) +
  geom_histogram(bins = 35, fill = "#4a90d9", color = "#0a0a0a", linewidth = 0.3, alpha = 0.9) +
  geom_vline(xintercept = mean(data$LLM_score),   linetype = "dashed", color = "#ffffff", linewidth = 0.8) +
  geom_vline(xintercept = median(data$LLM_score), linetype = "dotted", color = "#a0a0a0", linewidth = 0.8) +
  annotate("text", x = mean(data$LLM_score) + 0.6, y = Inf, label = "Mean",
           color = "#ffffff", size = 3, hjust = 0, vjust = 2) +
  labs(title    = "LLM Score Distribution",
       subtitle = "Histogram of weighted GEO scores across 500 startups",
       x = "LLM Score", y = "Count") +
  dark_theme
ggsave(file.path(chart_dir, "score_distribution.png"), p1, width = 8, height = 5, dpi = 140, bg = DARK_BG)

# ── CHART 2: Tier Breakdown Bar Chart ─────────────────────────────
tier_counts <- as.data.frame(table(data$tier))
names(tier_counts) <- c("Tier", "Count")
p2 <- ggplot(tier_counts, aes(x = Tier, y = Count, fill = Tier)) +
  geom_bar(stat = "identity", width = 0.6) +
  geom_text(aes(label = Count), vjust = -0.5, color = TITLE_COL, size = 4.5, fontface = "bold") +
  scale_fill_manual(values = TIER_COLS) +
  labs(title    = "Tier Distribution",
       subtitle = "Companies classified by decision-boundary thresholds",
       x = "Tier", y = "Number of Companies") +
  dark_theme + theme(legend.position = "none")
ggsave(file.path(chart_dir, "tier_distribution.png"), p2, width = 7, height = 5, dpi = 140, bg = DARK_BG)

# ── CHART 3: Feature Weight Bar Chart ─────────────────────────────
weight_df <- data.frame(Feature = names(weights), Weight = as.numeric(weights))
weight_df$Feature <- factor(weight_df$Feature, levels = weight_df$Feature[order(weight_df$Weight)])
p3 <- ggplot(weight_df, aes(x = Feature, y = Weight * 100, fill = Weight)) +
  geom_bar(stat = "identity", width = 0.65) +
  geom_text(aes(label = paste0(Weight * 100, "%")), hjust = -0.15, color = TITLE_COL, size = 3.5) +
  scale_fill_gradient(low = "#334155", high = "#4a90d9") +
  coord_flip() +
  labs(title    = "Feature Weight Distribution",
       subtitle = "Contribution of each dimension to the GEO score",
       x = NULL, y = "Weight (%)") +
  dark_theme + theme(legend.position = "none") +
  scale_y_continuous(expand = expansion(mult = c(0, 0.2)))
ggsave(file.path(chart_dir, "feature_weights.png"), p3, width = 8, height = 5, dpi = 140, bg = DARK_BG)

# ── CHART 4: Correlation Matrix ────────────────────────────────────
cor_matrix <- round(cor(data[, features]), 2)
p4 <- ggcorrplot(cor_matrix,
                 method        = "square",
                 type          = "lower",
                 lab           = TRUE,
                 lab_size      = 2.8,
                 colors        = c("#ef4444", DARK_PANEL, "#22c55e"),
                 outline.color = "#0a0a0a",
                 ggtheme       = theme_minimal()) +
  labs(title    = "Feature Correlation Matrix",
       subtitle = "Pearson correlation coefficients across all 8 metrics") +
  dark_theme +
  theme(axis.text.x = element_text(angle = 35, hjust = 1, size = 7.5),
        axis.text.y = element_text(size = 7.5))
ggsave(file.path(chart_dir, "correlation_matrix.png"), p4, width = 8, height = 7, dpi = 140, bg = DARK_BG)

# ── CHART 5: Score vs Rank Scatter ────────────────────────────────
p5 <- ggplot(data, aes(x = rank, y = LLM_score, color = tier)) +
  geom_point(alpha = 0.65, size = 1.4) +
  geom_smooth(method = "loess", se = FALSE, color = "#4a90d9", linewidth = 1.2) +
  scale_color_manual(values = TIER_COLS) +
  labs(title    = "Score vs. Rank",
       subtitle = "Decay curve of LLM scores across all ranked startups",
       x = "Rank", y = "LLM Score", color = "Tier") +
  dark_theme
ggsave(file.path(chart_dir, "score_vs_rank.png"), p5, width = 8, height = 5, dpi = 140, bg = DARK_BG)

# ── CHART 6: Top 20 Companies Score Bar ───────────────────────────
top20 <- head(data, 20)
top20$company_name <- factor(top20$company_name, levels = rev(top20$company_name))
p6 <- ggplot(top20, aes(x = company_name, y = LLM_score, fill = tier)) +
  geom_bar(stat = "identity", width = 0.7) +
  geom_text(aes(label = LLM_score), hjust = -0.1, color = TITLE_COL, size = 3) +
  scale_fill_manual(values = TIER_COLS) +
  coord_flip() +
  labs(title    = "Top 20 Ranked Companies",
       subtitle = "Highest-scoring startups by GEO weighted model",
       x = NULL, y = "LLM Score", fill = "Tier") +
  dark_theme +
  scale_y_continuous(expand = expansion(mult = c(0, 0.15)))
ggsave(file.path(chart_dir, "top20_companies.png"), p6, width = 9, height = 6, dpi = 140, bg = DARK_BG)

cat("\n==============================\n")
cat("  6 charts saved to frontend/public/charts/\n")
cat("  CSV and stats.json exported.\n")
cat("  GEO Analysis complete.\n")
cat("==============================\n")