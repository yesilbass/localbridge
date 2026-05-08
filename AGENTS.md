<claude-mem-context>
# Memory Context

# [bridge] recent context, 2026-05-06 5:21pm EDT

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (19,072t read) | 552,058t work | 97% savings

### May 6, 2026
1 2:24a 🔵 Bridge Platform — Full Backend Security & Reliability Audit Initiated
7 2:25a 🔵 vercel.json Confirmed: Three Wildcard Routes Point to Dead api/server, Not Just One
8 " 🔵 api/google-callback.js Bug: calendar_connected Set Before refresh_token Guard
9 " 🔵 Both Calendar Endpoints Confirmed: Wildcard CORS, No Auth, Error Message Leakage
10 2:26a 🔵 finalize-checkout.js All Four Bugs Confirmed in Exact Code Locations
11 " 🔵 create-subscription-checkout Prices Are Server-Side; Only Booking Checkout Has Price Manipulation Risk
12 " 🔵 api/realtime-session.js: sessionId Destructured but Never Used; OpenAI Error Text Leaked
13 2:27a 🔵 api/_lib/oauth.js: Auto-Refreshes and Persists Google Tokens via 'tokens' Event Listener
14 " 🔵 Bridge Production Domain and CORS Allowlist Confirmed in allowedOrigins.js
15 " 🔵 Client API Calls to Calendar and Auth Endpoints Send No Authorization Headers — Will Break After Auth Fix
16 " 🔵 getFeaturedMentors() Also Missing onboarding_complete Filter — Not Covered by Audit
17 " 🔵 client.js Confirmed Completely Orphaned — Zero Imports Anywhere in Codebase
18 " 🔵 cancellation_requests Table Confirmed to Exist; requestCancellation() Will 404 in Production
19 " 🔵 client/src/api/stripe.js Sends No Auth Headers to Checkout Endpoints
20 2:28a 🔵 IntakeCall.jsx Sends sessionId to Realtime Endpoint But Has No Auth Header — Confirms Both Issues
21 " 🔵 RLS on reviews and mentor_profiles Confirms Silent Rating Update Failure
22 2:29a 🔵 Bridge /api/ Has Exactly 9 Files — Vercel Function Count Confirmed, calendarBook.js Lib Not Yet Created
23 " 🔴 api/server.js Replaced: Dead Express Re-Export Removed, Now Returns JSON 404
24 2:30a 🟣 New api/_lib/auth.js Created: Shared JWT Verification Helper for All API Endpoints
25 " 🟣 api/_lib/allowedOrigins.js Extended with applyCors() Helper for Tightened CORS
26 " 🟣 api/_lib/calendarBook.js Created: Shared Calendar Booking Logic Eliminates Serverless-to-Serverless HTTP Call
27 " 🔴 api/calendar-book.js Refactored: JWT Auth Added, Wildcard CORS Fixed, Raw Error Leak Removed, Logic Delegated to Shared Lib
28 2:31a 🔴 api/calendar-availability.js Secured: JWT Auth Added, Wildcard CORS Fixed, Error Message Scrubbed
29 " 🔴 api/finalize-checkout.js: All Four Issues Fixed — Duplicate Client Removed, Debug Log Gone, HTTP Hop Eliminated, mentee_name Added
30 " 🔴 api/google-auth.js Secured: JWT Auth + Mentor Profile Ownership Check Added, Unused Import Removed
31 " 🔴 api/google-callback.js: Unused ALLOWED_ORIGINS Import Removed
32 2:32a 🔴 api/google-callback.js: refresh_token Guard Fixed — calendar_connected No Longer Set When Token Is Absent
33 " 🔴 api/realtime-session.js Secured: JWT Auth, Session Ownership Check, UUID Validation, OpenAI Error Scrubbed
34 " 🔴 api/create-booking-checkout.js: Price Manipulation Closed, JWT Auth Added, userId From Token
35 " 🔴 api/create-subscription-checkout.js: JWT Auth Added, userId From Token, Stripe Error Scrubbed
36 2:33a 🔴 client/src/api/calendar.js: Auth Headers Added to All Three Calendar API Calls
37 " 🔴 client/src/api/stripe.js: userId and sessionPrice Removed From Payloads, Auth Headers Added to Both Checkout Functions
38 " 🔵 Pricing/index.jsx Still Passes userId to createSubscriptionCheckout — Harmlessly Ignored After Signature Change
39 " 🔴 client/src/pages/IntakeCall.jsx: Authorization Header Added to Realtime Session Fetch
40 " ✅ client/src/api/client.js Marked as Dead Code With Deletion Instruction for Muaz
41 " 🔵 server/routes/cancellations.js Has Monthly Rate-Limiting Logic (3/month) That Must Be Preserved in Any Serverless Migration
42 2:34a ✅ client/src/api/cancellations.js: Production 404 Bug Documented With Architectural Decision Options
43 " 🔴 client/src/api/sessions.js acceptSession(): Jitsi Video Room URL Fixed From Bare Room Name to Full HTTPS URL
44 " 🔴 client/src/api/mentors.js getAllMentors(): Onboarding Filter Added to Hide Incomplete Real Mentor Profiles
45 " 🔴 client/src/api/reviews.js: Client-Side Rating Recalculation Block Removed, Replaced With DB Trigger Comment
S1 Full backend security and reliability audit of Bridge (paid mentorship platform) — 13 issues across API serverless functions and client-side API modules (May 6 at 2:34 AM)
S2 Full backend security and reliability audit of Bridge (paid mentorship platform) — 13 issues across API serverless functions and client-side API modules. All 14 tasks completed including final verification pass. (May 6 at 2:34 AM)
S3 Full backend security and reliability audit of Bridge — 13 issues fixed across API serverless functions and client-side modules. All tasks complete including a post-audit correction to the Jitsi URL change. (May 6 at 2:39 AM)
46 2:55a ⚖️ Cancellation System Architecture for Bridge Mentorship Platform
47 " 🟣 cancellation_requests Supabase Table Schema
48 " 🟣 MentorAvailabilityModal.jsx Timezone Selector Fix
49 2:56a 🔵 Production Bug: cancellation_requests Endpoint 404s on Vercel
50 " 🔵 Bridge Codebase: Infrastructure Baseline Before Cancellation Work
51 2:57a ✅ Landing Page Redesign Request: Hero, Typography, Header, and Animation
52 3:02a 🔵 Landing Page & Navbar Structure Mapped for Redesign
53 2:01p 🔵 HeroSection.jsx Full Content Mapped — Ready for Redesign
54 " ⚖️ New Design Request: Floating Transparent Navbar + Typewriter Animation Confirmation
55 2:05p ⚖️ User Reverted Landing Page Redesign and Pulled from Remote

Access 552k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>