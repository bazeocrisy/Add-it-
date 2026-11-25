# Resource Inventory

Every destination the prototype links to lives in **`assets/js/resources.js`**. To update a phone number or link, change it there and every page updates.

**Legend**
- **Source: Owner.** Already listed on theweightmen.com with the owner's `lastVerified` date. The prototype shows "✓ Checked by The Weight on …".
- **Source: Prototype.** A suggested addition that fills a gap (grief, counseling, fatherhood, caregiving, legal). The prototype shows "◇ Suggested addition: not yet checked by The Weight". **The owner should confirm or remove each one before launch.**
- **Link check (2026-11-25):** the result from this sandbox, using curl plus headless Chromium. "Bot-protected" means the site answered with a Cloudflare or anti-bot challenge, so it could not be confirmed automatically. It is not confirmed broken.

## Emergency and crisis

| ID | Name | Phone / text | Link | Source | Link check |
|---|---|---|---|---|---|
| 911 | Emergency services | tel:911 | n/a | Owner | n/a |
| 988 | 988 Suicide & Crisis Lifeline | tel:988 · sms:988 | https://988lifeline.org/get-help/ | Owner 2026-11-23 | 200 ✔ |
| 988 chat | 988 online chat | n/a | https://chat.988lifeline.org/ | Owner 2026-11-23 | Bot-protected (403 challenge) |
| vcl | Veterans Crisis Line | tel:988 (press 1) · sms:838255 | https://www.va.gov/health-care/health-needs-conditions/mental-health/suicide-prevention/ | Owner 2026-11-23 | 200 ✔ |
| vcl chat | Veterans Crisis Line chat | n/a | https://www.veteranscrisisline.net/get-help-now/chat/ | Owner 2026-11-23 | 200 ✔ |
| dv | National Domestic Violence Hotline | tel:18007997233 · sms:88788 | https://www.thehotline.org/ | Owner 2026-11-24 | 200 ✔ |
| rainn | National Sexual Assault Hotline (RAINN) | tel:18006564673 | https://rainn.org/ | Owner 2026-11-24 | Bot-protected (403 challenge) |
| trafficking | National Human Trafficking Hotline | tel:18883737888 · sms:233733 | https://humantraffickinghotline.org/ | Owner 2026-11-24 | 200 ✔ |

## Counseling and treatment referral

| ID | Name | Phone | Link | Source | Link check |
|---|---|---|---|---|---|
| samhsa | SAMHSA National Helpline | tel:18006624357 | https://www.samhsa.gov/find-help/helplines/national-helpline | **Prototype** | 200 ✔ |
| findtreatment | FindTreatment.gov | n/a | https://findtreatment.gov/ | **Prototype** | 200 ✔ |
| mos | Military OneSource | tel:8003429647 | https://www.militaryonesource.mil/ | **Prototype** | 200 ✔ |

## Practical help

| ID | Name | Phone | Link | Source | Link check |
|---|---|---|---|---|---|
| 211 | 211 | tel:211 | https://www.211.org/ | Owner 2026-11-23 | 301 → 211.org (redirects correctly) |
| nchv | National Call Center for Homeless Veterans | tel:18774243838 | https://department.va.gov/homeless/nationalcallcenter/ | Owner 2026-11-23 | 200 ✔ |
| food | Feeding America food-bank finder | n/a | https://www.feedingamerica.org/find-your-local-foodbank | Owner 2026-11-23 | 200 ✔ |
| ajc | American Job Centers | tel:18778725627 | https://www.careeronestop.org/LocalHelp/AmericanJobCenters/find-american-job-centers.aspx | Owner 2026-11-23 | Bot-protected (403 challenge) |
| fatherhood | National Responsible Fatherhood Clearinghouse | n/a | https://www.fatherhood.gov/ | **Prototype** | 200 ✔ |
| eldercare | Eldercare Locator | tel:18006771116 | https://eldercare.acl.gov/ | **Prototype** | 200 ✔ |
| lawhelp | LawHelp.org | n/a | https://www.lawhelp.org/ | **Prototype** | 200 ✔ (browser) |

## Information

| ID | Name | Link | Source | Link check |
|---|---|---|---|---|
| vagov | VA.gov | https://www.va.gov/ | Owner 2026-11-23 | 200 ✔ |
| ftcJobs | FTC: Job Scams | https://consumer.ftc.gov/articles/job-scams | Owner 2026-11-23 | **403/404 to automated checks. Confirm by hand.** |
| (about page) | CDC/NCHS Data Brief 572 | https://www.cdc.gov/nchs/products/databriefs/db572.htm | Owner (stats.js) | Not reachable from this sandbox |

## The Weight's own tools (re-created in the prototype)

| Tool | Prototype page | Original |
|---|---|---|
| Unload: private writing | `unload.html` | theweightmen.com/unload.html |
| Talk It Through: message builder | `talk.html` (adds "Open in Messages") | theweightmen.com/talk.html |

## Not used in the prototype

The finder's **event** listings (job fairs, food drives) are empty on the live site, so the prototype has nothing to show for them. The owner's side-income ideas from `work.html` aren't repeated either. Both can be added to `resources.js` later.

## Phone numbers not re-verified here

This sandbox can't place phone calls. Every phone number is copied exactly from the owner's `site.js` / `resources.js` (owner-verified 2026-11-23/24), or, for **Prototype** items, from that organization's own official page. Before launch, call or check each Prototype number against its official page.
