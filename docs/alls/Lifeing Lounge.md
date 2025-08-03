# Lifeing Lounge

Esta análise apresenta um relatório abrangente sobre a modelagem e implementação de um fórum anônimo, com funcionalidades de criação de threads, postagens, comentários e grupos fechados, além de mensagens diretas (DMs). O sistema utiliza Next.js no frontend e Supabase para backend, aproveitando os recursos de Autenticação, Realtime, e especialmente Row Level Security (RLS) para manter a segurança e o anonimato dos usuários. No contexto do MVP, o foco está em garantir que nenhum dado pessoal identificável (PII) seja exposto, e que operações privilegiadas – como as de moderação – sejam realizadas de forma segura, utilizando Edge Functions com privilégios restritos.

A seguir, é apresentado um estudo detalhado que abrange os seguintes tópicos:  
• Modelagem de dados e definição das entidades principais (threads, posts, comentários, grupos e mensagens diretas).  
• Configuração do Supabase, com ênfase na criação de tabelas, triggers e políticas de RLS para garantir acesso restrito.  
• Integração com Next.js para o consumo de dados, atualização via Supabase Realtime, e construção de componentes que interajam com o backend com segurança.  
• Requisitos de moderação, log de ações e práticas de segurança voltadas à proteção de dados e anonimato dos usuários.

---

### 1\. Modelagem de Dados e Estrutura do Fórum

A estrutura de dados deve possibilitar a criação de threads, postagens e comentários, além de diferenciar facilmente entre conteúdos públicos e conteúdos restritos a grupos fechados. O desenho dos dados deve ser feito considerando o seguinte:

#### 1.1 Entidades Principais

• **Threads:** representam tópicos de discussão, iniciados por um usuário anônimo. Cada thread tem um identificador único, título (quando aplicável), data de criação e referência ao perfil do criador.  
• **Posts/Comentários:** representam as mensagens publicadas nos threads. Podem ser organizados de forma cronológica. Em uma abordagem simplificada, postagens e comentários podem ser armazenados na mesma tabela, sendo diferenciados por um campo que indique se há um relacionamento hierárquico (por exemplo, uma coluna "parent_id").  
• **Grupos Fechados:** são categorias ou comunidades administradas, criadas pelos administradores. Threads podem ser vinculados a um grupo fechado, e apenas membros (ou usuários com acesso permitido via RLS) podem visualizar ou postar no contexto deste grupo.  
• **Mensagens Diretas (DMs):** possibilitam a comunicação 1-a-1 entre perfis anônimos. Cada mensagem deve identificar os dois participantes e manter um registro de status (por exemplo, indicadores de mensagens não lidas).

#### 1.2 Esquema Relacional Sugerido

A seguir, é apresentado um esquema conceitual que pode ser adaptado para as necessidades do projeto:

• **Tabela de Threads** (`forum_threads`):  
 – id (UUID ou serial)  
 – owner_id (referência ao perfil anônimo, tipicamente o mesmo que o id do usuário no Supabase Auth)  
 – title (opcional, se o fórum permitir títulos)  
 – description ou conteúdo inicial  
 – created_at (timestamp)

• **Tabela de Posts** (`forum_posts`):  
 – id (serial ou UUID)  
 – thread_id (referência à thread em que o post foi criado)  
 – parent_id (opcional, para hierarquia de comentários ou respostas)  
 – owner_id (referência ao perfil do usuário anônimo que postou)  
 – content (texto)  
 – created_at (timestamp)

**• Tabela de Grupos** (categorias ou comunidades – `forum_groups`):  
 – id (serial ou UUID)  
 – name (nome do grupo)  
 – description (detalhes sobre o grupo)  
 – created_by (usuário ou administrador responsável)  
 – created_at (timestamp)

• **Tabela de Mensagens Diretas** (`direct_messages`):  
 – id (serial ou UUID)  
 – sender_id (perfil do remetente)  
 – receiver_id (perfil do destinatário)  
 – content (texto da mensagem)  
 – is_read (boolean para indicar se a mensagem foi lida)  
 – created_at (timestamp)

