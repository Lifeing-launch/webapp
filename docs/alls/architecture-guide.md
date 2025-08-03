# Lifeing Launch WebApp - Guia de Arquitetura e Padrões

## 📋 Visão Geral

Este documento descreve a arquitetura, padrões e convenções do projeto **Lifeing Launch WebApp**, uma aplicação web moderna construída com Next.js 15, React 19, TypeScript e Supabase.

### Stack Tecnológica Principal

- **Framework**: Next.js 15 com App Router
- **Language**: TypeScript com configuração strict
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4 com design tokens
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **CMS**: Strapi headless CMS
- **UI Components**: Radix UI primitives
- **Testing**: Jest + Testing Library
- **Build Tool**: Turbopack (desenvolvimento)

---

## 🏗️ Estrutura de Diretórios

### Estrutura Principal

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rotas de autenticação agrupadas
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── (protected)/       # Rotas protegidas por autenticação
│   │   ├── dashboard/
│   │   ├── meetings/
│   │   ├── resources/
│   │   └── coaching/
│   ├── api/              # API routes do Next.js
│   └── globals.css       # Estilos globais e design tokens
├── components/           # Componentes React organizados por domínio
│   ├── ui/              # Design system base (Button, Card, Input, etc.)
│   ├── auth/            # Componentes de autenticação
│   ├── dashboard/       # Componentes específicos do dashboard
│   ├── meetings/        # Componentes de reuniões
│   ├── resources/       # Componentes de recursos/conteúdo
│   ├── layout/          # Componentes de estrutura (Header, Sidebar, etc.)
│   └── form/            # Componentes de formulário
├── hooks/               # Custom React hooks
├── lib/                 # Utilitários e configurações
├── typing/              # Definições de tipos TypeScript
├── utils/               # Funções utilitárias
│   └── supabase/        # Clientes e utilitários do Supabase
└── middleware.ts        # Middleware de autenticação
```

### Organização por Domínio

Os componentes são organizados por **domínio funcional**:

- **ui/**: Componentes base reutilizáveis do design system
- **auth/**: Tudo relacionado à autenticação e autorização
- **dashboard/**: Componentes específicos da página inicial
- **meetings/**: Funcionalidades de reuniões e eventos
- **resources/**: Artigos, conteúdo e recursos educacionais
- **layout/**: Estrutura e navegação da aplicação

---

## 🎨 Padrões de Componentes

### 1. Componentes UI Base

Todos os componentes UI seguem um padrão consistente baseado em:

- **Radix UI** como primitivos base
- **Class Variance Authority (CVA)** para variantes
- **Data attributes** para identificação (`data-slot`)
- **forwardRef** quando necessário

**Exemplo - Button Component:**

```typescript
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3",
        lg: "h-10 px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
```

### 2. Componentes Compostos

Para componentes complexos como Card, use o padrão de **composição**:

```typescript
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm", className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6", className)}
      {...props}
    />
  );
}

// Exportar todas as partes
export { Card, CardHeader, CardTitle, CardContent, CardFooter };
```

### 3. Componentes com Estado

Para componentes com lógica de negócio:

```typescript
interface MeetingCardProps {
  meeting: Meeting;
  showRsvp?: boolean;
}

