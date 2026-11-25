# Manifesto for Software Engineering in the Age of Artificial Intelligence

## Preamble

Artificial intelligence has transformed software engineering. In a very short time, the capability of models and agents has grown, their cost has fallen and their use has spread to every level of our profession. Today we can produce code, documentation, designs and technical decisions at a speed that barely a year ago seemed out of reach.

This capability opens an extraordinary opportunity. We must use artificial intelligence, innovate with it and build new ways of working. But we must do so by building on the foundations that software engineering has developed over decades, not by replacing them.

**The ability to generate software is growing faster than our ability to understand, validate and govern it**. The pressure to innovate, reach the market first and outperform our competitors pushes us to produce and integrate changes ever more quickly. In that process we run the risk of trusting results we have not reviewed, deploying code we do not understand and accepting as true artifacts produced by probabilistic systems.

The problem is not artificial intelligence. The problem arises when we delegate to it responsibilities that still belong to engineering professionals.

This manifesto exists to preserve and strengthen those responsibilities. It does not seek to slow innovation, but to give it foundations. It does not reject speed, but speed without control. It does not distrust the tool on principle, but any result that is not backed by evidence.

> **Artificial intelligence generates possibilities. Engineering generates guarantees.**

---

## Our vision

We want a software engineering in which artificial intelligence amplifies human capability without replacing judgment, accountability or professional discipline.

We want to build systems that are reliable, secure, understandable, maintainable and observable. Systems whose behavior can be demonstrated and whose changes can be traced, evaluated and revoked.

Artificial intelligence can take part in building software. Intent, acceptance criteria and accountability for the outcome must remain under human governance.

---

## Our values

### Evidence over apparent confidence

The coherence of an answer does not prove its truthfulness. The apparent quality of an artifact does not prove its correctness. We accept results because there is evidence that supports them, not because they have been presented convincingly.

### Human accountability over artificial autonomy

Artificial intelligence can propose, implement and assist. Final accountability for what is built, integrated and deployed belongs to the people and organizations that choose to use it.

### Understanding over thoughtless production

We do not integrate what we cannot sufficiently explain. The ability to produce more code does not remove the need to understand its purpose, its effects, its limits and its risks.

### Validation over uncontrolled speed

Delivering sooner only has value when what we deliver fulfills its purpose. Competitive pressure may explain a decision, but it can never justify the absence of validation.

### Discipline over convenience

Standards, controls and guardrails are not obstacles to be removed in order to complete a task. They are necessary conditions for the result to be trustworthy.

### Observability over opacity

We cannot govern what we cannot observe. Every system assisted by artificial intelligence must let us know what it did, what it produced, what it changed and when it drifted from our intent.

### Learning over false maturity

We are still learning to integrate and govern artificial intelligence. We act with humility, measure our results and revise our practices based on evidence.

---

## Principles

### 1. Accountability cannot be delegated

Artificial intelligence can generate an implementation, but it cannot bear its consequences. The decision to accept, integrate and deploy a change remains human.

Every contribution generated or modified through artificial intelligence must have identifiable accountability. Using an agent does not dilute ownership of the result, nor does it turn the agent's behavior into a justification.

> **AI can generate code. Accountability for that code remains human.**

### 2. Tests are a fundamental source of operational truth

Generative models are probabilistic. The software we deliver must provide controlled, predictable and verifiable behavior.

An agent may claim that an implementation works, but that claim is not evidence. It is executable, reproducible tests linked to the acceptance criteria that demonstrate whether the expected behavior is met.

Tests do not eliminate every risk, nor do they prove the absolute absence of defects. They do provide deterministic evidence about the behaviors they verify and allow regressions to be detected repeatably.

> **It is not the agent that proves the software works. It is the evidence produced by validation.**

### 3. Tests are contracts, not targets to be bent

Tests represent part of the intent of the product and of the engineering team. An agent tasked with implementing a change must not unilaterally redefine the criteria by which that change will be evaluated.

