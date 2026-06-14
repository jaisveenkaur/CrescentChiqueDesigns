from decimal import Decimal
from app.models import Design, Quotation

class QuotationService:
    """Calculates interior design costs based on area size, material grades, and design packages."""
    
    MATERIAL_RATES = {
        'Economy': Decimal('1000.00'),
        'Premium': Decimal('1500.00'),
        'Luxury': Decimal('2500.00')
    }
    
    @classmethod
    def validate_pagination(cls, page_param, per_page_param):
        """Validates pagination parameters.
        
        Returns validated integers (page, per_page).
        Raises ValueError if validation fails.
        """
        try:
            page = int(page_param) if page_param is not None else 1
        except (ValueError, TypeError):
            raise ValueError("page parameter must be a valid integer")
        if page < 1:
            raise ValueError("page parameter must be at least 1")

        try:
            per_page = int(per_page_param) if per_page_param is not None else 10
        except (ValueError, TypeError):
            raise ValueError("per_page parameter must be a valid integer")
        if per_page < 1:
            raise ValueError("per_page parameter must be at least 1")
        if per_page > 100:
            raise ValueError("per_page parameter cannot exceed 100")

        return page, per_page

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

    @classmethod
    def search_quotations(cls, user_role, customer_id, filters, page_param, per_page_param):
        """Applies filters, checks role boundaries, and paginates Quotation queries.
        
        Returns a dictionary mapping paginated results.
        Raises ValueError if validation fails.
        """
        page, per_page = cls.validate_pagination(page_param, per_page_param)
        
        query = Quotation.query.filter(Quotation.is_deleted == False)
        
        # Access control checks
        if user_role == 'admin':
            pass
        elif user_role == 'customer':
            query = query.filter(Quotation.customer_id == customer_id)
        else:
            raise ValueError("Unauthorized role access")
            
        # Apply filters
        material_grade = filters.get('material_grade')
        if material_grade:
            query = query.filter(Quotation.material_grade == material_grade)
            
        min_amount = filters.get('min_amount')
        if min_amount is not None:
            try:
                min_amt = Decimal(str(min_amount))
                if min_amt < 0:
                    raise ValueError("min_amount must be a positive number")
            except (ValueError, TypeError):
                raise ValueError("min_amount must be a valid number")
            query = query.filter(Quotation.total_amount >= min_amt)
            
        max_amount = filters.get('max_amount')
        if max_amount is not None:
            try:
                max_amt = Decimal(str(max_amount))
                if max_amt < 0:
                    raise ValueError("max_amount must be a positive number")
            except (ValueError, TypeError):
                raise ValueError("max_amount must be a valid number")
            query = query.filter(Quotation.total_amount <= max_amt)
            
        # Execute paginated query
        total = query.count()
        offset = (page - 1) * per_page
        items = query.order_by(Quotation.created_at.desc()).offset(offset).limit(per_page).all()
        pages = (total + per_page - 1) // per_page if total > 0 else 0
        
        return {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": pages,
            "items": items
        }
