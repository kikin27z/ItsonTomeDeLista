"""
Rename DB column `class_sesion_id` -> `class_session_id` if it exists.
This migration uses safe SQL that checks the information_schema before renaming.
"""
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("attendance", "0002_alter_attendancerecord_registration_datetime"),
    ]

    operations = [
        migrations.RunSQL(
            sql=r"""
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='attendance_attendancerecord' AND column_name='class_sesion_id') THEN
    ALTER TABLE attendance_attendancerecord RENAME COLUMN class_sesion_id TO class_session_id;
  END IF;
END
$$;
""",
            reverse_sql=r"""
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='attendance_attendancerecord' AND column_name='class_session_id') THEN
    ALTER TABLE attendance_attendancerecord RENAME COLUMN class_session_id TO class_sesion_id;
  END IF;
END
$$;
""",
        )
    ]