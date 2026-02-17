type ParallaxOptions = {
    lerp?: number;          // плавность (0.01–0.3)
    rotateFactor?: number;  // максимальный tilt в градусах
};

export function initParallax(
    container: HTMLElement | string,
    cardSelector: string = ".parallax-card",
    options: ParallaxOptions = {}
) {
    const root =
        typeof container === "string"
            ? (document.querySelector(container) as HTMLElement | null)
            : container;

    if (!root) return;

    const cards = Array.from(
        root.querySelectorAll<HTMLElement>(cardSelector)
    );

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    let isInside = false;
    let frameId: number | null = null;

    const lerpFactor = Math.min(Math.max(options.lerp ?? 0.08, 0.01), 0.3);
    const maxTilt = options.rotateFactor ?? 15; // максимальный угол наклона в градусах

    const update = () => {
        const targetX = isInside ? mouseX : 0;
        const targetY = isInside ? mouseY : 0;

        currentX += (targetX - currentX) * lerpFactor;
        currentY += (targetY - currentY) * lerpFactor;

        const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

        for (const card of cards) {
            const depth = Number(card.dataset.depth ?? "10");

            // Плавание можно оставить очень маленьким, или 0
            const moveX = currentX * (depth / 18);
            const moveY = currentY * (depth / 20);

            // Tilt: нормальный 3D-наклон во все направления
            // right => tiltY +
            // left  => tiltY -
            // down  => tiltX +
            // up    => tiltX -
            const tiltY = clamp(currentX * maxTilt, -maxTilt, maxTilt);
            const tiltX = clamp(-currentY * maxTilt, -maxTilt, maxTilt);

            card.style.setProperty("--parallax-x", `${moveX}px`);
            card.style.setProperty("--parallax-y", `${moveY}px`);
            card.style.setProperty("--parallax-tilt-x", `${tiltX}deg`);
            card.style.setProperty("--parallax-tilt-y", `${tiltY}deg`);
        }

        const stillMoving =
            Math.abs(currentX) > 0.0005 ||
            Math.abs(currentY) > 0.0005 ||
            isInside;

        if (stillMoving) {
            frameId = requestAnimationFrame(update);
        } else {
            for (const card of cards) {
                card.style.setProperty("--parallax-x", "0px");
                card.style.setProperty("--parallax-y", "0px");
                card.style.setProperty("--parallax-tilt-x", "0deg");
                card.style.setProperty("--parallax-tilt-y", "0deg");
            }
            frameId = null;
        }
    };

    const onMouseMove = (e: MouseEvent) => {
        console.log("move");
        const rect = root.getBoundingClientRect();

        mouseX =
            (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        mouseY =
            (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

        isInside = true;

        if (frameId === null) {
            frameId = requestAnimationFrame(update);
        }
    };

    const onLeave = () => {
        isInside = false;

        if (frameId === null) {
            frameId = requestAnimationFrame(update);
        }
    };

    root.addEventListener("mousemove", onMouseMove);
    root.addEventListener("mouseleave", onLeave);
}

export default initParallax;