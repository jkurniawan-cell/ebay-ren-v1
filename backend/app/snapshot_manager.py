"""
Snapshot manager for roadmap versioning and approval workflow.
"""
from datetime import datetime
from typing import Dict, List, Optional
from .database import get_session, RoadmapSnapshot, RoadmapDraft
from sqlalchemy import desc

class SnapshotManager:
    """Manage roadmap snapshots and draft versions."""

    @staticmethod
    def create_snapshot(planning_cycle: str, csv_data: Dict, approved_by: str = "Jordan") -> Dict:
        """
        Create a new approved snapshot from current draft.

        Args:
            planning_cycle: Planning cycle name (e.g., "H2 2026")
            csv_data: CSV data to snapshot
            approved_by: Who approved this snapshot

        Returns:
            Created snapshot info
        """
        session = get_session()

        try:
            # Get the next version number for this cycle
            existing_snapshots = session.query(RoadmapSnapshot).filter_by(
                planning_cycle=planning_cycle
            ).order_by(desc(RoadmapSnapshot.version)).all()

            next_version = 1
            if existing_snapshots:
                next_version = existing_snapshots[0].version + 1

            # Create snapshot
            snapshot = RoadmapSnapshot(
                planning_cycle=planning_cycle,
                version=next_version,
                approved_by=approved_by,
                approved_at=datetime.utcnow(),
                csv_data_json=csv_data
            )

            session.add(snapshot)
            session.commit()

            return {
                'id': snapshot.id,
                'planning_cycle': snapshot.planning_cycle,
                'version': snapshot.version,
                'approved_by': snapshot.approved_by,
                'approved_at': snapshot.approved_at.isoformat(),
                'total_launches': csv_data.get('total_count', 0)
            }

        finally:
            session.close()

    @staticmethod
    def get_all_snapshots() -> List[Dict]:
        """
        Get all approved snapshots, sorted by most recent first.

        Returns:
            List of snapshot metadata (without full CSV data)
        """
        session = get_session()

        try:
            snapshots = session.query(RoadmapSnapshot).order_by(
                desc(RoadmapSnapshot.approved_at)
            ).all()

            return [{
                'id': s.id,
                'planning_cycle': s.planning_cycle,
                'version': s.version,
                'approved_by': s.approved_by,
                'approved_at': s.approved_at.isoformat(),
                'total_launches': s.csv_data_json.get('total_count', 0) if s.csv_data_json else 0
            } for s in snapshots]

        finally:
            session.close()

    @staticmethod
    def get_snapshot_by_id(snapshot_id: int) -> Optional[Dict]:
        """
        Get a specific snapshot by ID, including full CSV data.

        Args:
            snapshot_id: Snapshot ID

        Returns:
            Snapshot data or None if not found
        """
        session = get_session()

        try:
            snapshot = session.query(RoadmapSnapshot).filter_by(id=snapshot_id).first()

            if not snapshot:
                return None

            return {
                'id': snapshot.id,
                'planning_cycle': snapshot.planning_cycle,
                'version': snapshot.version,
                'approved_by': snapshot.approved_by,
                'approved_at': snapshot.approved_at.isoformat(),
                'csv_data': snapshot.csv_data_json
            }

        finally:
            session.close()

    @staticmethod
    def save_draft(planning_cycle: str, csv_data: Dict, uploaded_by: str = "Team") -> Dict:
        """
        Save or update the current draft.

        Args:
            planning_cycle: Planning cycle name
            csv_data: CSV data
            uploaded_by: Who uploaded this draft

        Returns:
            Draft info
        """
        session = get_session()

        try:
            # Check if draft exists for this planning cycle
            draft = session.query(RoadmapDraft).filter_by(
                planning_cycle=planning_cycle
            ).first()

            if draft:
                # Update existing draft
                draft.csv_data_json = csv_data
                draft.last_uploaded_at = datetime.utcnow()
                draft.uploaded_by = uploaded_by
            else:
                # Create new draft
                draft = RoadmapDraft(
                    planning_cycle=planning_cycle,
                    csv_data_json=csv_data,
                    uploaded_by=uploaded_by
                )
                session.add(draft)

            session.commit()

            return {
                'id': draft.id,
                'planning_cycle': draft.planning_cycle,
                'last_uploaded_at': draft.last_uploaded_at.isoformat(),
                'uploaded_by': draft.uploaded_by,
                'total_launches': csv_data.get('total_count', 0)
            }

        finally:
            session.close()

    @staticmethod
    def get_draft(planning_cycle: str) -> Optional[Dict]:
        """
        Get the current draft for a planning cycle.

        Args:
            planning_cycle: Planning cycle name

        Returns:
            Draft data or None if not found
        """
        session = get_session()

        try:
            draft = session.query(RoadmapDraft).filter_by(
                planning_cycle=planning_cycle
            ).first()

            if not draft:
                return None

            return {
                'id': draft.id,
                'planning_cycle': draft.planning_cycle,
                'last_uploaded_at': draft.last_uploaded_at.isoformat(),
                'uploaded_by': draft.uploaded_by,
                'csv_data': draft.csv_data_json
            }

        finally:
            session.close()

    @staticmethod
    def get_all_drafts() -> List[Dict]:
        """
        Get all drafts.

        Returns:
            List of draft metadata
        """
        session = get_session()

        try:
            drafts = session.query(RoadmapDraft).order_by(
                desc(RoadmapDraft.last_uploaded_at)
            ).all()

            return [{
                'id': d.id,
                'planning_cycle': d.planning_cycle,
                'last_uploaded_at': d.last_uploaded_at.isoformat(),
                'uploaded_by': d.uploaded_by,
                'total_launches': d.csv_data_json.get('total_count', 0) if d.csv_data_json else 0
            } for d in drafts]

        finally:
            session.close()
