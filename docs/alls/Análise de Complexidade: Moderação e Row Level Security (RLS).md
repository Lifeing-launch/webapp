# Análise de Complexidade: Moderação e Row Level Security (RLS)

Esta seção detalha as áreas de maior complexidade técnica no desenvolvimento do MVP do Fórum Anônimo: o sistema de moderação, a nova funcionalidade de grupos criados por usuários e a implementação de Row Level Security (RLS). Todas são cruciais para a segurança, anonimato e funcionalidade da plataforma.

#### 1\. Row Level Security (RLS) – A Espinha Dorsal do Anonimato e Controle de Acesso

O RLS, uma feature do PostgreSQL utilizada extensivamente pelo Supabase, permite definir políticas de acesso em nível de linha para as tabelas do banco de dados. A complexidade aqui reside na necessidade de criar regras granulares e à prova de falhas para cada interação com os dados, garantindo tanto o anonimato quanto o acesso correto às informações.

- **Complexidade Intrínseca:**
  - **Definição de Políticas Granulares:** Para cada tabela sensível (perfis anônimos, threads, posts, comentários, grupos, DMs, flags), será necessário definir quem pode ler, inserir, atualizar ou deletar dados, e sob quais condições. Isso envolve traduzir os requisitos de negócio em lógicas SQL precisas.
  - **Garantia de Anonimato:** As políticas de RLS são fundamentais para que um usuário autenticado (`auth.users`) seja associado a um perfil anônimo (`anonymous_profiles`) sem que sua identidade real (PII) seja exposta a outros usuários ou mesmo acessível de forma indevida pelo frontend. As queries e políticas devem operar sobre identificadores anônimos.
  - **Interdependência de Políticas:** Políticas em diferentes tabelas podem interagir. Por exemplo, a visibilidade de um post pode depender da sua thread, do grupo ao qual pertence, e do status de moderação.
- **Principais Desafios e Considerações com RLS:**
  - **Perfis Anônimos vs. Usuários Autenticados:**
    - **Desafio:** Criar e manter uma ligação segura entre o `auth.uid()` (do usuário Supabase) e o perfil anônimo usado no fórum. As políticas de RLS precisarão, em muitos casos, verificar o `auth.uid()` para determinar o acesso ao perfil anônimo correspondente e, por extensão, ao conteúdo criado por esse perfil.
    - **Exemplo:** Um usuário só pode ver suas próprias DMs. A RLS na tabela de DMs verificará se o `auth.uid()` do requisitante corresponde a um dos participantes da DM (através da tabela de perfis anônimos).
  - **Visibilidade de Conteúdo:**
    - **Threads/Posts em Grupos:** RLS para permitir leitura por usuários membros dos grupos somente se `status = 'approved'`.
    - **Conteúdo em Grupos Privados:** RLS deve verificar se o perfil anônimo do usuário (`auth.uid()` -> `anonymous_profile_id`) é membro do grupo associado ao post/thread com `role = 'member'` ou `role = 'owner'` e se `status = 'approved'`.
    - **Mensagens Diretas (1-para-1):** RLS deve garantir que apenas os dois perfis anônimos envolvidos na conversa possam ler as mensagens.
    - **Acesso do Autor ao Próprio Conteúdo:** Adiciona complexidade às políticas RLS, pois o autor deve poder ver seu próprio conteúdo mesmo que o status seja `pending` ou `rejected`, mas outros usuários só veem conteúdo `approved`.
  - **Modificação e Interação com Conteúdo:**
    - **Flagging de Conteúdo:** Usuários podem criar flags para conteúdo já aprovado e público. RLS na tabela de flags deve permitir inserção associada ao perfil anônimo do "flagger" e ao conteúdo "flaggeado". Apenas moderadores podem ler todas as flags.
  - **Prevenção de Vazamento de Dados:** Um erro na lógica da RLS pode expor dados indevidamente. Por exemplo, uma política mal configurada em `JOINs` poderia acidentalmente revelar informações de perfis.
  - **Testes Exaustivos:** A validação de que todas as políticas de RLS funcionam como esperado em todos os cenários (diferentes usuários, diferentes papéis, diferentes tipos de conteúdo) é demorada e crítica. O Supabase Studio ajuda, mas testes automatizados e manuais são essenciais.
