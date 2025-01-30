BEGIN;

INSERT INTO public.users (id, email, metadata, created_at, updated_at) VALUES ('bb12933a-784a-4b7c-93d7-1daeb06d815f', 'agent@test.com', '{}'::jsonb, NOW(), NOW()) ON CONFLICT (id) DO NOTHING;

UPDATE public.tickets SET assigned_to = 'bb12933a-784a-4b7c-93d7-1daeb06d815f' WHERE id = '6fa809a1-8116-455f-82d5-7eb2b711e7cf';

SELECT COUNT(*), created_by FROM public.tickets GROUP BY created_by;

COMMIT;
