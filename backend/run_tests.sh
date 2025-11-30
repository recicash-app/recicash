#!/bin/bash

# Script para executar testes do endpoint de histórico de reciclagens
# Uso: ./run_tests.sh [opções]

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir uso
usage() {
    echo -e "${BLUE}Uso: ./run_tests.sh [opções]${NC}\n"
    echo "Opções:"
    echo "  all              Executar todos os testes"
    echo "  class            Executar apenas a classe de testes"
    echo "  auth             Executar apenas testes de autenticação"
    echo "  authz            Executar apenas testes de autorização"
    echo "  filters          Executar apenas testes de filtros"
    echo "  integrity        Executar apenas testes de integridade"
    echo "  own              Executar apenas teste de histórico próprio"
    echo "  other            Executar apenas teste de histórico de outro usuário"
    echo "  verbose          Executar todos com verbose output"
    echo "  coverage         Executar com cobertura de código"
    echo "  help             Mostrar esta mensagem"
    echo ""
}

# Verificar se docker-compose está disponível
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Erro: docker-compose não encontrado${NC}"
    echo "Instale docker-compose para continuar"
    exit 1
fi

# Se sem argumentos, mostrar ajuda
if [ $# -eq 0 ]; then
    usage
    exit 0
fi

case "$1" in
    all)
        echo -e "${GREEN}Executando todos os testes...${NC}\n"
        docker-compose exec backend python manage.py test tests.test_recycling_history_api
        ;;
    
    class)
        echo -e "${GREEN}Executando classe de testes...${NC}\n"
        docker-compose exec backend python manage.py test tests.test_recycling_history_api.RecyclingHistoryAPITestCase
        ;;
    
    auth)
        echo -e "${GREEN}Executando testes de autenticação...${NC}\n"
        docker-compose exec backend python manage.py test \
            tests.test_recycling_history_api.RecyclingHistoryAPITestCase.test_recycling_list_requires_authentication \
            tests.test_recycling_history_api.RecyclingHistoryAPITestCase.test_authenticated_user_can_access_endpoint
        ;;
    
    authz)
        echo -e "${GREEN}Executando testes de autorização...${NC}\n"
        docker-compose exec backend python manage.py test \
            tests.test_recycling_history_api.RecyclingHistoryAPITestCase.test_user_can_retrieve_own_recycling_history \
            tests.test_recycling_history_api.RecyclingHistoryAPITestCase.test_user_cannot_access_other_users_recycling_history \
            tests.test_recycling_history_api.RecyclingHistoryAPITestCase.test_user2_cannot_access_user1_recycling_history
        ;;
    
    filters)
        echo -e "${GREEN}Executando testes de filtros...${NC}\n"
        docker-compose exec backend python manage.py test \
            tests.test_recycling_history_api.RecyclingHistoryAPITestCase.test_filter_by_start_date \
            tests.test_recycling_history_api.RecyclingHistoryAPITestCase.test_filter_by_end_date \
            tests.test_recycling_history_api.RecyclingHistoryAPITestCase.test_filter_by_min_points \
            tests.test_recycling_history_api.RecyclingHistoryAPITestCase.test_filter_by_max_points
        ;;
    
    integrity)
        echo -e "${GREEN}Executando testes de integridade...${NC}\n"
        docker-compose exec backend python manage.py test \
            tests.test_recycling_history_api.RecyclingHistoryAPITestCase.test_recycling_data_structure \
            tests.test_recycling_history_api.RecyclingHistoryAPITestCase.test_recycling_order \
            tests.test_recycling_history_api.RecyclingHistoryAPITestCase.test_response_includes_pagination_info
        ;;
    
    own)
        echo -e "${GREEN}Executando teste de histórico próprio...${NC}\n"
        docker-compose exec backend python manage.py test \
            tests.test_recycling_history_api.RecyclingHistoryAPITestCase.test_user_can_retrieve_own_recycling_history
        ;;
    
    other)
        echo -e "${GREEN}Executando teste de histórico de outro usuário...${NC}\n"
        docker-compose exec backend python manage.py test \
            tests.test_recycling_history_api.RecyclingHistoryAPITestCase.test_user_cannot_access_other_users_recycling_history
        ;;
    
    verbose)
        echo -e "${GREEN}Executando todos os testes com verbose output...${NC}\n"
        docker-compose exec backend python manage.py test tests.test_recycling_history_api -v 2
        ;;
    
    coverage)
        echo -e "${GREEN}Executando testes com cobertura...${NC}\n"
        docker-compose exec backend coverage run --source='.' manage.py test tests.test_recycling_history_api
        echo -e "\n${BLUE}Relatório de cobertura:${NC}\n"
        docker-compose exec backend coverage report
        ;;
    
    help)
        usage
        ;;
    
    *)
        echo -e "${RED}Opção desconhecida: $1${NC}"
        usage
        exit 1
        ;;
esac