- **Exemplo Conceitual de Política RLS (Pseudo-SQL):**

  ```sql
  -- Política para visualização de posts em um grupo privado
  CREATE POLICY "Membros do grupo podem ver posts aprovados do grupo"
  ON posts FOR SELECT
  USING (
    status = 'approved' AND
    EXISTS (
      SELECT 1 FROM group_members gm
      JOIN anonymous_profiles ap ON gm.profile_id = ap.id
      WHERE gm.group_id = posts.group_id
      AND ap.user_id = auth.uid()
      AND gm.role IN ('owner', 'member')
    )
  );

  -- Política para autores verem seus próprios posts independente do status
  CREATE POLICY "Autores podem ver seus próprios posts"
  ON posts FOR SELECT
  USING (
    status = 'approved' OR
    author_profile_id = (
      SELECT id FROM anonymous_profiles WHERE user_id = auth.uid()
    )
  );

  -- Política para DMs
  CREATE POLICY "Participantes podem ler suas DMs"
  ON direct_messages FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM anonymous_profiles WHERE id = sender_profile_id)
    OR
    auth.uid() = (SELECT user_id FROM anonymous_profiles WHERE id = receiver_profile_id)
  );
  ```

#### 2\. Criação de Perfil Anônimo via Modal Frontend

**MUDANÇA SIGNIFICATIVA:** A criação do perfil anônimo não é mais automática via trigger de banco de dados. Agora é um fluxo manual iniciado pelo frontend na primeira visita ao fórum.

- **Complexidade do Novo Fluxo:**

  - **Detecção de Primeira Visita:** O frontend deve verificar se já existe um `AnonymousProfile` associado ao `auth.uid()` do usuário logado.
  - **Modal de Escolha de Nickname:** Interface para capturar o `display_name` escolhido pelo usuário, com validações (unicidade, caracteres permitidos, comprimento).
  - **Criação Sincronizada:** Após escolha do nickname, o frontend cria o registro na tabela `AnonymousProfile` associando o `auth.uid()` ao perfil anônimo.
  - **Tratamento de Erros:** Lidar com cenários como nicknames já em uso, falhas de rede durante criação, etc.

- **Vantagens do Novo Fluxo:**

  - **Controle do Usuário:** Usuário escolhe seu próprio nickname ao invés de ter um gerado automaticamente.
  - **Experiência Melhorada:** Modal contextual explica o propósito do perfil anônimo.
  - **Redução de Complexidade:** Elimina a necessidade de triggers e funções de banco de dados para criação automática.

- **Considerações de Implementação:**

  ```typescript
  // Verificação no frontend ao acessar o fórum
  const checkAnonymousProfile = async () => {
    const { data: profile } = await supabase
      .from("anonymous_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      setShowNicknameModal(true);
    }
  };

  // Criação do perfil após escolha do nickname
  const createAnonymousProfile = async (nickname: string) => {
    const { data, error } = await supabase.from("anonymous_profiles").insert({
      user_id: user.id,
      display_name: nickname,
    });
  };
  ```

#### 3\. Sistema de Moderação Simplificado

O sistema de moderação foi simplificado para ser mais eficiente e direto, removendo o estado intermediário "needs_review" e implementando um fluxo binário de aprovação/rejeição da IA.

- **Novo Fluxo de Moderação:**

  - **Status Simplificados:** Apenas `pending`, `approved`, e `rejected`.
  - **Decisão Binária da IA:**
    - Se IA aprova → `status: 'approved'` (conteúdo visível)
    - Se IA não aprova → `status: 'rejected'` (exclusão lógica)
  - **Painel de Revisão Admin:** Nova interface para administradores gerenciarem posts rejeitados.

