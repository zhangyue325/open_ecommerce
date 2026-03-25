const DUMMY_SAMPLE_IMAGE_URL =
  "https://placehold.co/1200x1200/111827/e5e7eb?text=Sample+Image";

export const PURPOSE_PROMPTS: Record<string, { prompt: string; sampleImageUrl: string }> = {
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
  }
};

export function getBuiltInPrompt(purpose: string) {
  return PURPOSE_PROMPTS[purpose]?.prompt ?? "";
}

export function getPurposeSampleImageUrl(purpose: string) {
  return PURPOSE_PROMPTS[purpose]?.sampleImageUrl ?? "";
}
