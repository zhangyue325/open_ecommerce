export const PURPOSE_PROMPTS: Record<string, { prompt: string; sampleImageUrl?: string }> = {
  "Clean Product Shot": {
    prompt: `tagline: Valentine's Day Promotion
call-to-action button: SHOP NOW

product layout: Center the product.
logo layout: Place the provided brand logo on the bottom-right corner, small and elegant.
tagline layout: tagline should be highlighted.
call-to-action layout: should be highlighted with a black background button.

Place the product on a soft, minimalist studio set with a clean, warm background (off-white, pastel beige, or light blue tones).
Use diffused daylight to create gentle shadows and a premium, airy atmosphere.
Include a sense of depth with subtle surface reflections or rounded props behind to frame the product elegantly.
Leave open negative space for text placement (tagline and call-to-action button).
Overall aesthetic: calm, luxurious, minimalist, suitable for paid ads creative.`,
    sampleImageUrl: "/clean_product_shot.png",
  },
  "Shoes With Model Feet": {
    prompt: `tagline: Valentine's Day Promotion
call-to-action button: SHOP NOW

product layout: Should have a model standing naturally with legs visible from bottom calf, showing the shoes clearly in the center of the frame. Focus on shoes.
logo layout: Place the provided brand logo on the upper-left corner, small and elegant.
tagline layout: tagline should be highlighted below the model legs with the shoes.
call-to-action layout: should be highlighted with a black background button and below the tagline.

Scene: Use a warm, softly lit environment with neutral tones (beige, blush, cream).
Lighting should be diffused to create soft shadows.
Overall aesthetic: clean, modern, elegant fashion advertisement.`,
    sampleImageUrl: "/shoes_with_model_feet.png",
  },
  "Performance Max Asset": {
    prompt: `tagline: Valentine's Day Promotion
call-to-action button: SHOP NOW

Product layout: Show a model seated or mid-step in a natural, comfortable pose, highlighting the shoes clearly. Focus on conveying comfort and elegance.
Logo layout: Place the provided brand logo on the upper-right corner, small and elegant. The logo should not overlap with other contents.
Tagline layout: Tagline should appear near the shoes or beside the model and be slightly highlighted.
Call-to-action layout: Highlight the call-to-action button with a black background below the tagline.
The tagline and call-to-action button should not overlap with other contents.

Scene: Create a cozy, lifestyle-inspired environment with soft pastel or neutral background tones (beige, blush, or soft peach). Include minimal props such as fabric textures, chair legs, or paper bags to suggest daily life. Lighting should be diffused, evoking comfort and warmth.
Overall aesthetic: modern, lifestyle-focused, and aspirational, suitable for a Performance Max campaign creative.`,
    sampleImageUrl: "/performance_max_asset.png",
  },
  "Poster Style": {
    prompt: `Logo layout: Place the provided brand logo on the upper-right corner, small and elegant. The logo should not overlap with other contents.
Tagline layout: Large bold headline near the bottom.
Overall aesthetic: bold, editorial, confident, modern luxury campaign.
Ensure the product and brand identity remain realistic and unchanged.

Show a model walking outdoors in bright daylight, wearing the product.
The clothes of the model should match the shoes in a natural and comfortable way.
Use a clean, architectural background such as white stone walls or minimalist textures for the model.
Lighting should be strong but natural, creating crisp shadows for a modern fashion editorial look.
Only the model has a rectangle background, the product and tagline should use the same pure color background.

Display the product again as a secondary floating beside the model to highlight design details.`,
    sampleImageUrl: "/poster_style.png",
  },
  "Emotional Hook": {
    prompt: `tagline: Valentine's Day Promotion
call-to-action button: SHOP NOW

product layout: Product worn on model (natural lifestyle context, not isolated).
logo layout: Place the provided brand logo subtly at the bottom or blended into the scene.
tagline layout: Large, bold, eye-catching at top or center.
call-to-action layout: Native-style button, slightly rounded, high contrast.

Scene:
Show a candid, lifestyle moment (e.g., walking on the street, cafe, date setting, soft urban background).
Focus on movement (walking step, slight motion blur, natural pose).

Lighting:
Golden hour or soft natural light for warmth and emotional appeal.

Composition:
Vertical-friendly.
Tight framing — optimized for mobile scrolling.
Keep clear focal point on the shoes.

Background:
Slightly blurred (depth of field) to emphasize product.

Mood:
Emotional, relatable, aspirational — like a real Instagram post.

Overall aesthetic:
Social-first, authentic, lifestyle-driven, designed to blend into feed but still stand out.`,
    sampleImageUrl: "/emotional_hook.png",
  },
  "Scroll Stopper": {
    prompt: `tagline: Black Friday Sale
sub-tagline: Biggest Sale of the Year
call-to-action button: SHOP NOW


product layout: Large hero product, slightly angled or floating.
logo layout: Small but sharp, placed top or bottom corner.
tagline layout: Big, bold typography, high contrast.
call-to-action layout: Strong button with high contrast (black or red).

Scene:
Minimal but bold composition with strong visual contrast.
Use a clean background but with a striking element (gradient, shadow, or abstract shape).

Lighting:
High contrast lighting with defined shadows to create depth and drama.

Composition:
Close-up crop — product fills 60-80% of frame.
Optimized for mobile feed visibility.

Background:
Solid color or gradient (e.g., soft pink, deep red, beige).
Optional subtle texture or shadow to avoid flatness.

Enhancements:
Add subtle motion elements (floating particles, light streaks, or soft glow).

Mood:
Confident, premium, attention-grabbing.

Overall aesthetic:
Scroll-stopping, bold, performance-driven creative optimized for conversions.`,
    sampleImageUrl: "/scroll_stopper.png",
  },
  "Catalog White Background": {
    prompt: `tagline: Best Seller
call-to-action button: SHOP NOW

product layout: Show the product front-facing, centered, and large in frame.
logo layout: Place the brand logo small and neat in the top-left corner.
tagline layout: Keep the tagline minimal and secondary to the product.
call-to-action layout: Small but visible button near the lower section.

Scene:
Use a pure white or very soft light gray ecommerce background.
No extra props. No human model. No distracting elements.

Lighting:
Bright, even studio lighting with soft realistic shadow under the product.

Composition:
Clean catalog framing with generous margins.
Keep edges sharp and product details highly visible.

Overall aesthetic:
Marketplace-safe, crisp, commercial, clean, and optimized for product listing conversion.`,
  },
  "Luxury Studio Spotlight": {
    prompt: `tagline: Limited Edition Drop
call-to-action button: SHOP NOW

product layout: Feature the product as a hero object in the center with a premium, sculptural feel.
logo layout: Place the logo subtly in the bottom corner.
tagline layout: Keep the tagline elegant and refined with generous spacing.
call-to-action layout: Minimal luxury-style button with strong contrast.

Scene:
Place the product in a dark luxury studio with subtle gradient background and premium reflective surface.
Use elegant shadows and controlled highlights to emphasize shape and texture.

Lighting:
Single spotlight plus soft fill light for a dramatic premium look.

Composition:
Balanced and symmetrical with strong negative space for luxury branding.

Overall aesthetic:
High-end, cinematic, premium ecommerce hero image for upscale campaigns.`,
  },
  "Bundle Offer Visual": {
    prompt: `tagline: Buy More Save More
call-to-action button: SHOP NOW

product layout: Show multiple products arranged as a cohesive bundle with one main hero item and supporting products around it.
logo layout: Place the logo at the top-right corner.
tagline layout: Bold promotional headline above or beside the bundle.
call-to-action layout: High-contrast retail-style button below the offer messaging.

Scene:
Use a clean studio backdrop with subtle retail shadows and enough space to clearly separate each item.
Optional soft geometric shapes behind the products to support grouping.

Lighting:
Bright, even lighting with enough definition to separate the products.

Composition:
Make the bundle easy to understand at a glance.
Prioritize clarity, value perception, and conversion.

Overall aesthetic:
Promotional, clean, value-driven, optimized for ecommerce bundle offers.`,
  },
  "Benefit Callout Ad": {
    prompt: `tagline: All-Day Comfort
call-to-action button: LEARN MORE

product layout: Show the product clearly with room for supporting benefit callouts around it.
logo layout: Place the logo neatly in the upper corner.
tagline layout: Strong headline focused on one product benefit.
call-to-action layout: Clean direct-response button near the headline area.

Scene:
Use a clean, bright background with subtle gradients or soft shapes that support readability.
Allow room for short supporting labels or icon-like benefit points.

Lighting:
Fresh, commercial studio lighting with soft highlights and realistic depth.

Composition:
Product remains the main focus while benefit messaging feels integrated and readable.

Overall aesthetic:
Clear, persuasive, benefit-led ad creative designed for conversion and product education.`,
  },
  "Founder Story Visual": {
    prompt: `tagline: Made With Purpose
call-to-action button: DISCOVER MORE

product layout: Show the product in a warm, authentic lifestyle scene with a handcrafted or founder-led brand feeling.
logo layout: Keep the logo understated and premium.
tagline layout: Emotional, story-first headline near the top or center.
call-to-action layout: Soft, tasteful button integrated into the composition.

Scene:
Create a lifestyle setup that feels real, intimate, and brand-driven.
Use subtle props, natural textures, and a believable environment that suggests craftsmanship and intention.

Lighting:
Soft natural light with warm shadows and gentle highlights.

Composition:
Authentic and editorial rather than overly polished.
Keep emotional clarity and product visibility balanced.

Overall aesthetic:
Warm, story-rich, founder-brand creative for social and landing page use.`,
  },
  "UGC Testimonial Frame": {
    prompt: `tagline: 10,000+ Happy Customers
call-to-action button: SHOP NOW

product layout: Show the product in use or near a believable lifestyle context, with a strong social-proof feel.
logo layout: Small and subtle, placed in a corner.
tagline layout: Testimonial-style headline or customer quote at the top.
call-to-action layout: Clear mobile-friendly button near the bottom.

Scene:
Create a natural, creator-style environment such as home, street, or cafe.
Keep it authentic and relatable, as if captured for a social ad.

Lighting:
Natural daylight or soft indoor lifestyle lighting.

Composition:
Vertical or mobile-friendly framing with product focus and room for quote-style text.

Overall aesthetic:
UGC-inspired, trustworthy, social-first, optimized for paid social testing.`,
  },
  "Promo Countdown Banner": {
    prompt: `tagline: 48 Hours Only
sub-tagline: Limited Time Offer
call-to-action button: SHOP NOW

product layout: Hero product large in frame with clear separation from promotional text.
logo layout: Small but visible in the top corner.
tagline layout: Large countdown-driven headline with urgency.
call-to-action layout: Strong retail-style button with bold contrast.

Scene:
Use a bold promotional background with subtle gradient, light effects, or graphic shapes to create urgency.
Keep the product sharp and easy to identify instantly.

Lighting:
High-contrast commercial lighting with punchy highlights.

Composition:
Design for immediate readability in paid ads and mobile placements.

Overall aesthetic:
Urgent, promotional, high-conversion campaign banner with strong retail energy.`,
  },
  "New Arrival Launch": {
    prompt: `tagline: New Arrival
call-to-action button: SHOP NOW

product layout: Present the product as a fresh hero launch item with elegant spacing and strong visual focus.
logo layout: Place the logo discreetly in the upper area.
tagline layout: Modern editorial headline with launch energy.
call-to-action layout: Clean premium button below the launch message.

Scene:
Use a clean, modern launch backdrop with soft gradients, minimal props, or architectural forms that feel fashion-forward.

Lighting:
Bright, premium studio lighting with polished reflections and subtle depth.

Composition:
Balanced, spacious, and premium.
Make the product feel new, elevated, and desirable.

Overall aesthetic:
Launch-ready ecommerce creative for product drops, homepage heroes, and paid ads.`,
  },
  "Comparison Showcase": {
    prompt: `tagline: See The Difference
call-to-action button: SHOP NOW

product layout: Present the hero product prominently with a side-by-side or layered comparison concept that highlights key differences or upgrades.
logo layout: Keep the logo clean and secondary.
tagline layout: Headline should clearly communicate comparison or improvement.
call-to-action layout: Clear conversion-focused button below the headline.

Scene:
Use a clean structured layout with subtle dividers, contrasting background panels, or product positioning that emphasizes comparison.

Lighting:
Commercial studio lighting with clear product edges and realistic depth.

Composition:
Make comparison easy to understand in a single glance.
Ensure the upgraded or featured product feels dominant.

Overall aesthetic:
Structured, informative, conversion-focused visual for feature comparison and product positioning.`,
  },
  "Instagram Carousel Cover": {
    prompt: `tagline: Swipe To See More
call-to-action button: SHOP NOW

product layout: Present the product as the main hero with a strong centered composition that works as the first slide of an Instagram carousel.
logo layout: Keep the logo small and clean, integrated naturally into the design.
tagline layout: Large, stylish, editorial headline that feels native to Instagram.
call-to-action layout: Minimal soft CTA placement near the bottom, secondary to the visual.

Scene:
Use a premium brand-forward background with clean shapes, soft gradients, or subtle props.
Design the composition so it feels polished and highly saveable.

Lighting:
Bright, soft, premium lifestyle lighting with smooth shadows.

Composition:
Square format.
Strong central focus, clean spacing, and a striking first impression for social browsing.

Overall aesthetic:
Modern, branded, polished Instagram carousel cover optimized for engagement.`,
  },
  "Instagram Quote Post": {
    prompt: `tagline: Style Meets Comfort
call-to-action button: DISCOVER MORE

product layout: Keep the product visible but secondary to a bold quote-style message.
logo layout: Small and tasteful in a corner.
tagline layout: Make the quote or statement the visual hero with elegant typography.
call-to-action layout: Minimal, understated, and aligned with the editorial style.

Scene:
Use a clean branded backdrop with subtle texture, soft gradients, or premium paper-like tones.
The overall scene should feel highly designed, social, and shareable.

Lighting:
Soft, diffused, editorial lighting.

Composition:
Square post format with generous margins and a clear text hierarchy.
Keep the layout visually calm and premium.

Overall aesthetic:
Editorial, quote-led Instagram post with strong brand style and high save/share appeal.`,
  },
  "Instagram Product Flat Lay": {
    prompt: `tagline: New Drop
call-to-action button: SHOP NOW

product layout: Arrange the product in a neat flat lay composition viewed from above.
logo layout: Small and aligned cleanly to one corner.
tagline layout: Simple and stylish, integrated into unused negative space.
call-to-action layout: Small, neat, and visually consistent with the layout.

Scene:
Use carefully styled props and textures that support the brand world without cluttering the frame.
Examples: fabric, paper, flowers, accessories, or seasonal details.

Lighting:
Soft top-down daylight with delicate shadows for depth.

Composition:
Square Instagram-friendly crop.
Balanced object spacing and clean visual rhythm.

Overall aesthetic:
Stylized, curated, premium flat lay designed for branded Instagram feeds.`,
  },
  "Instagram Lifestyle Post": {
    prompt: `tagline: Everyday Luxury
call-to-action button: SHOP NOW

product layout: Show the product worn or used in a natural lifestyle setting with strong visual storytelling.
logo layout: Keep the logo subtle and integrated.
tagline layout: Clean social-style headline that enhances the mood without overpowering the image.
call-to-action layout: Minimal mobile-friendly CTA near the bottom.

Scene:
Create an aspirational but believable daily-life setting, such as cafe, city walk, home interior, or weekend outing.

Lighting:
Natural light with warm, flattering tones and realistic depth.

Composition:
Square or slightly vertical-safe framing with product still clearly visible.
Focus on mood, relatability, and social-native polish.

Overall aesthetic:
Authentic, aspirational, lifestyle-driven Instagram post designed for engagement.`,
  },
  "Instagram Promo Graphic": {
    prompt: `tagline: Weekend Sale
sub-tagline: Up To 30% Off
call-to-action button: SHOP NOW

product layout: Large product hero with enough room for promotional text and offer details.
logo layout: Keep the logo sharp and easy to identify.
tagline layout: Bold promotional headline with strong hierarchy.
call-to-action layout: Clear, bright, and mobile-friendly button placement.

Scene:
Use a vibrant branded background with graphic shapes, gradients, or playful retail elements.
Make the promo feel exciting but still premium.

Lighting:
Commercial studio lighting with crisp product definition.

Composition:
Square post format optimized for feed visibility.
High contrast, strong readability, and immediate promotional clarity.

Overall aesthetic:
Bold, retail-driven Instagram promo graphic built for clicks and conversions.`,
  },
  "Instagram UGC Style Post": {
    prompt: `tagline: Real Looks, Real Comfort
call-to-action button: SHOP NOW

product layout: Present the product in a casual creator-style composition with a social-native perspective.
logo layout: Minimal and subtle.
tagline layout: Keep the text short and natural, like branded creator content.
call-to-action layout: Small and unobtrusive.

Scene:
Create a believable user-generated style setting such as mirror selfie, home corner, street snap, or casual day-out moment.

Lighting:
Natural, imperfect-but-beautiful light with a realistic mobile-photo feel.

Composition:
Instagram-friendly composition that feels spontaneous but still aesthetically strong.
Keep the product readable while preserving authenticity.

Overall aesthetic:
UGC-inspired, relatable, trendy, and designed to blend naturally into Instagram feeds.`,
  },
};

export function getBuiltInPrompt(purpose: string) {
  return PURPOSE_PROMPTS[purpose]?.prompt ?? "";
}

export function getPurposeSampleImageUrl(purpose: string) {
  return PURPOSE_PROMPTS[purpose]?.sampleImageUrl ?? "";
}