• **Tabela de Flag e Moderação** (`content_flags` e `moderation_actions`):  
 – Para flagging, registre a identificação do conteúdo, usuário responsável e timestamp.  
 – Para ações de moderação, registre qual Edge Function executou a ação, alterando ou removendo conteúdo, e mantenha logs de auditoria.

Esta modelagem permite uma clara separação entre os tipos de conteúdo, garantindo que as associações entre perfis e suas interações sejam feitas de maneira segura.

---

### 2\. Configuração do Supabase: Tabelas, Triggers e Políticas de RLS

O Supabase utiliza o PostgreSQL como base de dados, permitindo a configuração de Row Level Security (RLS), triggers e funções customizadas. Esta camada é fundamental para garantir que, mesmo se o frontend estiver comprometido, o acesso aos dados permaneça seguro.

#### 2.1 Criação de Tabelas com RLS

Cada tabela que contém dados sensíveis – como postagens e threads – deve ter o RLS habilitado. Por exemplo, para a tabela de posts:

```sql
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
```

A seguir, um exemplo de política que permite a um usuário acessar apenas as suas próprias publicações:

```sql
CREATE POLICY "Usuário pode visualizar seus posts"
ON forum_posts
FOR SELECT
USING (auth.uid() = owner_id);
```

No caso de visualização de conteúdo público, políticas adicionais podem ser criadas, de forma que threads em áreas públicas ou grupos abertos estejam disponíveis a todos, enquanto threads de grupos fechados exigem verificação adicional.

#### 2.2 Políticas para Threads e Grupos Fechados

Para threads vinculadas a grupos fechados, a política deve verificar se o usuário possui permissão para acessar aquele grupo. Se o grupo for gerido exclusivamente por administradores, o RLS pode exigirá uma verificação em uma tabela de associação, por exemplo, "group_memberships":

```sql
CREATE TABLE group_memberships (
  group_id UUID REFERENCES forum_groups (id),
  user_id UUID REFERENCES auth.users (id),
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);
```

Política de acesso a threads de grupos fechados:

```sql
CREATE POLICY "Acesso a threads de grupos fechados"
ON forum_threads
FOR SELECT
USING (
  (
    -- Se o thread não pertencer a um grupo fechado, é de acesso público
    group_id IS NULL
  )
  OR
  (
    -- Se o thread pertence a um grupo fechado, o usuário deve ser membro
    group_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM group_memberships WHERE
      group_memberships.group_id = forum_threads.group_id
      AND group_memberships.user_id = auth.uid()
    )
  )
);
```

#### 2.3 Uso de Triggers para Integração e Auditoria

Triggers podem ser empregados para automatizar ações como a criação de perfis anônimos ao cadastrar um novo usuário ou para logar ações de moderação. Por exemplo, o trigger que cria o perfil anônimo já apresentado no relatório anterior:

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, 'Anonymous_' || gen_random_uuid());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

Além disso, para logar ações de moderação, uma tabela de auditoria pode ser criada:

```sql
CREATE TABLE moderation_actions (
  id SERIAL PRIMARY KEY,
  moderator_id UUID REFERENCES auth.users (id),
  action TEXT NOT NULL,
  target_table TEXT,
  target_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);
```

Edge Functions podem ser utilizadas para realizar operações de moderação com privilégios elevados (usando a service role key), registrando a ação nesta tabela e garantindo que a responsabilidade seja devidamente auditorada.

---

### 3\. Integração com Next.js

A camada de frontend construída com Next.js é responsável por interagir com os dados armazenados no Supabase, utilizando os clientes disponibilizados pela biblioteca @supabase/supabase-js. A integração deve ser feita de forma a assegurar que apenas os dados permitidos sejam enviados para o usuário, de acordo com as restrições de RLS.

#### 3.1 Configuração do Cliente Supabase no Next.js

Para iniciar, é necessário configurar o cliente no projeto Next.js utilizando as variáveis de ambiente:

```javascript
// lib/supabaseClient.ts
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";

export const supabaseClient = createBrowserSupabaseClient();
```

