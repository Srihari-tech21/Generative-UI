import * as fs from 'fs';
import * as path from 'path';

const BASE_DIR = path.join(process.cwd(), 'public', 'datasets');

interface DatasetSpec {
  industry: string;
  filename: string;
  csvContent: string;
}

const DATASETS: DatasetSpec[] = [
  // -------------------------------------------------------------
  // 1. RESTAURANTS
  // -------------------------------------------------------------
  {
    industry: 'restaurants',
    filename: 'restaurant_sales.csv',
    csvContent: `item_id,item_name,category,price,quantity,total_revenue,order_date
ITM-101,Butter Chicken,Mains,18.50,142,2627.00,2025-02-01
ITM-102,Garlic Naan,Breads,4.00,380,1520.00,2025-02-01
ITM-103,Paneer Tikka,Starters,13.00,95,1235.00,2025-02-01
ITM-104,Chicken Biryani,Mains,16.50,210,3465.00,2025-02-02
ITM-105,Mango Lassi,Beverages,5.50,190,1045.00,2025-02-02
ITM-106,Dal Makhani,Mains,12.50,115,1437.50,2025-02-02
ITM-107,Samosa Platter,Starters,7.00,165,1155.00,2025-02-03
ITM-108,Gulab Jamun,Desserts,6.00,120,720.00,2025-02-03
ITM-109,Tandoori Roti,Breads,3.00,290,870.00,2025-02-03
ITM-110,Mutton Rogan Josh,Mains,21.00,88,1848.00,2025-02-04
ITM-111,Masala Chai,Beverages,3.50,225,787.50,2025-02-04
ITM-112,Palak Paneer,Mains,13.50,102,1377.00,2025-02-04
ITM-113,Gobi Manchurian,Starters,10.00,85,850.00,2025-02-05
ITM-114,Kulfi Falooda,Desserts,7.50,74,555.00,2025-02-05
ITM-115,Jeera Rice,Mains,5.00,140,700.00,2025-02-05`
  },
  {
    industry: 'restaurants',
    filename: 'restaurant_orders.csv',
    csvContent: `order_id,customer_name,order_type,table_number,items_count,subtotal,tax,total_amount,payment_mode,order_date
ORD-5001,Priya Sharma,Dine-in,Table 4,4,58.00,5.80,63.80,Credit Card,2025-02-01
ORD-5002,Rahul Mehta,Takeaway,Counter,2,24.00,2.40,26.40,UPI / Digital,2025-02-01
ORD-5003,Ananya Roy,Dine-in,Table 7,5,82.50,8.25,90.75,Credit Card,2025-02-01
ORD-5004,Vikram Das,Delivery,Online,3,41.00,4.10,45.10,Debit Card,2025-02-02
ORD-5005,Kavita Nair,Dine-in,Table 2,6,112.00,11.20,123.20,Cash,2025-02-02
ORD-5006,Siddharth Verma,Takeaway,Counter,3,34.50,3.45,37.95,UPI / Digital,2025-02-02
ORD-5007,Deepa Menon,Dine-in,Table 9,4,66.00,6.60,72.60,Credit Card,2025-02-03
ORD-5008,Amitabh Sen,Dine-in,Table 1,2,30.00,3.00,33.00,Cash,2025-02-03
ORD-5009,Neha Kapoor,Delivery,Online,5,78.00,7.80,85.80,UPI / Digital,2025-02-03
ORD-5010,Rohan Kulkarni,Dine-in,Table 5,3,48.50,4.85,53.35,Credit Card,2025-02-04
ORD-5011,Sunita Rao,Takeaway,Counter,4,52.00,5.20,57.20,Debit Card,2025-02-04
ORD-5012,Arjun Malhotra,Dine-in,Table 11,7,145.00,14.50,159.50,Credit Card,2025-02-04
ORD-5013,Meera Joshi,Delivery,Online,2,28.00,2.80,30.80,UPI / Digital,2025-02-05
ORD-5014,Tanvi Saxena,Dine-in,Table 3,4,62.00,6.20,68.20,Cash,2025-02-05
ORD-5015,Gaurav Bansal,Dine-in,Table 8,5,89.50,8.95,98.45,Credit Card,2025-02-05`
  },
  {
    industry: 'restaurants',
    filename: 'restaurant_inventory.csv',
    csvContent: `ingredient_id,ingredient_name,category,current_stock,unit,reorder_level,unit_cost,total_value,supplier
ING-01,Basmati Rice,Grains,240,kg,80,1.80,432.00,Apex Agro Mills
ING-02,Boneless Chicken,Poultry,95,kg,40,4.50,427.50,Sunrise Poultry Co
ING-03,Paneer (Cottage Cheese),Dairy,60,kg,25,3.80,228.00,Amul Fresh Dairy
ING-04,Cooking Oil,Oils,120,liters,45,2.10,252.00,National Edibles
ING-05,Onions,Produce,180,kg,60,0.70,126.00,Metro Mandi Wholesale
ING-06,Tomatoes,Produce,140,kg,50,0.85,119.00,Metro Mandi Wholesale
ING-07,Garam Masala Blend,Spices,35,kg,12,8.50,297.50,Kerala Spice Hub
ING-08,Fresh Cream,Dairy,48,liters,20,3.20,153.60,Amul Fresh Dairy
ING-09,Flour (Maida),Grains,160,kg,50,0.95,152.00,Apex Agro Mills
ING-10,Whole Milk,Dairy,110,liters,40,1.10,121.00,City Dairy Supply
ING-11,Mutton Cuts,Meat,42,kg,20,7.50,315.00,Heritage Farms
ING-12,Garlic,Produce,30,kg,15,2.40,72.00,Metro Mandi Wholesale
ING-13,Ginger,Produce,25,kg,12,2.60,65.00,Metro Mandi Wholesale
ING-14,Yogurt,Dairy,75,kg,30,1.40,105.00,City Dairy Supply
ING-15,Cardamom & Cloves,Spices,18,kg,8,14.00,252.00,Kerala Spice Hub`
  },

  // -------------------------------------------------------------
  // 2. BUSINESS & ENTERPRISE
  // -------------------------------------------------------------
  {
    industry: 'business',
    filename: 'business_revenue.csv',
    csvContent: `month,business_unit,product_line,gross_revenue,discounts,net_revenue,target_revenue
2025-01,Cloud Infrastructure,Compute Instances,450000,22500,427500,410000
2025-01,Cloud Infrastructure,Object Storage,185000,9250,175750,170000
2025-01,Enterprise Software,CRM Suite,620000,31000,589000,560000
2025-01,Cybersecurity,Identity Protection,280000,14000,266000,250000
2025-02,Cloud Infrastructure,Compute Instances,480000,24000,456000,430000
2025-02,Cloud Infrastructure,Object Storage,198000,9900,188100,180000
2025-02,Enterprise Software,CRM Suite,645000,32250,612750,590000
2025-02,Cybersecurity,Identity Protection,310000,15500,294500,270000
2025-03,Cloud Infrastructure,Compute Instances,515000,25750,489250,460000
2025-03,Cloud Infrastructure,Object Storage,210000,10500,199500,190000
2025-03,Enterprise Software,CRM Suite,680000,34000,646000,620000
2025-03,Cybersecurity,Identity Protection,335000,16750,318250,295000
2025-04,Cloud Infrastructure,Compute Instances,540000,27000,513000,480000
2025-04,Enterprise Software,CRM Suite,710000,35500,674500,650000
2025-04,Cybersecurity,Identity Protection,360000,18000,342000,320000`
  },
  {
    industry: 'business',
    filename: 'business_expenses.csv',
    csvContent: `expense_id,department,category,amount,budget_allocated,variance,month
EXP-101,Engineering,Cloud Hosting & AWS,142000,150000,8000,2025-01
EXP-102,Marketing,Digital Ad Campaigns,98000,110000,12000,2025-01
EXP-103,Sales,Travel & Client Dinners,34000,40000,6000,2025-01
EXP-104,Human Resources,Recruiting & Headhunting,28000,25000,-3000,2025-01
EXP-105,Operations,Office Facilities & Leases,55000,55000,0,2025-01
EXP-106,Engineering,Developer Tool Licenses,42000,45000,3000,2025-02
EXP-107,Marketing,Industry Conferences,65000,60000,-5000,2025-02
EXP-108,Sales,Sales Incentives & Bonuses,88000,85000,-3000,2025-02
EXP-109,Finance,Audit & Legal Retainers,32000,35000,3000,2025-02
EXP-110,Operations,Hardware Procurement,48000,50000,2000,2025-02
EXP-111,Engineering,Cloud Hosting & AWS,156000,160000,4000,2025-03
EXP-112,Marketing,Digital Ad Campaigns,105000,115000,10000,2025-03
EXP-113,Human Resources,Employee Wellness & Training,22000,25000,3000,2025-03
EXP-114,Sales,CRM Software Licensing,39000,40000,1000,2025-03
EXP-115,Operations,Office Facilities & Leases,56000,55000,-1000,2025-03`
  },
  {
    industry: 'business',
    filename: 'employee_performance.csv',
    csvContent: `employee_id,full_name,department,role,projects_completed,efficiency_score,satisfaction_rating,annual_salary
EMP-001,Aditi Rao,Engineering,Staff Engineer,14,4.8,4.9,145000
EMP-002,Karan Singhal,Engineering,Backend Developer,11,4.5,4.6,112000
EMP-003,Sneha Deshmukh,Marketing,Growth Lead,9,4.6,4.7,98000
EMP-004,Vivek Nambiar,Sales,Enterprise Account Exec,18,4.9,4.8,125000
EMP-005,Ritu Agarwal,Product,Senior PM,8,4.4,4.5,130000
EMP-006,Manish Chawla,Engineering,DevOps Lead,12,4.7,4.8,138000
EMP-007,Pooja Hegde,Customer Success,CS Manager,22,4.8,4.9,89000
EMP-008,Suresh Iyer,Finance,Financial Analyst,7,4.3,4.4,92000
EMP-009,Divya Sen,Engineering,Frontend Engineer,10,4.6,4.7,105000
EMP-010,Tarun Mittal,Sales,Account Executive,15,4.7,4.6,96000
EMP-011,Anjali Pillai,Human Resources,Talent Partner,8,4.5,4.8,84000
EMP-012,Rajesh Goud,Operations,Facilities Manager,6,4.2,4.3,78000
EMP-013,Farhan Siddiqui,Engineering,QA Architect,13,4.6,4.5,118000
EMP-014,Kavita Biswas,Marketing,Content Strategist,11,4.5,4.6,82000
EMP-015,Abhinav Verma,Product,UI/UX Designer,9,4.7,4.9,102000`
  },

  // -------------------------------------------------------------
  // 3. MOVIE THEATRES & ENTERTAINMENT
  // -------------------------------------------------------------
  {
    industry: 'theatres',
    filename: 'theatre_bookings.csv',
    csvContent: `booking_id,movie_title,screen_number,show_time,tickets_booked,ticket_price,total_booking_amount,payment_status,booking_date
BKG-201,Interstellar Odyssey,Audi 1,18:30,4,14.50,58.00,Confirmed,2025-02-01
BKG-202,Echoes of the Past,Audi 2,15:00,2,11.00,22.00,Confirmed,2025-02-01
BKG-203,Neon Cyberpunk 2099,Audi 3,21:15,5,16.00,80.00,Confirmed,2025-02-01
BKG-204,The Royal Dynasty,Audi 4,14:00,3,12.50,37.50,Confirmed,2025-02-02
BKG-205,Interstellar Odyssey,Audi 1,21:45,6,15.50,93.00,Confirmed,2025-02-02
BKG-206,Wild Frontier,Audi 2,17:30,2,10.00,20.00,Confirmed,2025-02-02
BKG-207,Neon Cyberpunk 2099,Audi 3,18:00,4,16.00,64.00,Confirmed,2025-02-03
BKG-208,The Royal Dynasty,Audi 4,19:30,5,13.00,65.00,Confirmed,2025-02-03
BKG-209,Interstellar Odyssey,Audi 1,14:15,3,13.50,40.50,Confirmed,2025-02-03
BKG-210,Echoes of the Past,Audi 2,20:45,4,12.00,48.00,Confirmed,2025-02-04
BKG-211,Neon Cyberpunk 2099,Audi 3,21:30,6,16.00,96.00,Confirmed,2025-02-04
BKG-212,Wild Frontier,Audi 2,14:30,3,10.00,30.00,Confirmed,2025-02-04
BKG-213,Interstellar Odyssey,Audi 1,18:30,5,15.00,75.00,Confirmed,2025-02-05
BKG-214,The Royal Dynasty,Audi 4,16:00,4,12.50,50.00,Confirmed,2025-02-05
BKG-215,Echoes of the Past,Audi 2,18:00,2,11.50,23.00,Confirmed,2025-02-05`
  },
  {
    industry: 'theatres',
    filename: 'movie_performance.csv',
    csvContent: `movie_id,title,genre,total_shows,total_admissions,gross_box_office,average_occupancy_pct,critic_rating
MOV-01,Interstellar Odyssey,Sci-Fi,48,9450,141750.00,82.4,9.1
MOV-02,Neon Cyberpunk 2099,Action,42,8120,129920.00,78.2,8.6
MOV-03,The Royal Dynasty,Historical Drama,36,6340,81152.00,69.5,8.2
MOV-04,Echoes of the Past,Mystery Thriller,32,4920,56580.00,62.8,7.9
MOV-05,Wild Frontier,Western Adventure,28,3480,36540.00,54.1,7.2
MOV-06,Laughter Express,Comedy,30,4820,48200.00,68.9,7.8
MOV-07,Dragon Kingdom,Animation,34,5920,68080.00,73.6,8.4
MOV-08,Shadows in the Mist,Horror,24,2840,29820.00,49.2,6.8`
  },
  {
    industry: 'theatres',
    filename: 'show_occupancy.csv',
    csvContent: `show_id,movie_title,screen,show_date,time_slot,capacity,seats_sold,occupancy_rate_pct,ticket_revenue
SHW-101,Interstellar Odyssey,Audi 1 (IMAX),2025-02-01,Evening,280,246,87.9,3813.00
SHW-102,Neon Cyberpunk 2099,Audi 3,2025-02-01,Night,220,188,85.5,3008.00
SHW-103,The Royal Dynasty,Audi 4,2025-02-01,Matinee,200,134,67.0,1675.00
SHW-104,Echoes of the Past,Audi 2,2025-02-01,Evening,180,118,65.6,1357.00
SHW-105,Interstellar Odyssey,Audi 1 (IMAX),2025-02-02,Night,280,265,94.6,4107.50
SHW-106,Wild Frontier,Audi 2,2025-02-02,Matinee,180,94,52.2,940.00
SHW-107,Dragon Kingdom,Audi 4,2025-02-02,Morning,200,162,81.0,1863.00
SHW-108,Neon Cyberpunk 2099,Audi 3,2025-02-03,Evening,220,172,78.2,2752.00
SHW-109,The Royal Dynasty,Audi 4,2025-02-03,Evening,200,140,70.0,1750.00
SHW-110,Interstellar Odyssey,Audi 1 (IMAX),2025-02-04,Evening,280,230,82.1,3565.00
SHW-111,Echoes of the Past,Audi 2,2025-02-04,Night,180,122,67.8,1464.00
SHW-112,Laughter Express,Audi 3,2025-02-05,Evening,220,165,75.0,1980.00
SHW-113,Interstellar Odyssey,Audi 1 (IMAX),2025-02-05,Night,280,252,90.0,3906.00
SHW-114,Wild Frontier,Audi 2,2025-02-05,Evening,180,98,54.4,980.00
SHW-115,Neon Cyberpunk 2099,Audi 3,2025-02-05,Night,220,180,81.8,2880.00`
  },

  // -------------------------------------------------------------
  // 4. HEALTHCARE & HOSPITALS
  // -------------------------------------------------------------
  {
    industry: 'healthcare',
    filename: 'hospital_appointments.csv',
    csvContent: `appointment_id,patient_id,department,doctor_name,appointment_date,appointment_type,status,consultation_fee
APT-1001,P-8401,Cardiology,Dr. Rajesh Gupta,2025-02-01,Routine Checkup,Completed,120.00
APT-1002,P-8402,Orthopedics,Dr. Sarah Jenkins,2025-02-01,Post-Op Review,Completed,95.00
APT-1003,P-8403,Pediatrics,Dr. Anita Desai,2025-02-01,Vaccination,Completed,65.00
APT-1004,P-8404,Neurology,Dr. David Chen,2025-02-01,Consultation,Cancelled,0.00
APT-1005,P-8405,Oncology,Dr. Robert Taylor,2025-02-02,Chemo Consultation,Completed,180.00
APT-1006,P-8406,Cardiology,Dr. Rajesh Gupta,2025-02-02,ECG Analysis,Completed,140.00
APT-1007,P-8407,General Medicine,Dr. Pooja Saxena,2025-02-02,Fever & Flu,Completed,50.00
APT-1008,P-8408,Orthopedics,Dr. Sarah Jenkins,2025-02-03,Joint Pain,Completed,95.00
APT-1009,P-8409,Dermatology,Dr. Maya Varma,2025-02-03,Skin Biopsy Review,Completed,85.00
APT-1010,P-8410,Pediatrics,Dr. Anita Desai,2025-02-03,General Wellness,No-show,0.00
APT-1011,P-8411,Cardiology,Dr. Rajesh Gupta,2025-02-04,Stress Test Followup,Completed,135.00
APT-1012,P-8412,Neurology,Dr. David Chen,2025-02-04,Migraine Treatment,Completed,150.00
APT-1013,P-8413,General Medicine,Dr. Pooja Saxena,2025-02-04,Annual Physical,Completed,60.00
APT-1014,P-8414,Oncology,Dr. Robert Taylor,2025-02-05,Second Opinion,Completed,180.00
APT-1015,P-8415,Orthopedics,Dr. Sarah Jenkins,2025-02-05,Fracture Cast Removal,Completed,90.00`
  },
  {
    industry: 'healthcare',
    filename: 'hospital_department_metrics.csv',
    csvContent: `department,doctors_count,beds_available,beds_occupied,occupancy_rate_pct,monthly_admissions,avg_length_of_stay_days
Cardiology,14,60,53,88.3,184,4.2
Orthopedics,11,45,38,84.4,142,3.8
Neurology,9,35,29,82.9,98,5.6
Pediatrics,12,50,34,68.0,165,2.4
Oncology,8,30,28,93.3,76,7.1
General Surgery,15,70,59,84.3,210,3.5
Intensive Care Unit (ICU),10,24,22,91.7,85,6.2
Emergency Medicine,18,40,32,80.0,420,1.2`
  },
  {
    industry: 'healthcare',
    filename: 'hospital_billing.csv',
    csvContent: `bill_id,patient_name,department,admission_date,discharge_date,treatment_charges,pharmacy_charges,room_charges,total_billed,insurance_covered,patient_payable
BIL-701,Ramesh Patel,Cardiology,2025-01-10,2025-01-14,4800.00,1250.00,1600.00,7650.00,6120.00,1530.00
BIL-702,Emily Watson,Orthopedics,2025-01-12,2025-01-15,3500.00,680.00,1200.00,5380.00,4304.00,1076.00
BIL-703,Harish Chandra,Neurology,2025-01-15,2025-01-20,6200.00,1850.00,2000.00,10050.00,8040.00,2010.00
BIL-704,Fatima Al-Mansoor,Pediatrics,2025-01-18,2025-01-20,1400.00,420.00,800.00,2620.00,2096.00,524.00
BIL-705,Sanjay Singhania,Oncology,2025-01-14,2025-01-22,8900.00,3400.00,3200.00,15500.00,12400.00,3100.00
BIL-706,Linda Gomez,General Surgery,2025-01-20,2025-01-23,4100.00,890.00,1200.00,6190.00,4952.00,1238.00
BIL-707,Karthik Subramanian,ICU,2025-01-21,2025-01-27,9500.00,4100.00,4800.00,18400.00,14720.00,3680.00
BIL-708,Grace O'Connor,Cardiology,2025-01-24,2025-01-28,5200.00,1450.00,1600.00,8250.00,6600.00,1650.00
BIL-709,Deepak Malhotra,Orthopedics,2025-01-25,2025-01-28,3800.00,740.00,1200.00,5740.00,4592.00,1148.00
BIL-710,Amina Begum,General Surgery,2025-01-26,2025-01-30,4500.00,980.00,1600.00,7080.00,5664.00,1416.00`
  },

  // -------------------------------------------------------------
  // 5. RETAIL & E-COMMERCE
  // -------------------------------------------------------------
  {
    industry: 'retail',
    filename: 'retail_transactions.csv',
    csvContent: `transaction_id,customer_id,store_location,channel,items_count,transaction_value,discount_applied,net_paid,payment_type,transaction_date
TXN-9001,CUST-412,Downtown Flagship,In-Store,3,145.00,14.50,130.50,Credit Card,2025-02-01
TXN-9002,CUST-789,Westside Mall,In-Store,1,85.00,0.00,85.00,UPI / Digital,2025-02-01
TXN-9003,CUST-234,Online Web,E-Commerce,4,220.00,33.00,187.00,Credit Card,2025-02-01
TXN-9004,CUST-561,Suburban Hub,In-Store,2,64.00,6.40,57.60,Cash,2025-02-02
TXN-9005,CUST-892,Mobile App,E-Commerce,5,310.00,46.50,263.50,Debit Card,2025-02-02
TXN-9006,CUST-104,Downtown Flagship,In-Store,2,95.00,9.50,85.50,Credit Card,2025-02-02
TXN-9007,CUST-673,Online Web,E-Commerce,3,175.00,17.50,157.50,Credit Card,2025-02-03
TXN-9008,CUST-318,Westside Mall,In-Store,1,45.00,0.00,45.00,Cash,2025-02-03
TXN-9009,CUST-945,Mobile App,E-Commerce,6,420.00,84.00,336.00,UPI / Digital,2025-02-03
TXN-9010,CUST-421,Downtown Flagship,In-Store,4,210.00,21.00,189.00,Credit Card,2025-02-04
TXN-9011,CUST-156,Suburban Hub,In-Store,2,78.00,7.80,70.20,Debit Card,2025-02-04
TXN-9012,CUST-723,Online Web,E-Commerce,3,135.00,13.50,121.50,Credit Card,2025-02-04
TXN-9013,CUST-881,Mobile App,E-Commerce,2,110.00,11.00,99.00,UPI / Digital,2025-02-05
TXN-9014,CUST-390,Westside Mall,In-Store,5,260.00,26.00,234.00,Credit Card,2025-02-05
TXN-9015,CUST-502,Downtown Flagship,In-Store,1,55.00,0.00,55.00,Cash,2025-02-05`
  },
  {
    industry: 'retail',
    filename: 'product_inventory.csv',
    csvContent: `sku,product_name,category,stock_on_hand,safety_stock,unit_cost,retail_price,inventory_value,stock_status
SKU-101,Classic Cotton Crew T-Shirt,Apparel,420,100,8.50,24.00,3570.00,In Stock
SKU-102,Slim-Fit Denim Jeans,Apparel,180,60,18.00,59.00,3240.00,In Stock
SKU-103,Wireless ANC Headphones,Electronics,75,30,42.00,119.00,3150.00,In Stock
SKU-104,Running Performance Shoes,Footwear,110,40,32.00,89.00,3520.00,In Stock
SKU-105,Smart Fitness Tracker V2,Electronics,90,35,28.00,79.00,2520.00,In Stock
SKU-106,Waterproof Trekking Backpack,Accessories,140,45,16.50,49.00,2310.00,In Stock
SKU-107,Polarized Polar Sunglasses,Accessories,210,50,9.00,29.00,1890.00,In Stock
SKU-108,Stainless Steel Thermal Flask,Home & Kitchen,260,70,7.20,22.00,1872.00,In Stock
SKU-109,Ceramic Coffee Mug 4-Pack,Home & Kitchen,130,40,6.00,19.00,780.00,In Stock
SKU-110,Ergonomic Memory Foam Pillow,Home & Kitchen,85,30,14.00,39.00,1190.00,In Stock
SKU-111,Leather Bifold Wallet,Accessories,165,45,11.00,34.00,1815.00,In Stock
SKU-112,Mechanical Gaming Keyboard,Electronics,45,25,38.00,99.00,1710.00,Low Stock
SKU-113,Yoga Mat Anti-Slip 6mm,Fitness,190,50,10.50,29.00,1995.00,In Stock
SKU-114,Fleece Winter Zip Hoodie,Apparel,60,40,19.00,55.00,1140.00,Low Stock
SKU-115,Canvas Sneaker Low-Top,Footwear,135,40,21.00,59.00,2835.00,In Stock`
  },
  {
    industry: 'retail',
    filename: 'customer_purchases.csv',
    csvContent: `customer_id,segment,total_orders,lifetime_spend,avg_basket_value,last_purchase_days_ago,loyalty_tier
CUST-101,VIP High Value,24,3480.00,145.00,4,Platinum
CUST-102,Regular Consumer,11,968.00,88.00,12,Gold
CUST-103,Bargain Seeker,6,288.00,48.00,28,Silver
CUST-104,VIP High Value,31,4960.00,160.00,2,Platinum
CUST-105,Occasional Buyer,4,312.00,78.00,45,Bronze
CUST-106,Regular Consumer,15,1425.00,95.00,8,Gold
CUST-107,VIP High Value,19,2945.00,155.00,6,Platinum
CUST-108,Bargain Seeker,8,360.00,45.00,19,Silver
CUST-109,Regular Consumer,12,1104.00,92.00,14,Gold
CUST-110,Occasional Buyer,3,195.00,65.00,60,Bronze
CUST-111,VIP High Value,28,4480.00,160.00,3,Platinum
CUST-112,Regular Consumer,9,738.00,82.00,16,Gold
CUST-113,Bargain Seeker,5,235.00,47.00,33,Silver
CUST-114,Regular Consumer,14,1288.00,92.00,9,Gold
CUST-115,Occasional Buyer,2,140.00,70.00,75,Bronze`
  },

  // -------------------------------------------------------------
  // 6. EDUCATION & INSTITUTIONS
  // -------------------------------------------------------------
  {
    industry: 'education',
    filename: 'student_performance.csv',
    csvContent: `student_id,student_name,grade_level,mathematics,science,english,history,average_score,pass_status
STU-01,Aarav Sharma,Grade 10,94,92,88,86,90.0,Pass
STU-02,Diya Patel,Grade 10,88,85,91,84,87.0,Pass
STU-03,Rohan Verma,Grade 10,72,68,75,71,71.5,Pass
STU-04,Ananya Iyer,Grade 10,98,96,94,92,95.0,Pass
STU-05,Kabir Singh,Grade 10,54,58,62,56,57.5,Pass
STU-06,Meera Nair,Grade 10,91,89,93,87,90.0,Pass
STU-07,Vikram Rao,Grade 10,38,42,48,40,42.0,Pass
STU-08,Pooja Hegde,Grade 10,82,79,85,80,81.5,Pass
STU-09,Arjun Menon,Grade 10,65,71,68,64,67.0,Pass
STU-10,Tanvi Kulkarni,Grade 10,95,94,90,91,92.5,Pass
STU-11,Nikhil Joshi,Grade 10,48,52,56,50,51.5,Pass
STU-12,Sneha Roy,Grade 10,86,88,84,82,85.0,Pass
STU-13,Gaurav Bansal,Grade 10,34,38,44,36,38.0,Fail
STU-14,Rhea Sen,Grade 10,92,90,95,89,91.5,Pass
STU-15,Karan Gupta,Grade 10,76,74,78,72,75.0,Pass`
  },
  {
    industry: 'education',
    filename: 'student_attendance.csv',
    csvContent: `student_id,student_name,grade,total_school_days,days_present,days_absent,attendance_percentage
STU-01,Aarav Sharma,Grade 10,90,88,2,97.8
STU-02,Diya Patel,Grade 10,90,86,4,95.6
STU-03,Rohan Verma,Grade 10,90,78,12,86.7
STU-04,Ananya Iyer,Grade 10,90,89,1,98.9
STU-05,Kabir Singh,Grade 10,90,72,18,80.0
STU-06,Meera Nair,Grade 10,90,87,3,96.7
STU-07,Vikram Rao,Grade 10,90,68,22,75.6
STU-08,Pooja Hegde,Grade 10,90,84,6,93.3
STU-09,Arjun Menon,Grade 10,90,79,11,87.8
STU-10,Tanvi Kulkarni,Grade 10,90,88,2,97.8
STU-11,Nikhil Joshi,Grade 10,90,74,16,82.2
STU-12,Sneha Roy,Grade 10,90,85,5,94.4
STU-13,Gaurav Bansal,Grade 10,90,62,28,68.9
STU-14,Rhea Sen,Grade 10,90,89,1,98.9
STU-15,Karan Gupta,Grade 10,90,82,8,91.1`
  },
  {
    industry: 'education',
    filename: 'course_enrollment.csv',
    csvContent: `course_id,course_title,department,capacity,enrolled_students,completion_rate_pct,credits,instructor
CRS-101,Intro to Data Structures,Computer Science,120,118,92.4,4,Dr. Alan Turing
CRS-102,Linear Algebra & Matrices,Mathematics,90,86,88.4,3,Dr. Katherine Johnson
CRS-103,Quantum Mechanics I,Physics,60,54,81.5,4,Dr. Richard Feynman
CRS-104,Organic Chemistry Principles,Chemistry,75,71,85.9,4,Dr. Marie Curie
CRS-105,Microeconomic Theory,Economics,100,95,90.5,3,Dr. Amartya Sen
CRS-106,World History 1900-2000,History,80,76,94.7,3,Dr. Eric Hobsbawm
CRS-107,Artificial Intelligence & ML,Computer Science,120,120,95.0,4,Dr. Geoffrey Hinton
CRS-108,Molecular Cell Biology,Biology,70,68,89.7,4,Dr. Rosalind Franklin`
  },

  // -------------------------------------------------------------
  // 7. HOTELS & HOSPITALITY
  // -------------------------------------------------------------
  {
    industry: 'hotels',
    filename: 'hotel_bookings.csv',
    csvContent: `booking_ref,guest_name,room_type,nights,room_rate_per_night,total_room_charge,service_fee,grand_total,booking_status
HTL-401,Alexander Wright,Deluxe Ocean View,3,180.00,540.00,45.00,585.00,Confirmed
HTL-402,Sunita Nambiar,Executive Suite,2,260.00,520.00,50.00,570.00,Confirmed
HTL-403,Marcus Becker,Standard Queen,4,110.00,440.00,35.00,475.00,Confirmed
HTL-404,Elena Rostova,Presidential Suite,3,450.00,1350.00,120.00,1470.00,Confirmed
HTL-405,Rajeev Saxena,Deluxe Ocean View,2,180.00,360.00,30.00,390.00,Cancelled
HTL-406,Chloe Dupont,Standard King,3,125.00,375.00,35.00,410.00,Confirmed
HTL-407,Tariq Mansoor,Executive Suite,4,260.00,1040.00,85.00,1125.00,Confirmed
HTL-408,Kavita Deshmukh,Standard Queen,1,110.00,110.00,20.00,130.00,Confirmed
HTL-409,Daniel Craig,Deluxe Ocean View,5,180.00,900.00,75.00,975.00,Confirmed
HTL-410,Mei Ling Chen,Standard King,2,125.00,250.00,25.00,275.00,Confirmed
HTL-411,Carlos Silva,Executive Suite,3,260.00,780.00,65.00,845.00,Confirmed
HTL-412,Ananya Roy,Deluxe Ocean View,4,180.00,720.00,60.00,780.00,Confirmed
HTL-413,Patrick O'Brien,Presidential Suite,2,450.00,900.00,80.00,980.00,Confirmed
HTL-414,Deepak Varma,Standard Queen,3,110.00,330.00,30.00,360.00,Confirmed
HTL-415,Svetlana Ivanova,Executive Suite,2,260.00,520.00,45.00,565.00,Confirmed`
  },
  {
    industry: 'hotels',
    filename: 'room_occupancy.csv',
    csvContent: `date,total_rooms,rooms_occupied,rooms_maintenance,occupancy_rate_pct,adr,revpar
2025-02-01,150,132,4,88.0,178.50,157.08
2025-02-02,150,138,4,92.0,182.00,167.44
2025-02-03,150,114,6,76.0,165.00,125.40
2025-02-04,150,108,6,72.0,162.00,116.64
2025-02-05,150,118,5,78.7,168.00,132.22
2025-02-06,150,125,5,83.3,174.00,144.94
2025-02-07,150,142,3,94.7,195.00,184.67
2025-02-08,150,145,3,96.7,205.00,198.24
2025-02-09,150,130,4,86.7,175.00,151.73
2025-02-10,150,112,5,74.7,160.00,119.52`
  },
  {
    industry: 'hotels',
    filename: 'hotel_revenue.csv',
    csvContent: `month,room_revenue,food_beverage_revenue,spa_events_revenue,total_gross_revenue,operating_expenses,net_operating_income
2024-09,680000,240000,95000,1015000,690000,325000
2024-10,720000,265000,110000,1095000,720000,375000
2024-11,810000,310000,145000,1265000,780000,485000
2024-12,960000,380000,190000,1530000,890000,640000
2025-01,840000,320000,155000,1315000,810000,505000
2025-02,790000,295000,135000,1220000,770000,450000`
  },

  // -------------------------------------------------------------
  // 8. LOGISTICS & TRANSPORTATION
  // -------------------------------------------------------------
  {
    industry: 'logistics',
    filename: 'delivery_performance.csv',
    csvContent: `delivery_id,order_id,destination_city,carrier,promised_hours,actual_hours,delivery_status,on_time_flag,delivery_cost
DEL-301,ORD-9801,Mumbai,ExpressCargo,24,21.5,Delivered,Yes,14.50
DEL-302,ORD-9802,Delhi,NationalFreight,48,44.0,Delivered,Yes,18.00
DEL-303,ORD-9803,Bengaluru,SwiftLogix,24,27.0,Delayed,No,16.20
DEL-304,ORD-9804,Hyderabad,ExpressCargo,36,32.0,Delivered,Yes,15.00
DEL-305,ORD-9805,Chennai,BlueDart Pro,24,22.0,Delivered,Yes,17.50
DEL-306,ORD-9806,Kolkata,NationalFreight,72,68.5,Delivered,Yes,22.00
DEL-307,ORD-9807,Pune,SwiftLogix,24,23.0,Delivered,Yes,13.80
DEL-308,ORD-9808,Ahmedabad,ExpressCargo,36,41.0,Delayed,No,16.00
DEL-309,ORD-9809,Jaipur,BlueDart Pro,48,45.0,Delivered,Yes,19.20
DEL-310,ORD-9810,Lucknow,NationalFreight,48,46.5,Delivered,Yes,18.50
DEL-311,ORD-9811,Bengaluru,ExpressCargo,24,20.0,Delivered,Yes,14.00
DEL-312,ORD-9812,Surat,SwiftLogix,24,28.5,Delayed,No,15.50
DEL-313,ORD-9813,Kochi,BlueDart Pro,48,43.0,Delivered,Yes,21.00
DEL-314,ORD-9814,Chandigarh,ExpressCargo,36,33.0,Delivered,Yes,17.00
DEL-315,ORD-9815,Indore,NationalFreight,36,34.0,Delivered,Yes,16.50`
  },
  {
    industry: 'logistics',
    filename: 'shipment_tracking.csv',
    csvContent: `tracking_number,origin,destination,weight_kg,mode,dispatch_date,estimated_delivery,current_status,freight_charge
TRK-5501,Nhava Sheva Port,Delhi ICD,14200,Rail Freight,2025-02-01,2025-02-04,In Transit,1850.00
TRK-5502,Chennai Port,Bengaluru Hub,8500,Road Transport,2025-02-01,2025-02-02,Delivered,920.00
TRK-5503,IGI Airport Delhi,Frankfurt Airport,1250,Air Cargo,2025-02-02,2025-02-03,Delivered,3450.00
TRK-5504,Mundra Port,Ahmedabad Warehouse,19500,Road Transport,2025-02-02,2025-02-03,Delivered,1150.00
TRK-5505,Kolkata Port,Patna Hub,11200,Road Transport,2025-02-03,2025-02-05,In Transit,1420.00
TRK-5506,Bengaluru Airport,Dubai Cargo Hub,980,Air Cargo,2025-02-03,2025-02-04,Delivered,2800.00
TRK-5507,Mumbai Hub,Hyderabad Depot,6400,Road Transport,2025-02-04,2025-02-05,Delivered,890.00
TRK-5508,Visakhapatnam,Nagpur Hub,16800,Rail Freight,2025-02-04,2025-02-07,In Transit,1980.00
TRK-5509,Cochin Port,Coimbatore Hub,5300,Road Transport,2025-02-05,2025-02-06,In Transit,680.00
TRK-5510,Mumbai Airport,London Heathrow,1800,Air Cargo,2025-02-05,2025-02-06,Customs Cleared,4600.00`
  },
  {
    industry: 'logistics',
    filename: 'transportation_costs.csv',
    csvContent: `route_id,origin_hub,destination_hub,distance_km,fuel_cost,toll_charges,driver_wages,total_trip_cost,trips_count
RTE-01,Mumbai,Delhi,1420,480.00,85.00,160.00,725.00,42
RTE-02,Bengaluru,Chennai,350,120.00,28.00,65.00,213.00,78
RTE-03,Delhi,Kolkata,1530,520.00,95.00,175.00,790.00,36
RTE-04,Mumbai,Bengaluru,980,335.00,62.00,130.00,527.00,54
RTE-05,Hyderabad,Chennai,630,215.00,45.00,95.00,355.00,48
RTE-06,Delhi,Chandigarh,260,90.00,22.00,50.00,162.00,85
RTE-07,Ahmedabad,Mumbai,530,180.00,40.00,85.00,305.00,62
RTE-08,Kolkata,Guwahati,990,345.00,58.00,140.00,543.00,28`
  },

  // -------------------------------------------------------------
  // 9. BANKING & FINANCE
  // -------------------------------------------------------------
  {
    industry: 'banking',
    filename: 'loan_portfolio.csv',
    csvContent: `loan_id,borrower_type,loan_category,principal_amount,interest_rate_pct,term_months,outstanding_balance,risk_rating,status
LN-8801,Individual,Home Mortgage,280000,7.25,240,245000,Low,Performing
LN-8802,SME Business,Equipment Finance,95000,9.50,60,68000,Medium,Performing
LN-8803,Corporate,Working Capital Facility,1200000,8.10,36,890000,Low,Performing
LN-8804,Individual,Auto Loan,32000,8.75,60,24500,Low,Performing
LN-8805,Individual,Personal Loan,18000,13.20,36,9200,High,Overdue 30 Days
LN-8806,SME Business,Invoice Discounting,65000,10.00,12,18000,Medium,Performing
LN-8807,Corporate,Commercial Real Estate,3400000,7.85,120,2950000,Low,Performing
LN-8808,Individual,Home Mortgage,350000,7.15,300,320000,Low,Performing
LN-8809,SME Business,Expansion Term Loan,140000,9.25,84,112000,Medium,Performing
LN-8810,Individual,Personal Loan,12000,13.80,24,3800,High,Default / NPL
LN-8811,Corporate,Project Finance Solar,2100000,7.60,180,1890000,Low,Performing
LN-8812,Individual,Auto Loan,41000,8.60,60,34000,Low,Performing
LN-8813,Individual,Education Loan,55000,8.90,120,44000,Medium,Performing
LN-8814,SME Business,Working Capital,80000,9.80,24,52000,Medium,Performing
LN-8815,Individual,Home Mortgage,420000,7.10,240,380000,Low,Performing`
  },
  {
    industry: 'banking',
    filename: 'banking_transactions.csv',
    csvContent: `transaction_id,account_type,transaction_type,amount,fee,channel,status,transaction_time
TXN-101,Savings Account,UPI Transfer,250.00,0.00,Mobile Banking,Success,2025-02-01 09:14
TXN-102,Checking Account,Wire Transfer,4800.00,15.00,Net Banking,Success,2025-02-01 10:22
TXN-103,Credit Card,POS Swipe,89.50,0.00,Merchant POS,Success,2025-02-01 11:45
TXN-104,Savings Account,ATM Withdrawal,200.00,2.50,Branch ATM,Success,2025-02-01 12:30
TXN-105,Corporate Account,NEFT Batch,38500.00,25.00,Net Banking,Success,2025-02-02 09:50
TXN-106,Checking Account,Direct Debit EMI,640.00,0.00,Auto Debit,Success,2025-02-02 11:00
TXN-107,Credit Card,Online Purchase,145.00,0.00,E-Commerce,Success,2025-02-02 14:15
TXN-108,Savings Account,UPI Transfer,120.00,0.00,Mobile Banking,Success,2025-02-02 17:30
TXN-109,Corporate Account,RTGS Salary Payout,84200.00,30.00,Net Banking,Success,2025-02-03 10:10
TXN-110,Checking Account,Cheque Deposit,2400.00,0.00,Branch Counter,Clearing,2025-02-03 12:00
TXN-111,Credit Card,International POS,320.00,9.60,Merchant POS,Success,2025-02-03 16:40
TXN-112,Savings Account,Bill Payment,78.50,0.00,Mobile Banking,Success,2025-02-04 08:30
TXN-113,Savings Account,ATM Withdrawal,300.00,2.50,Branch ATM,Success,2025-02-04 13:15
TXN-114,Checking Account,Wire Transfer,12500.00,20.00,Net Banking,Success,2025-02-04 15:45
TXN-115,Credit Card,Online Purchase,68.00,0.00,E-Commerce,Success,2025-02-05 18:20`
  },
  {
    industry: 'banking',
    filename: 'customer_deposits.csv',
    csvContent: `deposit_id,branch,deposit_type,deposit_amount,annual_yield_pct,maturity_months,customer_segment
DEP-401,Downtown Financial Center,Fixed Deposit,50000,7.10,24,Premier
DEP-402,Suburban Plaza Branch,Recurring Deposit,12000,6.75,12,Retail
DEP-403,Commercial Hub Metro,Corporate Term Deposit,500000,7.45,36,Corporate
DEP-404,Tech City Branch,High-Yield Savings,85000,5.25,0,Wealth
DEP-405,Downtown Financial Center,Fixed Deposit,100000,7.20,36,Premier
DEP-406,Airport Road Branch,Certificate of Deposit,25000,6.90,18,Retail
DEP-407,Suburban Plaza Branch,Fixed Deposit,40000,7.00,24,Retail
DEP-408,Commercial Hub Metro,Corporate Term Deposit,850000,7.60,48,Corporate
DEP-409,Downtown Financial Center,Fixed Deposit,75000,7.15,24,Premier
DEP-410,Tech City Branch,High-Yield Savings,120000,5.25,0,Wealth
DEP-411,Airport Road Branch,Recurring Deposit,18000,6.80,12,Retail
DEP-412,Suburban Plaza Branch,Fixed Deposit,30000,7.00,12,Retail`
  },

  // -------------------------------------------------------------
  // 10. FITNESS & GYMS
  // -------------------------------------------------------------
  {
    industry: 'fitness',
    filename: 'gym_memberships.csv',
    csvContent: `member_id,member_name,plan_type,monthly_fee,joined_date,status,visits_this_month,trainer_assigned
MEM-201,Karan Johar,Gold Annual,65.00,2024-03-15,Active,16,Yes
MEM-202,Simran Kaur,Silver Monthly,45.00,2024-06-10,Active,11,No
MEM-203,Alex Johnson,Platinum All-Access,95.00,2024-01-20,Active,22,Yes
MEM-204,Divya Aggarwal,Silver Monthly,45.00,2024-08-05,Active,8,No
MEM-205,Marcus Brody,Student Pass,30.00,2024-09-01,Active,14,No
MEM-206,Pooja Hegde,Gold Annual,65.00,2024-04-12,Active,18,Yes
MEM-207,Rohan Mehra,Silver Monthly,45.00,2024-07-22,Paused,2,No
MEM-208,Elena Vasquez,Platinum All-Access,95.00,2024-02-18,Active,19,Yes
MEM-209,Vikram Seth,Gold Annual,65.00,2024-05-30,Active,15,No
MEM-210,Sarah Connor,Platinum All-Access,95.00,2024-01-10,Active,24,Yes
MEM-211,Amitabh Sengupta,Silver Monthly,45.00,2024-10-15,Cancelled,0,No
MEM-212,Neha Sharma,Gold Annual,65.00,2024-04-01,Active,17,Yes
MEM-213,Gaurav Chopra,Student Pass,30.00,2024-09-15,Active,12,No
MEM-214,Tara Sutaria,Platinum All-Access,95.00,2024-03-25,Active,20,Yes
MEM-215,Naveen Jindal,Silver Monthly,45.00,2024-08-18,Active,9,No`
  },
  {
    industry: 'fitness',
    filename: 'gym_attendance.csv',
    csvContent: `log_id,member_id,check_in_time,check_out_time,duration_minutes,facility_area,day_of_week
LOG-901,MEM-203,06:30,07:45,75,Weight Training,Monday
LOG-902,MEM-210,06:45,08:00,75,Cardio Zone,Monday
LOG-903,MEM-201,07:00,08:15,75,CrossFit Arena,Monday
LOG-904,MEM-206,07:15,08:15,60,Yoga Studio,Monday
LOG-905,MEM-214,17:30,18:45,75,Weight Training,Monday
LOG-906,MEM-208,18:00,19:15,75,Functional Fitness,Monday
LOG-907,MEM-205,18:15,19:30,75,Weight Training,Monday
LOG-908,MEM-202,07:30,08:30,60,Cardio Zone,Tuesday
LOG-909,MEM-209,08:00,09:15,75,Weight Training,Tuesday
LOG-910,MEM-212,17:45,19:00,75,CrossFit Arena,Tuesday
LOG-911,MEM-203,18:30,19:45,75,Weight Training,Tuesday
LOG-912,MEM-210,06:30,07:30,60,Cardio Zone,Wednesday
LOG-913,MEM-201,07:00,08:15,75,Weight Training,Wednesday
LOG-914,MEM-214,18:00,19:00,60,Swimming Pool,Wednesday
LOG-915,MEM-206,18:15,19:30,75,Weight Training,Wednesday`
  },
  {
    industry: 'fitness',
    filename: 'subscription_revenue.csv',
    csvContent: `month,active_subscribers,new_signups,cancellations,mrr_amount,churn_rate_pct,avg_revenue_per_member
2024-09,420,38,12,27300.00,2.86,65.00
2024-10,446,42,14,29210.00,3.14,65.50
2024-11,474,45,11,31280.00,2.32,66.00
2024-12,508,52,16,33780.00,3.15,66.50
2025-01,544,58,18,36450.00,3.31,67.00
2025-02,584,62,15,39420.00,2.57,67.50`
  },

  // -------------------------------------------------------------
  // 11. ENERGY & UTILITIES
  // -------------------------------------------------------------
  {
    industry: 'energy',
    filename: 'electricity_consumption.csv',
    csvContent: `date,time_hour,customer_sector,consumption_kwh,peak_demand_kw,grid_frequency_hz,power_factor
2025-02-01,08:00,Industrial,4850.00,1420.00,49.98,0.95
2025-02-01,12:00,Industrial,5920.00,1680.00,50.02,0.96
2025-02-01,18:00,Commercial,3850.00,1150.00,50.01,0.94
2025-02-01,20:00,Residential,4200.00,1280.00,49.97,0.92
2025-02-02,08:00,Industrial,4920.00,1450.00,50.01,0.95
2025-02-02,12:00,Industrial,6100.00,1720.00,49.99,0.96
2025-02-02,18:00,Commercial,3950.00,1180.00,50.02,0.94
2025-02-02,20:00,Residential,4350.00,1310.00,49.96,0.92
2025-02-03,08:00,Industrial,5050.00,1490.00,50.00,0.95
2025-02-03,12:00,Industrial,6250.00,1780.00,49.98,0.96
2025-02-03,18:00,Commercial,4100.00,1220.00,50.03,0.94
2025-02-03,20:00,Residential,4420.00,1340.00,49.95,0.92
2025-02-04,08:00,Industrial,5180.00,1520.00,50.01,0.95
2025-02-04,12:00,Industrial,6340.00,1810.00,49.99,0.96
2025-02-04,20:00,Residential,4500.00,1360.00,49.96,0.92`
  },
  {
    industry: 'energy',
    filename: 'energy_production.csv',
    csvContent: `date,source_type,plant_name,installed_capacity_mw,generated_mwh,capacity_factor_pct,co2_emissions_tons
2025-02-01,Solar PV,Kurnool Ultra Mega Solar,1000,6200.00,25.8,0.00
2025-02-01,Wind Energy,Muppandal Wind Farm,1500,8850.00,24.6,0.00
2025-02-01,Hydroelectric,Bhakra Nangal Dam,1325,12400.00,39.0,0.00
2025-02-01,Supercritical Thermal,Mundra Ultra Mega,4000,74500.00,77.6,61090.00
2025-02-02,Solar PV,Kurnool Ultra Mega Solar,1000,6450.00,26.9,0.00
2025-02-02,Wind Energy,Muppandal Wind Farm,1500,9120.00,25.3,0.00
2025-02-02,Hydroelectric,Bhakra Nangal Dam,1325,12100.00,38.0,0.00
2025-02-02,Supercritical Thermal,Mundra Ultra Mega,4000,75200.00,78.3,61664.00
2025-02-03,Solar PV,Kurnool Ultra Mega Solar,1000,5980.00,24.9,0.00
2025-02-03,Wind Energy,Muppandal Wind Farm,1500,8450.00,23.5,0.00
2025-02-03,Hydroelectric,Bhakra Nangal Dam,1325,11800.00,37.1,0.00
2025-02-03,Supercritical Thermal,Mundra Ultra Mega,4000,76800.00,80.0,62976.00`
  },
  {
    industry: 'energy',
    filename: 'energy_billing.csv',
    csvContent: `bill_id,account_number,tariff_category,units_consumed_kwh,energy_charges,fixed_charges,taxes,total_bill_amount
BL-901,ACC-5011,Industrial HT,125000,11250.00,850.00,968.00,13068.00
BL-902,ACC-5012,Commercial LT,4800,528.00,60.00,47.04,635.04
BL-903,ACC-5013,Residential Domestic,420,33.60,8.00,3.33,44.93
BL-904,ACC-5014,Agricultural Subsidized,1850,37.00,0.00,1.85,38.85
BL-905,ACC-5015,Industrial HT,98000,8820.00,850.00,773.60,10443.60
BL-906,ACC-5016,Commercial LT,6200,682.00,60.00,59.36,801.36
BL-907,ACC-5017,Residential Domestic,610,54.90,8.00,5.03,67.93
BL-908,ACC-5018,Commercial LT,3900,429.00,60.00,39.12,528.12
BL-909,ACC-5019,Industrial HT,142000,12780.00,850.00,1090.40,14720.40
BL-910,ACC-5020,Residential Domestic,380,30.40,8.00,3.07,41.47`
  },

  // -------------------------------------------------------------
  // 12. AGRICULTURE
  // -------------------------------------------------------------
  {
    industry: 'agriculture',
    filename: 'crop_production.csv',
    csvContent: `record_id,state,crop_name,season,cultivated_area_hectares,total_production_tons,yield_kg_per_hectare
AGR-101,Punjab,Wheat,Rabi,3520000,17600000,5000.0
AGR-102,Haryana,Wheat,Rabi,2540000,11938000,4700.0
AGR-103,Uttar Pradesh,Rice (Paddy),Kharif,5890000,15903000,2700.0
AGR-104,West Bengal,Rice (Paddy),Kharif,5420000,16260000,3000.0
AGR-105,Madhya Pradesh,Soybean,Kharif,5010000,6012000,1200.0
AGR-106,Maharashtra,Cotton,Kharif,4250000,1912500,450.0
AGR-107,Gujarat,Groundnut,Kharif,1890000,3969000,2100.0
AGR-108,Karnataka,Maize (Corn),Kharif,1420000,4544000,3200.0
AGR-109,Andhra Pradesh,Rice (Paddy),Kharif,2210000,7735000,3500.0
AGR-110,Rajasthan,Mustard / Rapeseed,Rabi,3120000,4680000,1500.0
AGR-111,Uttar Pradesh,Sugarcane,Annual,2280000,182400000,80000.0
AGR-112,Maharashtra,Sugarcane,Annual,1140000,96900000,85000.0
AGR-113,Tamil Nadu,Rice (Paddy),Kharif,1820000,6916000,3800.0
AGR-114,Telangana,Cotton,Kharif,2150000,1182500,550.0
AGR-115,Bihar,Maize (Corn),Rabi,850000,3400000,4000.0`
  },
  {
    industry: 'agriculture',
    filename: 'agricultural_prices.csv',
    csvContent: `market_id,state,commodity,variety,arrivals_quintals,min_price_rs_per_qtl,max_price_rs_per_qtl,modal_price_rs_per_qtl,date
MKT-01,Punjab,Wheat,PBW 725,14200,2275,2350,2300,2025-02-01
MKT-02,Haryana,Basmati Rice,1121 Pusa,8900,4200,4800,4550,2025-02-01
MKT-03,Maharashtra,Soybean,Yellow Grade 1,12400,4400,4750,4600,2025-02-01
MKT-04,Gujarat,Cotton,Medium Staple,16800,6800,7400,7100,2025-02-02
MKT-05,Rajasthan,Mustard Seed,Black Bold,9800,5100,5500,5350,2025-02-02
MKT-06,Madhya Pradesh,Chana (Chickpeas),Desi Bold,7500,5600,6100,5900,2025-02-02
MKT-07,Andhra Pradesh,Red Chilli,Teja S17,6200,16500,19200,17800,2025-02-03
MKT-08,Karnataka,Turmeric,Salem Finger,4800,12800,14500,13600,2025-02-03
MKT-09,Uttar Pradesh,Potato,Jyoti Fresh,22500,950,1200,1100,2025-02-03
MKT-10,Maharashtra,Onion,Red Nashik,31000,1600,2200,1950,2025-02-04
MKT-11,West Bengal,Jute,TD-5 Commercial,5400,5200,5800,5500,2025-02-04
MKT-12,Tamil Nadu,Coconut,Grade A Medium,18500,2400,2800,2650,2025-02-04`
  },
  {
    industry: 'agriculture',
    filename: 'rainfall_yield.csv',
    csvContent: `district,state,year,annual_rainfall_mm,normal_rainfall_mm,rainfall_deviation_pct,major_crop,crop_yield_tons_per_ha
Ludhiana,Punjab,2024,680,720,-5.6,Wheat,5.2
Karnal,Haryana,2024,710,750,-5.3,Rice,3.8
Indore,Madhya Pradesh,2024,1020,950,7.4,Soybean,1.4
Nagpur,Maharashtra,2024,1150,1080,6.5,Cotton,0.5
Rajkot,Gujarat,2024,780,620,25.8,Groundnut,2.3
Dharwad,Karnataka,2024,840,790,6.3,Maize,3.5
Guntur,Andhra Pradesh,2024,960,890,7.9,Chilli,2.8
Burdwan,West Bengal,2024,1420,1380,2.9,Rice,4.1
Kota,Rajasthan,2024,820,740,10.8,Mustard,1.7
Thanjavur,Tamil Nadu,2024,1180,1110,6.3,Rice,4.3`
  }
];

export function generateAllDatasets() {
  console.log(`[Dataset Generator] Writing 36 industry datasets into ${BASE_DIR}...`);

  for (const ds of DATASETS) {
    const dir = path.join(BASE_DIR, ds.industry);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const targetFile = path.join(dir, ds.filename);
    fs.writeFileSync(targetFile, ds.csvContent.trim(), 'utf-8');
    console.log(`Created: ${ds.industry}/${ds.filename}`);
  }

  console.log(`[Dataset Generator] Successfully generated 36/36 industry datasets.`);
}

if (require.main === module) {
  generateAllDatasets();
}
