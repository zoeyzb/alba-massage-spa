# ALBA Massage & Wellness

A responsive, editorial-style spa website built with plain HTML, CSS, and vanilla JavaScript. The visual system pairs deep forest emerald with champagne gold, soft ivory, and muted jade.

![ALBA desktop hero mockup](design/mockup-desktop.png)

| Mobile preview | Full-page design |
|---|---|
| ![ALBA mobile hero mockup](design/mockup-mobile.png) | [View full-page mockup](design/mockup-full-page.png) |

## Run locally

```bash
npm install
npm run serve
```

Open [http://localhost:3000](http://localhost:3000).

## What is included

- A split hero with locally stored real spa photography, a layered metallic-gold arch, a moving highlight, a small glowing point, sculpted stones, and softly animated steam.
- A first-screen trust strip with four short, legible reassurance points.
- Treatment cards, signature rituals, a spa-space gallery, concise FAQs, and a responsive enquiry form.
- Mobile navigation, keyboard-friendly focus states, scroll-aware header, gentle reveal transitions, and reduced-motion support.
- Locally stored photography. Source URLs and license references are recorded in `assets/credits.json`; images are illustrative stock photos, not photos of ALBA’s actual premises, staff, or guests.

## Enquiries and important limits

The form prepares an email draft to `sierra@recoverrevenue.company` and offers a copy fallback. It **does not** submit to a booking backend, check live availability, or confirm an appointment. The spa must reply to confirm a booking.

Prices are intentionally not invented; treatment cards say “By enquiry.” Fabricated customer testimonials and unverified membership tiers have been removed. Replace stock images and confirm service descriptions, contact details, and actual policies with the spa before a public business launch.

## Checks

```bash
npm test
```

The smoke suite checks the hero layers, local image assets and credits, mobile navigation, first-screen trust strip, enquiry behaviour, concise/accurate content, responsive overflow, and reduced-motion mode.

## Publishing

The GitHub Actions workflow in `.github/workflows/pages.yml` publishes the static site to GitHub Pages when Pages is enabled for the repository. The intended public URL is:

https://zoeyzb.github.io/alba-massage-spa/