export function MeetingCard({ meeting, showRsvp = true }: MeetingCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRsvp = async () => {
    setIsLoading(true);
    try {
      // Lógica de RSVP
    } catch (error) {
      toast.error("Erro ao confirmar presença");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{meeting.title}</CardTitle>
        <CardDescription>{meeting.description}</CardDescription>
      </CardHeader>
      {showRsvp && (
        <CardFooter>
          <Button onClick={handleRsvp} disabled={isLoading}>
            {isLoading ? "Confirmando..." : "Confirmar Presença"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
```

---

## 🎨 Padrões de Estilização

### Design Tokens

O projeto utiliza um sistema robusto de **design tokens** baseado em CSS custom properties:

```css
:root {
  --radius: 0.5rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --primary: oklch(0.41 0.0956 131.06);
  --primary-foreground: oklch(0.982 0.018 155.826);
  /* ... mais tokens */
}

.dark {
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.696 0.17 162.48);
  /* ... tokens do tema escuro */
}
```

### Tailwind CSS 4

**Configuração:**

- **Versão**: Tailwind CSS 4 (nova geração)
- **Color Space**: oklch() para melhor controle de cores
- **Tema**: Suporte completo a dark/light mode
- **Container Queries**: Suporte nativo

**Padrões de Classes:**

```typescript
// ✅ Usar função cn() para merge de classes
className={cn("base-classes", conditionalClasses, className)}

// ✅ Seguir mobile-first
"flex flex-col lg:flex-row"

// ✅ Usar design tokens
"bg-primary text-primary-foreground"

// ✅ Estados consistentes
"focus-visible:ring-ring/50 focus-visible:ring-[3px]"
```

### Função Utilitária cn()

**Sempre usar** a função `cn()` para combinar classes:

```typescript
import { cn } from "@/lib/utils";

// ✅ Correto
className={cn("base-classes", className)}

// ❌ Evitar
className={`base-classes ${className}`}
```

---

## 🔧 Padrões TypeScript

### Configuração Strict

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "moduleResolution": "bundler",
    "jsx": "preserve"
  }
}
```

### Path Mapping

**Sempre usar** o alias `@/` para imports internos:

```typescript
// ✅ Correto
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ❌ Evitar
import { cn } from "../../lib/utils";
```

### Tipagem de Componentes

```typescript
// ✅ Padrão para componentes UI
interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

// ✅ Padrão para props de páginas
interface PageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

// ✅ Padrão para interfaces de negócio
interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  capacity: number;
  rsvp_count: number;
}
```

---

## 📄 Padrões de Páginas

### App Router Structure

**Agrupamento de Rotas:**

- `(auth)/`: Rotas de autenticação sem layout da aplicação
- `(protected)/`: Rotas que requerem autenticação

### Estrutura de Página

```typescript
import type { Metadata } from "next";

// ✅ Metadata export para SEO
export const metadata: Metadata = {
  title: "Dashboard - Lifeing Services",
  description: "Acesse seu painel pessoal",
};

interface PageProps {
  params: { slug: string };
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  // ✅ Server-side data fetching quando possível
  const data = await fetchData(params.slug);

  return (
    <PageTemplate title="Dashboard" breadcrumbs={breadcrumbs}>
      {/* Conteúdo da página */}
    </PageTemplate>
  );
}
```

### Layout Patterns

```typescript
// ✅ Layout com sidebar para rotas protegidas
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

### Loading e Error States

```typescript
// loading.tsx
export default function Loading() {
  return <DashboardSkeleton />;
}

// error.tsx
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorTemplate
      error={error}
      onRetry={reset}
      title="Algo deu errado"
    />
  );
}
```

---

## 🔌 Padrões de API Routes

### Estrutura Básica

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Lógica da API
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
```

### Parâmetros Dinâmicos

```typescript
// app/api/resources/[slug]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  // Lógica da API
}
```

### Validação de Dados

```typescript
interface CreateMeetingRequest {
  title: string;
  description: string;
  date: string;
  capacity: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateMeetingRequest = await request.json();

    // Validação básica
    if (!body.title || !body.date) {
      return NextResponse.json(
        { error: "Título e data são obrigatórios" },
        { status: 400 }
      );
    }

    // Continuar com a lógica...
  } catch (error) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
}
```

---

## 🔐 Integração com Supabase

### Clientes Supabase

**Server Client (para Server Components e API Routes):**

```typescript
// utils/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignorar se chamado de Server Component
          }
        },
      },
    }
  );
};

// Admin client para operações privilegiadas
export const createAdminClient = () => {
  return createJSClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY!
  );
};
```

**Browser Client (para Client Components):**

```typescript
// utils/supabase/browser.ts
import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
```

### Operações de Database

```typescript
// ✅ Operação com tratamento de erro
const fetchMeetings = async () => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .order("date", { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao buscar reuniões:", error);
    throw new Error("Falha ao carregar reuniões");
  }
};
```

### Realtime Subscriptions

```typescript
useEffect(() => {
  const supabase = createClient();

  const subscription = supabase
    .channel("meetings")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "meetings" },
      (payload) => {
        // Atualizar estado local
        setMeetings((prev) => [...prev, payload.new]);
      }
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, []);
```

---

## 🔒 Padrões de Autenticação

### Middleware de Autenticação

```typescript
// middleware.ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

### Server Actions para Auth

```typescript
// utils/supabase/actions.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirect("/signup?message=Erro ao criar conta");
  }

  redirect("/verify-email");
}
```

### Proteção de Rotas

```typescript
// (protected)/layout.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen">
      <AppSidebar user={user} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

---

## 📊 Padrões de Estado

### Estado Local

```typescript
// ✅ useState para estado simples
const [isLoading, setIsLoading] = useState(false);
const [meetings, setMeetings] = useState<Meeting[]>([]);

// ✅ useEffect para side effects
useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMeetings();
      setMeetings(data);
    } catch (error) {
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  fetchData();
}, []);
```

### Estado Global com Supabase

```typescript
// ✅ Context para estado compartilhado
const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
}>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

## 🧪 Padrões de Teste

### Configuração Jest

```typescript
// jest.config.ts
const config: Config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transformIgnorePatterns: ["/node_modules/", "\\.pnp\\.[^\\/]+$"],
};
```

### Testes de Componentes

```typescript
// components/ui/button.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

