import { supabase } from '../supabaseClient.js'

document.addEventListener("DOMContentLoaded", async () => {
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            sidebar.classList.toggle("active");
        });
    }

    document.addEventListener("click", (e) => {
        if (window.innerWidth <= 1024 && sidebar && sidebar.classList.contains("active")) {
            if (!sidebar.contains(e.target) && e.target !== menuToggle) {
                sidebar.classList.remove("active");
            }
        }
    });

    // 2. التحقق من أمان الجلسة (Auth Guard)
    const userId = localStorage.getItem("sb-user-id");
    const userRole = localStorage.getItem("sb-user-role");

    if (!userId || !userRole) {
        window.location.href = "../login/index.html";
        return;
    }

    await loadLiveStats();
    await loadUpcomingSessions();
});

async function loadLiveStats() {
    try {
        const { count: casesCount, error: casesError } = await supabase
            .from('cases')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');

        if (casesError) throw casesError;

        const { count: clientsCount, error: clientsError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'client');

        if (clientsError) throw clientsError;

        const todayStr = new Date().toISOString().split('T')[0];
        const { count: sessionsCount, error: sessionsError } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('due_date', todayStr);

        if (sessionsError) throw sessionsError;

        const caseH3 = document.querySelector(".stat-card:nth-child(1) h3");
        const clientH3 = document.querySelector(".stat-card:nth-child(2) h3");
        const sessionH3 = document.querySelector(".stat-card:nth-child(3) h3");

        if (caseH3) caseH3.innerText = `${casesCount || 0} قضية`;
        if (clientH3) clientH3.innerText = `${clientsCount || 0} موكل`;
        if (sessionH3) sessionH3.innerText = `${sessionsCount || 0} مواعيد`;

    } catch (err) {
        console.error("خطأ أثناء تحديث الإحصائيات الحية:", err.message);
    }
}

async function loadUpcomingSessions() {
    const agendaListContainer = document.querySelector(".agenda-list");
    if (!agendaListContainer) return;

    try {
        const { data: upcomingTasks, error } = await supabase
            .from('tasks')
            .select('*')
            .order('due_date', { ascending: true })
            .limit(2);

        if (error) throw error;

        if (upcomingTasks && upcomingTasks.length > 0) {
            agendaListContainer.innerHTML = ""; 

            upcomingTasks.forEach(task => {
                const taskDate = new Date(task.due_date);
                const day = taskDate.getDate();
                const monthNames = ["يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
                const month = monthNames[taskDate.getMonth()];

                agendaListContainer.innerHTML += `
                    <div class="agenda-item" style="display: flex; align-items: center; justify-content: space-between; padding: 15px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px; margin-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; width: 50px; height: 50px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
                                <span style="font-size: 16px; font-weight: 900; line-height:1;">${day}</span>
                                <small style="font-size: 10px; color: var(--gold);">${month}</small>
                            </div>
                            <div>
                                <h4 style="font-size: 14px; font-weight: 800;">${task.title}</h4>
                                <p style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">مهمة جارية بالسيستم</p>
                            </div>
                        </div>
                        <span class="badge-saas" style="background: rgba(245, 158, 11, 0.1); color: var(--orange);">${task.status}</span>
                    </div>
                `;
            });
        }
    } catch (err) {
        console.error("خطأ أثناء جلب الأجندة:", err.message);
    }
}

window.toggleModal = function(modalId, show) {
    const modalEl = document.getElementById(modalId);
    if (modalEl) {
        if (show) modalEl.classList.add("active");
        else modalEl.classList.remove("active");
    }
}