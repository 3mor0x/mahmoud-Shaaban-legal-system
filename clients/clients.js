// استيراد اتصال Supabase المركزي
import { supabase } from '../supabaseClient.js'

document.addEventListener("DOMContentLoaded", async () => {
    // 1. تشغيل السايدبار للموبايل
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            sidebar.classList.toggle("active");
        });
    }

    // 2. التحقق من أمان الجلسة
    const userId = localStorage.getItem("sb-user-id");
    if (!userId) {
        window.location.href = "../login/index.html";
        return;
    }

    // 3. جلب الموكلين فور فتح الصفحة
    await loadLiveClients();

    // 4. معالجة نموذج إضافة موكل جديد
    const clientModal = document.getElementById("clientModal");
    const saveBtn = clientModal.querySelector(".btn-primary");

    saveBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        const clientName = clientModal.querySelector("input[placeholder='أدخل الاسم']").value;

        if (!clientName) {
            alert("برجاء إدخال اسم الموكل!");
            return;
        }

        saveBtn.innerHTML = `جاري الحفظ... <i class="fas fa-spinner fa-spin"></i>`;
        saveBtn.disabled = true;

        try {
            // إضافة الموكل في جدول profiles كـ client
            // ملحوظة: في نظام الـ Production الحقيقي بيتم ربطه بـ Auth، هنا بنضيفه كبروفايل مسجل في الداتا مباشرة لسهولة الإدارة
            const { error } = await supabase
                .from('profiles')
                .insert([
                    { 
                        id: crypto.randomUUID(), // توليد معرف فريد مؤقت للبروفايل اليدوي
                        full_name: clientName, 
                        role: 'client'
                    }
                ]);

            if (error) throw error;

            alert("تم تسجيل بيانات الموكل بنجاح! 🎉");
            window.toggleModal('clientModal', false);
            location.reload(); 

        } catch (err) {
            alert("خطأ أثناء الحفظ: " + err.message);
            saveBtn.innerHTML = "حفظ البيانات";
            saveBtn.disabled = false;
        }
    });
});

// دالة جلب وعرض الموكلين في الـ Grid الفخم
async function loadLiveClients() {
    const gridLayout = document.querySelector(".saas-grid-layout");
    if (!gridLayout) return;

    try {
        // جلب المستخدمين الذين يملكون صلاحية client فقط
        const { data: clientsList, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'client')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (clientsList && clientsList.length > 0) {
            gridLayout.innerHTML = ""; // مسح الكروت الوهمية القديمة

            clientsList.forEach(client => {
                // أخذ الحرف الأول من الاسم للعرض في الأفاتار
                const firstLetter = client.full_name ? client.full_name.charAt(0) : 'ك';

                gridLayout.innerHTML += `
                    <div class="saas-card-item">
                        <div class="card-top-info">
                            <div class="avatar-box">${firstLetter}</div>
                            <span class="badge-saas active">نشط</span>
                        </div>
                        <h4>${client.full_name}</h4>
                        <div class="card-details-box">
                            <div class="card-detail-row"><i class="fas fa-phone"></i> <span>${client.phone || 'لا يوجد رقم مسجل'}</span></div>
                        </div>
                        <div class="card-actions-row">
                            <a href="../archive/archive.html" class="btn-action" style="text-decoration: none;"><i class="fas fa-folder-open"></i> ملفه بالأرشيف</a>
                            <a href="../lawyers/lawyers.html" class="btn-action" style="text-decoration: none;"><i class="fas fa-comments"></i> فتح الشات</a>
                        </div>
                    </div>
                `;
            });
        } else {
            gridLayout.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:var(--text-muted); padding: 20px;">لا يوجد موكلين مسجلين حالياً بالمكتب.</p>`;
        }
    } catch (err) {
        console.error("خطأ جلب الموكلين:", err.message);
    }
}