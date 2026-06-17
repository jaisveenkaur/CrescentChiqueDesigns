import setup_paths
import uuid
from decimal import Decimal
from app.models import db, Design, DesignImage

def seed_designs():
    """Seeds portfolio design records and related sub-images.
    
    Returns:
        tuple: (design_scandi_id, design_industrial_id, design_luxury_id)
    """
    design_scandi_id = str(uuid.uuid4())
    design_scandi = Design(
        id=design_scandi_id,
        title="Minimalist Scandinavian Living Room",
        description="Clean linear designs, natural timber highlights, functional spacing, and neutral color palettes.",
        room_type="Living Room",
        style="Scandinavian",
        price_per_sqft=Decimal("250.00"),
        image_url="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800"
    )
    db.session.add(design_scandi)
    
    design_industrial_id = str(uuid.uuid4())
    design_industrial = Design(
        id=design_industrial_id,
        title="Industrial Loft Kitchen",
        description="Exposed brick wall accents, matte black cabinetry, industrial piping shelves, and polished concrete countertops.",
        room_type="Kitchen",
        style="Industrial",
        price_per_sqft=Decimal("320.00"),
        image_url="https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&q=80&w=800"
    )
    db.session.add(design_industrial)

    design_luxury_id = str(uuid.uuid4())
    design_luxury = Design(
        id=design_luxury_id,
        title="Modern Luxury Bedroom Suite",
        description="Plush velvet customized headboard panels, integrated cove lighting systems, and dynamic walk-in glass wardrobes.",
        room_type="Bedroom",
        style="Luxury",
        price_per_sqft=Decimal("450.00"),
        image_url="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=800"
    )
    db.session.add(design_luxury)
    db.session.flush()

    # Sub-images mapping both Unsplash and local assets
    img_scandi_1 = DesignImage(
        id=str(uuid.uuid4()),
        design_id=design_scandi_id,
        image_url="/images/image.png",
        is_primary=False
    )
    img_scandi_2 = DesignImage(
        id=str(uuid.uuid4()),
        design_id=design_scandi_id,
        image_url="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800",
        is_primary=True
    )
    img_industrial_1 = DesignImage(
        id=str(uuid.uuid4()),
        design_id=design_industrial_id,
        image_url="https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&q=80&w=800",
        is_primary=True
    )
    img_industrial_2 = DesignImage(
        id=str(uuid.uuid4()),
        design_id=design_industrial_id,
        image_url="/images/image copy.png",
        is_primary=False
    )
    img_luxury_1 = DesignImage(
        id=str(uuid.uuid4()),
        design_id=design_luxury_id,
        image_url="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=800",
        is_primary=True
    )
    img_luxury_2 = DesignImage(
        id=str(uuid.uuid4()),
        design_id=design_luxury_id,
        image_url="/images/image copy 2.png",
        is_primary=False
    )
    db.session.add_all([
        img_scandi_1, 
        img_scandi_2, 
        img_industrial_1, 
        img_industrial_2, 
        img_luxury_1, 
        img_luxury_2
    ])
    db.session.flush()
    
    return design_scandi_id, design_industrial_id, design_luxury_id
