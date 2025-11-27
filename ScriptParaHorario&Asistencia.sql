-- =================================================================
-- SCRIPT DE GENERACIÓN DE HORARIO Y ASISTENCIA (3 MESES)
-- =================================================================
-- OBJETIVO:
-- 1. Crear 1 Horario (Schedule) para "Métodos Ágiles" (ISW-704)
--    asignado al profesor "Christian Gibrán" (00000999911).
-- 2. Inscribir a los 11 alumnos (del array) en ese horario.
-- 3. Generar 3 meses de asistencia para todos esos alumnos.
--
-- PRE-REQUISITOS (¡MUY IMPORTANTE!):
-- 1. El Profesor (unique_id='00000999911') YA DEBE EXISTIR.
-- 2. Los 11 Alumnos (del array) YA DEBEN EXISTIR.
-- 3. El Curso (key_name='ISW-704') YA DEBE EXISTIR.
-- =================================================================

DO $$
DECLARE
    -- --- IDs a buscar (basado en tus datos) ---
    v_prof_unique_id text := '00000999911';
    v_course_key_name text := 'ISW-704';
    
    -- --- IDs que se encontrarán/crearán ---
    v_prof_profile_id bigint;
    v_target_course_id bigint;
    v_target_schedule_id bigint;
    
    -- --- Listas de IDs de Alumnos (a buscar) ---
    v_student_unique_ids text[] := ARRAY[
        '00000245138', '00000247164', '00000244821', '00000247336', 
        '00000247398', '00000247383', '00000247571', '00000246904', 
        '00000245641', '0000024699',  '00000245244'
    ];
    v_student_profile_ids bigint[];
    v_profile_id bigint;

    -- --- Variables de Asistencia ---
    v_start_date date := '2025-08-18'; 
    v_end_date date := '2025-12-04';   
    v_current_date date;
    v_day_of_week int;
    v_session_id bigint;
    v_rand float;
    v_status text;
    v_class_time time := '08:00:00'; 