An agent must not delete, weaken, skip or alter the purpose of a test in order to get its implementation accepted. It may only modify a test when there is an explicit human instruction, an understood reason and a review proportionate to the risk.

When implementation and validation change at the same time, both changes must be reviewed independently and show that the contract is evolving deliberately, not that a failure is being covered up.

> **The test judges the agent. The agent does not judge the test.**

### 4. Guardrails are part of the goal

Security policies, architectural rules, access controls, operational limits, regulatory requirements and quality thresholds are not impediments external to the task. They are part of its definition.

An agent must not disable controls, expand its own permissions, ignore restrictions or modify protection mechanisms in order to achieve a result. Any exception must be explicit, traceable, limited and authorized by a person with the appropriate accountability.

> **A result that requires destroying its controls is not a valid result.**

### 5. Validating is as important as building

Implementation creates capability. Validation creates trust. No feature is finished merely because the code exists, compiles or was generated quickly.

Investment in testing frameworks, evaluation environments, test data, observability and control automation must grow at the same pace as our generation capability. If we multiply the volume of changes without expanding our ability to evaluate them, we have not increased our productivity: we have accumulated risk faster.

> **Software that has not been validated is not finished.**

### 6. Speed does not justify the absence of evidence

Competing, innovating and reaching the market first are legitimate needs. None of them breaks our commitment to the people who will use the software.

We do not consider it a success to quickly deliver a system we do not understand, cannot control or have not tested in proportion to its risk. Sustainable speed includes the time needed to define criteria, verify behavior, review results and prepare recovery from failure.

> **Speed without evidence is not engineering; it is unacknowledged risk.**

### 7. Every AI-assisted system must be observable

We must be able to reconstruct the involvement of artificial intelligence in the development lifecycle. At a minimum, we must know the requested goal, the relevant context, the artifacts created or modified, the validations executed, their results and the human acceptance decisions.

Traceability must be proportionate to impact. The greater an agent's autonomy, scope or risk, the greater our ability must be to audit it, limit it, stop it and revert its actions.

> **We cannot govern what we cannot observe.**

### 8. We measure the whole system, not just output

Lines of code, the number of pull requests or the time it takes to generate a solution are not enough to assess the value of artificial intelligence.

We must jointly measure:

- the quality, security, performance and maintainability of the software;
- the ability of tests to detect defects and regressions;
- the stability and usefulness of evaluations;
- the acceptance and correction rate of the agent's proposals;
- defects introduced, escaped and reopened;
- the economic and operational cost of the assistance;
- the human time spent understanding, correcting and validating;
- how often the agent attempts to alter tests, controls or scope;
- the ability to detect, stop and revert a divergence.

Metrics must help us decide, not decorate an adoption that has already been decided. A local improvement in speed does not make up for a global degradation in quality or in our ability to control.

### 9. We must detect divergence before damage

We do not merely wait for software to fail. We watch for when the agent begins to drift from the original intent, expands the scope, introduces unauthorized assumptions, modifies contracts or takes shortcuts incompatible with our standards.

Our systems must make it possible to pause, revoke and revert decisions before they spread. The ability to recover is not a measure taken after failure, but a property of the design.

> **We must detect divergence before we suffer its consequences.**

### 10. Every AI-generated result is a hypothesis until it is validated

Code, tests, documentation, diagrams, specifications, analyses and recommendations share the same condition when they are produced by a generative model: they are not sources of truth in themselves.

Each artifact must be validated through the appropriate mechanism. Whenever possible, we will use deterministic tests, schemas, compilers, linters, static analyzers, security checks and executable rules. When the nature of the artifact does not allow complete deterministic validation, we will require expert review, cross-checking against authoritative sources, traceability and an explicit statement of uncertainty.

A single answer from a model can be useful as a starting point. It must never become truth merely because it was generated, or because it looks correct.

> **What AI generates is not evidence. It is a claim that needs evidence.**

### 11. The independence of validation must be preserved

