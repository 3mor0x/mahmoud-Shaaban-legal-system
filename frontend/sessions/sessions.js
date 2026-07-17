import { supabase } from '../supabaseClient.js'

document.addEventListener("DOMContentLoaded", async () => {
    // تشغيل السايدبار للموبايل
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", (e) => { e.stopPropagation(); sidebar.classList.toggle("active"); });
    }

    // التحقق من أمان الجلسة
    const userId = localStorage.getItem("sb-user-id");
    if (!userId) { window.location.href = "../login/index.html"; return; }

    // جلب الجلسات الحية فوراً
    await loadLiveSessions();

    // معالجة إضافة موعد جديد (Submit Event)
    const sessionModal = document.getElementById("sessionModal");
    const saveBtn = sessionModal.querySelector(".btn-primary");

    saveBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        const title = sessionModal.querySelector("input[placeholder*='تقديم مذكرات دفاع']").value;
        const dueDate = sessionModal.querySelector("input[type='date']").value;

        if (!title || !dueDate) {
            alert("برجاء إدخال عنوان الموعد والتاريخ!");
            return;
        }

        saveBtn.innerHTML = `جاري الحفظ... <i class="fas fa-spinner fa-spin"></i>`;
        saveBtn.disabled = true;

        try {
            const { error } = await supabase
                .from('tasks')
                .insert([{ title: title, due_date: dueDate, status: 'pending' }]);

            if (error) throw error;

            alert("تم إدراج الموعد بالأجندة بنجاح! 📅");
            window.toggleModal('sessionModal', false);
            location.reload();
        } catch (err) {
            alert("خطأ أثناء الحفظ: " + err.message);
            saveBtn.innerHTML = "حفظ الموعد";
            saveBtn.disabled = false;
        }
    });
});

async function loadLiveSessions() {
    const agendaList = document.querySelector(".agenda-list");
    if (!agendaList) return;

    try {
        const { data: sessions, error } = await supabase
            .from('tasks')
            .select('*')
            .order('due_date', { ascending: true });

        if (error) throw error;

        if (sessions && sessions.length > 0) {
            agendaList.innerHTML = ""; // تصفية العناصر الثابتة

            sessions.forEach(session => {
                const sDate = new Date(session.due_date);
                const day = sDate.getDate();
                const monthNames = ["يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
                const month = monthNames[sDate.getMonth()];
                const isUrgent = session.status === 'pending';

                agendaList.innerHTML += `
                    <div class="agenda-item" style="justify-content: space-between; flex-wrap: wrap; gap: 15px;">
                        <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
                            <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; width: 50px; height: 50px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
                                <span style="font-size: 16px; font-weight: 900; line-height:1;">${day}</span>
                                <small style="font-size: 10px; color: var(--gold);">${month}</small>
                            </div>
                            <div>
                                <h4 style="font-size: 14px; font-weight: 800;">${session.title}</h4>
                                <p style="font-size: 12px; color: var(--text-muted); margin-top: 3px;">التاريخ: ${session.due_date}</p>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <span class="badge-saas ${isUrgent ? 'urgent' : 'active'}">${session.status === 'pending' ? 'عاجل' : 'مكتمل'}</span>
                            <button class="action-icon-btn"><i class="fas fa-edit"></i></button>
                        </div>
                    </div>
                `;
            });
        } else {
            agendaList.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:20px;">الأجندة فارغة، لا توجد مواعيد مضافة.</p>`;
        }
    } catch (err) {
        console.error("خطأ جلب الجلسات:", err.message);
    }
}