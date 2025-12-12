# คู่มือการติดตั้งและใช้งานระบบบันทึกกิจกรรมพนักงานกับ Supabase

## ขั้นตอนที่ 1: สร้างโปรเจคใน Supabase

1. เข้าไปที่เว็บไซต์ [Supabase](https://supabase.com)
2. ล็อกอินหรือสมัครบัญชีใหม่
3. คลิก "New Project"
4. เลือก organization ของคุณ
5. ตั้งชื่อโปรเจค (เช่น: employee-activity-tracker)
6. เลือกฐานข้อมูลและรหัสผ่าน
7. คลิก "Create new project"

## ขั้นตอนที่ 2: สร้างตารางในฐานข้อมูล

1. ในหน้า Dashboard ของโปรเจค คลิก "SQL Editor"
2. คลิก "New query"
3. คัดลอกโค้ดจากไฟล์ `supabase_setup.sql` และวางลงใน editor
4. คลิก "Run" เพื่อสร้างตารางและข้อมูลตัวอย่าง

## ขั้นตอนที่ 3: ดึงข้อมูลการเชื่อมต่อ

1. ในหน้า Dashboard คลิก "Project Settings"
2. คลิก "API"
3. คัดลอก "Project URL" (จะอยู่ในรูปแบบ: https://your-project-id.supabase.co)
4. คัดลอก "anon public" API key

## ขั้นตอนที่ 4: แก้ไขไฟล์ HTML

### สำหรับไฟล์ index.html:
1. เปิดไฟล์ `read_index.html`
2. หาบรรทัด:
   ```javascript
   const supabaseUrl = 'https://your-project-id.supabase.co';
   const supabaseKey = 'your-supabase-anon-key-here';
   ```
3. แทนที่ค่าด้วยข้อมูลจากขั้นตอนที่ 3

### สำหรับไฟล์ batch.html:
1. เปิดไฟล์ `read_batch.html`
2. หาบรรทัดเดิมกับ index.html และแทนที่ค่าเดียวกัน

## ขั้นตอนที่ 5: ใช้งานระบบ

### การบันทึกข้อมูลรายบุคคล (index.html):
1. เปิดไฟล์ `read_index.html` ในเบราว์เซอร์
2. กรอกข้อมูลพนักงาน:
   - ชื่อพนักงาน
   - รหัสพนักงาน
   - แผนก
   - วันที่ทำกิจกรรม
   - ประเภทกิจกรรม
   - รายละเอียดกิจกรรม
   - สถานะ (ปกติ/ไม่ปกติ)
   - ระยะเวลา (ชั่วโมง)
3. คลิก "บันทึกข้อมูล"

### การอัปโหลดแบบกลุ่ม (batch.html):
1. เปิดไฟล์ `read_batch.html` ในเบราว์เซอร์
2. เตรียมข้อมูลในรูปแบบ CSV:
   ```csv
   employee_name,employee_id,department,activity_date,activity_type,activity_description,status,duration
   สมชาย ใจดี,EMP001,IT,2024-01-15,meeting,ประชุมโปรเจคใหม่,normal,2
   สมศรี รักดี,EMP002,HR,2024-01-15,training,อบรมทักษะการสื่อสาร,normal,4
   ```
3. วางข้อมูลในช่องวางข้อมูล CSV
4. คลิก "อัปโหลดข้อมูล"

## รูปแบบข้อมูลที่รองรับ

### ประเภทกิจกรรม (activity_type):
- `meeting` - ประชุม
- `training` - การอบรม
- `project` - โปรเจค
- `break` - พักผ่อน
- `sick` - ลาป่วย
- `personal` - ลากิจส่วนตัว
- `overtime` - ทำงานล่วงเวลา
- `other` - อื่นๆ

### แผนก (department):
- `IT` - ไอที
- `HR` - ทรัพยากรบุคคล
- `Finance` - การเงิน
- `Marketing` - การตลาด
- `Operations` - ฝ่ายปฏิบัติการ
- `Sales` - ฝ่ายขาย

### สถานะ (status):
- `normal` - ปกติ
- `abnormal` - ไม่ปกติ

## การตรวจสอบข้อมูล

คุณสามารถตรวจสอบข้อมูลที่บันทึกได้โดย:
1. ในหน้า Supabase Dashboard คลิก "Table Editor"
2. เลือกตาราง `employee_activities`
3. ดูข้อมูลทั้งหมดที่ถูกบันทึก

หรือใช้ SQL Query เพื่อดูสถิติ:
```sql
-- ดูข้อมูลสถิติพนักงานทั้งหมด
SELECT * FROM employee_stats;

-- ดูกิจกรรมที่ไม่ปกติในสัปดาห์นี้
SELECT * FROM employee_activities 
WHERE status = 'abnormal' 
AND activity_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY activity_date DESC;
```

## การแก้ไขปัญหา

### ปัญหาที่พบบ่อย:
1. **CORS Error**: ตรวจสอบว่าได้ตั้งค่า CORS ใน Supabase แล้ว
2. **API Key Error**: ตรวจสอบว่าใช้ API key ที่ถูกต้อง (anon key)
3. **Connection Error**: ตรวจสอบว่า URL ของโปรเจคถูกต้อง
4. **Table Not Found**: ตรวจสอบว่าได้รัน SQL script เพื่อสร้างตารางแล้ว

### วิธีแก้ไข:
1. เปิด Console ในเบราว์เซอร์เพื่อดู error message
2. ตรวจสอบค่าที่ตั้งค่าในไฟล์ HTML
3. ตรวจสอบว่าตารางถูกสร้างใน Supabase แล้ว
4. ตรวจสอบสิทธิ์การเข้าถึง (RLS policies)