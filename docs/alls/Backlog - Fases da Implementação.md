# Backlog - Fases da Implementação

- [x] **Supabase:** Realizar um backup completo do banco de dados antes de iniciar as alterações.
- [x] **Next.js:** Validar e configurar as variáveis de ambiente (`.env.local` e Vercel).
- [x] **Next.js:** Criar a estrutura de diretórios para o módulo:

- [x] `src/app/(protected)/forum/`
- [x] `src/components/forum/`
- [x] `src/lib/types/forum.ts`

---

### **Fase 1: Backend - Modelagem e Criação das Tabelas no Supabase**

- [x] **Supabase:** Executar o script SQL para criar todas as tabelas do fórum (`AnonymousProfile`, `ForumGroup`, `GroupMembers`, `ForumThread`, `ForumPost`, `ForumComment`, `DirectMessage`, `ContentFlag`, `ModerationLog`).
- [ ] **Supabase:** Modificar a tabela `ForumGroup` para adicionar a coluna `group_type` com ENUM `('public', 'private')`.
- [ ] **Supabase:** Modificar a tabela `GroupMembers` para adicionar a coluna `role` com ENUM `('owner', 'member', 'pending_request')`.
- [ ] **Backend:** Alterar a coluna 'status' com a restrição CHECK nas tabelas ForumThread, ForumPost e ForumComment para usar o ENUM `('pending', 'approved', 'rejected')`.

---

### **Fase 2: Backend - Lógica de Segurança com Row Level Security (RLS)**

- [x] **Supabase:** Habilitar o RLS em todas as tabelas sensíveis criadas na Fase 1.
- [ ] **Supabase:** Criar política de RLS para `SELECT` em `ForumPost` e `ForumThread` (considerando `status = 'approved'` e acesso a grupos).
- [ ] **Supabase:** Criar política de RLS para `SELECT` em `ForumPost` e `ForumThread` que permite ao autor ver seus próprios posts independente do status (USING status = 'approved' OR author_profile_id = (SELECT id FROM AnonymousProfile WHERE user_id = auth.uid())).
- [x] **Supabase:** Criar política de RLS para `INSERT` em `ForumPost` e `ForumThread` (verificando se o usuário `is_restricted` e é membro do grupo).
- [x] **Supabase:** Criar política de RLS para `UPDATE`/`DELETE` (permitindo apenas para o autor do conteúdo).
- [ ] **Supabase:** Criar política de RLS para `DirectMessage` (permitindo acesso apenas para remetente e destinatário).
- [ ] **Supabase:** Criar política de RLS para `ContentFlag` (`INSERT` para todos, `SELECT` restrito a moderadores).
- [ ] **Supabase:** Criar políticas de RLS para `ForumGroup` (visibilidade baseada em `group_type` e membership).
- [ ] **Supabase:** Criar políticas de RLS para `GroupMembers` (entrada automática em públicos, solicitação em privados).

---

### **Fase 3: Backend - Edge Functions e Moderação Automatizada**

- [ ] **Backend:** Definir e obter chave de API para o serviço de IA (ex: Google Gemini).
- [ ] **Backend:** Criar a Edge Function 'moderate-post' que chama a API da IA e atualiza o status do post para 'approved' ou 'rejected'.
- [ ] **Backend:** Configurar um trigger e webhook no Supabase para acionar a função 'moderate-post' em cada novo post.
- [ ] **Supabase:** Criar a Edge Function `approve-rejected-post` para administradores reverterem decisões da IA.
- [ ] **Supabase:** Criar a Edge Function `delete-post-permanently` para exclusão definitiva de posts rejeitados.
- [ ] **Supabase:** Criar a Edge Function `restrict-user`.
- [ ] **Código (TS):** Implementar a lógica da função `restrict-user` para restringir um usuário e registrar a ação no `ModerationLog`.
- [ ] **Supabase:** Assegurar que todas as funções utilizem a `service_role_key` e verifiquem se o invocador tem permissão de administrador.

---

