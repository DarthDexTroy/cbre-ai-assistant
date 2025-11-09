# Guide: Adding Compatible Images to Properties Database

## Problem

Direct Unsplash image URLs (like `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800`) often don't work in web applications due to:
- CORS (Cross-Origin Resource Sharing) restrictions
- Authentication requirements
- Invalid or expired photo IDs
- API changes

## Solution

This application now includes:
1. **Automatic fallback images** - If an image fails to load, a compatible fallback is automatically used
2. **Image utility functions** - Helper functions to generate compatible image URLs
3. **Error handling** - All image components handle loading errors gracefully

## How to Add Compatible Images

### Option 1: Use Unsplash Source API (Recommended - Simple)

The Unsplash Source API is the simplest way to get working images without authentication:

```json
{
  "images": [
    "https://source.unsplash.com/800x600/?modern office building"
  ]
}
```

**Format:** `https://source.unsplash.com/{width}x{height}/?{keyword}`

**Examples:**
- Office: `https://source.unsplash.com/800x600/?modern office building`
- Industrial: `https://source.unsplash.com/800x600/?warehouse industrial`
- Retail: `https://source.unsplash.com/800x600/?retail shopping center`
- Residential: `https://source.unsplash.com/800x600/?apartment building`

**Pros:**
- No authentication needed
- Works reliably
- Easy to use
- Keyword-based search

**Cons:**
- Images are random (not specific photos)
- May occasionally return similar images

### Option 2: Use Picsum Photos (Most Reliable)

Picsum Photos provides high-quality placeholder images that always work:

```json
{
  "images": [
    "https://picsum.photos/seed/prop-001/800/600"
  ]
}
```

**Format:** `https://picsum.photos/seed/{property-id}/{width}/{height}`

**Examples:**
- `https://picsum.photos/seed/prop-001/800/600`
- `https://picsum.photos/seed/prop-002/800/600`

**Pros:**
- Always works (no CORS issues)
- Consistent images per property (using seed)
- High-quality photos
- No authentication needed

**Cons:**
- Not property-specific (generic photos)
- Less control over image content

### Option 3: Use Your Own Image Hosting

If you have your own images, host them on:
- Your own server
- AWS S3
- Cloudinary
- Imgur
- Any CDN that allows CORS

**Format:** Any HTTPS URL to a valid image file

**Example:**
```json
{
  "images": [
    "https://your-cdn.com/images/property-001.jpg"
  ]
}
```

### Option 4: Use Placeholder.com (For Testing)

For development/testing purposes:

```json
{
  "images": [
    "https://placehold.co/800x600?text=Property+Image"
  ]
}
```

## Using the Image Utility Functions

The application includes utility functions in `src/lib/imageUtils.ts`:

### Generate Property-Appropriate Images

```typescript
import { getPropertyImageUrl } from "@/lib/imageUtils";

// Automatically generates appropriate image based on property type
const imageUrl = getPropertyImageUrl("Office", 800, 600);
// Returns: "https://source.unsplash.com/800x600/?modern office building"
```

### Generate Picsum Images

```typescript
import { getPicsumImageUrl } from "@/lib/imageUtils";

// Generate consistent image using property ID as seed
const imageUrl = getPicsumImageUrl(800, 600, "prop-001");
// Returns: "https://picsum.photos/seed/prop-001/800/600"
```

## Updating properties.json

### For Existing Properties

1. Open `src/data/properties.json`
2. Find the property you want to update
3. Replace the `images` array with a compatible URL:

```json
{
  "id": "prop-001",
  "title": "Downtown Austin Class A Office Tower",
  "type": "Office",
  "images": [
    "https://source.unsplash.com/800x600/?modern office building"
  ]
}
```

### For New Properties

When adding new properties, always include an `images` array:

```json
{
  "id": "prop-999",
  "title": "New Property",
  "type": "Industrial",
  "images": [
    "https://source.unsplash.com/800x600/?warehouse industrial"
  ]
}
```

## Image Recommendations by Property Type

| Property Type | Recommended Keyword/URL |
|--------------|------------------------|
| Office | `modern office building` or `office tower` |
| Industrial | `warehouse industrial` or `distribution center` |
| Retail | `retail shopping center` or `shopping mall` |
| Residential | `apartment building` or `residential complex` |
| Mixed-Use | `mixed use building` or `commercial building` |

## Automatic Fallback

**Good news!** Even if you don't update the images, the application will:
1. Try to load the original image URL
2. If it fails, automatically use a fallback image based on property type
3. Never show broken image icons

## Best Practices

1. **Always include images array** - Even if empty, the fallback will work
2. **Use appropriate keywords** - Match the keyword to the property type
3. **Consistent dimensions** - Use 800x600 for consistency (or 800x400 for cards)
4. **Test your URLs** - Open the URL in a browser to verify it works
5. **Use seeds for consistency** - If using Picsum, use property ID as seed

## Quick Reference

### Unsplash Source API
```
https://source.unsplash.com/{width}x{height}/?{keyword}
```

### Picsum Photos
```
https://picsum.photos/seed/{seed}/{width}/{height}
```

### Placeholder.com
```
https://placehold.co/{width}x{height}?text={text}
```

## Troubleshooting

**Images not showing?**
- Check browser console for CORS errors
- Verify the URL works in a new browser tab
- The fallback should activate automatically

**Want specific images?**
- Use your own image hosting
- Or use Unsplash Source with very specific keywords
- Consider using the Unsplash API (requires authentication)

**Need help?**
- Check `src/lib/imageUtils.ts` for utility functions
- All components handle errors automatically
- Fallback images are always available

