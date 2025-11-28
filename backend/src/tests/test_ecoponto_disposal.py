"""
Unit tests for Ecoponto Disposal functionality.

Tests the EcopontoDisposalService class and related API endpoints for registering
disposal records by recycling points without associating them to specific users.
"""

from django.test import TransactionTestCase
from core.domain.models import RecyclingPoint, RecyclingValue, Recycling, User
from core.application.use_cases.ecoponto_disposal_service import EcopontoDisposalService
import logging

# Disable logging during tests to avoid cluttering test output
logging.disable(logging.CRITICAL)


class EcopontoDisposalServiceTestCase(TransactionTestCase):
    """
    Test cases for EcopontoDisposalService class.
    
    Uses TransactionTestCase to support database transactions.
    """

    def setUp(self):
        """Set up test data before each test method."""
        # Create test recycling point
        self.recycling_point = RecyclingPoint.objects.create(
            name="Ecoponto Teste",
            cnpj="12345678901234",
            zip_code="12345000",
            latitude=-23.5505,
            longitude=-46.6333
        )
        
        self.recycling_value = RecyclingValue.objects.create(
            points_value=500.0
        )

    def test_register_disposal_success(self):
        """Test successful disposal registration."""
        result = EcopontoDisposalService.register_disposal(
            recycling_point_id=self.recycling_point.recycling_point_id,
            weight=2.5
        )
        
        # Check returned data
        self.assertIn('recycling_id', result)
        self.assertIn('validation_hash', result)
        self.assertIn('points_value', result)
        self.assertIn('weight', result)
        # Validate calculated values
        self.assertEqual(result['points_value'], 1250)  # 2.5 kg * 500 points/kg
        self.assertEqual(result['weight'], 2.5)
        self.assertEqual(len(result['validation_hash']), 8)  # 8 characters hash

    def test_validation_hash_uniqueness(self):
        """Test that validation hashes are unique."""
        result1 = EcopontoDisposalService.register_disposal(
            recycling_point_id=self.recycling_point.recycling_point_id,
            weight=2.5
        )
        
        result2 = EcopontoDisposalService.register_disposal(
            recycling_point_id=self.recycling_point.recycling_point_id,
            weight=2.5
        )
        
        # Hashes should be different even with same parameters
        self.assertNotEqual(result1['validation_hash'], result2['validation_hash'])

    def test_register_disposal_invalid_weight(self):
        """Test disposal registration with invalid weight."""
        with self.assertRaises(ValueError) as context:
            EcopontoDisposalService.register_disposal(
                recycling_point_id=self.recycling_point.recycling_point_id,
                weight=-1.0
            )
        
        self.assertIn("Weight must be greater than 0", str(context.exception))

    def test_register_disposal_invalid_recycling_point(self):
        """Test disposal registration with non-existent recycling point."""
        with self.assertRaises(ValueError) as context:
            EcopontoDisposalService.register_disposal(
                recycling_point_id=9999,
                weight=2.5
            )
        
        self.assertIn("Recycling point with ID 9999 not found", str(context.exception))

    def test_register_disposal_with_specific_recycling_value(self):
        """Test disposal registration with specific recycling value."""
        # Create specific recycling value
        specific_value = RecyclingValue.objects.create(points_value=750.0)
        
        result = EcopontoDisposalService.register_disposal(
            recycling_point_id=self.recycling_point.recycling_point_id,
            weight=2.0,
            recycling_value_id=specific_value.recycling_value_id
        )
        
        # Should use specific value, not default
        self.assertEqual(result['points_value'], 1500)  # 2.0 * 750

    def test_register_disposal_invalid_recycling_value(self):
        """Test disposal registration with non-existent recycling value."""
        with self.assertRaises(ValueError) as context:
            EcopontoDisposalService.register_disposal(
                recycling_point_id=self.recycling_point.recycling_point_id,
                weight=2.5,
                recycling_value_id=9999
            )
        
        self.assertIn("Recycling value with ID 9999 not found", str(context.exception))

    def test_register_disposal_no_recycling_values_exist(self):
        """Test disposal registration when no recycling values configured."""
        # Delete all recycling values
        RecyclingValue.objects.all().delete()
        
        with self.assertRaises(ValueError) as context:
            EcopontoDisposalService.register_disposal(
                recycling_point_id=self.recycling_point.recycling_point_id,
                weight=2.5
            )
        
        self.assertIn("No recycling values configured in the system", str(context.exception))

    def test_disposal_database_persistence(self):
        """Test that disposal is correctly saved to database with proper attributes."""
        result = EcopontoDisposalService.register_disposal(
            recycling_point_id=self.recycling_point.recycling_point_id,
            weight=3.5
        )
        
        # Verify record exists in database
        disposal = Recycling.objects.get(recycling_id=result['recycling_id'])
        
        # Validate all key attributes
        self.assertIsNone(disposal.user_id)  # Should be NULL for ecoponto disposals
        self.assertEqual(disposal.recycling_point_id, self.recycling_point)
        self.assertEqual(disposal.weight, 3.5)
        self.assertEqual(disposal.points_value, 1750)  # 3.5 * 500
        self.assertEqual(disposal.validation_hash, result['validation_hash'])
        self.assertEqual(disposal.status, 'ACTIVE')
        self.assertIsNotNone(disposal.date)