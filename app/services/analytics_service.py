from datetime import datetime
from sqlalchemy import func
from app.extensions import db
from app.models import Lead, Project, Quotation, Customer

class AnalyticsService:
    """Aggregates multi-dimensional analytics for the management console."""

    @classmethod
    def get_leads_analytics(cls):
        """Calculates status distribution, trends, conversion rates, and sources for Leads."""
        leads = Lead.query.filter(Lead.is_deleted == False).all()
        total_leads = len(leads)
        
        # 1. Leads by status
        status_counts = {"new": 0, "contacted": 0, "qualified": 0, "lost": 0}
        for lead in leads:
            if lead.status in status_counts:
                status_counts[lead.status] += 1
                
        # 2. Leads created per month
        monthly_map = {}
        for lead in leads:
            month_str = lead.created_at.strftime("%Y-%m")
            monthly_map[month_str] = monthly_map.get(month_str, 0) + 1
            
        leads_per_month = [{"month": m, "count": c} for m, c in sorted(monthly_map.items())]
        
        # 3. Conversion rate calculation
        qualified_count = status_counts["qualified"]
        conversion_rate = round((qualified_count / total_leads * 100), 2) if total_leads > 0 else 0.0
        
        # 4. Top lead sources
        source_map = {}
        for lead in leads:
            source = lead.source or "Website"
            source_map[source] = source_map.get(source, 0) + 1
            
        top_lead_sources = [{"source": s, "count": c} for s, c in sorted(source_map.items(), key=lambda x: x[1], reverse=True)]
        
        return {
            "total_leads": total_leads,
            "leads_by_status": status_counts,
            "leads_per_month": leads_per_month,
            "conversion_rate": conversion_rate,
            "top_lead_sources": top_lead_sources
        }

    @classmethod
    def get_projects_analytics(cls):
        """Calculates project status distributions, completions, deadlines, and delay indicators."""
        projects = Project.query.filter(Project.is_deleted == False).all()
        total_projects = len(projects)
        
        # 1. Project status distribution
        status_counts = {}
        for p in projects:
            status_counts[p.project_status] = status_counts.get(p.project_status, 0) + 1
            
        # 2. Average project completion %
        active_progress_sum = sum(p.progress_percentage for p in projects)
        average_project_completion = round(active_progress_sum / total_projects, 2) if total_projects > 0 else 0.0
        
        # 3. Upcoming completion deadlines (expected_completion >= today, status != Completed)
        today = datetime.utcnow().date()
        upcoming = []
        delayed = []
        
        for p in projects:
            if p.project_status == 'Completed':
                continue
            if p.expected_completion:
                if p.expected_completion >= today:
                    upcoming.append({
                        "id": p.id,
                        "customer_name": p.customer.user.name if p.customer and p.customer.user else "Unknown",
                        "project_status": p.project_status,
                        "progress_percentage": int(p.progress_percentage),
                        "expected_completion": p.expected_completion.isoformat()
                    })
                else:
                    delayed.append({
                        "id": p.id,
                        "customer_name": p.customer.user.name if p.customer and p.customer.user else "Unknown",
                        "project_status": p.project_status,
                        "progress_percentage": int(p.progress_percentage),
                        "expected_completion": p.expected_completion.isoformat()
                    })
                    
        # Sort upcoming by date ascending
        upcoming.sort(key=lambda x: x["expected_completion"])
        
        return {
            "total_projects": total_projects,
            "project_status_distribution": status_counts,
            "average_project_completion": average_project_completion,
            "upcoming_completion_deadlines": upcoming,
            "delayed_project_indicators": delayed,
            "delayed_count": len(delayed)
        }

    @classmethod
    def get_quotations_analytics(cls):
        """Calculates quotation totals, approvals distribution, trends, and revenue forecast."""
        quotations = Quotation.query.filter(Quotation.is_deleted == False).all()
        
        # 1. Total quotation value
        total_quotation_value = float(sum(q.total_amount for q in quotations))
        
        # 2. Monthly quotation generation trend
        monthly_map = {}
        for q in quotations:
            month_str = q.created_at.strftime("%Y-%m")
            if month_str not in monthly_map:
                monthly_map[month_str] = {"count": 0, "total_value": 0.0}
            monthly_map[month_str]["count"] += 1
            monthly_map[month_str]["total_value"] += float(q.total_amount)
            
        monthly_quotation_trend = [
            {
                "month": m,
                "count": data["count"],
                "total_value": round(data["total_value"], 2)
            } for m, data in sorted(monthly_map.items())
        ]
        
        # 3. Accepted vs rejected vs pending quotations
        accepted_count = sum(1 for q in quotations if q.status == 'accepted')
        rejected_count = sum(1 for q in quotations if q.status == 'rejected')
        pending_count = sum(1 for q in quotations if q.status == 'pending')
        
        # 4. Revenue forecast (Sum of remaining value for active projects based on total_amount * (1 - progress/100))
        active_projects = Project.query.filter(Project.is_deleted == False, Project.project_status != 'Completed').all()
        forecast_value = 0.0
        for p in active_projects:
            if p.quotation:
                remaining_factor = 1.0 - (float(p.progress_percentage) / 100.0)
                forecast_value += float(p.quotation.total_amount) * remaining_factor
                
        return {
            "total_quotation_value": round(total_quotation_value, 2),
            "monthly_quotation_trend": monthly_quotation_trend,
            "accepted_vs_rejected": {
                "accepted": accepted_count,
                "rejected": rejected_count,
                "pending": pending_count
            },
            "revenue_forecast": round(forecast_value, 2)
        }
        
    @classmethod
    def get_all_admin_analytics(cls):
        """Orchestrates comprehensive analytics results for the admin portal."""
        return {
            "leads": cls.get_leads_analytics(),
            "projects": cls.get_projects_analytics(),
            "quotations": cls.get_quotations_analytics()
        }
