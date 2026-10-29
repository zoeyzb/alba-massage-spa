# ALBA — hero and brand direction

## Brand character
Quiet confidence, restorative care, modern natural materials. Avoid generic beige spa styling, excessive copy, fake testimonials, invented menu prices, and synthetic-looking stock composites.

## Palette
- Deep ink / forest: `#071C18`
- Raised pine: `#10362D`
- Ivory: `#F4F0E5`
- Soft jade: `#B7CDBF`
- Champagne amber: `#E8A64D`
- Highlight gold: `#F8C56B`

## Hero composition
1. Deep emerald light field behind the photography.
2. A locally hosted, real spa photograph with a guest and therapist.
3. A multi-rim metallic-gold arch with a slow moving specular highlight.
4. Foreground stones with a separate animated steam layer.
5. A small, softly pulsing gold point.
6. The trust strip sits directly under the hero and nowhere else.

The hero uses CSS transforms and SVG/CSS gradients rather than WebGL or an animation CDN. The steam is a diffuse gradient layer, not a looping white line. On mobile, the photo comes first, the copy is compact, the stones move to the opposite side of the guest’s face, and the trust strip remains in the first viewport.

## Content integrity
- The service menu uses “By enquiry” rather than invented prices.
- Fake reviews and unconfirmed membership tiers are not shown.
- Stock photography is identified in `assets/credits.json` and must not be represented as actual ALBA staff or premises.
- The enquiry form opens a prefilled email draft; it does not confirm a booking.
