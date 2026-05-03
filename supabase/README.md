# Green Supabase

This folder contains the first database contract for the Green MVP.

## Local start

```bash
supabase start
supabase db reset
```

Ports are aligned with the app workspace:

- Postgres: `17130`
- Supabase API: `17150`
- Supabase Studio: `17151`

## Migration scope

`202605030001_initial_green_schema.sql` creates:

- account/profile tables
- green flag and pass review flow
- match and evaluation flow
- reports, sanctions, and appeals for operations
- predefined green/red flag reason options
- RLS policies for members, female reviewers, participants, and operators

The schema intentionally blocks free-text reputation labels. User-facing flags use predefined reason options.