- **Complexidade Reduzida:**

  - **Eliminação do Estado Intermediário:** Remove a complexidade de lidar com conteúdo em "needs_review".
  - **Workflow mais Claro:** Fluxo direto: pending → approved/rejected, sem estados ambíguos.
  - **Menos Políticas RLS:** Simplifica as políticas de visibilidade ao remover um estado.

- **Painel de Moderação Admin:**

  - **Lista de Posts Rejeitados:** Interface para visualizar todos os posts com `status = 'rejected'`.
  - **Ações Disponíveis:**
    - **Aprovar Post:** Reverte a decisão da IA, mudando status para `approved`.
    - **Excluir Permanentemente:** Remove o post definitivamente do banco de dados.
  - **Contexto para Decisão:** Exibe o conteúdo rejeitado e a razão da IA (se disponível).

- **Implementação via Edge Functions:**

  ```typescript
  // Edge Function para aprovação manual
  const approveRejectedPost = async (postId: string) => {
    // Verificar se chamador é admin
    const isAdmin = await verifyAdminRole(jwt);
    if (!isAdmin) throw new Error("Unauthorized");

    // Atualizar status usando service_role_key
    const { error } = await supabaseAdmin
      .from("forum_posts")
      .update({ status: "approved" })
      .eq("id", postId);

    // Registrar ação no log
    await logModerationAction("APPROVE_REJECTED_POST", postId);
  };
  ```

#### 4\. Funcionalidade de Grupos Criados por Usuários (ALTA COMPLEXIDADE)

Nova funcionalidade que permite a qualquer usuário criar grupos públicos ou privados, introduzindo complexidades significativas de RLS e gerenciamento de permissões.

- **Tipos de Grupos:**

  - **Público (`public`):** Qualquer usuário pode entrar imediatamente.
  - **Privado (`private`):** Requer aprovação do criador (owner) para entrada.

- **Complexidades de RLS para Grupos:**

  - **Criação de Grupos:**
    ```sql
    -- Qualquer usuário autenticado pode criar grupos
    CREATE POLICY "Users can create groups"
    ON forum_groups FOR INSERT
    USING (
      auth.uid() = (SELECT user_id FROM anonymous_profiles WHERE id = creator_profile_id)
    );
    ```
  - **Visibilidade de Grupos:**
    ```sql
    -- Grupos públicos são visíveis para todos, privados apenas para membros
    CREATE POLICY "Group visibility"
    ON forum_groups FOR SELECT
    USING (
      group_type = 'public' OR
      EXISTS (
        SELECT 1 FROM group_members gm
        JOIN anonymous_profiles ap ON gm.profile_id = ap.id
        WHERE gm.group_id = forum_groups.id
        AND ap.user_id = auth.uid()
        AND gm.role IN ('owner', 'member')
      )
    );
    ```
  - **Gerenciamento de Membros:**

    ```sql
    -- Entrada em grupos públicos (automática)
    CREATE POLICY "Join public groups"
    ON group_members FOR INSERT
    USING (
      EXISTS (
        SELECT 1 FROM forum_groups fg
        WHERE fg.id = group_id AND fg.group_type = 'public'
      )
      AND
      profile_id = (SELECT id FROM anonymous_profiles WHERE user_id = auth.uid())
      AND role = 'member'
    );

    -- Solicitação para grupos privados
    CREATE POLICY "Request private group membership"
    ON group_members FOR INSERT
    USING (
      EXISTS (
        SELECT 1 FROM forum_groups fg
        WHERE fg.id = group_id AND fg.group_type = 'private'
      )
      AND
      profile_id = (SELECT id FROM anonymous_profiles WHERE user_id = auth.uid())
      AND role = 'pending_request'
    );
    ```