describe("Button", () => {
  it("should render correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("should handle click events", async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should apply variant classes correctly", () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-destructive");
  });
});
```

### Mocks

```typescript
// __mocks__/supabase.ts
export const createClient = jest.fn(() => ({
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { user: { id: "123", email: "test@example.com" } },
      error: null,
    }),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockResolvedValue({
      data: [],
      error: null,
    }),
  })),
}));
```

---

## 📝 Convenções de Nomenclatura

### Arquivos e Pastas

```
✅ Correto:
- kebab-case para arquivos: user-profile.tsx
- PascalCase para componentes: UserProfile.tsx
- lowercase para pastas: components/auth/

❌ Evitar:
- camelCase para arquivos: userProfile.tsx
- snake_case: user_profile.tsx
```

### Componentes e Funções

```typescript
// ✅ Componentes em PascalCase
export function UserProfile() {}
export const MeetingCard = () => {};

// ✅ Funções em camelCase
export function fetchUserData() {}
export const calculateTotal = () => {};

// ✅ Constantes em UPPER_SNAKE_CASE
export const API_BASE_URL = "https://api.example.com";
export const DEFAULT_PAGE_SIZE = 10;
```

### Interfaces e Types

```typescript
// ✅ Interfaces com prefixo I
interface IUser {
  id: string;
  email: string;
}

// ✅ Types descritivos
type ButtonVariant = "default" | "destructive" | "outline";
type LoadingState = "idle" | "loading" | "success" | "error";
```

---

## ⚠️ Tratamento de Erros

### Error Boundaries

```typescript
// components/layout/error.tsx
"use client";

import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log do erro para serviço de monitoramento
    console.error("Erro capturado:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <h2 className="text-xl font-semibold">Algo deu errado!</h2>
      <p className="text-muted-foreground">
        Ocorreu um erro inesperado. Tente novamente.
      </p>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  );
}
```

### API Error Handling

```typescript
// utils/api-client.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(
        error.message || "Erro na requisição",
        response.status,
        error.code
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Erro de rede", 0);
  }
}
```

---

## ⚡ Performance e Otimização

### Code Splitting

```typescript
// ✅ Lazy loading de componentes pesados
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("@/components/charts/heavy-chart"), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

// ✅ Lazy loading de páginas
const AdminPanel = dynamic(() => import("@/components/admin/admin-panel"), {
  loading: () => <div>Carregando painel...</div>,
});
```

### Otimizações do Next.js

```typescript
// ✅ Otimização de imagens
import Image from "next/image";

<Image
  src="/hero-image.jpg"
  alt="Hero"
  width={800}
  height={600}
  priority // Para imagens above-the-fold
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// ✅ Prefetch de links
import Link from "next/link";

