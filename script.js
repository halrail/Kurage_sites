// コピー機能
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".copy-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const target = document.querySelector(btn.dataset.copyTarget);
      if (target) {
        try {
          await navigator.clipboard.writeText(target.textContent.trim());
          btn.textContent = "コピーしました！";
          setTimeout(() => btn.textContent = "コピー", 1500);
        } catch {
          alert("コピーできませんでした。");
        }
      }
    });
  });
});