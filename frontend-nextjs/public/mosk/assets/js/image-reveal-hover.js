const serviceItems = document.querySelectorAll(".our-expertise-item");

serviceItems.forEach((item) => {
  // Create a hover image inside each service item
  const hoverImage = document.createElement("div");
  hoverImage.className = "hover-image";
  hoverImage.innerHTML = '<img src="" alt="Hover Preview">';
  item.appendChild(hoverImage);

  const hoverImgEl = hoverImage.querySelector("img");
  let target = { x: 0, y: 0 };
  let current = { x: 0, y: 0 };
  let lastPos = { x: 0, y: 0 };
  let tracking = false;

  function animateImageFollow() {
    if (!tracking) return;
    current.x += (target.x - current.x) * 0.2;
    current.y += (target.y - current.y) * 0.2;

    lastPos.x = target.x;
    lastPos.y = target.y;

    gsap.set(hoverImage, {
      x: current.x,
      y: current.y,
    });

    requestAnimationFrame(animateImageFollow);
  }

  item.addEventListener("mouseenter", (e) => {
    tracking = true;
    const imgSrc = item.getAttribute("data-img");
    hoverImgEl.src = imgSrc;

    const rect = item.getBoundingClientRect();
    target.x = e.clientX - rect.left;
    target.y = e.clientY - rect.top;
    current.x = target.x;
    current.y = target.y;

    gsap.set(hoverImage, {
      x: target.x,
      y: target.y,
      scale: 0,
      opacity: 1,
    });

    gsap.to(hoverImage, {
      scale: 1,
      duration: 0.4,
      ease: "power3.out",
    });

    animateImageFollow();
  });

  item.addEventListener("mousemove", (e) => {
    if (!tracking) return;
    const rect = item.getBoundingClientRect();
    target.x = e.clientX - rect.left;
    target.y = e.clientY - rect.top;
  });

  item.addEventListener("mouseleave", () => {
    tracking = false;
    gsap.to(hoverImage, {
      scale: 0,
      opacity: 0,
      duration: 0.3,
      ease: "power3.in",
    });
  });
});
