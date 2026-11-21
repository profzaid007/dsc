# DSC

Bilingual Next.js and PocketBase platform for service portals, customer cases, expert workflows, assignments, assessments, programmes and content administration.

Start with the [complete technical documentation](docs/Technical%20Docs/technical-documentation.md). The [source-derived technical reference](docs/Technical%20Docs/technical-reference.md) contains page routes, custom HTTP endpoints, the schema-snapshot data dictionary and access rules, migrations, backend deployment-copy differences, configuration references and test inventory.

The documentation distinguishes repository behavior from deployment state. The schema snapshot is a baseline; later migrations must be reviewed for the intended database.

## Development

```powershell
npm ci
# Configure local environment; provision the PocketBase binary separately.
./local-backend/start.ps1
# In another terminal:
npm run dev
```

See the technical manual for configuration, runtime paths, validation, deployment and recovery. Never use the full schema importer to upgrade a populated database: it uses `deleteMissing:true`.

## Documentation maintenance

```powershell
python tools/generate_technical_reference.py
```

This regenerates the reference from repository sources without reading environment files or runtime data. Update the main manual when architecture or workflows change.
