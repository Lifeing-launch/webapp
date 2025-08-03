# **Realtime Setup — Fórum Lifeing**

<small>Como habilitar e consumir streams de dados via Supabase Realtime em Next.js</small>

---

## 1. Ativar Realtime no banco (Dia 2)

### 1.1 Publicação Postgres

Supabase Cloud já tem a extensão `supabase_realtime`. Basta marcar cada tabela.

```sql
-- Posts (por thread)
alter publication supabase_realtime add table forum.posts;

-- Comments (por post)
alter publication supabase_realtime add table forum.comments;

-- Messages (DM)
alter publication supabase_realtime add table forum.messages;
```

> O publication padrão `supabase_realtime` já existe; adicionar é idempotente.

### 1.2 Filtros de segurança

- Realtime respeita **RLS**. As políticas que criamos garantem que cada usuário receba somente linhas que ele pode SELECT.

### 1.3 Event Filters (client‑side)

- Use filtros no payload para tópicos específicos (threadId, userId) — economiza tráfego.

---

## 2. Uso no Next.js (Client Components)

### 2.1 Setup

```ts
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient<Database>({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
});
```

### 2.2 Canal para feed de posts de um thread

```ts
useEffect(() => {
  const channel = supabase
    .channel(`posts:thread_${threadId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "forum",
        table: "posts",
        filter: `thread_id=eq.${threadId}`,
      },
      (payload) => addPost(payload.new as Post)
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}, [threadId]);
```

### 2.3 Canal DM (mensagens 1‑a‑1)

```ts
useEffect(() => {
  const channel = supabase
    .channel(`messages:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "forum",
        table: "messages",
        filter: `receiver_id=eq.${userId}`,
      },
      (payload) => pushMsg(payload.new as Message)
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}, [userId]);
```

> **Nota**: Para exibir conversa bilateral, simplesmente filtre `sender_id IN (self, partner) AND receiver_id IN (self, partner)` na query inicial; realtime completa.

---

## 3. Server Actions que disparam eventos

Nenhuma alteração — `INSERT` normal já dispara Realtime.

| Ação                 | Tabela afetada   | Canal escutado                                  |
| -------------------- | ---------------- | ----------------------------------------------- |
| `createPost`         | `forum.posts`    | `posts:thread_<id>`                             |
| `addComment`         | `forum.comments` | `posts:thread_<id>` (parent update opcional)    |
| `sendMessage` (Edge) | `forum.messages` | `messages:<receiverId>` + `messages:<senderId>` |

---

## 4. Performance & Cost

- Supabase cobra Realtime por quantidade de conexões e footprint; com canais segmentados (`thread_123`) cada usuário subscreve a poucos tópicos.
- Desative Realtime em tables onde não precisa (ex.: likes, se contador for agregado via view).

---

## 5. Checklist de Deploy

1. Rodar **ALTER PUBLICATION** (uma única vez no ambiente).
2. Garantir políticas RLS corretas.
3. Build front com hooks Realtime.
4. Testar: abrir duas sessões → postar/commentar/env DM → mudanças chegam ao vivo ≤ 300 ms.

---

### 🎉 Com isso, feed, comentários e DMs ficam dinâmicos sem infra adicional.
