# Recicash – Container Diagram

```mermaid
C4Container

    Person(cliente, "Cliente", "Usuário final")
    
    System_Boundary(RecicashSystem, "Recicash") {
        Container(frontend, "Frontend Web", "React", "Interface para cliente, administrador e ecoponto.")
        Container(backend, "Backend API", "Django", "Gerencia lógica, regras de negócio e integrações externas.")
        ContainerDb(database, "Database", "MySQL", "Armazena informações persistentes.")
    }

    Container_Ext(google, "Google Maps API", "Serviço externo de mapas e rotas.")

    Rel(cliente, frontend, "Interage via browser")
    Rel(frontend, backend, "Chamada REST")
    Rel(backend, database, "Consultas e persistência")
    Rel(backend, google, "Busca coordenadas, rotas e distâncias")

    UpdateLayoutConfig($c4ShapeInRow="2")
    UpdateRelStyle(cliente, frontend, $offsetY="-20")
    UpdateRelStyle(frontend, backend, $offsetX="-45", $offsetY="30")
    UpdateRelStyle(backend, database, $offsetY="20")
    UpdateRelStyle(backend, google, $offsetX="40")
````
