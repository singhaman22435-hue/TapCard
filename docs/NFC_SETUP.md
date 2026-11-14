# NFC Card Hardware Setup & Programming Guide

This document outlines the professional procedure for manufacturing, encoding, verifying, and dispatching physical NFC visiting cards on the **TapCard** platform.

---

## 1. Hardware Requirements

### NFC Chip Specifications
- **Recommended Tag IC**: **NTAG213**, **NTAG215**, or **NTAG216** (NXP Semiconductors)
  - **NTAG213**: 144 bytes user memory (ideal for short URLs, lowest unit cost).
  - **NTAG215 / NTAG216**: 504 / 888 bytes (larger memory, supports long URLs or vCard fallback if ever needed).
- **Frequency**: 13.56 MHz (High Frequency - ISO/IEC 14443 Type A).
- **Form Factors**:
  - PVC / Matte Polymer Visiting Cards (Standard CR80 credit card size: 85.60 × 53.98 mm).
  - Metal Hybrid Cards (Stainless steel with ferrite shielding layer on the back so the metal does not interfere with the RF field).
  - Natural Wood / Bamboo Cards with embedded inlay.

---

## 2. NDEF Architecture (Why we store only HTTPS URLs)

> [!IMPORTANT]
> **Never write the entire profile or vCard data directly into the NFC tag.**

### Core Reasons:
1. **Dynamic Profile Updates**: When the customer changes their designation, phone number, company, or WhatsApp greeting, the physical card **never needs reprogramming**. The server loads the latest data from the database.
2. **Universal Native OS Reading**: Both iOS (iPhone 7 and newer with iOS 14+) and Android feature native Background Tag Reading for standard **NDEF URI records** starting with `https://`. No app installation is required for visitors.
3. **Tracking & Analytics**: Explicit query parameters (`?source=nfc`) allow the platform to distinguish physical taps from camera QR scans.

---

## 3. Step-by-Step Programming Procedure (Factory / Operations)

### Step 1: Generate or Assign Card in Admin Portal
1. Navigate to `/admin/cards`.
2. Click **Bulk Generate Cards** or select an existing available card.
3. The system assigns a unique card code: e.g. `TC-8F72KX`.
4. The system produces the exact NFC NDEF HTTPS payload:
   ```text
   https://tapcard.in/c/TC-8F72KX?source=nfc
   ```

### Step 2: Open NFC Writing Tool
Use any standard industry writer or mobile NFC tool (e.g., **NFC Tools Pro** on Android/iOS, or an ACR122U USB Desktop Writer):
1. Open the app and tap **Write**.
2. Tap **Add a record**.
3. Select **URL / URI**.
4. Set protocol to `https://`.
5. Enter the exact domain and path:
   ```text
   tapcard.in/c/TC-8F72KX?source=nfc
   ```
6. Tap **OK**.

### Step 3: Write Tag
1. Tap **Write / N bytes**.
2. Hold the physical visiting card against the back of the phone (near the camera module on iPhone or the center back on Android).
3. The app will confirm: **"Write complete"**.

### Step 4: Quality Assurance & Verification
1. Open `/admin/cards/[id]/test` on the TapCard Admin Portal.
2. Hold the physical card against a test smartphone (with no writing software open).
3. The native notification or browser will open immediately:
   ```text
   https://tapcard.in/c/TC-8F72KX?source=nfc
   ```
4. Verify that:
   - The user's name, photo, and title render.
   - The "⚡ Opened via Contactless NFC Tap" banner appears.
   - An `nfc_visit` event increments in the Analytics dashboard.

### Step 5: Lock Tag (Optional for Production)
- To prevent end-users or unauthorized parties from overwriting the URL, you can permanently lock or password-protect the tag using password authentication (PWD/PACK on NTAG213/215).
- **Caution**: Only permanently lock after completing Step 4 verification.

### Step 6: Dispatch
1. In `/admin/orders`, advance status to **NFC_PROGRAMMED**.
2. Pack card with luxury envelope and dispatch via courier.
3. Mark status as **SHIPPED** with tracking number.

---

## 4. Universal Fallback: The QR Code

Every physical TapCard is laser-engraved or printed with a high-contrast QR code on the back:
```text
https://tapcard.in/c/TC-8F72KX?source=qr
```
- Built with **Level H Error Correction (30% recovery)** so the code remains readable even if scratched or worn.
- Allows instant connection on devices with disabled or unsupported NFC antennas.

