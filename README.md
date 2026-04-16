vanir Group Website
الموقع الرسمي لشركة Vanir Group — منصة تعكس هوية الشركة وتقدّم خدماتها بشكل احترافي وحديث.
 نظرة عامة
تم تطوير موقع Vanir Group لتقديم تجربة مستخدم مميزة، مع واجهة أنيقة وسريعة الاستجابة تدعم مختلف الأجهزة.
يركّز التصميم على الوضوح والاحترافية بما يتناسب مع طبيعة خدمات الشركة.
 التقنيات المستخدمة
Frontend: Next.js / React
Styling: Tailwind CSS / SCSS
Build & Deploy: Vercel / Netlify
Version Control: Git & GitHub
 هيكل المشروع
 vanirgroup-website/
├── public/          # ملفات الصور والأصول الثابتة
├── src/
│   ├── components/  # المكونات القابلة لإعادة الاستخدام
│   ├── pages/       # الصفحات (Home, About, Services, Contact...)
│   ├── styles/      # ملفات التنسيق
│   ├── lib/         # الأكواد المساعدة والإعدادات
│   └── data/        # المحتوى النصي أو بيانات JSON
├── package.json
└── README.md

 التثبيت والتشغيل محليًا
 # استنساخ المستودع
git clone [github.com](https://github.com/)[username]/vanirgroup.git

# دخول المجلد
cd vanirgroup

# تثبيت الاعتمادات
npm install

# تشغيل السيرفر المحلي
npm run dev

# بناء النسخة النهائية للإنتاج
npm run build

# اختبار النسخة المجمعة
npm start

