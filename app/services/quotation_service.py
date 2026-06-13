from decimal import Decimal
from app.models import Design

class QuotationService:
    """Calculates interior design costs based on area size, material grades, and design packages."""
    
    MATERIAL_RATES = {
        'Economy': Decimal('1000.00'),
        'Premium': Decimal('1500.00'),
        'Luxury': Decimal('2500.00')
    }
    
    @classmethod
    def calculate_costs(cls, design_id, area_sqft, material_grade):
        """Calculates material, labour, design, tax, and total cost.
        
        Returns a dictionary containing calculated costs as Decimals.
        Raises ValueError if validation fails.
        """
        # 1. Validation check for positive area size
        try:
            area = Decimal(str(area_sqft))
        except (ValueError, TypeError):
            raise ValueError("area_sqft must be a valid number")
            
        if area <= 0:
            raise ValueError("area_sqft must be a positive number")
            
        # 2. Validation check for material grade
        if material_grade not in cls.MATERIAL_RATES:
            raise ValueError(f"Invalid material_grade. Must be one of: {list(cls.MATERIAL_RATES.keys())}")
            
        # 3. Validation check that design portfolio entry exists
        design = Design.query.filter_by(id=design_id, is_deleted=False).first()
        if not design:
            raise ValueError("Design portfolio entry not found")
            
        material_rate = cls.MATERIAL_RATES[material_grade]
        
        # Cost engine formulas
        material_cost = area * material_rate
        labour_cost = material_cost * Decimal('0.30')
        design_cost = area * design.price_per_sqft
        
        subtotal = material_cost + labour_cost + design_cost
        tax_amount = subtotal * Decimal('0.18')
        total_amount = subtotal + tax_amount
        
        return {
            "design_id": design_id,
            "area_sqft": area,
            "material_grade": material_grade,
            "material_cost": material_cost,
            "labour_cost": labour_cost,
            "design_cost": design_cost,
            "tax_amount": tax_amount,
            "total_amount": total_amount
        }
