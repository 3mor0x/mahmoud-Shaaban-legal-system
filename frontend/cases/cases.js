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

    // 3. جلب القضايا فور فتح الصفحة
    await loadLiveCases();

    // 4. معالجة نموذج إضافة قضية جديدة (Submit Form)
    const caseModal = document.getElementById("caseModal");
    const saveBtn = caseModal.querySelector(".btn-primary");

    saveBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        const caseNumber = caseModal.querySelector("input[placeholder='مثال: 1452 / 2026']").value;
        const courtName = caseModal.querySelector("input[placeholder='مثال: جنايات ديروط - دائرة ب']").value;

        if (!caseNumber || !courtName) {
            alert("برجاء ملء جميع الحقول المطلوبة!");
            return;
        }

        saveBtn.innerHTML = `جاري الحفظ... <i class="fas fa-spinner fa-spin"></i>`;
        saveBtn.disabled = true;

        try {
            // إدخال البيانات في جدول cases بالسيرفر
            const { error } = await supabase
                .from('cases')
                .insert([
                    { 
                        case_number: caseNumber, 
                        court_name: courtName,
                        status: 'active'
                    }
                ]);

            if (error) throw error;

            alert("تم تأسيس ملف القضية بنجاح! 🎉");
            window.toggleModal('caseModal', false);
            location.reload(); // إعادة تحميل الصفحة لعرض القضية الجديدة فوراُ

        } catch (err) {
            alert("خطأ أثناء الحفظ: " + err.message);
            saveBtn.innerHTML = "حفظ الملف";
            saveBtn.disabled = false;
        }
    });
});

// دالة جلب وعرض القضايا الحية في الجدول
async function loadLiveCases() {
    const tableBody = document.querySelector(".saas-table tbody");
    const activeCountH3 = document.querySelector(".stats-grid .stat-card h3");
    if (!tableBody) return;

    try {
        const { data: casesList, error } = await supabase
            .from('cases')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // تحديث عداد الكارت العلوي
        if (activeCountH3) {
            activeCountH3.innerText = `${casesList ? casesList.length : 0} قضية`;
        }

        if (casesList && casesList.length > 0) {
            tableBody.innerHTML = ""; // مسح السطر التجريبي القديم

            casesList.forEach(item => {
                tableBody.innerHTML += `
                    <tr>
                        <td><strong>${item.case_number}</strong></td>
                        <td><span style="color: var(--text-muted); font-size: 13px;">لم يُحدد</span></td>
                        <td><span style="color: var(--text-muted); font-size: 13px;">لم يُحدد</span></td>
                        <td>${item.court_name}</td>
                        <td><span class="badge-saas active">متداولة</span></td>
                        <td>
                            <button class="action-icon-btn"><i class="fas fa-eye"></i></button>
                            <button class="action-icon-btn"><i class="fas fa-edit"></i></button>
                        </td>
                    </tr>
                `;
            });
        } else {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">لا يوجد قضايا مسجلة حالياً بالمكتب.</td></tr>`;
        }
    } catch (err) {
        console.error("خطأ جلب القضايا:", err.message);
    }
}