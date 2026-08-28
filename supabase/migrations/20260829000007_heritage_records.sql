CREATE TYPE public.heritage_record_kind AS ENUM ('obituary', 'achiever', 'evangelist', 'committee');

CREATE TABLE public.heritage_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind public.heritage_record_kind NOT NULL,
  name text NOT NULL,
  branch text NOT NULL DEFAULT 'Pullazhiyil',
  title text,
  description text,
  image_url text,
  year_label text,
  birth_year text,
  death_year text,
  tribute text,
  location text,
  is_placeholder boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.heritage_records ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.can_manage_heritage_records()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND role IN ('admin', 'secretary')
  );
$$;

REVOKE ALL ON FUNCTION public.can_manage_heritage_records() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_manage_heritage_records() TO authenticated;

GRANT SELECT ON public.heritage_records TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.heritage_records TO authenticated;

CREATE POLICY "heritage_records_public_read" ON public.heritage_records
  FOR SELECT TO anon, authenticated USING (is_published OR (select public.can_manage_heritage_records()));
CREATE POLICY "heritage_records_staff_insert" ON public.heritage_records
  FOR INSERT TO authenticated WITH CHECK ((select public.can_manage_heritage_records()));
CREATE POLICY "heritage_records_staff_update" ON public.heritage_records
  FOR UPDATE TO authenticated USING ((select public.can_manage_heritage_records())) WITH CHECK ((select public.can_manage_heritage_records()));
CREATE POLICY "heritage_records_staff_delete" ON public.heritage_records
  FOR DELETE TO authenticated USING ((select public.can_manage_heritage_records()));

CREATE INDEX heritage_records_public_index ON public.heritage_records (kind, is_published, sort_order, created_at);

INSERT INTO public.heritage_records (kind, name, branch, title, description, image_url, year_label, birth_year, death_year, tribute, location, is_placeholder, sort_order) VALUES
('achiever','Lt. Cdr Kuriakose Mathew (Aniyan)','Thanuvelil','First Commissioned Officer of Indian Navy','First Commissioned Officer of Indian Navy from Thanuvelil family. Participated in 1971 Indo-Pak war on board Aircraft Carrier INS VIKRANT.','/achv/Lt. Cdr Kuriakose Mathew(Aniyan). .jpeg','1971',NULL,NULL,NULL,NULL,false,10),
('achiever','TC Thomas Thykurinjiyil-Thoppil','Thykurinjiyil','Trustee - Knanaya Samudayam','Served as the Trustee of the Knanaya Samudayam, bringing distinction and honor to the Thykurinjiyil-Thoppil branch.','/achv/TC Thomas.jpeg','Honored',NULL,NULL,NULL,NULL,false,20),
('achiever','Siby Mathew Thanuvelil','Thanuvelil','Director at AbbVie & IIM Alumnus','An IIM Alumni. Now Director of a USA based MNC Abbvie. S/o Lt. Cdr. Kuriakose Mathew.','/achv/Siby Mathew Thanuvelil. An IIM Alumni.jpeg','Present',NULL,NULL,NULL,NULL,false,30),
('achiever','Dr. Susan Thomas, Thyparampil','Thyparampil','Ph.D. in Photonics','Awarded a Ph.D. in Photonics from the Indian Institute of Technology (IIT) Madras.','/achv/Dr.Susan Thomas,Thyparampil.jpeg','Honored',NULL,NULL,NULL,NULL,false,40),
('achiever','T. K. Kurian & Molikutty Kurian','Knanaya Samudhayam','Evangelists of the Knanaya Samudhayam','Ordained as Evangelists of the Knanaya Samudhayam, in recognition of their life of faith and service.','/achv/T. K. Kurian and Molikutty Kurian.jpeg','Ordained',NULL,NULL,NULL,NULL,false,50),
('evangelist','T. T. Thomas Thanuvelil','Thanuvelil','Centre Pastor, IPC Pampakuda Centre','Serving as Centre Pastor at IPC Pampakuda Centre.','/Evangilist/TT Thomas Thanuvelil.jpeg','Present',NULL,NULL,NULL,NULL,false,10),
('evangelist','Fr. Thomas Pullazhiyil','Pullazhiyil','Pioneer Missionary Priest','Dedicated decades of priestly service across Kerala and abroad, establishing missions and spreading the Gospel rooted in the Knanaya tradition.',NULL,'1965',NULL,NULL,NULL,NULL,false,20),
('evangelist','Sr. Mary Thykurinjiyil','Thykurinjiyil','Religious Sister & Educator','Founded a charitable school for underprivileged children in rural Kerala, serving as principal for over 30 years and inspiring generations of students.',NULL,'1978',NULL,NULL,NULL,NULL,false,30),
('evangelist','Deacon Jose Thanuvelil','Thanuvelil','Ordained Deacon & Community Servant','Faithfully served the parish community as an ordained deacon, leading family prayer movements and charitable outreach across the diocese.',NULL,'2005',NULL,NULL,NULL,NULL,false,40),
('obituary','Jacob Kurian','Pullazhiyil',NULL,'A cherished patriarch of the Pullazhiyil branch. Known for his unwavering kindness, wisdom, and leadership within the Kudumbayogam.','/obituary/JacobKurian.jpeg',NULL,'1942','2023','You will always remain in our hearts and prayers. Rest in peace.',NULL,false,10),
('obituary','T. I. Joseph','Thanuvelil',NULL,'A respected elder of the Thanuvelil branch. Remembered for his steadfast faith, guidance, and contributions to our family legacy.','/obituary/T I Joseph.jpeg',NULL,'1939','2022','Your memory is a guiding light for all of us. Rest in peace.',NULL,false,20),
('obituary','Kuriakose Thykurinjiyil','Thykurinjiyil',NULL,'Remembered with love and gratitude by the Pullazhiyil Kudumbayogam family.','/obituary/Kuriakose Thykurinjiyil.jpeg',NULL,NULL,NULL,'May his memory remain a blessing to all who knew him.',NULL,false,30),
('obituary','Remembrance Record','Thykurinjiyil',NULL,'Remembrance profile pending. Family members from this branch are encouraged to share photographs and biographical details.',NULL,NULL,NULL,NULL,'Submit records to the Kudumbayogam committee.',NULL,true,40),
('obituary','Remembrance Record','Poovathumparambil',NULL,'Remembrance profile pending. Family members from this branch are encouraged to share photographs and biographical details.',NULL,NULL,NULL,NULL,'Submit records to the Kudumbayogam committee.',NULL,true,50),
('committee','Joemon Thomas Thanuvelil','Thanuvelil','President',NULL,'/members/Joemon Thomas Thanuvelil.jpeg',NULL,NULL,NULL,NULL,'Kerala',false,10),
('committee','Lt. Cdr Kuriakose Mathew (Aniyan) Thanuvelil','Thanuvelil','Treasurer',NULL,'/achv/Lt. Cdr Kuriakose Mathew(Aniyan). .jpeg',NULL,NULL,NULL,NULL,'Kerala',false,20),
('committee','Moncy Abraham Thanuvelil Madathil','Thanuvelil','Committee Member',NULL,'/members/Moncy Abraham,Thanuvelil-Madathil.jpeg',NULL,NULL,NULL,NULL,'Kerala',false,30),
('committee','Bino Abraham Thykurinjiyil Thoppil','Thykurinjiyil','Committee Member',NULL,'/members/Bino Abraham ,Thykurinjiyil Thoppil.jpeg',NULL,NULL,NULL,NULL,'Kerala',false,40);
