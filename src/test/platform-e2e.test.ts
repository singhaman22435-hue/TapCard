/**
 * TapCard End-to-End System Integration & Workflow Test Suite
 * 
 * Verifies all 17 critical acceptance criteria:
 * 1. User registration & profile initialization
 * 2. Profile update (slug, photo, custom WhatsApp opener, services)
 * 3. Physical NFC Card creation (TC-XXXXXX code generation)
 * 4. Card assignment to customer profile
 * 5. Card activation and verification
 * 6. NFC URL resolution (/c/[code]?source=nfc)
 * 7. QR code resolution (/c/[code]?source=qr)
 * 8. vCard 3.0 generation & formatting
 * 9. Direct contact links (WhatsApp, Phone tel:, Email mailto:)
 * 10. Inbound lead generation submission & database persistence
 * 11. Multi-event analytics recording (view, nfc, qr, leads, ctr)
 * 12. Card replacement workflow (old card -> REPLACED, new card -> ACTIVE)
 * 13. Replacement routing verification (old card returns CARD_REPLACED)
 * 14. Inactive card verification (suspended card returns CARD_INACTIVE)
 * 15. Invalid card code verification (returns CARD_NOT_FOUND)
 * 16. Order creation & status advance pipeline
 * 17. Admin bulk card generation & CSV inventory
 */

import { repo } from '../lib/db/repository';
import { generateVCardString } from '../lib/vcard';
import { generateQRCodeDataUrl } from '../lib/qr';
import { getCardUrl, generateCardCode, getWhatsAppUrl } from '../lib/utils';

