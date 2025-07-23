WITH
registrations_2024 AS (
    SELECT
        s.er_id,
        s.aesl_roll_no__c,
        s.aesl_first_name__c,
        s.aesl_last_name__c,
        s.business_unit,
        s.branch_name,
        s.registration_date,
        s.class_studying,
        p.paper AS paper_type,
        TRUE AS is_scheduled
    FROM (
        SELECT
            id AS er_id,
            aesl_roll_no__c,
            aesl_first_name__c,
            aesl_last_name__c,
            (CASE WHEN TRIM(LOWER(aesl_branch_code__c)) IN ('', 'null') THEN NULL ELSE CONCAT(SUBSTRING(aesl_branch_code__c, 4, 2), SUBSTRING(aesl_branch_code__c, 1, 3)) END) AS business_unit,
            (CASE WHEN TRIM(LOWER(aesl_f_branch_name__c)) IN ('', 'null') THEN NULL ELSE aesl_f_branch_name__c END) AS branch_name,
            DATE_ADD('minute', 330, DATE_PARSE(SUBSTRING(createddate, 1, 19), '%Y-%m-%dT%T')) AS registration_date,
            (CASE WHEN TRIM(LOWER(aesl_class_studying__c)) IN ('', 'null') THEN NULL ELSE aesl_class_studying__c END) AS class_studying
        FROM (
            SELECT *, ROW_NUMBER() OVER (PARTITION BY id ORDER BY lastmodifieddate DESC) AS rnum
            FROM salesforceanalytics.exam_registration
            WHERE
                partition_0 >= '2024' 
                AND SUBSTRING(createddate,1,4) = '2024'
                AND aesl_lead_type__c = 'MOCK-JEE'
                AND aesl_roll_no__c IS NOT NULL AND trim(lower(aesl_roll_no__c)) NOT IN ('','null')
                AND aesl_original_exam_date__c IS NOT NULL AND trim(lower(aesl_original_exam_date__c)) NOT IN ('','null')
        )
        WHERE rnum = 1 AND TRIM(isdeleted) <> 'true'
    ) AS s
    CROSS JOIN (VALUES ('paper-1'), ('paper-2')) AS p(paper)
),
registrations_2025 AS (
    SELECT
        r.er_id,
        r.aesl_roll_no__c,
        r.aesl_first_name__c,
        r.aesl_last_name__c,
        r.business_unit,
        r.branch_name,
        r.registration_date,
        r.class_studying,
        t.test_type AS paper_type,
        CASE
            WHEN t.test_type = 'JEE Main' AND r.registration_date > TIMESTAMP '2025-07-21 09:00:00' THEN FALSE
            ELSE TRUE
        END AS is_scheduled
    FROM (
        SELECT
            id AS er_id,
            aesl_roll_no__c,
            aesl_first_name__c,
            aesl_last_name__c,
            (CASE WHEN TRIM(LOWER(aesl_branch_code__c)) IN ('', 'null') THEN NULL ELSE CONCAT(SUBSTRING(aesl_branch_code__c, 4, 2), SUBSTRING(aesl_branch_code__c, 1, 3)) END) AS business_unit,
            (CASE WHEN TRIM(LOWER(aesl_f_branch_name__c)) IN ('', 'null') THEN NULL ELSE aesl_f_branch_name__c END) AS branch_name,
            DATE_ADD('minute', 330, DATE_PARSE(SUBSTRING(createddate, 1, 19), '%Y-%m-%dT%T')) AS registration_date,
            (CASE WHEN TRIM(LOWER(aesl_class_studying__c)) IN ('', 'null') THEN NULL ELSE aesl_class_studying__c END) AS class_studying
        FROM (
            SELECT *, ROW_NUMBER() OVER (PARTITION BY id ORDER BY lastmodifieddate DESC) AS rnum
            FROM salesforceanalytics.exam_registration
            WHERE partition_0 >= '2025'
            AND SUBSTRING(createddate,1,4) = '2025'
              AND aesl_lead_type__c = 'MOCK-JEE'
              AND aesl_roll_no__c IS NOT NULL AND trim(lower(aesl_roll_no__c)) NOT IN ('','null')
        )
        WHERE rnum = 1 AND TRIM(isdeleted) <> 'true'
    ) AS r
    CROSS JOIN (VALUES ('JEE Main'), ('JEE Advanced Paper 1'), ('JEE Advanced Paper 2')) AS t(test_type)
),
all_registrations AS (
    SELECT * FROM registrations_2024
    UNION ALL
    SELECT * FROM registrations_2025
),

test_attempts AS (
    SELECT
        *,
        CASE
            WHEN test_id IN ('M1205FTOG2RT0101', 'M1905FTOG2RT0201') THEN 'paper-1'
            WHEN test_id IN ('M1205FTOG2RT0102', 'M1905FTOG2RT0202') THEN 'paper-2'
            WHEN test_id IN ('INVICTUS2007MAIN01', 'INVICTUS2007MAIN02') THEN 'JEE Main'
            WHEN test_id IN ('INVICTUS2707ADV001', 'INVICTUS2707ADV101') THEN 'JEE Advanced Paper 1'
            WHEN test_id IN ('INVICTUS2707ADV002', 'INVICTUS2707ADV102') THEN 'JEE Advanced Paper 2'
            ELSE 'NA'
        END AS paper_type
    FROM testplayer.test_attempt_combined_including_missed_including_non_myaakash_vw
    WHERE test_id IN (
        -- 2024 tests
        'M1205FTOG2RT0101', 'M1905FTOG2RT0201', 'M1205FTOG2RT0102', 'M1905FTOG2RT0202',
        -- 2025 tests
        'INVICTUS2007MAIN01', 'INVICTUS2007MAIN02', 'INVICTUS2707ADV001', 'INVICTUS2707ADV101',
        'INVICTUS2707ADV002', 'INVICTUS2707ADV102'
    )
)
SELECT
    s.aesl_roll_no__c AS rollnumber,
    s.er_id,
    s.registration_date,
    s.aesl_first_name__c AS first_name,
    s.aesl_last_name__c AS last_name,
    s.class_studying,
    s.business_unit,
    s.branch_name,
    s.paper_type,
    s.is_scheduled,
    r.platform,
    r.attempt_number,
    r.is_latest_live_attempt,
    r.state,
    r.status,
    r.ex_start_time,
    r.ex_end_time,
    r.physics,
    r.mathematics,
    r.chemistry,
    r.max_marks,
    r.total_score,
    r.created_at,
    r.rank
FROM all_registrations AS s
LEFT JOIN test_attempts AS r
    ON s.aesl_roll_no__c = r.psid AND s.paper_type = r.paper_type
