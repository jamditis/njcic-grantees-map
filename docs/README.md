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

### ../CLAUDE.md
Comprehensive development guide for Claude Code including:
- Project overview and architecture
- Technology stack details
- Development commands
- Data management procedures
- Key functionality explanations
- Recent updates and improvements (2025-11-06 session)
- Technical challenges and solutions
- Code locations for key features
- Next session recommendations

## Quick links

**For developers:**
- See `CLAUDE.md` for complete technical documentation
- See `CHANGELOG.md` for recent changes
- See `../README.md` for project overview (if exists)

**For content editors:**
- See "Data management" section in `CLAUDE.md`
- See "Updating the map with new data" section for CSV workflow

**For troubleshooting:**
- See "Technical challenges and solutions" in `CLAUDE.md`
- Check browser console for JavaScript errors
- Verify JSON formatting in `data/grantees.json`

## Key project files

- `index.html` - Main application structure
- `js/app.js` - Application logic and interactivity
- `data/grantees.json` - Grantee data (generated from CSV)
- `scripts/` - Data processing and consolidation scripts

## Getting started

1. Install a local web server: `npm install`
2. Start the server: `npm start`
3. Access at: http://localhost:8080
4. See console for any errors

## Recent updates (2025-11-06)

Major session focused on:
- Map legend and custom zoom controls
- Mobile responsiveness improvements
- Data consolidation (HopeLoft entries)
- Z-index fixes for proper layering
- Zoom button functionality debugging

See CHANGELOG.md for complete details.
