# NJCIC Map Claude Skills

Domain-specific skills for developing and maintaining the NJCIC Grantees Map.

## Available Skills

| Skill | Description | Use When |
|-------|-------------|----------|
| **airtable-sync** | Airtable data synchronization patterns | Modifying sync logic, debugging data flow |
| **leaflet-map** | Leaflet.js map development patterns | Working on map features, markers, popups |
| **njcic-data** | Data validation and geocoding | Validating coordinates, data quality |
| **deployment** | Server deployment and CI/CD | Deploying changes, caching issues |
| **testing** | Testing patterns and strategies | Adding test coverage |
| **code-review** | Code review guidelines | Reviewing PRs, quality checks |
| **troubleshooting** | Quick diagnostic reference | Debugging issues |

## Design Principles

These skills follow the **4 Core Truths**:

1. **Expertise Transfer, Not Instructions**: Skills make Claude think like an expert developer on this project, not follow step-by-step recipes
2. **Flow, Not Friction**: Skills produce working code and solutions, not intermediate documents
3. **Voice Matches Domain**: Skills sound like a practitioner who knows this codebase
4. **Focused Beats Comprehensive**: Each skill under 500 lines, ruthlessly constrained to essentials

## Skill Structure

Each skill file includes:
- YAML frontmatter (name, description)
- When to Activate triggers
- Core concepts and patterns
- Code examples from this codebase
- Common issues and solutions
- Key file references

## Usage

Skills are loaded on-demand when relevant to the current task. Reference specific files using `file_path:line_number` format for easy navigation.

## Maintenance

Update skills when:
- Architecture changes significantly
- New patterns are established
- Common issues are discovered
- Key files are refactored

---
*Created: December 2025*
