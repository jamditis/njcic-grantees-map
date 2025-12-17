# NJCIC Grantees Map - Staff guide

## What is this?

The NJCIC Grantees Map is an interactive map that displays all Consortium grantees across New Jersey. It lives at:

**https://njcivicinfo.org/map/**

The map gets its data directly from the Airtable base "Grants to date: NJ Civic Info Consortium." When you update information in Airtable, those changes automatically appear on the map.

---

## How to update grantee information

### Adding a new grantee

1. Open the Airtable base "Grants to date: NJ Civic Info Consortium"
2. Add a new row with the grantee's information:
   - **Grantee** - Organization name
   - **Grant purpose** - Description of what the grant funds
   - **Year(s) granted** - Select the year(s)
   - **Total awarded** - Dollar amount
   - **Focus area** - Category of work
   - **Service area** - County or region served
   - **Grantee website** - URL (optional)
   - **Lat** - Latitude coordinate (see below)
   - **Long** - Longitude coordinate (see below)
   - **City** - City name

### Getting coordinates for new grantees

For new grantees, you'll need to add latitude and longitude so they appear in the correct location on the map:

1. Go to **https://www.latlong.net/**
2. Search for the grantee's city or address
3. Copy the latitude (e.g., 40.7357) into the **Lat** column
4. Copy the longitude (e.g., -74.1724) into the **Long** column

*Tip: If you don't add coordinates, the grantee will appear at the center of their county.*

### Editing existing grantees

Simply edit the fields in Airtable. Changes to names, amounts, descriptions, websites, etc. will all sync to the map.

### Removing a grantee

To remove a grantee from the map, check the **"Returned/Cancelled grant?"** checkbox in Airtable. The grantee will no longer appear on the map but the record stays in Airtable for your records.

---

## When do changes appear on the map?

**Automatic sync:** Every day at **7:00 AM Eastern**, the map automatically pulls the latest data from Airtable.

**What this means:** If you update Airtable on Monday afternoon, the changes will appear on the map by Tuesday morning at 7am.

---

## How to update the map immediately

If you need changes to appear right away (before the next morning), you can trigger a manual sync:

### Option 1: Visit the sync URL

Go to this URL in your browser (bookmark this for easy access):
```
https://njcivicinfo.org/map/sync.php?key=0Ra1wXM8dgwGfeoP
```

You'll see a message confirming the sync completed with details like:
- Number of grantees synced
- Total funding amount
- Time of sync

Then refresh the map page to see your changes.

### Option 2: Use GitHub Actions (for technical staff)

1. Go to https://github.com/jamditis/njcic-grantees-map/actions
2. Click "Sync Airtable Data"
3. Click "Run workflow" → "Run workflow"

---

## What the map displays

For each grantee, the map shows:
- **Organization name**
- **Location** (city and county)
- **Total funding received**
- **Grant years**
- **Focus area**
- **Project description**
- **Link to website** (if provided)

Grantees with multiple grants are grouped together and show all their grant details in one popup.

---

## Understanding the data flow

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Airtable  │   →→→   │  Sync runs  │   →→→   │  Map shows  │
│  (you edit  │  (7am   │  (updates   │  (visitors│  updated   │
│   here)     │  daily) │   the data) │   see it) │   info)    │
└─────────────┘         └─────────────┘         └─────────────┘
```

1. **You update Airtable** - Add, edit, or mark grantees as returned
2. **Sync runs automatically** - Every morning at 7am ET
3. **Map displays new data** - Visitors see the updated information

---

## Important notes

### The impact section is separate (for now)

The "Impact at a glance" statistics below the map (total invested, stories published, etc.) are **not** currently pulled from Airtable. These are official NJCIC figures that are updated manually in the website code. Contact Joe if these need to be updated.

**Planned enhancement:** In a future version, the impact section will be connected to Airtable data so these statistics update automatically along with the grantee information.

### Cancelled/returned grants

Grantees marked as "Returned/Cancelled" in Airtable will **not** appear on the map, but they are still counted in the official total investment figure in the impact section.

### Multiple grants to same organization

If an organization receives multiple grants, they appear as a single marker on the map. Clicking on them shows details for all their grants.

### Project names

If a grantee name includes a colon (like "Center for Cooperative Media: Spanish Translation Service"), the system treats the part before the colon as the organization name and groups all their grants together.

---

## Troubleshooting

### "I updated Airtable but the map hasn't changed"

- The automatic sync runs at 7am ET. If it's not yet 7am the next day, the change hasn't synced yet.
- To update immediately, visit the sync URL (see "How to update the map immediately" above).
- Try clearing your browser cache or doing a hard refresh (Ctrl+F5).

### "A grantee is in the wrong location on the map"

- Check the **Lat** and **Long** fields in Airtable
- Make sure they're decimal numbers (like 40.7357, not 40° 44' 8")
- Use https://www.latlong.net/ to find the correct coordinates

### "A grantee isn't showing up at all"

- Make sure the **"Returned/Cancelled grant?"** checkbox is NOT checked
- Make sure the **Grantee** name field is not empty
- Try triggering a manual sync

### "The sync URL gives an error"

- Make sure you're using the exact URL with the correct key
- If you see "Unauthorized," the key may have been changed - contact Joe

---

## Quick reference

| Task | How to do it |
|------|--------------|
| Add new grantee | Add row in Airtable with all fields filled |
| Edit grantee info | Edit the row directly in Airtable |
| Remove grantee | Check "Returned/Cancelled grant?" in Airtable |
| Get coordinates | Use latlong.net to look up the city |
| Force immediate sync | Visit sync.php URL or use GitHub Actions |
| View the map | https://njcivicinfo.org/map/ |

---

## Contacts

**Technical issues with the map or sync:**
Joe Amditis - amditisj@montclair.edu

**Airtable access or grantee data questions:**
[Add appropriate NJCIC contact]

---

*Last updated: December 2025*
