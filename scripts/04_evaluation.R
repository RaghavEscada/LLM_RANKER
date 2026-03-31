# 04_evaluation.R
library(ggplot2)
library(ggcorrplot)
library(scales)

# Loading environment from step 3
if(!file.exists("../data/env_03.RData")) stop("Run 03_modeling.R first!")
load("../data/env_03.RData")

# ─────────────────────────────────────────────
# 4. REGRESSION & EVALUATION
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

# Directories for results and app
res_fig <- "../results/figures"
res_tbl <- "../results/tables"
app_crt <- "../app/public/charts"
app_pub <- "../app/public"

if (!dir.exists(res_fig)) dir.create(res_fig, recursive = TRUE)
if (!dir.exists(res_tbl)) dir.create(res_tbl, recursive = TRUE)
if (!dir.exists(app_crt)) dir.create(app_crt, recursive = TRUE)

# Stats JSON Export - For app & for results
stats_json <- sprintf(
  '{"mean":%.2f,"median":%.2f,"sd":%.2f,"min":%.2f,"max":%.2f,"r_squared":%.4f,"tier_high":%d,"tier_medium":%d,"tier_low":%d}',
  mean(data$LLM_score), median(data$LLM_score), sd(data$LLM_score),
  min(data$LLM_score), max(data$LLM_score), lm_summary$r.squared,
  sum(data$tier == "High"), sum(data$tier == "Medium"), sum(data$tier == "Low")
)
writeLines(stats_json, file.path(app_pub, "stats.json"))
write.csv(data, file.path(res_tbl, "ranked_companies.csv"), row.names = FALSE)
write.csv(data, file.path(app_pub, "ranked_companies.csv"), row.names = FALSE)

# Evaluation Results Table (From regression coefficients/p-values)
eval_df <- data.frame(Feature = rownames(lm_summary$coefficients),
                      Estimate = lm_summary$coefficients[,1],
                      P_Value = lm_summary$coefficients[,4])
write.csv(eval_df, file.path(res_tbl, "model_performance.csv"), row.names = FALSE)

# ─────────────────────────────────────────────
# 5. CHART GENERATION
# ─────────────────────────────────────────────
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

# Helper function to save in both places
save_plot <- function(filename, p, w=8, h=5) {
  ggsave(file.path(res_fig, filename), p, width = w, height = h, dpi = 140, bg = DARK_BG)
  file.copy(file.path(res_fig, filename), file.path(app_crt, filename), overwrite = TRUE)
}

# CHART 1: Distribution
p1 <- ggplot(data, aes(x = LLM_score)) + geom_histogram(bins = 35, fill = "#4a90d9", color = "#0a0a0a", linewidth = 0.3, alpha = 0.9) +
  labs(title="LLM Score Distribution", subtitle="Histogram of weighted GEO scores", x="LLM Score", y="Count") + dark_theme
save_plot("score_distribution.png", p1)

# CHART 2: Correlation Matrix
cor_matrix <- round(cor(data[, features]), 2)
p4 <- ggcorrplot(cor_matrix, method="square", type="lower", lab=TRUE, lab_size=2.8, colors=c("#ef4444", DARK_PANEL, "#22c55e"), outline.color="#0a0a0a", ggtheme=theme_minimal()) +
  labs(title="Feature Correlation Matrix", subtitle="Pearson correlation coefficients") + dark_theme + theme(axis.text.x=element_text(angle=35, hjust=1, size=7.5), axis.text.y=element_text(size=7.5))
save_plot("correlation_matrix.png", p4, w=8, h=7)

# CHART 3: Weight Output
weight_df <- data.frame(Feature = names(weights), Weight = as.numeric(weights))
weight_df$Feature <- factor(weight_df$Feature, levels = weight_df$Feature[order(weight_df$Weight)])
p3 <- ggplot(weight_df, aes(x = Feature, y = Weight * 100, fill = Weight)) +
  geom_bar(stat = "identity", width = 0.65) + coord_flip() +
  scale_fill_gradient(low = "#334155", high = "#4a90d9") +
  labs(title="Feature Importance (Weights)", subtitle="Contribution to final GEO score", x=NULL, y="Weight (%)") + dark_theme + theme(legend.position="none")
save_plot("feature_importance.png", p3)

cat("\n==============================\n")
cat("  Charts and results saved!\n")
cat("==============================\n")
