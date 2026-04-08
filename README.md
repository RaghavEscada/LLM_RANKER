# Project Report: Network Robustness Under Probabilistic Attack

**Team Members:** Raghav Krishna M, Akshay, Gireesh, Kavya
**Reference Paper:** *Network Robustness Under Probabilistic Attack* (Entropy Journal, Guizhou University, 2023)

---

## 1. Introduction and Motivation
This project involves a structured four-phase study—from understanding and replication to original experimentation and interpretation—of a 2023 research paper on network robustness.

Most traditional robustness models rely on the unrealistic premise that every attack on a network node succeeds with a probability of 1. Real-world infrastructure (such as power grids and the internet) features defenders and security systems, meaning attacks have varying probabilities of success. This paper introduces the concept of modeling probabilistic attacks and proposes a novel metric, **RASR (Robustness under Attack Success Rate)**, making it highly practical for modeling real-world infrastructure defense.

## 2. Phase 1: Understanding
The core of the paper addresses how to measure network robustness when attacks don't always succeed.

- **Classical Robustness (ANC):** The Area under the Network-robustness Curve (ANC) measures how much a network degrades as nodes are removed. A higher ANC indicates a more robust network.
- **The New Metric (RASR):** RASR extends ANC using probability theory, allowing each node to carry its own likelihood of being successfully attacked. This allows defenders to model partial protection and quantify the robustness gained from hardening key nodes.
- **Key Findings from the Paper:** Validating across six real-world networks (ranging from 34 to 10,000 nodes), the paper introduced the PRQMC algorithm, which is 50× faster than standard Monte Carlo methods. Furthermore, it demonstrated that protecting just the top 30% of critical nodes yields 78% of the maximum robustness improvement.

## 3. Phase 2: Replication
To ensure our setup matched the original research before running deeper analysis, we replicated the paper's analysis using the classic **Karate Club Network** (34 nodes representing two social factions).

### Verification
Using Python and NetworkX, we successfully reproduced the exact metrics from the paper's Table 1:
- **Nodes:** 34
- **Edges:** 78
- **Density:** 0.139
- **Avg. Degree:** 4.59

### Centrality Analysis & Node Identification
We computed four centrality measures to identify critical network points.
- **Degree Centrality:** Node 0 and Node 33 ranked highest.
- **Betweenness Centrality:** Node 0 scored 0.438 (~44% of all shortest paths pass through it), making it the highest-value target for an attacker and the most critical node for a defender.
- **Conclusion:** Nodes 0 (Instructor) and 33 (Club President) dominantly represent structural weaknesses. Even a small reduction in their attack success rate produces a substantial robustness benefit for the entire network.

### Network Visualization
We recreated the topology visualization (Figure 6a) mapped with community coloring. The network showed a strong community modularity score of **0.411**, cleanly separating into three groups: the Instructor's group (Node 0), the President's group (Node 33), and a peripheral group vulnerable to disconnection.

## 4. Phase 3 & 4: Extension and Findings
Moving beyond the paper's focus on fixed real-world networks, we introduced an original research question: *Does the type of network structure determine its vulnerability, regardless of the attack strategy?*

### Experimental Design
We generated three synthetic 34-node networks to serve as fair comparisons against the Karate Club dataset:
1. **Scale-Free:** Hub-dominated (like the internet).
2. **Small-World:** High local clustering (like social networks).
3. **Random:** Neutral baseline with no structural bias.

### Extension Results

| Network Type | ANC (Targeted) | ANC (Random) | Gap |
| :--- | :--- | :--- | :--- |
| **Scale-Free** | 0.146 | 0.341 | 0.195 |
| **Small-World** | 0.228 | 0.312 | 0.084 |
| **Random** | 0.339 | 0.347 | 0.008 |

*The "Gap" illustrates the advantage an intelligent attacker has over a random attacker.*

### Observations & Conclusions
- **Topology is Destiny:** Scale-free networks experience the steepest drop in robustness (ANC 0.146) because hub removal immediately triggers cascading collapse. Random networks have the flattest drop (ANC 0.339) since there are no structural weak points easily exploitable.
- **Vulnerability Source:** A scale-free network is **2.32× more fragile** than a random network under the identical targeted attack. This underlines that vulnerability is a structural attribute as much as it is a consequence of the attack strategy.
- **Actionable Insight:** Defense efforts provide the highest ROI when hardening the hub nodes of scale-free networks. Even a minimal reduction in the attack success rate at these nodes yields disproportionately large improvements to the network's overall survival and robustness.
