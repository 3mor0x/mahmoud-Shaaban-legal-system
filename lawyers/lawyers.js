import { supabase } from '../supabaseClient.js'

let activeReceiverId = null;

document.addEventListener("DOMContentLoaded", async () => {
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", (e) => { e.stopPropagation(); sidebar.classList.toggle("active"); });
    }

    const userId = localStorage.getItem("sb-user-id");
    if (!userId) { window.location.href = "../login/index.html"; return; }

    // تحميل قوائم المستخدمين للشات
    await loadChatUsers();

    // برمجة زرار إرسال التكليف (المهمة القضائية) داخل الشات
    const taskModal = document.getElementById("taskModal");
    const sendTaskBtn = taskModal.querySelector(".modal-buttons-footer .btn-primary");

    sendTaskBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        const taskTitle = taskModal.querySelector("input[type='text']").value;
        const dueDate = taskModal.querySelector("input[type='date']").value;

        if (!taskTitle || !dueDate) {
            alert("برجاء إدخال تفاصيل المهمة وتاريخ الاستحقاق!");
            return;
        }

        sendTaskBtn.innerHTML = `جاري الإرسال... <i class="fas fa-spinner fa-spin"></i>`;
        sendTaskBtn.disabled = true;

        try {
            const { error } = await supabase
                .from('tasks')
                .insert([{
                    title: taskTitle,
                    due_date: dueDate,
                    assigned_to: activeReceiverId || userId, // لو مفيش مستلم محدد بيسندها لنفسه كأدمن
                    status: 'pending'
                }]);

            if (error) throw error;

            alert("تم إصدار أمر التكليف بنجاح وإرساله للمحامي! 🚀⚖️");
            window.toggleModal('taskModal', false);
            location.reload();
        } catch (err) {
            alert("خطأ أثناء إرسال التكليف: " + err.message);
            sendTaskBtn.innerHTML = "إرسال التكليف فوراً";
            sendTaskBtn.disabled = false;
        }
    });
});

async function loadChatUsers() {
    const lawyersGroup = document.getElementById("lawyersGroup");
    const clientsGroup = document.getElementById("clientsGroup");

    try {
        const { data: users, error } = await supabase
            .from('profiles')
            .select('*');

        if (error) throw error;

        if (users && users.length > 0) {
            if (lawyersGroup) lawyersGroup.innerHTML = "";
            if (clientsGroup) clientsGroup.innerHTML = "";

            users.forEach(user => {
                const initial = user.full_name ? user.full_name.charAt(0) : 'يو';
                const userRowHtml = `
                    <div class="chat-user-item-row" data-id="${user.id}">
                        <div class="avatar-box">${initial}</div>
                        <div><h4>${user.full_name}</h4><p style="font-size:11px; color:var(--text-muted);">${user.role === 'admin' ? 'مدير المكتب' : user.role === 'lawyer' ? 'محامي مساعد' : 'موكل بالسيستم'}</p></div>
                    </div>
                `;

                if (user.role === 'admin' || user.role === 'lawyer') {
                    if (lawyersGroup) lawyersGroup.innerHTML += userRowHtml;
                } else if (user.role === 'client') {
                    if (clientsGroup) clientsGroup.innerHTML += userRowHtml;
                }
            });

            // إضافة حدث النقر على أي مستخدم لفتح الشات معه وتحديث المعرّف النشط
            document.querySelectorAll(".chat-user-item-row").forEach(row => {
                row.addEventListener("click", function() {
                    document.querySelectorAll(".chat-user-item-row").forEach(r => r.classList.remove("active"));
                    this.classList.add("active");
                    activeReceiverId = this.getAttribute("data-id");
                    const userName = this.querySelector("h4").innerText;
                    const headerTitle = document.querySelector(".chat-window-header h4");
                    if (headerTitle) headerTitle.innerHTML = `غرفة العمل الجارية مع: <strong>${userName}</strong>`;
                });
            });
        }
    } catch (err) {
        console.error("خطأ جلب مستخدمي الشات:", err.message);
    }
}