import { supabase } from '../supabaseClient.js'

document.addEventListener("DOMContentLoaded", async () => {
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", (e) => { e.stopPropagation(); sidebar.classList.toggle("active"); });
    }

    const userId = localStorage.getItem("sb-user-id");
    if (!userId) { window.location.href = "../login/index.html"; return; }

    await loadArchiveStats();
});

async function loadArchiveStats() {
    const totalDocsLabel = document.querySelector(".stats-grid .stat-card:nth-child(2) p");
    try {
        // جلب عدد القضايا كدليل إحصائي للملفات المتاحة
        const { count, error } = await supabase
            .from('cases')
            .select('*', { count: 'exact', head: true });

        if (error) throw error;
        if (totalDocsLabel) {
            totalDocsLabel.innerText = `${count || 0} ملف نشط بالسيستم`;
        }
    } catch (err) {
        console.error("خطأ الأرشيف:", err.message);
    }
}