Whoever produces a solution must not control, without oversight, the mechanisms that determine its acceptance. This principle, known for decades in critical systems, becomes even more important when an agent can simultaneously modify implementation, tests, configuration and documentation.

To the extent the risk allows, we will separate generation from evaluation; proposal from approval; and execution from authorization. When complete separation is not possible, we will apply compensating controls, human review and reinforced traceability.

### 12. Our governance must evolve with the evidence

We are at an early stage. No organization should assume it has already definitively solved the integration of artificial intelligence into software engineering.

We will define explicit frameworks for action, learn from their use and review them periodically. We will increase autonomy only when the data show that our validation, observability and recovery systems can sustain it.

Trust is not granted all at once. It is built gradually and can be revoked.

---

## Engineering commitments

To turn these principles into a real way of working, we commit to:

1. **Define intent before delegating.** State acceptance criteria, constraints and limits before asking an agent to act.
2. **Keep a person accountable.** Identify who accepts each change and who answers for its consequences.
3. **Protect tests and controls.** Require explicit authorization and review for any modification of validation mechanisms.
4. **Separate implementation and acceptance.** Prevent the same agent from generating, modifying and approving its own evidence without independent control.
5. **Apply least privilege.** Grant each agent only the capabilities, tools, data and access duration it needs.
6. **Validate according to risk.** Increase the depth of testing and review as impact, autonomy or irreversibility increase.
7. **Record relevant actions.** Keep the traceability needed to understand, audit and reproduce changes.
8. **Measure quality, not just speed.** Evaluate defects, regressions, maintainability, security, review cost and outcomes for the user.
9. **Prepare for revocation.** Design mechanisms to stop agents, revert changes and restore service.
10. **Treat outputs as proposals.** Do not turn generated code, documentation, diagrams or decisions into sources of truth without adequate validation.
11. **Continuously review the framework.** Adapt policies, tests, metrics and permissions based on incidents, data and learning.
12. **Preserve professional judgment.** Use artificial intelligence to expand our capability, never as an excuse to give up understanding and deciding.

---

## Warning signs

We consider the following to be signs of irresponsible adoption:

- merging AI-generated pull requests without a review proportionate to the risk;
- accepting tests modified solely to make an implementation pass;
- allowing an agent to disable linters, security controls or access policies;
- measuring success only by volume of code, number of changes or reduction in implementation time;
- deploying artifacts that no one on the team can explain;
- using generated documentation as a source of truth without cross-checking it;
- expanding autonomy without having auditing, limits and revocation mechanisms in place;
- treating the appearance of correctness as evidence;
- normalizing avoidable failures on the grounds that “the AI did it”;
- increasing production capacity without increasing validation capacity.

---

## How we will recognize healthy engineering

We will know we are moving in the right direction when:

- every change has understandable acceptance criteria and associated evidence;
- tests fail in the face of real defects and are not adapted to hide them;
- changes to contracts and guardrails are explicit and traceable;
- we can reconstruct what an agent did and why its result was accepted;
- we know the rate of defects, corrections and regressions associated with the use of AI;
- we can stop or revert an action without depending on the agent itself;
- quality and maintainability improve along with speed;
- teams understand the software they operate;
- autonomy is granted on the basis of evidence and can be reduced when that evidence changes;
- our users receive more valuable software without bearing risks that we chose to ignore.

---

## Final declaration

We do not renounce artificial intelligence. We renounce using it without accountability.

We do not reject speed. We reject confusing speed with progress.

We do not defend tests as a formality. We defend them as executable contracts that safeguard our intent.

We do not accept that an agent should redefine what it means to succeed, remove the limits that contain it or become the judge of its own work.

We recognize that we are at an early stage and that our framework will evolve. Precisely for that reason, we choose to observe, measure, validate and learn.

Artificial intelligence can write more software than we have ever been able to produce. Our obligation is to ensure that this software deserves to exist, can be understood and is worthy of the trust of those who use it.

> **In the age of mass software generation, trust is the most important product of engineering.**
