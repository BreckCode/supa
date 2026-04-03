# Todo App with Supabase

A simple todo list web app that persists data to Supabase.

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run this SQL in the **SQL Editor** to create the `todos` table:

```sql
create table todos (
  id uuid default gen_random_uuid() primary key,
  text text not null,
  is_completed boolean default false,
  created_at timestamptz default now()
);

-- Enable Row Level Security (optional, for public access disable RLS)
alter table todos enable row level security;

-- Allow anonymous access (for demo purposes)
create policy "Allow all access" on todos
  for all
  using (true)
  with check (true);
```

3. Copy your **Project URL** and **anon public key** from:
   **Settings > API** in the Supabase dashboard.

4. Open `app.js` and replace the placeholder values:

```js
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

## Run

Open `index.html` in a browser. No build step required.

## Features

- Add, complete, and delete todos
- Filter by All / Active / Completed
- Clear all completed todos
- Real-time persistence to Supabase
