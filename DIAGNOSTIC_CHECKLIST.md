# 🔧 QR Menu Diagnostic Checklist

## 📋 **Step 1: Verify Enhanced Storage Debugger**

1. Go to: `/dashboard/menu-management`
2. Open browser console (F12)
3. Look for the **🔍 Enhanced Storage Debugger v2** panel (top-right)
4. If you DON'T see it, that means the new build wasn't deployed correctly

**✅ Verification:** You should see 6 buttons:
- `Inspect Storage`
- `Clear Storage` 
- `Fix Slug Mismatch`
- `Test Public Access`
- `Full Diagnostics` ⭐
- `Get QR URL` ⭐

### 🚨 **If Enhanced Storage Debugger is NOT visible:**

**Option A: Clear Cache & Hard Refresh**
1. Clear browser cache completely (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Check again for Enhanced Storage Debugger

**Option B: Emergency Console Script**
If Enhanced Storage Debugger still doesn't appear, copy and paste this entire script into the browser console:

```javascript
// Copy the entire content of EMERGENCY_CONSOLE_SCRIPT.js here
// (The script will run diagnostics directly in console)
```

Then skip to Step 3C for emergency results.

---

## 📋 **Step 2: Test MenuService Constructor Issue**

**Click each button ONE BY ONE and report any errors:**

### Test 1: Click "Inspect Storage"
- **Expected:** No errors, should show auth user and storage data below
- **If Error:** Copy the EXACT error message from console

### Test 2: Click "Get QR URL"  
- **Expected:** Should copy URL to clipboard and show alert
- **If Error:** Copy the EXACT error message from console

### Test 3: Click "Full Diagnostics"
- **Expected:** Should show "✅ Comprehensive diagnostics completed!" 
- **If Error:** Copy the EXACT error message from console

**⚠️ CRITICAL:** If ANY button shows `MenuService is not a constructor` error, STOP and report this immediately.

---

## 📋 **Step 3: Gather Debug Information**

**Only proceed if Step 2 buttons work without constructor errors.**

### A) Click "Inspect Storage" and provide:
```
Auth User Restaurant ID: [Replace with actual ID]
Expected Slug: [Replace with actual expected slug]
Available Slugs in Storage: [Replace with actual available slugs]
```

### B) Click "Get QR URL" and provide:
```
Generated QR URL: [Replace with actual URL from clipboard/alert]
```

### C) Click "Full Diagnostics" and provide console output:
```
[Paste the COMPLETE console output from Full Diagnostics here]
```

### C-Emergency) If using Emergency Console Script:
```
[Paste the COMPLETE console output from running the emergency script]
```

---

## 📋 **Step 4: Test Public Menu Access**

1. Use the QR URL from Step 3B (or emergency script output)
2. Open it in **NEW INCOGNITO TAB**
3. Open console (F12) in that tab
4. Report what you see:

### Visual Result:
- [ ] Menu content displays correctly
- [ ] "Menu unavailable" message
- [ ] Other error message: ___________

### Console Logs (provide ALL logs that start with these patterns):
```
🔍 [PublicMenuView] restaurantSlug from URL: [COPY EXACT LOG]
🔍 [PublicMenuView] Available restaurant slugs in storage: [COPY EXACT LOG]
🔍 [menuService] getPublicMenuData called with slug: [COPY EXACT LOG]
[ANY OTHER RELEVANT LOGS]
```

---

## 📋 **Step 5: Environment Check**

### Current Environment Details:
- **Server IP/Domain:** ___________
- **QR URL Format:** http://[IP]/menu/[slug] or different?
- **Dashboard URL:** http://[IP]/dashboard/menu-management
- **Are you testing from:** 
  - [ ] Same network as server
  - [ ] Different network/mobile data
  - [ ] Different device entirely

---

## 🚨 **IMMEDIATE FIXES TO TRY**

### Fix A: If MenuService Constructor Error Persists
This means the new build didn't deploy correctly. Try:
1. **Clear browser cache completely** (Ctrl+Shift+Delete, clear everything)
2. **Hard refresh** the page (Ctrl+F5)
3. Check if the Enhanced Storage Debugger appears with 6 buttons

### Fix B: If Debug Tools Work But Public Access Fails
1. Click **"Fix Slug Mismatch"** button
2. Click **"Full Diagnostics"** again
3. Try the QR URL again

### Fix C: If Using Emergency Script and It Shows Issues
If emergency script shows:
- **Slug mismatch:** Run `emergencySlugFix()` in console
- **Menu inactive:** Run `emergencyActivateMenu()` in console
- **No data:** Need to create/save menu content in dashboard

### Fix D: If Data Exists But Wrong Slug
Look at the "Available Slugs in Storage" vs "Expected Slug":
- If they're different, the **"Fix Slug Mismatch"** should resolve this
- If they're the same but public access still fails, we need the console logs from Step 4

---

## 📞 **What to Report Back**

**PRIORITY 1:** Does Enhanced Storage Debugger appear with all 6 buttons?
- [ ] YES - Proceed with button tests
- [ ] NO - Used Emergency Console Script (provide script output)

**PRIORITY 2:** Does any button throw `MenuService is not a constructor`?
- [ ] YES - Report this immediately with exact error
- [ ] NO - Proceed with remaining steps

**PRIORITY 3:** Complete diagnostic outputs from Steps 3A, 3B, 3C

**PRIORITY 4:** Public menu test results from Step 4

**PRIORITY 5:** Environment details from Step 5

---

## 🎯 **Expected Resolution Path**

Based on what you report:

1. **If Enhanced Storage Debugger missing:** Build deployment issue - need to verify file upload
2. **If constructor error persists:** Build/cache issue - emergency script provides workaround
3. **If slug mismatch found:** "Fix Slug Mismatch" should resolve it  
4. **If no data found:** Need to check why menu creation data isn't saving to expected location
5. **If data found but menu inactive:** Need to activate menu properly
6. **If data found and active but still fails:** Deep dive into PublicMenuView logic

The diagnostic tools (Enhanced Debugger OR Emergency Script) will tell us exactly which scenario we're in.

---

**🚀 Please complete Steps 1-5 and report back with the specific outputs. This will give us the exact information needed to resolve your QR menu issue once and for all!** 