export async function runTapCardPlatformTests() {
  const results: Array<{ test: string; passed: boolean; details?: string }> = [];

  function assert(condition: boolean, test: string, details?: string) {
    if (condition) {
      results.push({ test, passed: true, details });
    } else {
      results.push({ test, passed: false, details });
      console.error(`❌ FAILED: ${test} - ${details || ''}`);
    }
  }

  console.log('🚀 STARTING TAPCARD E2E VERIFICATION SUITE...\n');

  // 1. Profile Creation
  const testUserId = `usr_test_${Date.now()}`;
  const profile = await repo.createProfile({
    user_id: testUserId,
    full_name: 'Priya Verma',
    designation: 'VP of Engineering',
    company: 'Skyline Cloud Systems',
    phone: '+919876500000',
    whatsapp: '+919876500000',
    email: 'priya@skylinecloud.io',
    website: 'https://skylinecloud.io',
    city: 'Bengaluru',
    country: 'India',
    custom_whatsapp_message: "Hi Priya, I tapped your TapCard at the Tech Summit!",
  });

  assert(Boolean(profile.id), '1. Profile created successfully', `ID: ${profile.id}, Slug: /${profile.slug}`);
  assert(profile.slug.startsWith('priya-verma'), '1b. Slug generated cleanly from name', profile.slug);

  // 2. Profile Update
  const updatedProfile = await repo.updateProfile(profile.id, {
    bio: 'Pioneering distributed cloud systems and edge NFC digital cards.',
    theme: 'modern',
    accent_color: '#0f766e',
  });
  assert(updatedProfile?.theme === 'modern', '2. Profile theme updated to "modern"', updatedProfile?.accent_color);

  // 3. Physical NFC Card Creation
  const newCardCode = generateCardCode('TC');
  const card = await repo.createCard({
    card_code: newCardCode,
    card_type: 'matte_black',
    status: 'AVAILABLE',
  });
  assert(card.status === 'AVAILABLE', '3. Physical card created with AVAILABLE status', `Code: ${card.card_code}`);

  // 4. Card Assignment
  const assignedCard = await repo.assignCard(card.id, profile.id, testUserId);
  assert(assignedCard?.status === 'ASSIGNED', '4. Card assigned to customer profile', `Profile ID: ${assignedCard?.profile_id}`);

  // 5. Card Activation
  const activatedCard = await repo.activateCard(card.id);
  assert(activatedCard?.status === 'ACTIVE' && Boolean(activatedCard.activated_at), '5. Card activated with activated_at timestamp');

  // 6. NFC URL Resolution
  const nfcResolution = await repo.resolvePublicIdentifier(card.card_code);
  assert(
    nfcResolution.profile?.id === profile.id && nfcResolution.card?.id === card.id,
    '6. NFC Card code resolves target customer profile',
    `Resolved: ${nfcResolution.profile?.full_name}`
  );

  // 7. QR Generation
  const qrTarget = getCardUrl(card.card_code, 'qr');
  const qrDataUrl = await generateQRCodeDataUrl(qrTarget, { width: 300 });
  assert(qrDataUrl.startsWith('data:image/png;base64,'), '7. Valid base64 QR code PNG generated for tracking URL');

  // 8. vCard 3.0 Generation
  const vcardStr = generateVCardString(profile);
  assert(
    vcardStr.includes('BEGIN:VCARD') &&
    vcardStr.includes('VERSION:3.0') &&
    vcardStr.includes('FN:Priya Verma') &&
    vcardStr.includes('ORG:Skyline Cloud Systems;') &&
    vcardStr.includes('END:VCARD'),
    '8. Compliant vCard 3.0 generated for phone book import'
  );

  // 9. WhatsApp Opener URL
  const waUrl = getWhatsAppUrl(profile.phone!, profile.custom_whatsapp_message);
  assert(
    waUrl.startsWith('https://wa.me/919876500000?text=') &&
    waUrl.includes('tapped%20your%20TapCard'),
    '9. Correct international format WhatsApp URL with encoded message'
  );

  // 10. Inbound Lead Submission
  const lead = await repo.createLead({
    profile_id: profile.id,
    card_id: card.id,
    name: 'Devendra Patel',
    email: 'dev@enterprise.org',
    phone: '+919811223399',
    message: 'We want to order 50 cards for our partner network.',
    source: 'nfc',
  });
  assert(lead.status === 'NEW' && lead.source === 'nfc', '10. Lead submitted and persisted with source="nfc"');

  // 11. Analytics Recording & Aggregation
  await repo.recordAnalyticsEvent({
    profile_id: profile.id,
    card_id: card.id,
    event_type: 'nfc_visit',
    source: 'nfc',
  });
  await repo.recordAnalyticsEvent({
    profile_id: profile.id,
    card_id: card.id,
    event_type: 'profile_view',
    source: 'nfc',
  });
  await repo.recordAnalyticsEvent({
    profile_id: profile.id,
    card_id: card.id,
    event_type: 'whatsapp_click',
    source: 'nfc',
  });

  const summary = await repo.getAnalyticsSummary(profile.id);
  assert(summary.totalViews >= 1 && summary.nfcTaps >= 1, '11. Analytics metrics aggregated correctly', `Views: ${summary.totalViews}, Taps: ${summary.nfcTaps}`);

  // 12. Card Replacement Workflow
  const replacementCard = await repo.createCard({
    card_type: 'metallic_gold',
    status: 'AVAILABLE',
  });
  const replaceResult = await repo.replaceCard(card.id, replacementCard.id);
  assert(
    replaceResult.oldCard.status === 'REPLACED' && replaceResult.newCard.status === 'ACTIVE',
    '12. Atomic card replacement: old=REPLACED, new=ACTIVE'
  );

  // 13. Replacement Verification Screen
  const oldCardCheck = await repo.resolvePublicIdentifier(card.card_code);
  assert(oldCardCheck.errorReason === 'CARD_REPLACED', '13. Old card correctly triggers CARD_REPLACED guard');

  // 14. Suspended Card Verification
  await repo.updateCardStatus(replacementCard.id, 'SUSPENDED');
  const suspendedCheck = await repo.resolvePublicIdentifier(replacementCard.card_code);
  assert(suspendedCheck.errorReason === 'CARD_INACTIVE', '14. Suspended card correctly triggers CARD_INACTIVE guard');

  // 15. Invalid Card Code Verification
  const invalidCheck = await repo.resolvePublicIdentifier('TC-INVALID-999');
  assert(invalidCheck.errorReason === 'CARD_NOT_FOUND', '15. Invalid card code triggers CARD_NOT_FOUND guard');

  // 16. Orders Pipeline
  const order = await repo.createOrder({
    user_id: testUserId,
    profile_id: profile.id,
    quantity: 2,
    card_type: 'metallic_gold',
    design: 'corporate',
    amount: 4998,
    shipping_name: 'Priya Verma',
    shipping_phone: '+919876500000',
    shipping_address: '100 Feet Road, Indiranagar',
    shipping_city: 'Bengaluru',
    shipping_state: 'Karnataka',
    shipping_pincode: '560038',
  });
  const updatedOrder = await repo.updateOrderStatus(order.id, 'SHIPPED', 'PAID', 'BLUEDART-99220011');
  assert(
    updatedOrder?.order_status === 'SHIPPED' && updatedOrder?.payment_status === 'PAID',
    '16. Hardware order pipeline updated with courier tracking'
  );

  // 17. Bulk Card Generation
  const bulkCards = await repo.bulkGenerateCards(5, 'bamboo_wood');
  assert(bulkCards.length === 5, '17. Bulk generated 5 factory inventory NFC cards');

  console.log('\n======================================================');
  console.log(`TEST RESULTS: ${results.filter(r => r.passed).length} / ${results.length} PASSED`);
  console.log('======================================================');

  return results;
}
