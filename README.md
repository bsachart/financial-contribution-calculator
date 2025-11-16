# Couple Financial Contribution Calculator

🔗 **Live Demo:** [https://bsachart.github.io/financial-contribution-calculator/](https://bsachart.github.io/financial-contribution-calculator/)

A tool to help couples determine fair, proportional financial contributions based on **actual financial capacity**—not just salary.

## Core Philosophy

This calculator is built around one fundamental fairness test:

> **"Would this arrangement feel equitable if the relationship ended tomorrow?"**

If the answer is no, the percentages need adjustment. This tool helps couples move beyond simple 50/50 splits to achieve true equity based on the resources and privileges that genuinely support your lifestyle.

## Core Principle: Equitable, Not Necessarily Equal

The calculator uses **proportional contribution** based on total financial capacity. If one partner has 60% of combined capacity, they contribute 60% to shared expenses. This approach:

- Maintains fairness when financial situations differ significantly
- Preserves individual autonomy over personal spending
- Prevents long-term resentment from unbalanced contributions
- Accounts for real-world advantages beyond paychecks

## How It Works

1. Calculate each partner's total financial capacity (income + imputed income from assets)
2. Define shared expenses (housing, utilities, groceries, joint activities)
3. Split proportionally: Each pays their percentage of shared expenses
4. Keep individual accounts for personal spending and discretionary purchases

## Required Inputs

### Net Income (After-Tax)

**What it captures:** Your actual take-home pay from employment.

**Why it's fair:** This is what's truly available to spend. Using gross income would penalize those in higher tax brackets unfairly.

### Shared Monthly Expenses

**What it captures:** Housing, utilities, groceries, insurance, joint activities, etc.

**Why it's fair:** Only expenses that benefit both partners should be split. Personal discretionary spending remains individual.

**Important:** When one partner owns the property, shared expenses should **exclude** rent/mortgage payments. Only include utilities, insurance, and maintenance that both partners benefit from.

### Currency

**What it captures:** Your primary currency for expenses.

**Why it's fair:** Risk-free rates and inflation vary by currency (e.g., USD vs. CHF). Using currency-appropriate rates ensures accurate comparisons.

## Optional Features

### 1. Past Inheritance (Received)

**What it captures:**

- Lump sum inheritances already received (with date tracking for compounding)
- **Two distinct types:**
  - **Direct inheritance:** Cash, property, securities (hard money with clear value)
  - **Passive family advantages:** Education without debt, healthcare, tutoring, career risk-taking ability, social capital, ongoing family support (soft benefits that are diffuse and indirect)

**Why it's fair:** Someone who inherited $1M and earns $100k/year has vastly more financial capacity than someone earning $200k with no inheritance. The inheritance holder has:

- A safety net for emergencies
- Investment income potential
- Reduced financial stress and anxiety
- Ability to take career risks others can't
- Lifetime advantages that contributed to their current position

_Without including this, the higher earner subsidizes someone who is objectively wealthier._

**How it's calculated:**

- **Direct inheritance:** Compound from receipt date at the specified rate, then apply current rate to generate imputed annual income. This represents what that wealth would reasonably generate if preserved.
- **Passive advantages:** Estimate lifetime value of educational/developmental benefits, then apply a **50-70% discount** before annualizing. This heavy discount acknowledges:
  - These benefits are indirect, non-liquid, and often consumed (education is in the past)
  - They've already partially contributed to current salary (double-counting risk)
  - Harder to document and quantify than direct cash
  - Represent privileges, not transferable assets

**Example of the 50-70% discount:**

- Partner A: $500k direct inheritance (received 5 years ago) → Compounds to ~$655k → $36,000 annual imputed capacity (at 5.5% rate)
- Partner B: $500k estimated passive advantages → 70% discount to $150k → $8,250 annual imputed capacity (at 5.5% rate)

The heavy discount recognizes these advantages are real but not equivalent to having liquid cash in hand.

### 2. Expected Future Inheritance

**What it captures:** Likely inheritance based on family wealth, heavily discounted for uncertainty.

**Why it's fair:** Over decades together, if one partner inherits $2M while the other inherits nothing, the non-inheriting partner will have subsidized the eventually-wealthier partner for years. Knowing you'll inherit wealth also affects current risk-taking, saving behavior, and lifestyle expectations. Someone from a wealthy family already enjoys privileges that should be acknowledged.

**How it's calculated:**

- Estimate expected amount
- Apply heavy discount for uncertainty: 70% (distant/uncertain), 50% (medium-term), or 30% (near-term/certain)
- Calculate imputed income: Discounted Amount × 5.5%
- **Crucial:** Recalculate when inheritance is actually received

### 3. Dependent Support

**What it captures:** Financial support for parents, siblings, or relatives (monthly contributions, emergency funds).

**Why it's fair:** If one partner sends $1,500/month to aging parents, that obligation existed before the relationship and reduces their available income. They shouldn't be penalized for fulfilling family responsibilities.

**How it's calculated:** Deduct monthly support from net income before calculating capacity.

**Important distinction:** Pre-existing obligations are personal deductions; jointly agreed family support could be a shared expense.

### 4. Part-Time Work

**Voluntary Part-Time:** Partner chooses reduced hours for lifestyle, education, or career change.

**Why it's fair:** Proportional split still applies. Choosing fewer hours means accepting lower disposable income and contribution percentage—this is a personal choice, not a penalty.

**Part-Time for Family Needs (Childcare, Elder Care):** One partner reduces paid work to provide unpaid labor benefiting the household.

**Why it's fair:** Unpaid care work has economic value. If both agreed to this arrangement, the financial burden shouldn't fall disproportionately on the care provider.

**Calculator approach:** Users can either:

- Impute a market-rate salary for care work, OR
- Reduce the care provider's contribution percentage as a couple decision

### 5. Overtime Income

**What it captures:** Regular expected overtime vs. sporadic voluntary overtime.

**Why it's fair:** Regular overtime is predictable compensation that increases capacity. Voluntary sporadic overtime represents personal sacrifice of free time—if one partner sacrifices disproportionately for individual savings, it may be excluded from shared capacity.

**Calculator approach:** Specify what percentage of overtime to include (0-100%). Default: include 100% of regular, expected overtime.

### 6. Pre-Relationship Property Ownership

1. **Owner receives full market rent as imputed income**
   - This represents the value of the property they're providing
   - Increases their financial capacity

2. **Non-owner(s) pay their share of market rent**
   - Each person pays 1/(number of people) of market rent
   - Represents their housing consumption cost

3. **Shared expenses exclude rent/mortgage**
   - Only include utilities, insurance, maintenance
   - The owner's mortgage is their personal expense
   - Non-owners pay rent + their share of utilities

This ensures:

- Owner isn't subsidizing non-owner's housing
- Non-owner only pays for housing consumption, not equity building
- Fair split of remaining household expenses

**Why it's fair:** The owner gains wealth through appreciation and mortgage paydown—benefits the non-owner doesn't share. Without adjustment, the non-owner effectively helps fund the owner's asset accumulation while receiving none of the long-term value. This ensures the non-owner only pays their share of actual housing consumption, not wealth building.

### Why Market Rent is the Proper Approach

**1. It Prices Housing Consumption, Not Investment**

Market rent reflects the **actual consumption value** of living in the property—the shelter, location, and amenities. The non-owner is consuming housing, not buying an investment. Paying market rent ensures they compensate the owner fairly for what they're actually using, without funding the owner's asset accumulation.

**2. Cost of Capital and Risk/Reward Belong to the Owner**

The owner bears:

- **Opportunity cost:** Their downpayment could have been invested elsewhere
- **Interest rate risk:** Their mortgage rate may be higher or lower than market
- **Market risk:** The property may appreciate or depreciate
- **Liquidity risk:** Real estate is hard to sell quickly
- **Concentration risk:** Their wealth is tied to a single asset

These risks and rewards are inherent to ownership. The non-owner didn't choose to buy this property, didn't choose the timing, and shouldn't share in either the gains or losses. Market rent divorces housing consumption from investment performance, which is appropriate since only the owner holds the investment.

**3. Interest Deductions Belong to the Owner**

If the owner claims mortgage interest tax deductions (where available), these **benefits should stay with the owner**. The deduction compensates them for the cost of financing their investment, not for providing housing to their partner.

**How this works in practice:**

- The tax deduction increases the owner's net income (they pay less tax)
- This higher net income is already accounted for when calculating their proportional share of utilities/maintenance
- The deduction **should not** reduce their $1,500 housing consumption payment
- The non-owner shouldn't subsidize the owner's tax benefits

**Example:** If the owner deducts $500/month in mortgage interest and is in a 30% tax bracket, they save $150/month in taxes. Their net income is $150 higher, but their $1,500 housing consumption payment stays the same. The $150 benefit flows to their overall financial capacity, not to reduced housing costs.

**4. Property Taxes: Who Pays Depends on Local Norms**

Property taxes require special handling because tax burdens vary dramatically by location:

- **If owners typically pay property tax directly** (common in US, UK): The tax is part of ownership costs and should be **paid entirely by the owner**, not split. It's a cost of their investment, just like their mortgage.
- **If renters pay property tax** (common in some European countries): Property tax is considered part of occupancy costs and should be **split proportionally** as a shared expense, separate from the owner's rent contribution.

- **If property tax is included in "rent" calculations** (some jurisdictions): Then it should be incorporated into the market rent figure and split accordingly (owner pays 50%, non-owner pays proportional share of utilities/maintenance, taxes are embedded in the rent value).

**Practical approach:** Research whether renters in your area typically pay property tax directly. If yes, split it proportionally. If no, the owner pays it as part of their ownership responsibilities.

**5. Simplicity and Transparency**

Market rent is:

- **Verifiable:** Comparable rental listings provide objective evidence
- **Stable:** Doesn't fluctuate with interest rates or market conditions
- **Understandable:** Both partners intuitively grasp what rent means
- **Neutral:** Doesn't reward or punish the owner for financing choices

You don't need to argue about what interest rate to use, how large the downpayment was, or whether refinancing was smart. The question is simply: "What's this property worth as a place to live?"

### 7. Student Loan Debt

**What it captures:** Monthly debt service payments.

**Why it's fair:** Student loans funded education that created earning capacity, but they reduce available income. Two people earning $100k have different capacities if one pays $1,500/month in loans. If one partner's family paid for education (a soft benefit) while the other has debt, this compounds inequality.

**Calculator approach:** Deduct monthly payments from net income (optional—some couples treat education debt as personal responsibility).

### 8. Variable Income / Bonus Compensation

**What it captures:** Commissions, bonuses, freelance income, stock vesting.

**Why it's fair:** Someone earning $100k base + $50k typical bonus has significantly more capacity than someone earning just $100k. Their total capacity is comparable to a $150k guaranteed salary, though with some uncertainty. Ignoring variable income entirely would understate their real earning power and create an unfair burden on the partner with stable income.

**How it's calculated:** Enter expected annual variable income, apply 20-30% uncertainty discount, divide by 12. Reconcile quarterly or annually based on actuals.

### 9. Retirement Contributions

**What it captures:** 401(k), IRA, employer matching contributions.

**Why it's fair:** Someone contributing 15% of income to retirement has less available for expenses than someone contributing 3%, even with equal salaries. However, they're building personal wealth.

**Calculator approach:** Users choose whether to use income before or after retirement contributions based on whether they view saving as personal choice or shared goal.

**Note:** Employer matching is free money and should probably be included in capacity regardless.

## Additional Fairness Considerations

### Revisit Regularly

Recalculate when:

- Incomes change (promotion, job change, raises)
- Work arrangements shift (full-time ↔ part-time)
- Inheritance is received or expected timeline changes
- Dependent obligations change
- Major life events occur (children, marriage, health issues)

### Documentation Recommended

For arrangements involving property ownership, inheritance assumptions, or support obligations, consider documenting your approach in writing. This isn't about distrust—it's about clarity and preventing future misunderstandings.

### The "What If We Break Up Tomorrow" Test (The Fairness Test)

For each input, ask:

- Would I feel this arrangement was fair if we separated today?
- Did I subsidize advantages I won't benefit from?
- Did my partner subsidize me unfairly?
- Am I accounting for privileges I received but didn't "earn"?

If the answer creates discomfort, adjust parameters until it passes the test for both partners.

## Philosophy Notes

### Why Not Just Split 50/50?

Equal splits work when partners have **truly equal financial capacity**. But when capacity differs—whether from income, inheritance, family support, or debt—equal contribution becomes inequitable. The person with less capacity either:

- Can't afford the shared lifestyle (limiting both partners)
- Overstretches financially while their partner lives comfortably
- Builds resentment over time

Proportional contribution allows both partners to maintain similar financial comfort relative to their capacity.

### Why Include Inheritance at All?

Some argue inheritance is "separate property" and shouldn't affect splits. This calculator disagrees for **new couples establishing financial patterns** because:

- **Capacity is real:** Someone with $1M inherited has current financial advantages
- **Safety nets matter:** Inheritance creates security that affects decision-making
- **Lifetime fairness:** Over decades, ignoring inheritance means one partner subsidizes the eventually-wealthy partner
- **Privileges compound:** Family wealth provides advantages long before formal inheritance

**Important:** Inheritance should remain legally separate property. This calculator affects expense sharing, not asset ownership.

### The Complexity Trade-Off

You can make this calculation as simple or complex as your situation requires:

- **Minimum:** Just net income and shared expenses
- **Add complexity incrementally:** Enable only the features that matter to your situation

**Start simple.** Add complexity only where it matters to your situation and sense of fairness. The goal is equity, not accounting perfection.

## Important Notes

### What This Calculator Doesn't Do

- It doesn't dictate what expenses are "shared" vs. "individual"
- It doesn't account for non-financial contributions (emotional labor, household management)
- It doesn't replace honest, ongoing communication about money
- It doesn't determine how to split assets if you separate
- It doesn't make decisions about lifestyle inflation

### What It Does Do

- Provides a transparent framework for equitable expense sharing
- Makes invisible advantages (inheritance, family support) visible and discussable
- Helps prevent resentment from unfair arrangements
- Offers a starting point for difficult but important financial conversations

### For New Couples Without Children

This calculator is particularly valuable for couples establishing financial patterns. Without children, financial contributions are often the primary measure of partnership investment. Getting this right early prevents years of potential resentment. After all, _les bons comptes font les bons amis_.

**Fairness is a feeling, not just a formula.** If the calculator's output doesn't feel right to one or both partners, the formula is wrong for your relationship. Adjust it until it passes your fairness test.

## Development

Built with SvelteKit and TypeScript. Comprehensive test coverage included.

---

Things to improve:

- Total shared expenses value is different than SHARED EXPENSES.
- Yearly / Monthly button sticky? to avoid scrolling up and down
- Why this matters can be shown next to the features, and always be displayed, not need to click to show or hide.
- Allow closing "Quick Start Guide" section.
- Can you make the features card in light blue when they are selected like in your react example, and can you alsomake the Calculation Results cards expand the whole section?
- Currency selector does not update all the needed fields like the input for the market rent.