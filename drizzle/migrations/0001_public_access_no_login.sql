DO $$ DECLARE t text; BEGIN
FOREACH t IN ARRAY ARRAY['clients','client_events','payments','projects','services','tasks'] LOOP
  EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO anon', t);
  EXECUTE format('CREATE POLICY "public access" ON public.%I FOR ALL TO anon USING (true) WITH CHECK (true)', t);
END LOOP; END $$;
GRANT SELECT ON public.profiles TO anon;
CREATE POLICY "public reads profiles" ON public.profiles FOR SELECT TO anon USING (true);