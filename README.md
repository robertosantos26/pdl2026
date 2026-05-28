
# Painel Corporativo

## Instalação

```bash
npm install
npm run dev
```

## Configuração Supabase

Crie um projeto no Supabase e adicione as variáveis no `.env.local`.

Tabela:

```sql
create table posts (
  id uuid primary key default gen_random_uuid(),
  image_url text,
  caption text,
  created_at timestamp default now()
);
```

Bucket:
- Nome: uploads
- Público: true