Em paralelo, para operações no lado do servidor, pode ser empregado um cliente servidor que utiliza cookies para manter o estado da sessão:

```javascript
// lib/supabaseServer.ts
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const supabaseServer = () => createServerSupabaseClient({ cookies });
```

#### 3.2 Consumo de Dados e Atualizações em Tempo Real

Para exibir as threads, posts e comentários, o Next.js pode utilizar o Supabase Realtime, que escuta alterações nas tabelas e atualiza a interface automaticamente. Um exemplo simples para buscar e atualizar threads:

```javascript
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";

export default function ThreadList() {
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    // Busca inicial de threads públicas
    supabaseClient
      .from("forum_threads")
      .select("*")
      .then(({ data, error }) => {
        if (!error) setThreads(data);
      });

    // Configuração do canal realtime para atualizar threads
    const subscription = supabaseClient
      .channel("public:forum_threads")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "forum_threads" },
        (payload) => {
          // Atualizar o estado conforme a mudança
          setThreads((current) => [...current, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(subscription);
    };
  }, []);

  return (
    <div>
      <h2>Tópicos Recentes</h2>
      <ul>
        {threads.map((thread) => (
          <li key={thread.id}>
            {thread.title} – iniciado por {thread.owner_id}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

Este exemplo demonstra como buscar dados e configurar um canal realtime para obter updates imediatos.

#### 3.3 Gerenciamento de Fluxos de Criação e Publicação

No fluxo de criação de conteúdo, o usuário anônimo (ou seu perfil criado automaticamente) realiza a seguinte sequência:

• Autenticação com Supabase Auth, onde o user id é gerado e o perfil é associado automaticamente por trigger;  
• A criação de uma nova thread ou postagem envia a requisição para a tabela correspondente;  
• As políticas de RLS verificam, no nível do banco, se o usuário possui permissão para criar ou editar o conteúdo;  
• Em caso de ações de moderação, Edge Functions são chamadas para executar tarefas privilegiadas (como deletar ou ocultar conteúdo) e registrar o evento na tabela de auditoria.

Um exemplo de criação de post via Next.js:

```javascript
async function createPost(threadId, content) {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado.");

  const { error } = await supabaseClient.from("forum_posts").insert([
    {
      thread_id: threadId,
      owner_id: user.id,
      content: content,
    },
  ]);
  if (error) console.error("Erro ao criar post:", error);
}
```

---

### 4\. Requisitos de Moderação e Segurança

A moderação é um componente crítico para manter a integridade do fórum. A implementação segura de ações de moderação deve seguir as seguintes práticas:

#### 4.1 Painel de Moderação e Controle de Conteúdo

Criar um painel exclusivo para administradores e moderadores que exibam os conteúdos sinalizados para flagging. Nesta interface, o moderador poderá aprovar, ocultar ou deletar conteúdo. As ações realizadas são registradas em uma tabela de auditoria para posterior análise.

Exemplo de registro de moderação:

```sql
INSERT INTO moderation_actions (moderator_id, action, target_table, target_id)
VALUES ('{MODERATOR_UUID}', 'delete', 'forum_posts', '{POST_UUID}');
```

#### 4.2 Uso de Edge Functions para Ações Privilegiadas

Edge Functions são empregadas para isolar operações sensíveis, como a remoção de posts ou a alteração de status de publicações sinalizadas. As funções são executadas com privilégios elevados, o que impede que a lógica administrativa seja realizada diretamente no frontend. Este isolamento evita a exposição de chaves sensíveis e assegura a integridade das operações.

#### 4.3 Proteção dos Dados e Criptografia

Os dados são sempre transmitidos via SSL/TLS, e a criptografia “at-rest” já vem configurada pelo Supabase. Em casos onde dados sensíveis precisem ser armazenados temporariamente, a utilização da extensão pgcrypto pode garantir a proteção adicional, conforme o exemplo:

```sql
INSERT INTO sensitive_data (user_id, encrypted_data)
VALUES (auth.uid(), pgp_sym_encrypt('dado_sensível', 'chave_secreta'));
```