### **Fase 4: Frontend - Componentes de UI e Layout**

- [ ] **Next.js:** Implementar verificação de perfil anônimo na entrada do fórum e exibir modal 'Escolha seu Nickname' para novos usuários.
- [ ] **Next.js:** Criar o componente `PostCard.tsx` para exibir posts e comentários.
- [ ] **Next.js:** Criar o componente `ThreadItem.tsx` para a lista de tópicos.
- [ ] **Next.js:** Criar o componente `GroupCard.tsx` para a lista de grupos.
- [ ] **Next.js:** Criar o componente `MessageBubble.tsx` para as mensagens diretas.
- [ ] **Next.js:** Estruturar as páginas e layouts em `src/app/(protected)/forum/` conforme os mockups.

---

### **Fase 5: Frontend - Funcionalidade Principal do Fórum**

- [ ] **Next.js:** Implementar a busca de dados com Server Components para carregar o conteúdo inicial do fórum.
- [ ] **Next.js:** Implementar o Supabase Realtime com `useEffect` em Client Components para atualizações ao vivo.
- [ ] **Next.js:** Criar Server Actions para gerenciar a criação de novos posts e comentários dentro de grupos.
- [ ] **Frontend:** Implementar notificação (toast) de "Aguardando aprovação" após o envio do post.
- [ ] **Next.js:** Implementar a funcionalidade de `flagging` de conteúdo, conectando a UI a uma Server Action que cria um registro em `ContentFlag`.

---

### **Fase 6: Frontend - Grupos e Mensagens Diretas**

- [ ] **Next.js:** Construir a página de "Grupos", listando os grupos disponíveis (públicos e privados que o usuário faz parte).
- [ ] **Next.js:** Implementar a lógica para visualizar threads dentro de um grupo específico.
- [ ] **Next.js:** Construir a interface de Mensagens Diretas (DM) com lista de conversas e área de chat.
- [ ] **Next.js:** Integrar o Realtime para atualizações ao vivo nas DMs e implementar o indicador de mensagens não lidas.

---

### **Fase 7: Frontend - Painel de Moderação**

- [ ] **Next.js:** Criar uma rota protegida para o painel de moderação (ex: `/admin/moderation`).
- [ ] **Admin:** Construir o Painel de Moderação para gerenciar posts rejeitados pela IA com opções de 'Aprovar' e 'Excluir Permanentemente'.
- [ ] **Admin:** Construir seção para gerenciar conteúdo sinalizado da tabela ContentFlag.
- [ ] **Next.js:** Adicionar botões na interface para "Aprovar Post Rejeitado", "Excluir Permanentemente" e "Restringir Usuário".
- [ ] **Next.js:** Conectar os botões do painel para invocar as respectivas Edge Functions (`approve-rejected-post`, `delete-post-permanently`, `restrict-user`) via chamadas de API.

---

### **Fase 8: Funcionalidade de Grupos**

- [ ] **Backend:** Implementar RLS para criação e gerenciamento de grupos (políticas para criação, visibilidade e membership).
- [ ] **Frontend:** Construir formulário 'Criar Novo Grupo' com opções de tipo (público/privado), nome e descrição.
- [ ] **Frontend:** Construir UI para listar grupos disponíveis, separando grupos públicos de grupos privados que o usuário faz parte.
- [ ] **Frontend:** Implementar botões e lógica para 'Entrar' em grupos públicos (entrada imediata).
- [ ] **Frontend:** Implementar botões e lógica para 'Solicitar Entrada' em grupos privados (status pending_request).
- [ ] **Frontend:** Construir painel para o dono do grupo gerenciar pedidos de entrada (aprovar/negar solicitações de pending_request).
- [ ] **Backend/Frontend:** Integrar a criação de posts e threads para que ocorram dentro de um grupo específico.
- [ ] **Frontend:** Implementar navegação contextual para mostrar conteúdo específico de cada grupo.
- [ ] **Backend:** Implementar Edge Functions para gerenciamento avançado de grupos (remover membros, transferir ownership, etc.).
