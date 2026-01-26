# NJCIC Map Documentation

This folder contains documentation for the NJ Civic Information Consortium Grantees Map application.

## Available documentation

### CHANGELOG.md
Detailed timestamped changelog of all updates, features, and bug fixes. Organized by date with:
- Features added
- Data consolidation changes
- Bug fixes and solutions
- Technical improvements
- File modifications
- Statistics

### NJCIC-Map-Guide.md
Staff guide for NJCIC team members including:
- How to update grantee information in Airtable
- Adding new grantees with coordinates
- Triggering manual syncs
- Troubleshooting common issues

### ../CLAUDE.md
Comprehensive development guide for Claude Code including:
- Project overview and architecture
- Airtable sync configuration
- Development commands
- Data management procedures
- Key functionality explanations
- Technical challenges and solutions
- Code locations for key features

## Quick links

**For developers:**
- See `CLAUDE.md` for complete technical documentation
- See `CHANGELOG.md` for recent changes
- See `../README.md` for project overview (if exists)

**For content editors:**
- See `NJCIC-Map-Guide.md` for staff instructions
- Data is managed through Airtable and syncs automatically daily at 7am ET

**For troubleshooting:**
- See "Technical challenges and solutions" in `CLAUDE.md`
- Check browser console for JavaScript errors
- Verify JSON formatting in `data/grantees.json`

## Key project files

- `index.html` - Main application structure
- `js/app.js` - Application logic and interactivity
- `data/grantees.json` - Grantee data (synced from Airtable)
- `scripts/` - Local sync and data processing scripts
- `.github/workflows/sync-airtable.yml` - Daily automated sync

## Getting started

1. Install a local web server: `npm install`
2. Start the server: `npm start`
3. Access at: http://localhost:8080
4. See console for any errors

## Recent updates (December 2025)

Major improvements:
- Implemented live Airtable sync (replaces hardcoded/CSV data)
- Added GitHub Actions workflow for daily automated sync at 7am ET
- Created PHP sync script for server-side execution
- Added "New org?" feature to highlight new grantees with orange markers
- Accessibility enhancements to CSS
- Comprehensive staff documentation in NJCIC-Map-Guide.md

See CHANGELOG.md for complete history.
