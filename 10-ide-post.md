# 10 Computree Discord Posts

Each numbered section is a complete, standalone English message. Paste the heading and message together. Product and infrastructure capabilities are described as planned unless they have been verified.

---

## 01 · What we're building

Hey everyone — Computree is being designed as an access layer for NVIDIA GPU compute. The goal is to make network-acquired compute available through a programmable API, so applications can focus on what they want to build.

The API and provider flow are still being validated, so this isn't a live compute service yet. What would you like us to explain first?

---

## 02 · The problem we're exploring

GPU compute can involve hardware decisions, provisioning, cloud accounts, and fragmented providers. We're exploring whether an access layer can make that workflow simpler—not claiming those trade-offs are solved yet.

What's the biggest source of friction for your team: setup, availability, cost visibility, or something else?

---

## 03 · Not another chatbot

Computree isn't being designed as another AI chat interface. The focus is the infrastructure behind an app: API access, job handling, provider orchestration, and returning results to the caller.

What would you want a compute-access product to do that your current setup doesn't?

---

## 04 · The request path we're working toward

The target MVP flow is:

`Open WebUI → Computree API → job/allocation → Golem requestor → GPU worker (Qwen + Ollama) → response`

This is a planned architecture, not a production integration yet. Which step should we unpack first?

---

## 05 · Balance, allocation, and payment are different

The proposed access model keeps three things separate: $CTREE eligibility, compute allocation, and provider payments. Their units and sources of truth need to be defined independently; we don't have finalized thresholds or conversion figures to share yet.

What should a usage dashboard show to feel transparent?

---

## 06 · Which app should we test?

Open WebUI is the first client planned for integration. LibreChat is also on our test list, but we won't call it supported until compatibility has been verified.

Which app would be most useful for us to test next—and what workflow should that test cover?

---

## 07 · Why start with one provider?

The MVP plan evaluates Golem as the first provider-adapter candidate. The goal is to prove one request path end to end before talking about a wider network. Provider availability, pricing, and production GPU execution still need verification.

What evidence would you expect before trusting a provider integration?

---

## 08 · Qwen and Ollama do different jobs

Quick stack distinction: Qwen is the model; Ollama is a runtime used to serve models. They sit at different layers of the proposed worker setup.

Would a short diagram of `model → runtime → worker → API` be useful?

---

## 09 · Demo data isn't production evidence

A mock dashboard, CPU response, or successful API request alone doesn't prove a production GPU job ran.

We'll keep demo values labeled and share GPU availability only when it's backed by a verifiable run. What proof would you want to see in a build update?

---

## 10 · Queued isn't the same as parallel

Several jobs in a queue don't mean several GPUs are running them at once. The design distinguishes `queued`, `running`, and genuinely parallel GPU execution.

Which matters more for your workloads: a clear wait state or simultaneous workers?
