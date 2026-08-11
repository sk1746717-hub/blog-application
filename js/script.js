// ================================
// BlogSphere Sparkle Background
// ================================

document.addEventListener("DOMContentLoaded", () => {

    const sparkleCount = 35;

    for (let i = 0; i < sparkleCount; i++) {

        const sparkle = document.createElement("span");

        sparkle.classList.add("sparkle");

        sparkle.style.left =
            Math.random() * 100 + "vw";

        sparkle.style.top =
            Math.random() * 100 + "vh";

        sparkle.style.animationDelay =
            Math.random() * 3 + "s";

        sparkle.style.animationDuration =
            2 + Math.random() * 3 + "s";

        document.body.appendChild(sparkle);
    }

});
console.log("BlogSphere frontend loaded successfully!");