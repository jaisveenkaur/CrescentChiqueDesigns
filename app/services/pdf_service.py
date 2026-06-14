import io
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

class PDFService:
    """Service class to handle styled PDF document generation using reportlab."""

    @classmethod
    def generate_quotation_pdf(cls, quotation):
        """Generates a premium PDF document for a quotation and returns a BytesIO buffer.
        
        Args:
            quotation (Quotation): The quotation record to render.
            
        Returns:
            BytesIO: Buffer containing the PDF binary.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=54,
            leftMargin=54,
            topMargin=54,
            bottomMargin=54
        )
        
        story = []
        styles = getSampleStyleSheet()
        
        # Define premium color palette
        primary_color = colors.HexColor("#1A252C") # Dark slate
        accent_color = colors.HexColor("#C5A880")  # Muted gold
        text_color = colors.HexColor("#333333")    # Charcoal
        bg_light = colors.HexColor("#F9F9FB")      # Soft white/grey
        
        # Custom styles
        title_style = ParagraphStyle(
            'CompanyTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=24,
            leading=28,
            textColor=primary_color,
            spaceAfter=4
        )
        
        subtitle_style = ParagraphStyle(
            'CompanySubtitle',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=10,
            leading=12,
            textColor=accent_color,
            spaceAfter=20
        )
        
        header_style = ParagraphStyle(
            'SectionHeader',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=14,
            leading=18,
            textColor=primary_color,
            spaceAfter=8,
            keepWithNext=True
        )
        
        label_style = ParagraphStyle(
            'FieldLabel',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=10,
            leading=12,
            textColor=primary_color
        )
        
        value_style = ParagraphStyle(
            'FieldValue',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=12,
            textColor=text_color
        )
        
        # 1. Header (Company Branding)
        story.append(Paragraph("CRESCENT CHIQUE DESIGNS", title_style))
        story.append(Paragraph("Premium Interior Architecture & Renovation Services", subtitle_style))
        story.append(Spacer(1, 15))
        
        # 2. Quotation Info & Customer Info (2-column layout)
        customer = quotation.customer
        user = customer.user
        design = quotation.design
        
        design_title = design.title if design else "Custom Design Portfolio"
        design_style = design.style if design else "N/A"
        
        info_data = [
            [Paragraph("Quotation Reference:", label_style), Paragraph(str(quotation.id), value_style),
             Paragraph("Client Name:", label_style), Paragraph(user.name, value_style)],
            [Paragraph("Date Issued:", label_style), Paragraph(quotation.created_at.strftime("%B %d, %Y"), value_style),
             Paragraph("Client Email:", label_style), Paragraph(user.email, value_style)],
            [Paragraph("Design Type:", label_style), Paragraph(design_title, value_style),
             Paragraph("Client Phone:", label_style), Paragraph(customer.phone, value_style)],
            [Paragraph("Design Style:", label_style), Paragraph(design_style, value_style),
             Paragraph("Client Address:", label_style), Paragraph(customer.address or "N/A", value_style)]
        ]
        
        info_table = Table(info_data, colWidths=[1.5*inch, 2.0*inch, 1.0*inch, 2.5*inch])
        info_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('TOPPADDING', (0,0), (-1,-1), 0),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ]))
        story.append(info_table)
        story.append(Spacer(1, 25))
        
        # 3. Cost Breakdown Section
        story.append(Paragraph("COST ESTIMATE BREAKDOWN", header_style))
        
        # Format currency helper
        def fmt(val):
            return f"INR {float(val):,.2f}"
            
        cost_headers = [
            Paragraph("<b>Line Item Description</b>", label_style),
            Paragraph("<b>Details / Metrics</b>", label_style),
            Paragraph("<b>Amount</b>", ParagraphStyle('RightLabel', parent=label_style, alignment=2))
        ]
        
        design_price_desc = f"Design fee per sqft: {fmt(design.price_per_sqft)}" if design else "Custom flat design fee"
        
        cost_rows = [
            [
                Paragraph("Project Area Size", value_style),
                Paragraph(f"{float(quotation.area_sqft):,.2f} sqft", value_style),
                Paragraph("—", ParagraphStyle('RightVal', parent=value_style, alignment=2))
            ],
            [
                Paragraph("Material Cost", value_style),
                Paragraph(f"Grade: {quotation.material_grade}", value_style),
                Paragraph(fmt(quotation.material_cost), ParagraphStyle('RightVal', parent=value_style, alignment=2))
            ],
            [
                Paragraph("Labour Cost", value_style),
                Paragraph("Sourcing, site prep & execution", value_style),
                Paragraph(fmt(quotation.labour_cost), ParagraphStyle('RightVal', parent=value_style, alignment=2))
            ],
            [
                Paragraph("Design Cost", value_style),
                Paragraph(design_price_desc, value_style),
                Paragraph(fmt(quotation.design_cost), ParagraphStyle('RightVal', parent=value_style, alignment=2))
            ],
            [
                Paragraph("Goods & Services Tax (GST)", value_style),
                Paragraph("18.00% Standard Rate", value_style),
                Paragraph(fmt(quotation.tax_amount), ParagraphStyle('RightVal', parent=value_style, alignment=2))
            ]
        ]
        
        total_row = [
            Paragraph("<b>GRAND TOTAL</b>", label_style),
            Paragraph("<b>Includes all taxes and design execution fees</b>", ParagraphStyle('Muted', parent=value_style, fontSize=8, textColor=colors.HexColor("#777777"))),
            Paragraph(f"<b>{fmt(quotation.total_amount)}</b>", ParagraphStyle('RightBold', parent=label_style, alignment=2, textColor=accent_color, fontSize=12))
        ]
        
        table_data = [cost_headers] + cost_rows + [total_row]
        cost_table = Table(table_data, colWidths=[2.5*inch, 2.5*inch, 2.0*inch])
        cost_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), bg_light),
            ('LINEBELOW', (0,0), (-1,0), 1, accent_color),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('LINEBELOW', (0,1), (-1,-3), 0.5, colors.HexColor("#E2E2E2")),
            ('LINEBELOW', (0,-2), (-1,-2), 1, primary_color),
            ('BACKGROUND', (0,-1), (-1,-1), bg_light),
            ('TOPPADDING', (0,-1), (-1,-1), 12),
            ('BOTTOMPADDING', (0,-1), (-1,-1), 12),
        ]))
        story.append(cost_table)
        story.append(Spacer(1, 35))
        
        # 4. Terms & Conditions
        terms_title_style = ParagraphStyle(
            'TermsTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=11,
            textColor=primary_color,
            spaceAfter=4
        )
        terms_text_style = ParagraphStyle(
            'TermsText',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8,
            leading=10,
            textColor=colors.HexColor("#666666")
        )
        story.append(Paragraph("Terms & Conditions:", terms_title_style))
        story.append(Paragraph("1. This quotation is valid for 30 days from the date of issue.", terms_text_style))
        story.append(Paragraph("2. All payments must be made in accordance with the project milestone schedule.", terms_text_style))
        story.append(Paragraph("3. Any changes to design styles or material grades post-acceptance will incur revised estimations.", terms_text_style))
        
        doc.build(story)
        buffer.seek(0)
        return buffer