- **Fluxos de Interação Complexos:**

  - **Criação de Grupo:**
    1. Usuário preenche formulário (nome, descrição, tipo)
    2. Frontend cria registro em `forum_groups`
    3. Frontend automaticamente adiciona criador como `owner` em `group_members`
  - **Entrada em Grupo Público:**
    1. Usuário vê lista de grupos públicos
    2. Clica em "Entrar"
    3. Frontend adiciona usuário como `member` em `group_members`
  - **Solicitação para Grupo Privado:**
    1. Usuário solicita entrada
    2. Frontend adiciona usuário como `pending_request`
    3. Owner vê solicitação em painel de gerenciamento
    4. Owner aprova/nega via atualização do `role` (`member` ou `DELETE`)

- **Gerenciamento de Permissões por Role:**

  - **Owner:** Pode aprovar/negar solicitações, remover membros, editar grupo.
  - **Member:** Pode postar conteúdo, ver outros membros.
  - **Pending_request:** Pode ver que solicitou entrada, mas não pode interagir.

- **Políticas RLS para Conteúdo em Grupos:**

  ```sql
  -- Posts só visíveis para membros do grupo
  CREATE POLICY "Group content visibility"
  ON forum_posts FOR SELECT
  USING (
    status = 'approved' AND
    EXISTS (
      SELECT 1 FROM group_members gm
      JOIN anonymous_profiles ap ON gm.profile_id = ap.id
      WHERE gm.group_id = forum_posts.group_id
      AND ap.user_id = auth.uid()
      AND gm.role IN ('owner', 'member')
    )
  );

  -- Criação de posts limitada a membros
  CREATE POLICY "Group posting permissions"
  ON forum_posts FOR INSERT
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      JOIN anonymous_profiles ap ON gm.profile_id = ap.id
      WHERE gm.group_id = forum_posts.group_id
      AND ap.user_id = auth.uid()
      AND gm.role IN ('owner', 'member')
      AND ap.is_restricted = false
    )
  );
  ```

#### 5\. Interseção e Interdependência entre RLS, Moderação e Grupos

- **RLS Consciente da Moderação e Grupos:** As políticas de RLS para visualização de conteúdo devem levar em conta tanto o estado de moderação quanto a estrutura de grupos. Posts são visíveis apenas se `status = 'approved'` E o usuário é membro do grupo, exceto para o próprio autor.

  ```sql
  -- Política complexa considerando moderação + grupos + autoria
  CREATE POLICY "Complete content visibility"
  ON forum_posts FOR SELECT
  USING (
    (
      status = 'approved' AND
      EXISTS (
        SELECT 1 FROM group_members gm
        JOIN anonymous_profiles ap ON gm.profile_id = ap.id
        WHERE gm.group_id = forum_posts.group_id
        AND ap.user_id = auth.uid()
        AND gm.role IN ('owner', 'member')
      )
    )
    OR
    -- Autor pode ver seus próprios posts independente do status
    author_profile_id = (
      SELECT id FROM anonymous_profiles WHERE user_id = auth.uid()
    )
  );
  ```

- **Edge Functions e Bypass de RLS:** As Edge Functions de moderação, ao usarem a `service_role_key`, operam com privilégios de superusuário do banco, ignorando as RLS. Isso é necessário para que possam modificar status de posts e gerenciar membros de grupos independentemente das restrições normais de acesso.

#### Conclusão sobre a Complexidade

As funcionalidades de Row Level Security, o sistema de moderação simplificado e a nova funcionalidade de grupos representam os maiores desafios técnicos do MVP. A funcionalidade de grupos introduz uma camada adicional de complexidade significativa, especialmente nas políticas RLS que devem gerenciar permissões granulares baseadas em tipos de grupo e roles de usuário. Exigem um planejamento cuidadoso, implementação meticulosa e, crucialmente, testes exaustivos para garantir a segurança, privacidade, anonimato e o correto funcionamento da plataforma. Erros nessas áreas podem levar a vazamentos de dados, falhas de segurança ou uma experiência de usuário comprometida.
