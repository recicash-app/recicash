"""
Example: Using the Google Maps API integration for Recycling Points

This script demonstrates how to:
1. Find recycling points near a location
2. Geocode addresses
3. Retrieve specific recycling point details
"""

import requests
import json
from typing import Dict, List, Optional


class RecyclingPointClient:
    """Client para interagir com a API de Recycling Points."""
    
    def __init__(self, base_url: str = "http://localhost:8000/api/v1"):
        """
        Initialize the client.
        
        Args:
            base_url: Base URL da API (padrão: localhost)
        """
        self.base_url = base_url
        self.session = requests.Session()
    
    def list_all_points(self) -> Optional[List[Dict]]:
        """List all recycling points in the database."""
        try:
            response = self.session.get(f"{self.base_url}/recycling-points/")
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Erro ao listar pontos: {e}")
            return None
    
    def get_point_by_id(self, point_id: int) -> Optional[Dict]:
        """Get a specific recycling point by ID."""
        try:
            response = self.session.get(f"{self.base_url}/recycling-points/{point_id}/")
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Erro ao recuperar ponto {point_id}: {e}")
            return None
    
    def get_location(self, point_id: int) -> Optional[Dict]:
        """
        Get detailed location info including Google Maps link.
        
        Args:
            point_id: ID do recycling point
            
        Returns:
            Dict com informações de localização ou None
        """
        try:
            response = self.session.get(
                f"{self.base_url}/recycling-points/{point_id}/location/"
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Erro ao obter localização: {e}")
            return None
    
    def find_nearby_points(
        self,
        latitude: float,
        longitude: float,
        radius_meters: int = 5000,
        include_google: bool = False
    ) -> Optional[Dict]:
        """
        Find recycling points near given coordinates.
        
        Args:
            latitude: Latitude do usuário
            longitude: Longitude do usuário
            radius_meters: Raio de busca em metros (padrão: 5km)
            include_google: Incluir resultados do Google Places (padrão: False)
            
        Returns:
            Dict com pontos próximos ou None
        """
        try:
            params = {
                'lat': latitude,
                'lon': longitude,
                'radius': radius_meters,
                'include_google': 'true' if include_google else 'false'
            }
            response = self.session.get(
                f"{self.base_url}/recycling-points/nearby/",
                params=params
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Erro ao buscar pontos próximos: {e}")
            return None
    
    def geocode_address(self, address: str) -> Optional[Dict]:
        """
        Convert an address to coordinates.
        
        Args:
            address: Endereço a geocodificar
            
        Returns:
            Dict com latitude/longitude ou None
        """
        try:
            params = {'address': address}
            response = self.session.get(
                f"{self.base_url}/recycling-points/geocode/",
                params=params
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Erro ao geocodificar endereço: {e}")
            return None


def example_1_list_all_points():
    """Example 1: List all recycling points."""
    print("=" * 50)
    print("Exemplo 1: Listar todos os pontos de reciclagem")
    print("=" * 50)
    
    client = RecyclingPointClient()
    points = client.list_all_points()
    
    if points:
        print(f"Total de pontos encontrados: {len(points)}\n")
        for point in points:
            print(f"- {point['name']}")
            print(f"  Localização: ({point['latitude']}, {point['longitude']})")
            print(f"  CNPJ: {point['cnpj']}\n")
    else:
        print("Nenhum ponto encontrado.")


def example_2_find_nearby():
    """Example 2: Find nearby recycling points."""
    print("=" * 50)
    print("Exemplo 2: Buscar pontos próximos")
    print("=" * 50)
    
    client = RecyclingPointClient()
    
    # Coordenadas de Brasília (Praça dos Três Poderes)
    latitude = -15.7942
    longitude = -48.0766
    radius = 10000  # 10 km
    
    print(f"Buscando pontos em raio de {radius}m")
    print(f"Localização: ({latitude}, {longitude})\n")
    
    result = client.find_nearby_points(latitude, longitude, radius)
    
    if result:
        print(f"Total encontrado: {result['count']}")
        print(f"Localização do usuário: {result['user_location']}\n")
        
        print("Pontos do Banco de Dados:")
        for point in result['database_points']:
            print(f"- {point['name']}")
            print(f"  Distância: {point['distance_meters']:.2f}m")
            print(f"  Localização: ({point['latitude']}, {point['longitude']})\n")
        
        if result['google_points']:
            print("\nSugestões do Google Places:")
            for place in result['google_points']:
                print(f"- {place['name']}")
                print(f"  Classificação: {place.get('rating', 'N/A')}")
                print(f"  Localização: {place['address']}\n")
    else:
        print("Erro ao buscar pontos próximos.")


def example_3_geocode_address():
    """Example 3: Geocode an address."""
    print("=" * 50)
    print("Exemplo 3: Geocodificar um endereço")
    print("=" * 50)
    
    client = RecyclingPointClient()
    
    address = "Brasília DF Brasil"
    print(f"Geocodificando: '{address}'\n")
    
    result = client.geocode_address(address)
    
    if result:
        print(f"Endereço: {result['address']}")
        print(f"Latitude: {result['latitude']}")
        print(f"Longitude: {result['longitude']}\n")
        
        # Now find nearby points at this location
        print("Buscando pontos próximos a esta localização...\n")
        nearby = client.find_nearby_points(
            result['latitude'],
            result['longitude'],
            radius_meters=5000
        )
        
        if nearby and nearby['database_points']:
            for point in nearby['database_points']:
                print(f"- {point['name']} ({point['distance_meters']:.2f}m)")
        else:
            print("Nenhum ponto encontrado nesta área.")
    else:
        print("Erro ao geocodificar endereço.")


def example_4_get_location():
    """Example 4: Get detailed location info."""
    print("=" * 50)
    print("Exemplo 4: Obter informações detalhadas de localização")
    print("=" * 50)
    
    client = RecyclingPointClient()
    
    # Primeiro, listar os pontos para obter um ID
    points = client.list_all_points()
    
    if not points:
        print("Nenhum ponto disponível.")
        return
    
    point_id = points[0]['recycling_point_id']
    
    print(f"Obtendo localização do ponto ID {point_id}\n")
    
    location = client.get_location(point_id)
    
    if location:
        print(f"Nome: {location['name']}")
        print(f"Coordenadas: ({location['latitude']}, {location['longitude']})")
        print(f"CNPJ: {location['cnpj']}")
        print(f"CEP: {location['zip_code']}")
        print(f"\nLink Google Maps:")
        print(f"{location['maps_url']}")
    else:
        print("Erro ao obter localização.")


def example_5_integrated_workflow():
    """Example 5: Complete workflow."""
    print("=" * 50)
    print("Exemplo 5: Fluxo Completo")
    print("=" * 50)
    
    client = RecyclingPointClient()
    
    # Step 1: Geocodify an address
    print("\n1. Geocodificando endereço...")
    user_address = "Brasília DF Brasil"
    geo_result = client.geocode_address(user_address)
    
    if not geo_result:
        print("Erro ao geocodificar. Abortando.")
        return
    
    user_lat = geo_result['latitude']
    user_lon = geo_result['longitude']
    print(f"   Localização obtida: ({user_lat}, {user_lon})")
    
    # Step 2: Find nearby points
    print("\n2. Buscando pontos de reciclagem próximos...")
    nearby = client.find_nearby_points(user_lat, user_lon, radius_meters=5000)
    
    if not nearby or not nearby['database_points']:
        print("   Nenhum ponto encontrado.")
        return
    
    print(f"   Encontrados {len(nearby['database_points'])} pontos")
    
    # Step 3: Get details of closest point
    closest_point = nearby['database_points'][0]
    closest_id = closest_point['recycling_point_id']
    
    print(f"\n3. Obtendo detalhes do ponto mais próximo ({closest_point['name']})...")
    location = client.get_location(closest_id)
    
    if location:
        print(f"   Nome: {location['name']}")
        print(f"   Distância: {closest_point['distance_meters']:.2f}m")
        print(f"   Google Maps: {location['maps_url']}")
    
    # Step 4: Display all nearby points
    print(f"\n4. Todos os pontos próximos (ordenados por distância):")
    for i, point in enumerate(nearby['database_points'], 1):
        print(f"   {i}. {point['name']} - {point['distance_meters']:.2f}m")


if __name__ == "__main__":
    """Run all examples."""
    
    # Descomentar o exemplo que deseja executar:
    
    example_1_list_all_points()
    print("\n")
    
    example_2_find_nearby()
    print("\n")
    
    example_3_geocode_address()
    print("\n")
    
    example_4_get_location()
    print("\n")
    
    example_5_integrated_workflow()