<Link href="/dashboard" prefetch={true}>
  Dashboard
</Link>
```

### Memoização

```typescript
// ✅ Usar React.memo para componentes puros
const MeetingCard = React.memo(({ meeting }: { meeting: Meeting }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{meeting.title}</CardTitle>
      </CardHeader>
    </Card>
  );
});

// ✅ Usar useMemo para cálculos custosos
const expensiveValue = useMemo(() => {
  return meetings.filter(m => m.status === 'active').length;
}, [meetings]);

// ✅ Usar useCallback para funções estáveis
const handleMeetingClick = useCallback((meetingId: string) => {
  // Lógica do click
}, []);
```

---

## 🚀 Deploy e CI/CD

### Scripts de Build

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "ci": "npm run format && npm run lint && npm run test"
  }
}
```

### Environment Variables

```bash
# .env.local (não commitado)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# .env.example (commitado)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY=
```

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Builder
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

---

## 🎯 Melhores Práticas

### Segurança

```typescript
// ✅ Validar inputs do usuário
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ✅ Sanitizar dados antes de usar
import { sanitize } from "isomorphic-dompurify";

const cleanContent = sanitize(userInput);

// ✅ Usar Row Level Security no Supabase
-- SQL para RLS
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own meetings" ON meetings
  FOR SELECT USING (user_id = auth.uid());
```

### Performance

```typescript
// ✅ Debounce para buscas
import { useDebounce } from "@/hooks/use-debounce";

function SearchInput() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (debouncedSearch) {
      performSearch(debouncedSearch);
    }
  }, [debouncedSearch]);
}

// ✅ Pagination para listas grandes
const ITEMS_PER_PAGE = 20;

function MeetingsList() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMeetings({
    page,
    limit: ITEMS_PER_PAGE,
  });
}
```

### Acessibilidade

```typescript
// ✅ Atributos ARIA apropriados
<button
  aria-label="Confirmar presença na reunião"
  aria-pressed={isRsvped}
  onClick={handleRsvp}
>
  {isRsvped ? "Confirmado" : "Confirmar"}
</button>

// ✅ Focus management
const dialogRef = useRef<HTMLDialogElement>(null);

useEffect(() => {
  if (isOpen) {
    dialogRef.current?.focus();
  }
}, [isOpen]);

// ✅ Keyboard navigation
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    onClose();
  }
};
```

### SEO

```typescript
// ✅ Metadata dinâmica
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const meeting = await getMeeting(params.slug);

  return {
    title: meeting.title,
    description: meeting.description,
    openGraph: {
      title: meeting.title,
      description: meeting.description,
      images: [meeting.image],
    },
  };
}

// ✅ Structured data
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Event",
      "name": meeting.title,
      "startDate": meeting.date,
      "location": meeting.location,
    }),
  }}
/>
```

---

## 📚 Recursos e Referências

### Documentação Externa

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [Tailwind CSS 4 Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

### Arquivos de Configuração

- [`package.json`](../package.json) - Dependências e scripts
- [`next.config.ts`](../next.config.ts) - Configuração do Next.js
- [`tailwind.config.ts`](../tailwind.config.ts) - Configuração do Tailwind
- [`tsconfig.json`](../tsconfig.json) - Configuração do TypeScript
- [`jest.config.ts`](../jest.config.ts) - Configuração de testes

### Componentes de Referência

- [`src/components/ui/button.tsx`](../src/components/ui/button.tsx) - Exemplo de componente base
- [`src/components/ui/card.tsx`](../src/components/ui/card.tsx) - Exemplo de componente composto
- [`src/lib/utils.ts`](../src/lib/utils.ts) - Função utilitária cn()
- [`src/app/globals.css`](../src/app/globals.css) - Design tokens e estilos globais

---

## 🎉 Conclusão

Este guia fornece as diretrizes fundamentais para desenvolver de forma consistente e eficiente no projeto Lifeing Launch WebApp. Siga estes padrões para manter a qualidade, performance e manutenibilidade do código.

Para dúvidas ou sugestões de melhorias neste documento, entre em contato com a equipe de desenvolvimento.
