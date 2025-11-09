/**
 * Helper script to update property images in properties.json
 * 
 * This script helps you update all property images to use compatible URLs.
 * 
 * Usage:
 *   node scripts/update-property-images.js
 * 
 * Options:
 *   - Use Unsplash Source API (default)
 *   - Use Picsum Photos
 *   - Keep existing images that work
 */

const fs = require('fs');
const path = require('path');

const PROPERTIES_FILE = path.join(__dirname, '../src/data/properties.json');

// Property type to keyword mapping
const TYPE_KEYWORDS = {
  'Office': 'modern office building',
  'Industrial': 'warehouse industrial',
  'Retail': 'retail shopping center',
  'Residential': 'apartment building',
  'Mixed-Use': 'mixed use building',
};

/**
 * Generate Unsplash Source URL
 */
function getUnsplashUrl(type, width = 800, height = 600) {
  const keyword = TYPE_KEYWORDS[type] || 'commercial building';
  return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(keyword)}`;
}

/**
 * Generate Picsum Photos URL
 */
function getPicsumUrl(propertyId, width = 800, height = 600) {
  return `https://picsum.photos/seed/${propertyId}/${width}/${height}`;
}

/**
 * Update property images
 */
function updatePropertyImages(usePicsum = false) {
  try {
    // Read properties file
    const propertiesData = fs.readFileSync(PROPERTIES_FILE, 'utf8');
    const properties = JSON.parse(propertiesData);

    let updated = 0;

    // Update each property
    properties.forEach((property) => {
      let imageUrl;
      
      if (usePicsum) {
        imageUrl = getPicsumUrl(property.id, 800, 600);
      } else {
        imageUrl = getUnsplashUrl(property.type || 'Office', 800, 600);
      }

      // Update images array
      property.images = [imageUrl];
      updated++;
    });

    // Write back to file
    fs.writeFileSync(PROPERTIES_FILE, JSON.stringify(properties, null, 2), 'utf8');

    console.log(`✅ Successfully updated ${updated} properties with compatible images`);
    console.log(`📝 Using: ${usePicsum ? 'Picsum Photos' : 'Unsplash Source API'}`);
    console.log(`📁 File: ${PROPERTIES_FILE}`);
    
  } catch (error) {
    console.error('❌ Error updating property images:', error.message);
    process.exit(1);
  }
}

// Check command line arguments
const usePicsum = process.argv.includes('--picsum') || process.argv.includes('-p');

// Run the update
updatePropertyImages(usePicsum);

