# Recicash - Component Diagrams

## Backend Component Diagram

```mermaid
C4Component

    Container_Boundary(backend, "Django Backend") {
        Component(presentation, "Presentation Layer / Controllers (Views)", "Camada Presentation", "Recebe requisições HTTP e retorna respostas JSON.")
        Component(application, "Application Layer / Services", "Camada Application", "Orquestra casos de uso, valida regras e coordena entidades de domínio.")
        Component(domain, "Domain Layer / Domain Models", "Camada Domain", "Define entidades e lógica de domínio pura.")
        Component(infrastructure, "Infrastructure Layer / Repositories", "Camada Infrastructure", "Gerencia persistência, integrações externas (ORM, APIs) e cache.")
    }

    Rel(presentation, application, "Invoca serviços para executar casos de uso")
    Rel(application, domain, "Manipula entidades de domínio")
    Rel(application, infrastructure, "Acessa dados persistentes e APIs externas")
    
    UpdateRelStyle(presentation, application, $offsetX="-50", $offsetY="30")
    UpdateRelStyle(application, domain, $offsetX="50", $offsetY="5")
    UpdateRelStyle(application, infrastructure, $offsetX="10")
```

## Frontend Component Diagram

```mermaid
C4Component
    System_Boundary(frontend, "Frontend (Microfrontends)") {
        Container_Boundary(proxy, "Orchestration Layer (Docker + Traefik)") {
            Component(traefik, "Traefik Reverse Proxy", "Proxy Layer", "Roteia requisições entre microfrontends e backend.")
        }
        Container_Boundary(web, "Web App") {
            Component(web_ui, "UI Components", "React + MUI", "Interface principal do cliente final.")
            Component(web_logic, "Hooks / State Management", "", "Gerencia estado, rotas e consumo de APIs.")
        }
        Container_Boundary(admin, "Admin App") {
            Component(admin_ui, "Admin UI", "React + MUI", "Painel administrativo.")
            Component(admin_logic, "Admin State / Hooks", "", "Gerencia estado e regras administrativas.")
        }
        Container_Boundary(ecoponto, "Ecoponto App") {
            Component(ecoponto_ui, "Ecoponto UI", "React + MUI", "Interface para operação de ecopontos.")
            Component(ecoponto_logic, "Ecoponto Logic / Hooks", "", "Gerencia dados e operações de ecoponto.")
        }
        Container_Boundary(auth, "Auth App") {
            Component(auth_ui, "Auth UI (Login/Logout)", "React + MUI", "Formulários de login/logout e feedback de autenticação.")
            Component(auth_logic, "Auth Logic / Session Handler", "", "Executa login/logout usando backend e redireciona usuários autenticados.")
        }
        Component(shared_libs, "Shared Libraries", "shared/ (UI, Hooks, Auth, Utils)", 
                 "Bibliotecas compartilhadas entre todos os microfrontends (componentes, hooks, API, validações).")
    }

    Rel(traefik, web_ui, "Roteia requisições para")
    Rel(traefik, admin_ui, "Roteia requisições para")
    Rel(traefik, ecoponto_ui, "Roteia requisições para")
    Rel(traefik, auth_ui, "Roteia requisições para")

    Rel(web_ui, web_logic, "Interage com")
    Rel(admin_ui, admin_logic, "Interage com")
    Rel(ecoponto_ui, ecoponto_logic, "Interage com")
    Rel(auth_ui, auth_logic, "Interage com")

    Rel(web_logic, shared_libs, "Usa componentes e hooks")
    Rel(admin_logic, shared_libs, "Usa bibliotecas compartilhadas")
    Rel(ecoponto_logic, shared_libs, "Usa bibliotecas compartilhadas")
    Rel(auth_logic, shared_libs, "Usa APIs e helpers compartilhados")

    Rel(web_logic, auth_ui, "Redireciona usuário não autenticado para login")
    Rel(auth_logic, web_logic, "Após login, redireciona")
    Rel(auth_logic, admin_logic, "Redireciona administradores")
    Rel(auth_logic, ecoponto_logic, "Redireciona ecopontos")
}
```