BEGIN
    RAISE NOTICE '--- Iniciando script de Horario y Asistencia ---';

    -- =================================================================
    -- PASO 1: OBTENER IDs DE DATOS PRE-EXISTENTES
    -- =================================================================
    RAISE NOTICE 'Buscando IDs del Profesor y Curso...';

    SELECT id INTO v_prof_profile_id
    FROM public.users_profile
    WHERE unique_id = v_prof_unique_id AND user_type = 'TEACHER';
    
    IF v_prof_profile_id IS NULL THEN
        RAISE EXCEPTION 'ERROR: El profesor con unique_id % no fue encontrado. (Asegúrate de crearlo primero)', v_prof_unique_id;
    END IF;

    SELECT id INTO v_target_course_id
    FROM public.academic_course
    WHERE key_name = v_course_key_name;
    
    IF v_target_course_id IS NULL THEN
        RAISE EXCEPTION 'ERROR: El curso con key_name % no fue encontrado. (Asegúrate de crearlo primero)', v_course_key_name;
    END IF;
    
    RAISE NOTICE 'Profesor (ID: %) y Curso (ID: %) encontrados.', v_prof_profile_id, v_target_course_id;

    -- =================================================================
    -- PASO 2: LIMPIAR DATOS ANTIGUOS (para ser re-ejecutable)
    -- =================================================================
    RAISE NOTICE 'Limpiando registros antiguos de asistencia para este horario...';
    
    -- Borrar en orden para evitar conflictos de llaves foráneas
    DELETE FROM public.attendance_attendancerecord
    WHERE class_session_id IN (
        SELECT id FROM public.attendance_classsession WHERE schedule_id IN (
            SELECT id FROM public.academic_schedule WHERE course_id = v_target_course_id AND teacher_id = v_prof_profile_id
        )
    );

    DELETE FROM public.attendance_classsession
    WHERE schedule_id IN (
        SELECT id FROM public.academic_schedule WHERE course_id = v_target_course_id AND teacher_id = v_prof_profile_id
    );

    DELETE FROM public.academic_enrollment
    WHERE schedule_id IN (
        SELECT id FROM public.academic_schedule WHERE course_id = v_target_course_id AND teacher_id = v_prof_profile_id
    );
    
    DELETE FROM public.academic_schedule
    WHERE course_id = v_target_course_id AND teacher_id = v_prof_profile_id;
    
    RAISE NOTICE 'Datos antiguos limpiados.';

    -- =================================================================
    -- PASO 3: CREAR EL HORARIO (Schedule)
    -- =================================================================
    RAISE NOTICE 'Creando Horario para Métodos Ágiles...';
    
    INSERT INTO public.academic_schedule 
        (course_id, teacher_id, start_time, end_time, classroom, days_of_week, end_date, start_date)
    VALUES
        (v_target_course_id, v_prof_profile_id, '08:00:00', '09:00:00', 'HV-4101', 'L,M,W,J,V', '2025-12-05', '2025-08-18')
    RETURNING id INTO v_target_schedule_id;

    -- =================================================================
    -- PASO 4: INSCRIBIR ALUMNOS AL HORARIO
    -- =================================================================
    RAISE NOTICE 'Inscribiendo a los 11 alumnos al horario (id=%)...', v_target_schedule_id;
    
    -- Obtener los IDs de perfil (PKs) de los 11 alumnos
    SELECT ARRAY_AGG(id) INTO v_student_profile_ids
    FROM public.users_profile
    WHERE unique_id = ANY(v_student_unique_ids) AND user_type = 'STUDENT';
    
    IF array_length(v_student_profile_ids, 1) != 11 THEN
        RAISE WARNING 'ADVERTENCIA: Se esperaban 11 alumnos pero solo se encontraron % en la BD. (Asegúrate de crearlos primero)', array_length(v_student_profile_ids, 1);
    END IF;
    
    FOREACH v_profile_id IN ARRAY v_student_profile_ids
    LOOP
        INSERT INTO public.academic_enrollment (student_id, schedule_id, status)
        VALUES (v_profile_id, v_target_schedule_id, 'ACTIVE');
    END LOOP;
    
    RAISE NOTICE 'Alumnos inscritos.';

    -- =================================================================
    -- PASO 5: GENERAR SESIONES Y REGISTROS DE ASISTENCIA
    -- =================================================================
    RAISE NOTICE 'Generando 3 meses de asistencia (de % a %)...', v_start_date, v_end_date;
    
    v_current_date := v_start_date;
    LOOP
        EXIT WHEN v_current_date > v_end_date;
        v_day_of_week := EXTRACT(DOW FROM v_current_date);
        
        -- Solo crear sesiones si es Lunes (1) a Viernes (5)
        IF v_day_of_week BETWEEN 1 AND 5 THEN
        
            INSERT INTO public.attendance_classsession
                (schedule_id, actual_start_time, status, attendance_code)
            VALUES
                (v_target_schedule_id, v_current_date + v_class_time, 'CLOSED', 'SCRIPT_GEN_' || v_current_date::text)
            RETURNING id INTO v_session_id;
            
            -- Crea un registro de asistencia para cada alumno
            FOREACH v_profile_id IN ARRAY v_student_profile_ids
            LOOP
                v_rand := random();
                IF v_rand < 0.75 THEN
                    v_status := 'PRESENT'; 
                ELSIF v_rand < 0.85 THEN
                    v_status := 'LATE';     
                ELSIF v_rand < 0.95 THEN
                    v_status := 'ABSENT';   
                ELSE
                    v_status := 'JUSTIFIED';
                END IF;
                
                INSERT INTO public.attendance_attendancerecord
                    (student_id, class_session_id, status, registration_datetime)
                VALUES
                    (v_profile_id, v_session_id, v_status, v_current_date + v_class_time + (random() * interval '5 minutes'));
            
            END LOOP; 
        
        END IF; 
        
        v_current_date := v_current_date + interval '1 day';
    END LOOP; 

    RAISE NOTICE '--- Script completado. % alumnos tienen 3 meses de asistencia. ---', array_length(v_student_profile_ids, 1);

END $$;